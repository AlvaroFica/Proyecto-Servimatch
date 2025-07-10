from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from django.db.models import Q
from django.db.models import Avg
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action, api_view
from math import radians, sin, cos, sqrt, atan2
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
from .models import *
from .serializers import *
from django_filters.rest_framework import DjangoFilterBackend
import traceback
from django.db import IntegrityError 
from django.shortcuts import redirect
from django.views import View
from django.http import HttpResponse
import math
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny
from rest_framework.decorators import api_view, permission_classes
from django.contrib.auth import get_user_model
from .models import Trabajador, Cliente, Chat, Mensaje
import json  # ← asegúrate de tenerlo al inicio del archivo
from django.db import models  # asegúrate de tener esto importado arriba




from geopy.geocoders import Nominatim

#Para pasarela de pago
import stripe
from django.conf import settings
from datetime import datetime, timedelta

stripe.api_key = settings.STRIPE_SECRET_KEY

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        serializer = UsuarioSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Crear perfil según el rol
        if user.rol in ('cliente', 'ambos'):
            Cliente.objects.get_or_create(usuario=user)

        if user.rol in ('trabajador', 'ambos'):
            trabajador, creado = Trabajador.objects.get_or_create(
                usuario=user,
                defaults={
                    'latitud': user.latitud,
                    'longitud': user.longitud,
                }
            )
            if not creado:
                trabajador.latitud = user.latitud
                trabajador.longitud = user.longitud
                trabajador.save()

            user.es_trabajador = True
            user.save(update_fields=['es_trabajador'])

        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            **serializer.data
        }, status=status.HTTP_201_CREATED)


# Dentro de ActualizarPerfilView
class ActualizarPerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        usuario = request.user
        serializer = UsuarioSerializer(
            usuario,
            data=request.data,
            partial=True,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if user.rol in ('cliente', 'ambos'):
            Cliente.objects.get_or_create(usuario=user)

        if user.rol in ('trabajador', 'ambos'):
            trabajador, creado = Trabajador.objects.get_or_create(
                usuario=user,
                defaults={
                    'latitud': user.latitud,
                    'longitud': user.longitud,
                }
            )
            if not creado:
                trabajador.latitud = user.latitud
                trabajador.longitud = user.longitud

            # Procesar disponibilidad si viene

            trabajador_data = request.data.get('trabajador')
            if trabajador_data:
                if isinstance(trabajador_data, str):
                    try:
                        trabajador_data = json.loads(trabajador_data)
                    except json.JSONDecodeError:
                        return Response({'error': 'Formato de trabajador inválido'}, status=400)

                # Solo actualizar disponibilidad si viene explícitamente
                if 'disponibilidad' in trabajador_data:
                    trabajador.disponibilidad = json.dumps(trabajador_data['disponibilidad'])

                # Servicios sí pueden actualizarse vacíos
                if 'servicios' in request.data:
                    servicios_ids = request.data['servicios']
                    trabajador.servicios.set(servicios_ids)


            trabajador.save()

            user.es_trabajador = True
            user.save(update_fields=['es_trabajador'])

        return Response(serializer.data)


class ProfesionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Profesion.objects.all()
    serializer_class = ProfesionSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class TrabajadorViewSet(viewsets.ReadOnlyModelViewSet):
    queryset         = Trabajador.objects.select_related('usuario', 'profesion').all()
    serializer_class = TrabajadorSerializer
    filter_backends  = [DjangoFilterBackend]
    filterset_fields = ['profesion']    # ahora filtra por ?profesion=<id>

class ServicioViewSet(viewsets.ModelViewSet):
    queryset = Servicio.objects.all()
    serializer_class = ServicioSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class SolicitudViewSet(viewsets.ModelViewSet):
    queryset = Solicitud.objects.all()
    serializer_class = SolicitudSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Solo devolvemos las solicitudes del cliente autenticado en list
        if self.action == 'list':
            try:
                cliente = self.request.user.cliente_profile
            except:
                return Solicitud.objects.none()
            return Solicitud.objects.filter(cliente=cliente)
        return super().get_queryset()

    def perform_create(self, serializer):
        # Geocodifica la ubicación y guarda coordenadas junto al cliente
        datos = serializer.validated_data
        ubic = datos.get('ubicacion')
        geolocator = Nominatim(user_agent="servimatch")
        lat, lng = None, None
        if ubic:
            loc = geolocator.geocode(ubic)
            if loc:
                lat, lng = loc.latitude, loc.longitude

        # Guarda la solicitud con cliente y coordenadas
        solicitud = serializer.save(
            cliente=self.request.user.cliente_profile,
            latitud=lat,
            longitud=lng
        )

        # ✅ Crear notificación interna para el trabajador
        if solicitud.trabajador_asignado:  # Solo si ya hay un trabajador asignado
            Notificacion.objects.create(
                usuario=solicitud.trabajador_asignado.usuario,
                mensaje=f"Tienes una nueva solicitud de {self.request.user.get_full_name()}",
                tipo="solicitud"
            )

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def aceptar(self, request, pk=None):
        """
        POST /api/solicitudes/{pk}/aceptar/
        Permite al trabajador aceptar la solicitud, asignándosela y marcándola como aceptada.
        """
        solicitud = self.get_object()

        # Validar rol de trabajador
        try:
            trabajador = request.user.trabajador_profile
        except:
            return Response(
                {'detail': 'Solo un trabajador puede aceptar solicitudes.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if solicitud.aceptada:
            return Response(
                {'detail': 'La solicitud ya fue aceptada.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        solicitud.aceptada = True
        solicitud.trabajador_asignado = trabajador
        solicitud.estado = 'Aceptada'
        solicitud.save(update_fields=['aceptada', 'trabajador_asignado', 'estado'])

        # Devolvemos la solicitud actualizada
        serializer = self.get_serializer(solicitud)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancelar(self, request, pk=None):
        solicitud = self.get_object()

        if solicitud.estado != 'Pendiente':
            return Response(
                {'detail': 'Solo se pueden cancelar solicitudes pendientes'},
                status=status.HTTP_400_BAD_REQUEST
            )

        solicitud.delete()
        return Response(
            {'detail': 'Solicitud cancelada correctamente'},
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def cercanas(self, request):
        """
        GET /api/solicitudes/cercanas/?lat={lat}&lng={lng}
        Retorna solicitudes dentro de 10 km.
        """
        try:
            lat = float(request.query_params['lat'])
            lng = float(request.query_params['lng'])
        except (KeyError, ValueError):
            return Response({'detail': 'Parámetros lat y lng requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        def haversine(lat1, lon1, lat2, lon2):
            R = 6371
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) \
                * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            return R * c

        qs = Solicitud.objects.filter(latitud__isnull=False, longitud__isnull=False)
        cercanas = [s for s in qs if haversine(lat, lng, s.latitud, s.longitud) <= 10]

        serializer = self.get_serializer(cercanas, many=True)
        return Response(serializer.data)
    

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def no_calificadas(self, request):
        cliente = request.user.cliente_profile

        # Obtener solicitudes finalizadas del cliente
        solicitudes = Solicitud.objects.filter(
            cliente=cliente,
            estado='Finalizada'
        ).exclude(calificaciones__isnull=False)  # ya tienen calificación

        serializer = self.get_serializer(solicitudes, many=True)
        return Response(serializer.data)


class PagoViewSet(viewsets.ModelViewSet):
    queryset = Pago.objects.all()
    serializer_class = PagoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class CalificacionViewSet(viewsets.ModelViewSet):
    queryset = Calificacion.objects.all()
    serializer_class = CalificacionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        cliente = self.request.user.cliente_profile
        solicitud_id = self.request.data.get('solicitud')

        try:
            solicitud = Solicitud.objects.get(id=solicitud_id)
        except Solicitud.DoesNotExist:
            raise ValidationError("La solicitud no existe.")

        if solicitud.estado != 'Finalizada':
            raise ValidationError("Solo puedes calificar una solicitud finalizada.")

        if Calificacion.objects.filter(cliente=cliente, solicitud=solicitud).exists():
            raise ValidationError("Ya calificaste esta solicitud.")

        trabajador = solicitud.trabajador_asignado

        serializer.save(
            cliente=cliente,
            trabajador=trabajador,
            solicitud=solicitud
        )




class EtiquetaViewSet(viewsets.ModelViewSet):
    queryset = Etiqueta.objects.all()
    serializer_class = EtiquetaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class EtiquetaCalificacionViewSet(viewsets.ModelViewSet):
    queryset = EtiquetaCalificacion.objects.all()
    serializer_class = EtiquetaCalificacionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

######################PARA USAR LA API DE GOOGLE MAPS################################
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Radio de la Tierra en km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

@api_view(['GET'])
def trabajadores_cercanos(request):
    lat = float(request.GET.get('lat'))
    lon = float(request.GET.get('lon'))
    servicio_id = request.GET.get('servicio_id')

    trabajadores = Trabajador.objects.filter(
        latitud__isnull=False, longitud__isnull=False,
        servicios=servicio_id
    )

    resultado = []
    for t in trabajadores:
        distancia = haversine(lat, lon, t.latitud, t.longitud)
        if distancia <= 10:  # Dentro de 10 km
            data = TrabajadorSerializer(t).data
            data['distancia'] = round(distancia, 2)
            resultado.append(data)

    return Response(resultado)

class PlanServicioViewSet(viewsets.ModelViewSet):
    queryset = PlanServicio.objects.all()
    serializer_class = PlanServicioSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # Si es solicitud de detalle (retrieve), no filtrar
        if self.action == 'retrieve':
            return PlanServicio.objects.all()

        # Si es solicitud de lista, aplicar filtros
        trabajador_id = self.request.query_params.get('trabajador')

        if trabajador_id:
            try:
                trabajador = Trabajador.objects.get(pk=trabajador_id)
                return PlanServicio.objects.filter(trabajador=trabajador)
            except Trabajador.DoesNotExist:
                return PlanServicio.objects.none()

        if hasattr(self.request.user, 'trabajador_profile'):
            return PlanServicio.objects.filter(trabajador=self.request.user.trabajador_profile)

        return PlanServicio.objects.none()

    def perform_create(self, serializer):
        if hasattr(self.request.user, 'trabajador_profile'):
            trabajador = self.request.user.trabajador_profile
        else:
            trabajador_id = self.request.data.get('trabajador')
            if not trabajador_id:
                raise ValidationError("Se requiere el ID del trabajador.")
            try:
                trabajador = Trabajador.objects.get(pk=trabajador_id)
            except Trabajador.DoesNotExist:
                raise ValidationError("Trabajador no válido.")
        
        serializer.save(trabajador=trabajador)



        
class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # filtra por plan y fecha si vienen como query params
        qs = super().get_queryset()
        plan = self.request.query_params.get('plan')
        fecha = self.request.query_params.get('fecha')
        if plan:
            qs = qs.filter(plan_id=plan)
        if fecha:
            qs = qs.filter(fecha=fecha)
        return qs

    def perform_create(self, serializer):
        # asigna trabajador logueado
        serializer.save(trabajador=self.request.user.trabajador_profile)


# views.py

class CreateCheckoutSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            plan_id = request.data.get('plan_id')
            fecha_str = request.data.get('fecha')
            hora_inicio_str = request.data.get('hora_inicio')

            plan = PlanServicio.objects.filter(id=plan_id).first()
            if not plan:
                return Response({'error': 'Plan no encontrado'}, status=status.HTTP_404_NOT_FOUND)

            fecha = datetime.strptime(fecha_str, '%Y-%m-%d').date()
            hora_inicio = datetime.strptime(hora_inicio_str, '%H:%M').time()
            dt_inicio = datetime.combine(fecha, hora_inicio)
            dt_fin = dt_inicio + plan.duracion_estimado
            hora_fin = dt_fin.time()

            if Reserva.objects.filter(plan=plan, fecha=fecha, hora_inicio=hora_inicio).exists():
                return Response(
                    {'error': 'Esa franja ya está reservada. Elige otra.'},
                    status=status.HTTP_409_CONFLICT
                )

            # Validar si el usuario tiene perfil cliente
            try:
                cliente = request.user.cliente_profile
            except:
                return Response({'error': 'Usuario no tiene perfil de cliente.'}, status=403)

            reserva = Reserva.objects.create(
                cliente=cliente,
                plan=plan,
                fecha=fecha,
                hora_inicio=hora_inicio,
                hora_fin=hora_fin,
                estado='PENDIENTE'
            )

            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'clp',
                        'product_data': {'name': plan.nombre},
                        'unit_amount': int(plan.precio * 100),
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=request.build_absolute_uri("/api/stripe/success/"),
                cancel_url=request.build_absolute_uri("/api/stripe/cancel/"),
                metadata={'reserva_id': reserva.id},
            )

            return Response({'url': session.url})

        except Exception as e:
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class StripeRedirectView(View):
    """
    Recibe el session_id y devuelve un 302 manual al deep link exitoso.
    """
    def get(self, request):
        session_id = request.GET.get('session_id')
        deep_link = f"servimatchapp://pago-exitoso?session_id={session_id}"
        response = HttpResponse(status=302)
        response['Location'] = deep_link
        return response


class StripeCancelRedirectView(View):
    """
    Redirige manualmente al deep link de pago cancelado.
    """
    def get(self, request):
        deep_link = "servimatchapp://pago-fallido"
        response = HttpResponse(status=302)
        response['Location'] = deep_link
        return response
    
@api_view(['GET'])
@permission_classes([AllowAny])
def top_trabajadores(request):
    print("👉 Entrando al endpoint de ranking")

    trabajadores = (
        Trabajador.objects
        .annotate(rating_promedio=Avg('calificaciones_recibidas__puntuacion'))
        .order_by('-rating_promedio')[:10]
    )

    serializer = TrabajadorSerializer(trabajadores, many=True)
    return Response(serializer.data)




class GaleriaTrabajadorViewSet(viewsets.ModelViewSet):
    queryset = FotoTrabajador.objects.all()
    serializer_class = FotoTrabajadorSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        # Asegura que el usuario es trabajador
        if not hasattr(self.request.user, 'trabajador_profile'):
            raise ValidationError("Solo los trabajadores pueden subir imágenes.")
        serializer.save(trabajador=self.request.user.trabajador_profile)







class ChatViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    # GET /api/chats/<pk>/
    def retrieve(self, request, pk=None):
        usuario = request.user
        chat = get_object_or_404(Chat, id=pk)

        # Validar que el usuario esté involucrado en el chat
        if chat.cliente != usuario and chat.trabajador != usuario:
            return Response({'error': 'No tienes acceso a este chat'}, status=403)

        serializer = ChatSerializer(chat)
        return Response(serializer.data)


    # GET y POST /api/chats/<chat_id>/mensajes/
    @action(detail=True, methods=['get', 'post'])
    def mensajes(self, request, pk=None):
        chat = get_object_or_404(Chat, id=pk)

        if request.method == 'GET':
            mensajes = chat.mensajes.order_by('enviado')

            # ✅ Marcar como leídos todos los mensajes del otro usuario
            mensajes_para_mi = mensajes.filter(leido=False).exclude(remitente=request.user)
            for m in mensajes_para_mi:
                m.leido = True
                m.save(update_fields=['leido'])

            return Response(MensajeSerializer(mensajes, many=True).data)

        if request.method == 'POST':
            contenido = request.data.get('contenido', '').strip()
            if not contenido:
                return Response({'error': 'El mensaje está vacío'}, status=400)

            mensaje = Mensaje.objects.create(
                chat=chat,
                remitente=request.user,
                contenido=contenido
            )
            return Response(MensajeSerializer(mensaje).data, status=201)


class MisChatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        usuario = request.user

        chats = Chat.objects.filter(models.Q(cliente=usuario) | models.Q(trabajador=usuario))

        # ✅ Añadir conteo de no leídos
        for chat in chats:
            chat.no_leidos = chat.mensajes.exclude(remitente=usuario).filter(leido=False).count()

        serializer = ChatSerializer(chats, many=True, context={'request': request})
        return Response(serializer.data)


class NotificacionViewSet(viewsets.ModelViewSet):
    serializer_class = NotificacionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notificacion.objects.filter(usuario=self.request.user).order_by('-fecha')

    @action(detail=False, methods=['post'])
    def marcar_como_leidas(self, request):
        Notificacion.objects.filter(usuario=request.user, leido=False).update(leido=True)
        return Response({'mensaje': 'Notificaciones marcadas como leídas'})
    


class ObtenerOCrearChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        usuario = request.user
        trabajador_id = request.data.get('trabajador_id')

        if not trabajador_id:
            return Response({'error': 'Falta el ID del trabajador'}, status=400)

        try:
            trabajador = Usuario.objects.get(id=trabajador_id)
        except Usuario.DoesNotExist:
            return Response({'error': 'Trabajador no encontrado'}, status=404)

        if usuario == trabajador:
            return Response({'error': 'No puedes iniciar un chat contigo mismo'}, status=400)

        # Determina los roles para crear o buscar el chat
        if usuario.rol == 'cliente':
            cliente = usuario
        else:
            cliente = trabajador

        if usuario.rol == 'trabajador':
            trabajador_final = usuario
        else:
            trabajador_final = trabajador

        # Buscar si ya existe
        chat, creado = Chat.objects.get_or_create(
            cliente=cliente,
            trabajador=trabajador_final
        )

        return Response({'chat_id': chat.id}, status=200)