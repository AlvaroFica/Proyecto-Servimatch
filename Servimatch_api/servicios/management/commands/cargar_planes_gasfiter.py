import sys
import os
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from django.core.management.base import BaseCommand
from core.models import PlanServicio, Trabajador

class Command(BaseCommand):
    help = "Carga planes de servicio para trabajadores gasfiter"

    def handle(self, *args, **kwargs):
        correos_trabajadores = [
            "pedroGas@gmail.com",
            "cristobalGas@gmail.com",
            "ignacioGas@gmail.com",
            "franciscoGas@gmail.com",
            "gabrielGas@gmail.com",
            "sebastianGas@gmail.com",
            "rodrigoGas@gmail.com",
            "marcoGas@gmail.com",
            "danielGas@gmail.com",
            "alvaroGas@gmail.com",
        ]

        planes = [
            {
                "nombre": "Destape de cañerías",
                "descripcion": "Solución a obstrucciones en lavamanos, lavaplatos o WC mediante herramientas especializadas.",
                "duracion": "01:00:00",
                "precio": 25000,
                "incluye": ["Herramientas de destape", "Revisión de flujo", "Mano de obra"]
            },
            {
                "nombre": "Cambio de llave de paso",
                "descripcion": "Reemplazo de llave de paso defectuosa por una nueva, asegurando estanqueidad.",
                "duracion": "00:45:00",
                "precio": 20000,
                "incluye": ["Llave de paso", "Materiales básicos", "Mano de obra"]
            },
            {
                "nombre": "Instalación de lavaplatos",
                "descripcion": "Montaje y conexión de lavaplatos nuevo, incluyendo desagüe y sellado.",
                "duracion": "02:00:00",
                "precio": 40000,
                "incluye": ["Sellos", "Desagüe", "Mano de obra", "Revisión general"]
            },
            {
                "nombre": "Reparación de filtraciones",
                "descripcion": "Detección y solución de fugas en cañerías o grifería.",
                "duracion": "01:30:00",
                "precio": 35000,
                "incluye": ["Detector de fuga", "Empaquetaduras", "Mano de obra"]
            },
            {
                "nombre": "Cambio de grifería",
                "descripcion": "Reemplazo de grifería antigua por un modelo nuevo.",
                "duracion": "01:00:00",
                "precio": 28000,
                "incluye": ["Grifería nueva", "Instalación", "Prueba de fugas"]
            },
            {
                "nombre": "Instalación de calefón",
                "descripcion": "Montaje de calefón a gas e instalación de conexiones de agua y gas.",
                "duracion": "03:00:00",
                "precio": 60000,
                "incluye": ["Soportes", "Flexibles", "Revisión de conexiones"]
            },
        ]

        for email in correos_trabajadores:
            try:
                trabajador = Trabajador.objects.get(usuario__email=email)
                self.stdout.write(self.style.SUCCESS(f"👨‍🔧 Cargando planes para: {email}"))
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

        self.stdout.write(self.style.SUCCESS("✅ Planes de gasfiter cargados correctamente."))
