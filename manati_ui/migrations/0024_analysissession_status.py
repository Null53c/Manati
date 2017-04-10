# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2017-04-06 15:01
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manati_ui', '0023_analysissession_uuid'),
    ]

    operations = [
        migrations.AddField(
            model_name='analysissession',
            name='status',
            field=models.CharField(choices=[('open', 'Open'), ('closed', 'Closed')], default='open', max_length=30),
        ),
    ]
