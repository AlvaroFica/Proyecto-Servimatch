from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.conf import settings

class Usuario(AbstractUser):
    ROL_CHOICES = [
        ('cliente', 'Cliente'),
        ('trabajador', 'Trabajador'),
        ('ambos', 'Ambos'),
    ]

    es_trabajador = models.BooleanField(default=False)
    foto_perfil   = models.ImageField(upload_to='perfiles/', null=True, blank=True)
    biografia     = models.TextField(blank=True)
    es_admin = models.BooleanField(default=False)
    direccion = models.CharField(max_length=255, blank=True)
    latitud   = models.FloatField(null=True, blank=True)
    longitud  = models.FloatField(null=True, blank=True)

    nombre   = models.CharField(max_length=100, blank=True)
    apellido = models.CharField(max_length=100, blank=True)
    telefono = models.CharField(max_length=20, blank=True)

    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='cliente')
   
    def __str__(self):
        return self.username

class Cliente(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True, related_name='cliente_profile')

    def __str__(self):
        return self.usuario.username

# core/models.py

class Servicio(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    profesion = models.ForeignKey(
        'Profesion',
        on_delete=models.CASCADE,
        related_name='servicios',
        null=True  # Temporalmente permitir null
    )

    def __str__(self):
        return f"{self.nombre} ({self.profesion.nombre})" if self.profesion else self.nombre


class Feedback(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='feedbacks')
    trabajador = models.ForeignKey('Trabajador', on_delete=models.SET_NULL, null=True, blank=True, related_name='reportes_recibidos')
    mensaje = models.TextField()
    respuesta = models.TextField(blank=True, null=True)
    tipo = models.CharField(max_length=50, blank=True)  # Ej: "soporte", "problema", "reporte"
    role = models.CharField(max_length=20, blank=True)  # "cliente" o "trabajador"
    respondido = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Feedback #{self.id} de {self.usuario.username}'

class Profesion(models.Model):
    nombre      = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.nombre
    


class Trabajador(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True, related_name='trabajador_profile')
    disponibilidad = models.TextField(blank=True)  # Horarios y días disponibles
    latitud = models.FloatField(null=True, blank=True)
    longitud = models.FloatField(null=True, blank=True)
    servicios = models.ManyToManyField('Servicio', related_name='trabajadores')
    profesion = models.ForeignKey(Profesion, on_delete=models.SET_NULL, null=True, blank=True)


    def __str__(self):
        return self.usuario.username

class ExperienciaProfesional(models.Model):
    trabajador         = models.ForeignKey(Trabajador, on_delete=models.CASCADE, related_name='experiencias')
    profesion          = models.ForeignKey(Profesion, on_delete=models.CASCADE, related_name='experiencias')
    anos_experiencia   = models.IntegerField()
    descripcion_breve  = models.TextField(blank=True)
    idiomas            = models.CharField(max_length=200, blank=True)

    class Meta:
        unique_together = ('trabajador', 'profesion')

    def __str__(self):
        return f"{self.trabajador.usuario.username} – {self.profesion.nombre}"

class Solicitud(models.Model):
    cliente             = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='solicitudes'
    )
    servicio            = models.ForeignKey(
        Servicio,
        on_delete=models.CASCADE,
        related_name='solicitudes'
    )
    nombre              = models.CharField(max_length=100, default='')
    descripcion         = models.TextField()
    precio              = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    ubicacion           = models.CharField(max_length=200)
    # Nuevos campos para coordenadas
    latitud             = models.FloatField(null=True, blank=True)
    longitud            = models.FloatField(null=True, blank=True)
    class DiaSemana(models.IntegerChoices):
        LUNES     = 1, 'Lunes'
        MARTES    = 2, 'Martes'
        MIERCOLES = 3, 'Miércoles'
        JUEVES    = 4, 'Jueves'
        VIERNES   = 5, 'Viernes'
        SABADO    = 6, 'Sábado'
        DOMINGO   = 7, 'Domingo'

    dia_semana = models.IntegerField(
        choices=DiaSemana.choices,
        verbose_name='Día de la semana',
        default=1     # Valor por defecto para las filas existentes
    )
    hora_preferida = models.TimeField(
        verbose_name='Hora preferida',
        null=True,    # Permite NULL en las filas antiguas
        blank=True
    )
    
    fecha_creacion      = models.DateTimeField(auto_now_add=True)
    fecha_preferida     = models.DateTimeField(null=True, blank=True)
    trabajador_asignado = models.ForeignKey(
        Trabajador,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='solicitudes_asignadas'
    )
 
    ESTADOS_SOLICITUD = [
    ('Pendiente', 'Pendiente'),
    ('Aceptada', 'Aceptada'),
    ('Finalizada', 'Finalizada'),
    ('Cancelada', 'Cancelada'),
]
    estado = models.CharField(max_length=20, choices=ESTADOS_SOLICITUD, default='Pendiente')


    aceptada            = models.BooleanField(default=False)

    def __str__(self):
        return f"Solicitud de {self.cliente} para {self.servicio}"

class Pago(models.Model):
    solicitud = models.OneToOneField(Solicitud, on_delete=models.CASCADE, related_name='pago')
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateTimeField(auto_now_add=True)
    liberado = models.BooleanField(default=False)
    # Otros detalles del pago

    def __str__(self):
        return f"Pago de {self.monto} para {self.solicitud}"

class Calificacion(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE, related_name='calificaciones_dadas')
    trabajador = models.ForeignKey(Trabajador, on_delete=models.CASCADE, related_name='calificaciones_recibidas')
    solicitud = models.ForeignKey(Solicitud, on_delete=models.CASCADE, related_name='calificaciones')
    puntuacion = models.IntegerField(choices=[(1, '1 estrella'), (2, '2 estrellas'), (3, '3 estrellas'), (4, '4 estrellas'), (5, '5 estrellas')])
    comentario = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Calificación de {self.cliente} a {self.trabajador}: {self.puntuacion} estrellas"

class Etiqueta(models.Model):
    nombre = models.CharField(max_length=50)

    def __str__(self):
        return self.nombre

class EtiquetaCalificacion(models.Model):
    calificacion = models.ForeignKey(Calificacion, on_delete=models.CASCADE, related_name='etiquetas_calificacion')
    etiqueta = models.ForeignKey(Etiqueta, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('calificacion', 'etiqueta')  # Evita duplicados

    def __str__(self):
        return f"{self.calificacion} - {self.etiqueta}"
    
class FotoTrabajador(models.Model):
    trabajador = models.ForeignKey(
        Trabajador,
        on_delete=models.CASCADE,      # ← aquí debe ir un callable
        related_name='fotos'           # opcional, pero recomendado
    )
    imagen     = models.ImageField(upload_to='galeria_trabajadores/')
    titulo     = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Foto de {self.trabajador.usuario.username} ({self.id})"

class PlanServicio(models.Model):
    trabajador = models.ForeignKey(
        Trabajador,
        on_delete=models.CASCADE,
        related_name='planes'
    )
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    duracion_estimado = models.DurationField(help_text='Formato HH:MM:SS')
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    incluye = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f'{self.nombre} – {self.trabajador.usuario.username}'

      
class Reserva(models.Model):
    ESTADO_CHOICES = [
        ('PENDIENTE', 'Pendiente de pago'),
        ('CONFIRMADA', 'Confirmada'),
        ('CANCELADA', 'Cancelada'),
    ]

    # Reemplazar o eliminar si no se usa
    trabajador = models.ForeignKey(
        Trabajador,
        on_delete=models.CASCADE,
        related_name='reservas',
        null=True, blank=True,
    )
    # ✅ Nuevo campo
    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.CASCADE,
        related_name='reservas',
        null=True, blank=True  # solo si tienes datos existentes en la base
    )
    plan = models.ForeignKey(
        PlanServicio,
        on_delete=models.CASCADE,
        related_name='reservas'
    )
    fecha = models.DateField()
    hora_inicio = models.TimeField()
    hora_fin = models.TimeField()
    estado = models.CharField(
        max_length=10,
        choices=ESTADO_CHOICES,
        default='PENDIENTE'
    )
    creado_en = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('plan', 'fecha', 'hora_inicio')

    def __str__(self):
        return f"Reserva {self.plan.nombre} {self.fecha} {self.hora_inicio}"


from django.conf import settings

class Chat(models.Model):
    cliente = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chats_como_cliente'
    )
    trabajador = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='chats_como_trabajador'
    )
    creado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Chat entre {self.cliente} y {self.trabajador}'


class Mensaje(models.Model):
    chat = models.ForeignKey(Chat, on_delete=models.CASCADE, related_name='mensajes')
    remitente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    contenido = models.TextField()
    enviado = models.DateTimeField(auto_now_add=True)
    leido = models.BooleanField(default=False)  # ✅ NUEVO

    def __str__(self):
        return f'{self.remitente}: {self.contenido[:30]}'

class Notificacion(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notificaciones')
    mensaje = models.CharField(max_length=255)
    leido = models.BooleanField(default=False)
    tipo = models.CharField(max_length=50, blank=True)  # ejemplo: 'reserva', 'solicitud'
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.mensaje}"

class PagoServicio(models.Model):
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plan = models.ForeignKey('PlanServicio', on_delete=models.CASCADE)
    trabajador = models.ForeignKey('Trabajador', on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=50, default='pendiente')
    fecha = models.DateTimeField(auto_now_add=True)
    flow_order = models.CharField(max_length=100, blank=True, null=True)
    flow_token = models.CharField(max_length=100, blank=True, null=True)

    def __str__(self):
        return f'Pago de {self.usuario} a {self.trabajador} por {self.plan}'

class PagoSolicitud(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
        ('fallido', 'Fallido'),
    ]

    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    trabajador = models.ForeignKey('Trabajador', on_delete=models.CASCADE)
    solicitud = models.OneToOneField('Solicitud', on_delete=models.CASCADE)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=10, choices=ESTADOS, default='pendiente')
    flow_order = models.CharField(max_length=100, blank=True, null=True)
    flow_token = models.CharField(max_length=100, blank=True, null=True)
    fecha = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Pago solicitud {self.solicitud.id} - {self.estado}"

