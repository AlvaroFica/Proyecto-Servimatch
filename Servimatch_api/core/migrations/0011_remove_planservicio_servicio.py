# Generated by Django 5.1.2 on 2025-05-29 01:14

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0010_planservicio_incluye_reserva'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='planservicio',
            name='servicio',
        ),
    ]
