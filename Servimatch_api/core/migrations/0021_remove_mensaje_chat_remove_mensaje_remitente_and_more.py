# Generated by Django 5.2.1 on 2025-07-03 03:38

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0020_alter_chat_unique_together_remove_mensaje_enviado_en_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='mensaje',
            name='chat',
        ),
        migrations.RemoveField(
            model_name='mensaje',
            name='remitente',
        ),
        migrations.DeleteModel(
            name='Chat',
        ),
        migrations.DeleteModel(
            name='Mensaje',
        ),
    ]
