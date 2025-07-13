import sys
import os
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from django.core.management.base import BaseCommand
from core.models import PlanServicio, Trabajador

class Command(BaseCommand):
    help = "Carga planes de servicio para varios trabajadores albañiles"

    def handle(self, *args, **kwargs):
        correos_trabajadores = [
            "davidAlb@gmail.com",
            "sergioAlb@gmail.com",
            "andresAlb@gmail.com",
            "francoAlb@gmail.com",
            "jonathanAlb@gmail.com",
            "nicolasAlb@gmail.com",
            "patricioAlb@gmail.com",
            "marceloAlb@gmail.com",
            "hermanAlb@gmail.com",
            "cristianAlb@gmail.com",
        ]

        planes = [
            {
                "nombre": "Levantamiento de muro de ladrillo",
                "descripcion": "Construcción de muro con ladrillo fiscal, incluye mezcla, alineación y nivelación.",
                "duracion": "06:00:00",
                "precio": 95000,
                "incluye": ["Ladrillos", "Cemento", "Arena", "Mano de obra", "Herramientas"]
            },
            {
                "nombre": "Reparación de grietas en muros",
                "descripcion": "Relleno de grietas estructurales o superficiales, con terminación de estuco.",
                "duracion": "02:00:00",
                "precio": 30000,
                "incluye": ["Mortero", "Herramientas", "Terminación básica"]
            },
            {
                "nombre": "Radier de concreto",
                "descripcion": "Instalación de base de concreto para piso o terraza. Incluye nivelación y compactación.",
                "duracion": "05:00:00",
                "precio": 85000,
                "incluye": ["Cemento", "Grava", "Nivelación", "Compactación", "Herramientas"]
            },
            {
                "nombre": "Construcción de escalera exterior",
                "descripcion": "Levantamiento de escalera de concreto con terminación rugosa.",
                "duracion": "06:00:00",
                "precio": 100000,
                "incluye": ["Cemento", "Formaleta", "Hierro", "Nivelación", "Mano de obra"]
            },
            {
                "nombre": "Enchape de cerámica en muro",
                "descripcion": "Colocación de cerámica decorativa en muro de baño o cocina.",
                "duracion": "03:00:00",
                "precio": 50000,
                "incluye": ["Cerámicos", "Pegamento", "Crucetas", "Lechada", "Mano de obra"]
            },
            {
                "nombre": "Apertura de vano para puerta/ventana",
                "descripcion": "Creación de vano estructural para instalación de puerta o ventana nueva.",
                "duracion": "04:00:00",
                "precio": 70000,
                "incluye": ["Corte de muro", "Refuerzo estructural", "Herramientas", "Mano de obra"]
            },
        ]

        for email in correos_trabajadores:
            try:
                trabajador = Trabajador.objects.get(usuario__email=email)
                self.stdout.write(self.style.SUCCESS(f"🏗️ Cargando planes para: {email}"))
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
