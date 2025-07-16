import sys
import os
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from django.core.management.base import BaseCommand
from core.models import PlanServicio, Trabajador

class Command(BaseCommand):
    help = "Carga planes de servicio para varios trabajadores soldadores"

    def handle(self, *args, **kwargs):
        correos_trabajadores = [
            "ricardoSol@gmail.com",
            "hectorSol@gmail.com",
            "arturoSol@gmail.com",
            "victorSol@gmail.com",
            "leonardoSol@gmail.com",
            "manuelSol@gmail.com",
            "franciscoSol@gmail.com",
            "rodrigoSol@gmail.com",
            "jorgeSol@gmail.com",
            "gustavoSol@gmail.com",
        ]

        planes = [
            {
                "nombre": "Soldadura de reja metálica",
                "descripcion": "Reparación o instalación de rejas metálicas en exterior o interior.",
                "duracion": "01:30:00",
                "precio": 45000,
                "incluye": ["Máquina de soldar", "Electrodos", "Protección anticorrosiva", "Mano de obra"]
            },
            {
                "nombre": "Refuerzo de estructura metálica",
                "descripcion": "Refuerzo de estructuras débiles con perfiles metálicos soldados.",
                "duracion": "02:00:00",
                "precio": 60000,
                "incluye": ["Perfiles metálicos", "Soldadura reforzada", "Revisión estructural"]
            },
            {
                "nombre": "Soldadura en portón abatible",
                "descripcion": "Soldadura de bisagras o refuerzos en portones metálicos.",
                "duracion": "01:00:00",
                "precio": 35000,
                "incluye": ["Bisagras nuevas", "Soldadura de precisión", "Ajuste de apertura"]
            },
            {
                "nombre": "Fabricación de estructura básica",
                "descripcion": "Construcción de marco metálico para estructuras básicas.",
                "duracion": "03:00:00",
                "precio": 80000,
                "incluye": ["Corte de perfiles", "Ensamble y soldadura", "Revisión final"]
            },
            {
                "nombre": "Soldadura en escaleras metálicas",
                "descripcion": "Reparación o ajuste de peldaños y soportes de escalera.",
                "duracion": "01:20:00",
                "precio": 40000,
                "incluye": ["Electrodos", "Soldadura estructural", "Refuerzo"]
            },
            {
                "nombre": "Soldadura de urgencia",
                "descripcion": "Atención rápida para reparación urgente de elementos metálicos.",
                "duracion": "00:45:00",
                "precio": 30000,
                "incluye": ["Despliegue rápido", "Revisión y diagnóstico", "Soldadura puntual"]
            },
        ]

        for email in correos_trabajadores:
            try:
                trabajador = Trabajador.objects.get(usuario__email=email)
                self.stdout.write(self.style.SUCCESS(f"🔥 Cargando planes para: {email}"))
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

        self.stdout.write(self.style.SUCCESS("✅ Todos los planes de soldadura fueron cargados correctamente."))
