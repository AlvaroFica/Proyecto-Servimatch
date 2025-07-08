from django.apps import AppConfig

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'  # <- debe coincidir con el nombre de tu app

    def ready(self):
        import core.signals  # <- importa el archivo con tus signals
