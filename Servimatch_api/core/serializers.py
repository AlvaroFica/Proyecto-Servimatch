from rest_framework import serializers
from .models import (
    Usuario, Cliente, Servicio, Profesion, Trabajador, ExperienciaProfesional,
    FotoTrabajador, Calificacion, Solicitud, Pago, Etiqueta,
    EtiquetaCalificacion, PlanServicio, Reserva, PagoServicio, PagoSolicitud )
from django.db.models import Avg 
import json   

# 1) Serializer de Profesión
class ProfesionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profesion
        fields = ['id', 'nombre', 'descripcion']

# 2) Serializer de ExperienciaProfesional
class ExperienciaProfesionalSerializer(serializers.ModelSerializer):
    profesion = serializers.PrimaryKeyRelatedField(queryset=Profesion.objects.all())

    class Meta:
        model = ExperienciaProfesional
        fields = ['profesion', 'anos_experiencia', 'descripcion_breve', 'idiomas']

class FotoTrabajadorSerializer(serializers.ModelSerializer):
    imagen = serializers.ImageField(use_url=True)

    class Meta:
        model = FotoTrabajador
        fields = ['id', 'imagen', 'titulo']
       

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ['id', 'nombre', 'descripcion']

class TrabajadorSerializer(serializers.ModelSerializer):
    id           = serializers.IntegerField(source='usuario.id', read_only=True)
    nombre       = serializers.CharField(source='usuario.nombre', required=False, allow_blank=True)
    apellido     = serializers.CharField(source='usuario.apellido', required=False, allow_blank=True)
    foto_perfil  = serializers.ImageField(source='usuario.foto_perfil', required=False)
    biografia    = serializers.CharField(source='usuario.biografia', required=False, allow_blank=True)
    latitud      = serializers.FloatField(required=False)
    longitud     = serializers.FloatField(required=False)
    profesion    = serializers.StringRelatedField()
    rating       = serializers.SerializerMethodField()
    galeria      = FotoTrabajadorSerializer(source='fotos', many=True, read_only=True)
    servicios    = ServicioSerializer(many=True, read_only=True)  # ← este es el cambio clave

    class Meta:
        model  = Trabajador
        fields = [
          'id',
          'nombre', 'apellido', 'foto_perfil', 'biografia',
          'profesion', 'rating',
          'disponibilidad', 'latitud', 'longitud', 'servicios',
          'galeria',
        ]

    def get_rating(self, obj):
        agg = obj.calificaciones_recibidas.aggregate(avg=Avg('puntuacion'))
        return round(agg['avg'] or 0, 1)

    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario', {})
        exps = validated_data.pop('experiencias', [])
        prof = validated_data.pop('profesion', None)
        trab = super().create(validated_data)

        # Actualizar datos en Usuario anidado
        if usuario_data:
            for attr, value in usuario_data.items():
                setattr(trab.usuario, attr, value)
            trab.usuario.save()

        # Asignar profesión principal si viene
        if prof:
            trab.profesion = prof
            trab.save(update_fields=['profesion'])

        # Crear experiencias asociadas
        for exp in exps:
            ExperienciaProfesional.objects.create(
                trabajador=trab,
                profesion=exp['profesion'],
                anos_experiencia=exp['anos_experiencia'],
                descripcion_breve=exp.get('descripcion_breve', ''),
                idiomas=exp.get('idiomas', '')
            )
        return trab

    def update(self, instance, validated_data):
        usuario_data = validated_data.pop('usuario', {})
        exps = validated_data.pop('experiencias', None)
        prof = validated_data.pop('profesion', None)

        # Actualizar Usuario
        if usuario_data:
            for attr, value in usuario_data.items():
                setattr(instance.usuario, attr, value)
            instance.usuario.save()

        # Actualizar campos de Trabajador
        for attr in ['disponibilidad', 'latitud', 'longitud']:
            if attr in validated_data:
                setattr(instance, attr, validated_data.get(attr))
        instance.save()

        # Actualizar profesión
        if prof is not None:
            instance.profesion = prof
            instance.save(update_fields=['profesion'])

        # Reemplazar experiencias si vienen
        if exps is not None:
            instance.experiencias.all().delete()
            for exp in exps:
                ExperienciaProfesional.objects.create(
                    trabajador=instance,
                    profesion=exp['profesion'],
                    anos_experiencia=exp['anos_experiencia'],
                    descripcion_breve=exp.get('descripcion_breve', ''),
                    idiomas=exp.get('idiomas', '')
                )
        return instance


class UsuarioSerializer(serializers.ModelSerializer):
    rol         = serializers.ChoiceField(
        choices=Usuario._meta.get_field('rol').choices,
        write_only=True,
        required=False
    )
    nombre      = serializers.CharField(required=False, allow_blank=True)
    apellido    = serializers.CharField(required=False, allow_blank=True)
    direccion   = serializers.CharField(required=False, allow_blank=True)
    latitud     = serializers.FloatField(required=False)
    longitud    = serializers.FloatField(required=False)
    foto_perfil = serializers.ImageField(required=False)
    trabajador  = serializers.DictField(write_only=True, required=False)
    servicios = serializers.PrimaryKeyRelatedField(queryset=Servicio.objects.all(), many=True, write_only=True, required=False)
    disponibilidad = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model  = Usuario
        fields = [
            'id', 'username', 'email', 'password',
            'es_trabajador', 'foto_perfil', 'biografia',
            'nombre', 'apellido', 'telefono',
            'rol', 'direccion', 'latitud', 'longitud',
            'trabajador', 'servicios', 'disponibilidad',
        ]
        extra_kwargs = {
            'password':      {'write_only': True},
            'es_trabajador': {'read_only': True},
        }

    def create(self, validated_data):
        rol_data = self.initial_data.get('rol')
        validated_data.pop('trabajador', None)
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save(update_fields=['password'])
        if rol_data:
            user.rol = rol_data
            user.save(update_fields=['rol'])
        return user

    def update(self, instance, validated_data):
        # 1) Extraer rol y contraseña al inicio
        rol_data = validated_data.pop('rol', None)
        password = validated_data.pop('password', None)

        # 2) Actualizar rol si viene
        if rol_data:
            instance.rol = rol_data
            instance.save(update_fields=['rol'])

        # 3) Actualizar campos básicos
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        if password:
            instance.set_password(password)
        instance.save()

        # 4) Activar es_trabajador si aplica
        if rol_data in ('trabajador', 'ambos'):
            instance.es_trabajador = True
            instance.save(update_fields=['es_trabajador'])

        # 5) Procesar bloque trabajador anidado
        raw = self.context['request'].data.get('trabajador', {})
        if isinstance(raw, str):
            try:
                trab_data = json.loads(raw)
            except json.JSONDecodeError:
                trab_data = {}
        else:
            trab_data = raw

        if trab_data:
            trab, _ = Trabajador.objects.get_or_create(usuario=instance)

            trab.latitud = trab_data.get('latitud', trab.latitud)
            trab.longitud = trab_data.get('longitud', trab.longitud)
            trab.disponibilidad = trab_data.get('disponibilidad', trab.disponibilidad)

            prof_id = trab_data.get('profesion')
            if prof_id is not None:
                try:
                    prof = Profesion.objects.get(pk=int(prof_id))
                    trab.profesion = prof
                except (ValueError, Profesion.DoesNotExist):
                    pass

            servicios_ids = trab_data.get('servicios')
            if isinstance(servicios_ids, list):
                trab.servicios.set(servicios_ids)

            trab.save()


        # 6) Crear perfil de Cliente si aplica
        if rol_data in ('cliente', 'ambos'):
            Cliente.objects.get_or_create(usuario=instance)

        return instance


class ClienteSerializer(serializers.ModelSerializer):
    usuario = UsuarioSerializer(read_only=True)

    class Meta:
        model = Cliente
        fields = ['usuario']

    def create(self, validated_data):
        usuario_data = validated_data.pop('usuario')
        usuario_instance = UsuarioSerializer.create(UsuarioSerializer(), validated_data=usuario_data)
        Cliente.objects.create(usuario=usuario_instance)
        return usuario_instance  # Opcional: Puedes devolver el usuario creado
    
class ProfesionSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Profesion
        fields = ['id', 'nombre', 'descripcion']

# 2) Serializer de ExperienciaProfesional
class ExperienciaProfesionalSerializer(serializers.ModelSerializer):
    profesion = serializers.PrimaryKeyRelatedField(queryset=Profesion.objects.all())

    class Meta:
        model  = ExperienciaProfesional
        fields = ['profesion', 'anos_experiencia', 'descripcion_breve', 'idiomas']    


    def update(self, instance, validated_data):
        # 1) Extraemos bloques
        servicios_data  = validated_data.pop('servicios', None)
        experiencias    = validated_data.pop('experiencias', None)

        # 2) Actualizamos campos simples
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # 3) Actualizamos M2M servicios
        if servicios_data is not None:
            instance.servicios.set(servicios_data)

        # 4) Reemplazamos experiencias si vienen
        if experiencias is not None:
            instance.experiencias.all().delete()
            for exp in experiencias:
                ExperienciaProfesional.objects.create(
                    trabajador=instance,
                    profesion=exp['profesion'],
                    anos_experiencia=exp['anos_experiencia'],
                    descripcion_breve=exp.get('descripcion_breve', ''),
                    idiomas=exp.get('idiomas', '')
                )

        return instance



class SolicitudSerializer(serializers.ModelSerializer):
    cliente     = ClienteSerializer(read_only=True)
    servicio    = ServicioSerializer(read_only=True)
    servicio_id = serializers.PrimaryKeyRelatedField(
        queryset=Servicio.objects.all(),  # ← esto es lo obligatorio
        write_only=True,
        source='servicio'
    )

    class Meta:
        model = Solicitud
        fields = [
            'id',
            'cliente',
            'servicio',
            'servicio_id',
            'nombre',
            'descripcion',
            'precio',
            'ubicacion',
            'latitud',
            'longitud',
            'fecha_creacion',
            'fecha_preferida',
            'trabajador_asignado',
            'aceptada',
        ]
        read_only_fields = [
            'cliente',
            'servicio',
            'latitud',
            'longitud',
            'fecha_creacion',
            'trabajador_asignado',
            'aceptada',
        ]


class PagoSerializer(serializers.ModelSerializer):
    solicitud = SolicitudSerializer(read_only=True)

    class Meta:
        model = Pago
        fields = ['id', 'solicitud', 'monto', 'fecha_pago', 'liberado']
        read_only_fields = ['solicitud']

class CalificacionSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    trabajador = TrabajadorSerializer(read_only=True)
    solicitud = SolicitudSerializer(read_only=True)

    class Meta:
        model = Calificacion
        fields = ['id', 'cliente', 'trabajador', 'solicitud', 'puntuacion', 'comentario', 'fecha_creacion']
        read_only_fields = ['cliente', 'trabajador', 'solicitud']

class EtiquetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Etiqueta
        fields = ['id', 'nombre']

class EtiquetaCalificacionSerializer(serializers.ModelSerializer):
    calificacion = CalificacionSerializer(read_only=True)
    etiqueta = EtiquetaSerializer(read_only=True)

    class Meta:
        model = EtiquetaCalificacion
        fields = ['id', 'calificacion', 'etiqueta']
        read_only_fields = ['calificacion', 'etiqueta']

class PlanServicioSerializer(serializers.ModelSerializer):
    trabajador = serializers.SerializerMethodField()

    class Meta:
        model = PlanServicio
        fields = ['id', 'nombre', 'descripcion', 'duracion_estimado', 'precio', 'incluye', 'trabajador']

    def get_trabajador(self, obj):
        if obj.trabajador:
            return {
                "nombre": obj.trabajador.usuario.nombre,
                "apellido": obj.trabajador.usuario.apellido,
                "foto_perfil": obj.trabajador.usuario.foto_perfil.url if obj.trabajador.usuario.foto_perfil else None,
                "profesion": obj.trabajador.profesion.nombre if obj.trabajador.profesion else None,
            }
        return None

class ReservaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reserva
        fields = ['id', 'trabajador', 'plan', 'fecha', 'hora_inicio', 'hora_fin']
        read_only_fields = ['trabajador']






# ✅ Chat y Mensaje serializers
from .models import Chat, Mensaje
class UsuarioSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nombre', 'apellido', 'foto_perfil']


class MensajeSerializer(serializers.ModelSerializer):
    remitente = UsuarioSimpleSerializer(read_only=True)

    class Meta:
        model = Mensaje
        fields = ['id', 'chat', 'remitente', 'contenido', 'enviado']
        read_only_fields = ['remitente', 'enviado', 'chat']


class ChatSerializer(serializers.ModelSerializer):
    cliente = UsuarioSimpleSerializer(read_only=True)
    trabajador = UsuarioSimpleSerializer(read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'cliente', 'trabajador', 'creado']


class PagoServicioSerializer(serializers.ModelSerializer):
    plan = serializers.SerializerMethodField()
    trabajador = serializers.SerializerMethodField()

    def get_plan(self, obj):
        return {'nombre': obj.plan.nombre}

    def get_trabajador(self, obj):
        return {
            'nombre': obj.trabajador.usuario.nombre,
            'apellido': obj.trabajador.usuario.apellido,
        }

    class Meta:
        model = PagoServicio
        fields = ['id', 'plan', 'trabajador', 'monto', 'estado', 'fecha']

class PagoSolicitudSerializer(serializers.ModelSerializer):
    class Meta:
        model = PagoSolicitud
        fields = '__all__'