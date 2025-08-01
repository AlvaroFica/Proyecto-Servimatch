# Generated by Django 5.2.1 on 2025-07-02 04:16

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0018_chat_mensaje'),
    ]

    operations = [
        migrations.CreateModel(
            name='Peticion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('mensaje_inicial', models.TextField(blank=True)),
                ('creada_en', models.DateTimeField(auto_now_add=True)),
                ('cliente', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='peticiones_enviadas', to='core.cliente')),
                ('trabajador', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='peticiones_recibidas', to='core.trabajador')),
            ],
            options={
                'unique_together': {('cliente', 'trabajador')},
            },
        ),
        migrations.AddField(
            model_name='chat',
            name='peticion',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='chats', to='core.peticion'),
        ),
    ]
