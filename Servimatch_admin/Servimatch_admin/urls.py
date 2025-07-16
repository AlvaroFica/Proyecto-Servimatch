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
    path('admin/feedback/<int:feedback_id>/', views.feedback_detail_admin, name='feedback_detail_c'),
    path('admin/feedback/<int:feedback_id>/responder/', views.responder_feedback, name='responder_feedback'),
    path('admin/login/', views.login_admin_view, name='login_admin'),
    path('admin/logout/', views.logout_admin_view, name='logout_admin'),
    path('dashboard-admin/notificaciones_dashboard/', views.notificaciones_dashboard, name='notificaciones_dashboard'),
    # Vista HTML que muestra los gráficos
    path('dashboard-admin/feedback-tipo/', views.feedback_tipo_view, name='feedback_tipo'),

    # Endpoint JSON que da los datos al gráfico
    path('api/graficos/feedback-tipo/', views.grafico_feedback_tipo, name='grafico_feedback_tipo'),

    # Los otros dos endpoints también deben ir como API:
    path('api/graficos/boletas-por-estado/', views.grafico_boletas_por_estado),
    path('api/graficos/servicios-populares/', views.grafico_servicios_populares),


]