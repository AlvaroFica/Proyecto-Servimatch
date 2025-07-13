import sys
import os
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from django.core.management.base import BaseCommand
from core.models import PlanServicio, Trabajador

class Command(BaseCommand):
    help = "Carga planes de servicio para trabajadores carpinteros"

    def handle(self, *args, **kwargs):
        correos_trabajadores = [
            "manuelCar@gmail.com",
            "claudioCar@gmail.com",
            "hugoCar@gmail.com",
            "estebanCar@gmail.com",
            "gonzaloCar@gmail.com",
            "rafaelCar@gmail.com",
            "samuelCar@gmail.com",
            "luisCar@gmail.com",
            "enzoCar@gmail.com",
            "benjaminCar@gmail.com",
        ]


        planes = [
            {
                "nombre": "Instalación de puertas interiores",
                "descripcion": "Montaje de puerta nueva con bisagras y cerradura.",
                "duracion": "01:30:00",
                "precio": 35000,
                "incluye": ["Bisagras", "Cerradura", "Nivelación", "Mano de obra"]
            },
            {
                "nombre": "Fabricación de estantería a medida",
                "descripcion": "Diseño e instalación de estantería de madera según medidas del cliente.",
                "duracion": "03:00:00",
                "precio": 70000,
                "incluye": ["Tablas MDF", "Tornillos", "Fijaciones", "Instalación"]
            },
            {
                "nombre": "Reparación de muebles",
                "descripcion": "Ajuste o restauración de muebles dañados o sueltos.",
                "duracion": "01:00:00",
                "precio": 25000,
                "incluye": ["Herramientas", "Material de reparación", "Lijado", "Mano de obra"]
            },
            {
                "nombre": "Construcción de cobertizo",
                "descripcion": "Estructura de madera techada para patio o estacionamiento.",
                "duracion": "05:00:00",
                "precio": 120000,
                "incluye": ["Vigas", "Tejas", "Soportes", "Construcción"]
            },
            {
                "nombre": "Revestimiento de muros",
                "descripcion": "Instalación de paneles de madera en interiores para decoración.",
                "duracion": "02:30:00",
                "precio": 60000,
                "incluye": ["Paneles", "Adhesivo", "Nivelado"]
            },
            {
                "nombre": "Cambio de piso flotante",
                "descripcion": "Remplazo de piso dañado por uno nuevo de tipo flotante.",
                "duracion": "04:00:00",
                "precio": 90000,
                "incluye": ["Piso nuevo", "Cortes", "Nivelación", "Mano de obra"]
            },
        ]

        for email in correos_trabajadores:
            try:
                trabajador = Trabajador.objects.get(usuario__email=email)
                self.stdout.write(self.style.SUCCESS(f"🔨 Cargando planes para: {email}"))
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

        self.stdout.write(self.style.SUCCESS("✅ Planes de carpintero cargados correctamente."))
