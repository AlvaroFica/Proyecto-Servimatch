import sys
import os
from datetime import timedelta

sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from django.core.management.base import BaseCommand
from core.models import PlanServicio, Trabajador

class Command(BaseCommand):
    help = "Carga planes de servicio para varios trabajadores electricistas"

    def handle(self, *args, **kwargs):
        correos_trabajadores = [
            "carlosEle@gmail.com",
            "andresEle@gmail.com",
            "marceloEle@gmail.com",
            "matiasEle@gmail.com",
            "felipeEle@gmail.com",
            "tomasEle@gmail.com",
            "javierEle@gmail.com",
            "pabloEle@gmail.com",
            "nicolasEle@gmail.com",
            "diegoEle@gmail.com",
        ]

        planes = [
            {
                "nombre": "Instalación de enchufe adicional",
                "descripcion": "Instalación de un nuevo enchufe con canalización superficial o empotrada. Incluye revisión del circuito, materiales básicos y pruebas de funcionamiento.",
                "duracion": "01:30:00",
                "precio": 30000,
                "incluye": ["Canalización superficial", "Caja de enchufe", "Mano de obra", "Revisión general"]
            },
            {
                "nombre": "Cambio de enchufe dañado",
                "descripcion": "Reemplazo de enchufe antiguo o quemado por uno nuevo. Incluye revisión de continuidad eléctrica y seguridad de la instalación.",
                "duracion": "00:30:00",
                "precio": 15000,
                "incluye": ["Enchufe nuevo", "Revisión de continuidad", "Materiales básicos", "Mano de obra"]
            },
            {
                "nombre": "Instalación de interruptor doble",
                "descripcion": "Instalación de interruptor doble para control de dos luminarias desde un mismo punto.",
                "duracion": "00:45:00",
                "precio": 18000,
                "incluye": ["Interruptor doble", "Conexión segura", "Canalización básica", "Materiales básicos"]
            },
            {
                "nombre": "Ampliación de circuito eléctrico",
                "descripcion": "Creación de nueva línea desde el tablero para conectar electrodomésticos adicionales. Incluye canalización y protección adecuada.",
                "duracion": "02:00:00",
                "precio": 45000,
                "incluye": ["Cableado nuevo", "Disyuntor", "Tubos conduit", "Revisión del tablero", "Materiales"]
            },
            {
                "nombre": "Instalación de lámpara colgante",
                "descripcion": "Montaje de lámpara de techo con soporte de seguridad y conexión eléctrica.",
                "duracion": "00:40:00",
                "precio": 20000,
                "incluye": ["Instalación de soporte", "Conexión eléctrica", "Prueba de encendido", "Asesoría en ubicación"]
            },
            {
                "nombre": "Cambio de automáticos en tablero",
                "descripcion": "Reemplazo de disyuntores defectuosos o antiguos por nuevos modelos.",
                "duracion": "01:00:00",
                "precio": 35000,
                "incluye": ["Disyuntores nuevos", "Verificación de carga", "Revisión de tablero", "Materiales de instalación"]
            },
        ]

        for email in correos_trabajadores:
            try:
                trabajador = Trabajador.objects.get(usuario__email=email)
                self.stdout.write(self.style.SUCCESS(f"👷 Cargando planes para: {email}"))
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
