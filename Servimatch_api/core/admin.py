from django.contrib import admin
from .models import Usuario, Cliente, Servicio, Trabajador, Solicitud, Pago, Calificacion, Etiqueta, EtiquetaCalificacion, Profesion, ExperienciaProfesional, PagoServicio

# Registro básico del modelo Usuario
@admin.register(Profesion)
class ProfesionAdmin(admin.ModelAdmin):
    list_display   = ('nombre',)
    search_fields  = ('nombre',)

class ExperienciaInline(admin.TabularInline):
    model = ExperienciaProfesional
    extra = 1  # cuántas filas vacías mostrar

@admin.register(Trabajador)
class TrabajadorAdmin(admin.ModelAdmin):
    list_display    = ('usuario', 'latitud', 'longitud')
    search_fields   = ('usuario__username',)
    filter_horizontal = ('servicios',)
    inlines         = [ExperienciaInline]  # ← aquí

@admin.register(ExperienciaProfesional)
class ExperienciaProfesionalAdmin(admin.ModelAdmin):
    list_display  = ('trabajador', 'profesion', 'anos_experiencia')
    list_filter   = ('profesion',)
    search_fields = ('trabajador__usuario__username', 'profesion__nombre')

@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'es_trabajador', 'is_staff', 'is_active')
    search_fields = ('username', 'email')
    list_filter = ('es_trabajador', 'is_staff', 'is_active')

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ('usuario',)
    search_fields = ('usuario__username',)

@admin.register(Servicio)
class ServicioAdmin(admin.ModelAdmin):
    list_display = ('nombre',)
    search_fields = ('nombre',)


@admin.register(Solicitud)
class SolicitudAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'servicio', 'fecha_creacion', 'aceptada', 'trabajador_asignado')
    list_filter = ('aceptada', 'fecha_creacion')
    search_fields = ('cliente__usuario__username', 'servicio__nombre')

@admin.register(Pago)
class PagoAdmin(admin.ModelAdmin):
    list_display = ('solicitud', 'monto', 'fecha_pago', 'liberado')
    list_filter = ('liberado', 'fecha_pago')

@admin.register(Calificacion)
class CalificacionAdmin(admin.ModelAdmin):
    list_display = ('cliente', 'trabajador', 'puntuacion', 'fecha_creacion')
    list_filter = ('puntuacion', 'fecha_creacion')
    search_fields = ('cliente__usuario__username', 'trabajador__usuario__username')

@admin.register(Etiqueta)
class EtiquetaAdmin(admin.ModelAdmin):
    list_display = ('nombre',)
    search_fields = ('nombre',)

@admin.register(EtiquetaCalificacion)
class EtiquetaCalificacionAdmin(admin.ModelAdmin):
    list_display = ('calificacion', 'etiqueta')
    search_fields = ('calificacion__comentario', 'etiqueta__nombre')


from .models import FotoTrabajador, PlanServicio, Reserva

@admin.register(FotoTrabajador)
class FotoTrabajadorAdmin(admin.ModelAdmin):
    list_display = ('trabajador', 'titulo')
    search_fields = ('trabajador__usuario__username', 'titulo')

@admin.register(PlanServicio)
class PlanServicioAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'trabajador', 'precio', 'duracion_estimado')
    list_filter = ('trabajador',)
    search_fields = ('nombre', 'trabajador__usuario__username')

@admin.register(Reserva)
class ReservaAdmin(admin.ModelAdmin):
    list_display = ('plan', 'cliente', 'fecha', 'hora_inicio', 'estado')
    list_filter = ('estado', 'fecha')
    search_fields = ('cliente__usuario__username', 'plan__nombre')

@admin.register(PagoServicio)
class PagoServicioAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'trabajador', 'plan', 'monto', 'estado', 'fecha', 'flow_order')
    list_filter = ('estado', 'fecha')
    search_fields = ('usuario__email', 'trabajador__nombre', 'plan__nombre', 'flow_order')
    ordering = ('-fecha',)







