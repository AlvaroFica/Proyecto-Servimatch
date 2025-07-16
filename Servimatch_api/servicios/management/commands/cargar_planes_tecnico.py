import sys
import os
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from django.core.management.base import BaseCommand
from core.models import PlanServicio, Trabajador

class Command(BaseCommand):
    help = "Carga planes de servicio para varios trabajadores técnicos computacionales"

    def handle(self, *args, **kwargs):
        correos_trabajadores = [
            "andresTec@gmail.com",
            "sebastianTec@gmail.com",
            "ignacioTec@gmail.com",
            "camiloTec@gmail.com",
            "matiasTec@gmail.com",
            "francoTec@gmail.com",
            "bastianTec@gmail.com",
            "danielTec@gmail.com",
            "luisTec@gmail.com",
            "alexisTec@gmail.com",
        ]

        planes = [
            {
                "nombre": "Formateo e instalación de sistema operativo",
                "descripcion": "Formateo completo del equipo e instalación de Windows, drivers y software básico.",
                "duracion": "01:30:00",
                "precio": 25000,
                "incluye": ["Instalación de Windows", "Office", "Antivirus", "Drivers actualizados"]
            },
            {
                "nombre": "Limpieza física interna del equipo",
                "descripcion": "Desarme y limpieza profunda del equipo para mejorar su rendimiento y evitar sobrecalentamiento.",
                "duracion": "00:45:00",
                "precio": 15000,
                "incluye": ["Desarme del equipo", "Limpieza con aire", "Revisión de ventiladores"]
            },
            {
                "nombre": "Diagnóstico y reparación de errores",
                "descripcion": "Detección de fallas comunes, revisión de hardware y software, entrega de diagnóstico técnico.",
                "duracion": "01:00:00",
                "precio": 20000,
                "incluye": ["Pruebas de hardware", "Chequeo de sistema", "Informe técnico"]
            },
            {
                "nombre": "Actualización de componentes (RAM/Disco)",
                "descripcion": "Cambio o instalación de memoria RAM o disco duro/SSD en equipos de escritorio o portátiles.",
                "duracion": "00:40:00",
                "precio": 18000,
                "incluye": ["Instalación física", "Configuración del sistema", "Pruebas de arranque"]
            },
            {
                "nombre": "Respaldo y recuperación de archivos",
                "descripcion": "Extracción segura de archivos desde un equipo dañado o lento. Copia en medio externo.",
                "duracion": "01:20:00",
                "precio": 22000,
                "incluye": ["Revisión del disco", "Copia de archivos", "Medio de respaldo (USB o cliente)"]
            },
            {
                "nombre": "Optimización de sistema lento",
                "descripcion": "Limpieza de software innecesario, optimización de inicio y recursos.",
                "duracion": "00:50:00",
                "precio": 16000,
                "incluye": ["Eliminación de malware", "Optimización de inicio", "Configuración avanzada"]
            },
        ]

        for email in correos_trabajadores:
            try:
                trabajador = Trabajador.objects.get(usuario__email=email)
                self.stdout.write(self.style.SUCCESS(f"💻 Cargando planes para: {email}"))
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

        self.stdout.write(self.style.SUCCESS("✅ Todos los planes de técnico computacional fueron cargados correctamente."))
