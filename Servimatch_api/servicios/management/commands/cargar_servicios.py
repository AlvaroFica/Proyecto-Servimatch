from django.core.management.base import BaseCommand
from core.models import Profesion, Servicio

class Command(BaseCommand):
    help = "Carga servicios (subcategorías con iconos) asociados a cada profesión"

    def handle(self, *args, **kwargs):
        data = {
            "🔌 Electricista": [
                "🔌 Instalación de enchufes",
                "⚡ Revisión de cortocircuitos",
                "🏠 Cableado eléctrico residencial",
                "💡 Instalación de luminarias LED",
                "📄 Certificación TE1"
            ],
            "🔧 Gasfiter": [
                "🔥 Instalación de calefont",
                "🧰 Reparación de cañerías",
                "🚨 Detección de fugas de gas",
                "🚿 Cambio de grifería",
                "🛠️ Mantención de calefactores"
            ],
            "🔨 Carpintero": [
                "🪚 Fabricación de muebles a medida",
                "🚪 Instalación de puertas",
                "🏚️ Reparación de techumbres",
                "🌳 Decks y terrazas de madera",
                "🪵 Revestimientos interiores"
            ],
            "🎨 Pintor": [
                "🎨 Pintura de interiores",
                "🏘️ Pintura de fachadas",
                "🖌️ Aplicación de esmaltes",
                "🧱 Estuco y empaste",
                "🌀 Pintura decorativa"
            ],
            "👷‍♂️ Albañil": [
                "🏗️ Levantamiento de muros",
                "🪨 Construcción de radieres",
                "🧱 Colocación de ladrillos",
                "🪟 Instalación de cerámicas",
                "🔧 Reparación de grietas"
            ],
            "🌳 Jardinero": [
                "🌿 Corte de césped",
                "✂️ Poda de arbustos",
                "💧 Instalación de riego automático",
                "🌺 Diseño de paisajismo",
                "🪴 Mantención de jardines"
            ],
            "🛠 Cerrajero": [
                "🔐 Cambio de chapas",
                "🗝️ Duplicado de llaves",
                "🚪 Apertura de puertas",
                "📲 Cerraduras digitales",
                "🛡️ Reforzamiento de seguridad"
            ],
            "⚙ Soldador": [
                "🔩 Soldadura estructural",
                "🧰 Reparación de rejas",
                "🚪 Fabricación de portones",
                "⚙️ Soldadura MIG/TIG",
                "🪛 Rejas de protección"
            ],
            "🪑 Tapicero": [
                "🛋️ Tapizado de sillones",
                "🪑 Reparación de sillas antiguas",
                "🛏️ Tapizado de respaldos de cama",
                "🎯 Restauración de muebles",
                "📦 Cambio de relleno"
            ],
            "💻 Técnico computacional": [
                "💻 Formateo de computador",
                "🧼 Limpieza de virus",
                "⚙️ Instalación de software",
                "🔧 Reparación de hardware",
                "🌐 Configuración de redes"
            ]
        }

        for nombre_profesion, servicios in data.items():
            profesion = Profesion.objects.filter(nombre=nombre_profesion).first()
            if not profesion:
                self.stdout.write(self.style.ERROR(f'❌ Profesión no encontrada: {nombre_profesion}'))
                continue

            for nombre_servicio in servicios:
                servicio, creado = Servicio.objects.get_or_create(
                    nombre=nombre_servicio,
                    profesion=profesion,
                    defaults={"descripcion": f"Servicio de {nombre_servicio.lower()}"}
                )
                if creado:
                    self.stdout.write(self.style.SUCCESS(f'✅ Servicio creado: {nombre_servicio} → {nombre_profesion}'))
                else:
                    self.stdout.write(f'⏩ Ya existe: {nombre_servicio} → {nombre_profesion}')
