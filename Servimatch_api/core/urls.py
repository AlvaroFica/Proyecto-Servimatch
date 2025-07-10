from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import ProfesionViewSet, PlanServicioViewSet, ReservaViewSet, CreateCheckoutSessionView, StripeRedirectView, StripeCancelRedirectView, SolicitudViewSet, UsuarioViewSet, MisChatsView, ObtenerOCrearChatView, IniciarPagoFlowView, confirmar_pago_flow
from django.conf import settings
from django.conf.urls.static import static






router = DefaultRouter()
router.register(r'solicitudes', SolicitudViewSet, basename='solicitud')
router.register(r'usuarios', UsuarioViewSet, basename='usuarios')
router.register(r'clientes', views.ClienteViewSet)
router.register(r'trabajadores', views.TrabajadorViewSet)
router.register(r'servicios', views.ServicioViewSet)
router.register(r'pagos', views.PagoViewSet)
router.register(r'calificaciones', views.CalificacionViewSet)
router.register(r'etiquetas', views.EtiquetaViewSet)
router.register(r'etiquetas-calificaciones', views.EtiquetaCalificacionViewSet)
router.register(r'profesiones', ProfesionViewSet, basename='profesiones')
router.register(r'planes', PlanServicioViewSet, basename='planes')
router.register(r'reservas', ReservaViewSet, basename='reserva')
router.register(r'fotos-trabajador', views.GaleriaTrabajadorViewSet, basename='fotos-trabajador')
router.register(r'chats', views.ChatViewSet, basename='chat')
router.register('notificaciones', views.NotificacionViewSet, basename='notificaciones')


urlpatterns = [
    path('flow/iniciar-pago/', IniciarPagoFlowView.as_view(), name='flow-iniciar-pago'),
    path('flow/confirmacion/', confirmar_pago_flow, name='flow-confirmacion'),
    path('stripe/create-checkout-session/', CreateCheckoutSessionView.as_view(), name='create-checkout-session'),
    path('stripe/success/', StripeRedirectView.as_view(), name='stripe-redirect-success'),
    path('stripe/cancel/', StripeCancelRedirectView.as_view(), name='stripe-redirect-cancel'),
    path('usuarios/register/', UsuarioViewSet.as_view({'post': 'register'}), name='usuario-register'),
    path('solicitudes/<int:pk>/aceptar/', views.SolicitudViewSet.as_view({'post': 'aceptar'}), name='solicitud-aceptar'),
    path('trabajadores-cercanos/', views.trabajadores_cercanos, name='trabajadores-cercanos'),
    path('usuarios/actualizar-perfil/', views.ActualizarPerfilView.as_view(), name='actualizar-perfil'),
    path('ranking/trabajadores/', views.top_trabajadores, name='top-trabajadores'),
    path('chats/', MisChatsView.as_view(), name='mis-chats'),
    path('chats/obtener_o_crear/', ObtenerOCrearChatView.as_view(), name='obtener_o_crear_chat'),

    path('', include(router.urls)),
]





