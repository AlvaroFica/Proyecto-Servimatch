import sys
import os
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from django.core.management.base import BaseCommand
from core.models import PlanServicio, Trabajador

class Command(BaseCommand):
    help = "Carga planes de servicio para varios trabajadores pintores"

    def handle(self, *args, **kwargs):
        correos_trabajadores = [
            "alejandroPin@gmail.com",
            "rodrigoPin@gmail.com",
            "fabianPin@gmail.com",
            "pabloPin@gmail.com",
            "tomasPin@gmail.com",
            "jorgePin@gmail.com",
            "juanPin@gmail.com",
            "felipePin@gmail.com",
            "matiasPin@gmail.com",
            "ricardoPin@gmail.com",
        ]

        planes = [
            {
                "nombre": "Pintura interior de habitación",
                "descripcion": "Aplicación de pintura en muros interiores. Incluye preparación de superficie, aplicación de base y pintura final.",
                "duracion": "04:00:00",
                "precio": 55000,
                "incluye": ["Pintura base y color", "Cinta de enmascarar", "Rodillos y brochas", "Preparación de superficie"]
            },
            {
                "nombre": "Pintura exterior de muro",
                "descripcion": "Pintado de muro exterior con pintura resistente al clima. Incluye limpieza previa.",
                "duracion": "03:30:00",
                "precio": 60000,
                "incluye": ["Pintura exterior", "Sellador", "Herramientas", "Mano de obra"]
            },
            {
                "nombre": "Reparación y pintura de grietas",
                "descripcion": "Reparación de fisuras pequeñas en muros y posterior pintado.",
                "duracion": "02:00:00",
                "precio": 30000,
                "incluye": ["Masilla", "Lija", "Pintura", "Herramientas"]
            },
            {
                "nombre": "Pintura de techumbre metálica",
                "descripcion": "Aplicación de pintura anticorrosiva a techumbre metálica.",
                "duracion": "05:00:00",
                "precio": 75000,
                "incluye": ["Pintura anticorrosiva", "Rodillos", "Limpieza previa", "Mano de obra"]
            },
            {
                "nombre": "Pintura de puertas de madera",
                "descripcion": "Lijado y pintado de puertas de madera, incluye barniz o esmalte.",
                "duracion": "01:30:00",
                "precio": 25000,
                "incluye": ["Lija", "Pintura", "Barniz o esmalte", "Cinta protectora"]
            },
            {
                "nombre": "Pintura de cielos interiores",
                "descripcion": "Aplicación de pintura blanca o clara en techos interiores.",
                "duracion": "02:30:00",
                "precio": 40000,
                "incluye": ["Pintura blanca", "Rodillo largo", "Protección de mobiliario", "Mano de obra"]
            },
        ]

        for email in correos_trabajadores:
            try:
                trabajador = Trabajador.objects.get(usuario__email=email)
                self.stdout.write(self.style.SUCCESS(f"🎨 Cargando planes para: {email}"))
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

        self.stdout.write(self.style.SUCCESS("✅ Todos los planes fueron cargados correctamente."))
