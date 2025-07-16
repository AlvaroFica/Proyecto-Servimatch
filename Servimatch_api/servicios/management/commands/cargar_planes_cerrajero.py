import sys
import os
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from django.core.management.base import BaseCommand
from core.models import PlanServicio, Trabajador

class Command(BaseCommand):
    help = "Carga planes de servicio para varios trabajadores cerrajeros"

    def handle(self, *args, **kwargs):
        correos_trabajadores = [
            "jorgeCer@gmail.com",
            "danielCer@gmail.com",
            "raulCer@gmail.com",
            "marioCer@gmail.com",
            "eduardoCer@gmail.com",
            "oscarCer@gmail.com",
            "cristianCer@gmail.com",
            "luisCer@gmail.com",
            "sebastianCer@gmail.com",
            "ivanCer@gmail.com",
        ]

        planes = [
            {
                "nombre": "Apertura de puerta sin daño",
                "descripcion": "Apertura de puerta por pérdida de llaves sin dañar cerradura o puerta.",
                "duracion": "00:30:00",
                "precio": 20000,
                "incluye": ["Herramientas especializadas", "Mano de obra", "Servicio urgente"]
            },
            {
                "nombre": "Cambio de cerradura simple",
                "descripcion": "Instalación de cerradura simple nueva por daño o pérdida de seguridad.",
                "duracion": "00:45:00",
                "precio": 25000,
                "incluye": ["Cerradura estándar", "Instalación", "Retiro de cerradura anterior"]
            },
            {
                "nombre": "Instalación de cerradura de alta seguridad",
                "descripcion": "Colocación de cerradura multipunto o de seguridad reforzada.",
                "duracion": "01:30:00",
                "precio": 50000,
                "incluye": ["Cerradura de seguridad", "Ajuste de marco", "Herramientas especializadas"]
            },
            {
                "nombre": "Duplicado de llaves en terreno",
                "descripcion": "Servicio de copia de llaves directamente en domicilio.",
                "duracion": "00:20:00",
                "precio": 10000,
                "incluye": ["Llaves nuevas", "Máquina duplicadora portátil", "Asesoría"]
            },
            {
                "nombre": "Reparación de cerradura trabada",
                "descripcion": "Solución de fallas mecánicas de cerraduras que no giran o están trabadas.",
                "duracion": "00:40:00",
                "precio": 18000,
                "incluye": ["Lubricación", "Ajustes", "Revisión general"]
            },
            {
                "nombre": "Instalación de cerrojo adicional",
                "descripcion": "Instalación de un cerrojo adicional para aumentar seguridad.",
                "duracion": "00:35:00",
                "precio": 22000,
                "incluye": ["Cerrojo adicional", "Perforación e instalación", "Revisión de funcionamiento"]
            },
        ]

        for email in correos_trabajadores:
            try:
                trabajador = Trabajador.objects.get(usuario__email=email)
                self.stdout.write(self.style.SUCCESS(f"🔐 Cargando planes para: {email}"))
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

        self.stdout.write(self.style.SUCCESS("✅ Todos los planes de cerrajería fueron cargados correctamente."))
