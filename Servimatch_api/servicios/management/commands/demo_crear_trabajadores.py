from django.core.management.base import BaseCommand
from core.models import Usuario, Trabajador, Cliente, Profesion, Servicio
from django.db import IntegrityError

class Command(BaseCommand):
    help = 'Crea usuarios que se convierten automáticamente en trabajadores demo'

    def handle(self, *args, **kwargs):
        # Lista de trabajadores demo a crear
        datos = [
            {
                "username": "ricardop@gmail.com",
                "email": "ricardop@gmail.com",
                "password": "Liver.2590@",
                "nombre": "Ricardo",
                "apellido": "Sepulveda",
                "telefono": "+56941122464",
                "direccion": "Calle Falsa 123, Santiago",
                "latitud": -33.570826,
                "longitud": -70.6843679,
                "profesion_id": 4,  # Pintor
                "servicios_ids": [1],  # Debe existir este servicio
            },
            {
                "username": "carlos.tapicero@gmail.com",
                "email": "carlos.tapicero@gmail.com",
                "password": "Demo.1234@",
                "nombre": "Carlos",
                "apellido": "Tapia",
                "telefono": "+56945555555",
                "direccion": "Pasaje Los Tapices 321, Renca",
                "latitud": -33.51234,
                "longitud": -70.71234,
                "profesion_id": 10,  # Tapicero
                "servicios_ids": [2],  # Debe existir este servicio
            },
        ]

        for data in datos:
            # Evitar duplicados
            if Usuario.objects.filter(username=data["username"]).exists():
                self.stdout.write(self.style.WARNING(f"⚠️ Usuario {data['username']} ya existe, omitiendo..."))
                continue

            try:
                # Validación de profesión
                try:
                    profesion = Profesion.objects.get(id=data["profesion_id"])
                except Profesion.DoesNotExist:
                    self.stderr.write(f"❌ Profesión ID {data['profesion_id']} no existe. Omitido.")
                    continue

                # Validación de servicios
                servicios_qs = Servicio.objects.filter(id__in=data["servicios_ids"])
                if servicios_qs.count() != len(data["servicios_ids"]):
                    self.stderr.write(f"❌ Servicios no válidos para {data['username']}. Omitido.")
                    continue

                # Crear usuario base
                user = Usuario.objects.create_user(
                    username=data["username"],
                    email=data["email"],
                    password=data["password"],
                    nombre=data["nombre"],
                    apellido=data["apellido"],
                    telefono=data["telefono"],
                    direccion=data["direccion"],
                    latitud=data["latitud"],
                    longitud=data["longitud"],
                    rol="trabajador",
                    es_trabajador=True
                )

                # Crear perfil de Cliente
                Cliente.objects.get_or_create(usuario=user)

                # Crear perfil de Trabajador
                trabajador = Trabajador.objects.create(
                    usuario=user,
                    profesion=profesion,
                    disponibilidad="Lunes a Viernes, 9 a 18 hrs",
                    latitud=data["latitud"],
                    longitud=data["longitud"]
                )
                trabajador.servicios.set(servicios_qs)

                self.stdout.write(self.style.SUCCESS(f"✅ Trabajador creado: {user.username} ({profesion.nombre})"))

            except IntegrityError as e:
                self.stderr.write(f"❌ Error creando usuario: {e}")
