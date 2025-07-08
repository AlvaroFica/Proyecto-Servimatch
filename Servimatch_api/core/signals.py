from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Mensaje, Notificacion

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
