import sys
import os
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from django.core.management.base import BaseCommand
from core.models import PlanServicio, Trabajador

class Command(BaseCommand):
    help = "Carga planes de servicio para varios trabajadores tapiceros"

    def handle(self, *args, **kwargs):
        correos_trabajadores = [
            "cristianTap@gmail.com",
            "fernandoTap@gmail.com",
            "jorgeTap@gmail.com",
            "raulTap@gmail.com",
            "diegoTap@gmail.com",
            "luisTap@gmail.com",
            "victorTap@gmail.com",
            "carlosTap@gmail.com",
            "joseTap@gmail.com",
            "andresTap@gmail.com",
        ]

        planes = [
            {
                "nombre": "Tapizado de silla individual",
                "descripcion": "Retiro del tapiz anterior y colocación de nuevo material en silla de comedor o escritorio.",
                "duracion": "01:00:00",
                "precio": 20000,
                "incluye": ["Tapiz nuevo", "Relleno básico", "Mano de obra", "Herramientas"]
            },
            {
                "nombre": "Tapizado de sillón de 1 cuerpo",
                "descripcion": "Revestimiento completo de sillón pequeño, incluye renovación de espuma si es necesario.",
                "duracion": "02:00:00",
                "precio": 45000,
                "incluye": ["Tela nueva", "Espuma de asiento", "Grapas y adhesivo", "Revisión de estructura"]
            },
            {
                "nombre": "Reparación de base de asiento",
                "descripcion": "Cambio de cinchas o correas sueltas y refuerzo de estructura del asiento.",
                "duracion": "00:50:00",
                "precio": 18000,
                "incluye": ["Cinchas nuevas", "Refuerzo estructural", "Herramientas de fijación"]
            },
            {
                "nombre": "Cambio de espuma en respaldo",
                "descripcion": "Renovación del respaldo por desgaste o hundimiento. Se cambia la espuma y se ajusta el tapiz.",
                "duracion": "00:40:00",
                "precio": 15000,
                "incluye": ["Espuma nueva", "Ajuste de tapiz", "Mano de obra"]
            },
            {
                "nombre": "Tapizado de sofá de 2 cuerpos",
                "descripcion": "Renovación total del tapiz y relleno de sofá de 2 cuerpos. Trabajo profesional y detallado.",
                "duracion": "04:00:00",
                "precio": 90000,
                "incluye": ["Tapiz de alta calidad", "Relleno completo", "Ajuste de estructura", "Herramientas"]
            },
            {
                "nombre": "Renovación de cojines sueltos",
                "descripcion": "Tapizado de cojines sueltos, incluye cambio de tela y relleno si es necesario.",
                "duracion": "00:30:00",
                "precio": 10000,
                "incluye": ["Tela nueva", "Relleno", "Costura y cierre"]
            },
        ]

        for email in correos_trabajadores:
            try:
                trabajador = Trabajador.objects.get(usuario__email=email)
                self.stdout.write(self.style.SUCCESS(f"🪑 Cargando planes para: {email}"))
            except Trabajador.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"❌ No se encontró trabajador con email: {email}"))
                continue

            for plan in planes:
                h, m, s = map(int, plan["duracion"].split(":"))
                duracion_td = timedelta(hours=h, minutes=m, seconds=s)

                PlanServicio.objects.create(
                    trabajador=trabajador,
                    nombre=plan["nombre"],
                    descripcion=plan["descripcion"],
                    duracion_estimado=duracion_td,
                    precio=plan["precio"],
                    incluye=plan["incluye"]
                )

        self.stdout.write(self.style.SUCCESS("✅ Todos los planes de tapicero fueron cargados correctamente."))
