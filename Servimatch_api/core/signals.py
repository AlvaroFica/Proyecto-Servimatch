from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Mensaje, Notificacion, Calificacion, Usuario

@receiver(post_save, sender=Mensaje)
def crear_notificacion_mensaje(sender, instance, created, **kwargs):
    if created:
        # Identificar el receptor (quien no es el remitente)
        chat = instance.chat
        if instance.remitente == chat.cliente:
            receptor = chat.trabajador
        else:
            receptor = chat.cliente

        Notificacion.objects.create(
            usuario=receptor,
            mensaje=f"Nuevo mensaje de {instance.remitente.first_name or instance.remitente.username}",
            tipo="Mensaje"
        )


@receiver(post_save, sender=Calificacion)
@receiver(post_save, sender=Calificacion)
def crear_notificacion_calificacion(sender, instance, created, **kwargs):
    if created:
        cliente = instance.cliente.usuario  # Usuario base
        trabajador = instance.trabajador.usuario  # Asumiendo relación similar
        mensaje = f"Has recibido una nueva calificación de {cliente.first_name or cliente.username}"
        Notificacion.objects.create(
            usuario=trabajador,
            mensaje=mensaje,
            tipo="calificacion",
        )
