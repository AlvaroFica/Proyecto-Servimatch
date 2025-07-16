import sys
import os
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from django.core.management.base import BaseCommand
from core.models import PlanServicio, Trabajador

class Command(BaseCommand):
    help = "Carga planes de servicio para varios trabajadores jardineros"

    def handle(self, *args, **kwargs):
        correos_trabajadores = [
            "pedroJar@gmail.com",
            "joseJar@gmail.com",
            "camiloJar@gmail.com",
            "gonzaloJar@gmail.com",
            "rodrigoJar@gmail.com",
            "darioJar@gmail.com",
            "luisJar@gmail.com",
            "victorJar@gmail.com",
            "manuelJar@gmail.com",
            "javierJar@gmail.com",
        ]

        planes = [
            {
                "nombre": "Corte de césped",
                "descripcion": "Servicio de corte y perfilado de césped en jardines residenciales.",
                "duracion": "01:00:00",
                "precio": 20000,
                "incluye": ["Cortadora de pasto", "Perfilador", "Mano de obra", "Limpieza final"]
            },
            {
                "nombre": "Poda de arbustos y setos",
                "descripcion": "Poda estética y de mantenimiento de arbustos, setos o cercos vivos.",
                "duracion": "02:00:00",
                "precio": 30000,
                "incluye": ["Tijeras de poda", "Escalera", "Bolsa de residuos", "Desinfección de herramientas"]
            },
            {
                "nombre": "Instalación de riego por goteo",
                "descripcion": "Diseño e instalación de sistema de riego por goteo automatizado.",
                "duracion": "03:30:00",
                "precio": 70000,
                "incluye": ["Mangueras", "Gotero", "Programador", "Conectores", "Instalación"]
            },
            {
                "nombre": "Fertilización de jardín",
                "descripcion": "Aplicación de fertilizante orgánico o químico según tipo de vegetación.",
                "duracion": "00:45:00",
                "precio": 15000,
                "incluye": ["Fertilizante", "Herramientas de aplicación", "Evaluación del suelo"]
            },
            {
                "nombre": "Diseño de jardín pequeño",
                "descripcion": "Diseño y plantación de especies para jardín de hasta 20 m².",
                "duracion": "04:00:00",
                "precio": 85000,
                "incluye": ["Asesoría", "Selección de plantas", "Plantación", "Decoración básica"]
            },
            {
                "nombre": "Control de plagas en áreas verdes",
                "descripcion": "Tratamiento para eliminar plagas comunes como pulgones, hongos y babosas.",
                "duracion": "01:30:00",
                "precio": 25000,
                "incluye": ["Pesticidas", "Equipos de protección", "Aplicación segura", "Seguimiento"]
            },
        ]

        for email in correos_trabajadores:
            try:
                trabajador = Trabajador.objects.get(usuario__email=email)
                self.stdout.write(self.style.SUCCESS(f"🌿 Cargando planes para: {email}"))
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

        self.stdout.write(self.style.SUCCESS("✅ Todos los planes de jardinería fueron cargados correctamente."))
