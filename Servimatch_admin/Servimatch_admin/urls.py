from django.contrib import admin
from django.urls import path
from adminpanel import views

urlpatterns = [
    path('admin/usuarios/', views.usuarios_admin, name='admin_usuarios'),
    path('admin/trabajadores/', views.trabajadores_admin, name='admin_trabajadores'),
    path('admin/trabajadores/<int:trabajador_id>/historial/', views.trabajador_historial, name='admin_trabajador_historial'),
    path('admin/servicios/', views.servicios_admin, name='admin_servicios'),
    path('admin/reportes-clientes/', views.reportes_clientes, name='admin_reportes_clientes'),
    path('admin/pendientes/', views.pendientes_verificacion, name='admin_pendientes'),
    path('admin/pagos/', views.pagos_admin, name='pagos_admin'),
    path('admin/boletas/', views.boletas_admin, name='admin_boletas'),
    path('admin/citas/', views.citas_admin, name='admin_citas'),
    path('dashboard-admin/', views.dashboard_admin, name='dashboard_admin'),
    path('acciones/', views.acciones, name='acciones'),
    path('admin/boletas/<int:boleta_id>/liberar/', views.liberar_pago, name='liberar_pago'),
    path('admin/feedback/<int:feedback_id>/responder/', views.responder_feedback, name='responder_feedback'),
    path('admin/trabajadores/<int:trabajador_id>/verificar/', views.verificar_trabajador, name='verificar_trabajador'),
    path('admin/notificaciones/', views.notificaciones_admin, name='admin_notificaciones'),
]