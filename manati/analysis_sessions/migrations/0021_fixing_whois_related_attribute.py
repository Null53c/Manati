#
# Copyright (c) 2017 Stratosphere Laboratory.
#
# This file is part of ManaTI Project
# (see <https://stratosphereips.org>). It was created by 'Raul B. Netto <raulbeni@gmail.com>'
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Affero General Public License as
# published by the Free Software Foundation, either version 3 of the
# License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Affero General Public License for more details.
#
# You should have received a copy of the GNU Affero General Public License
# along with this program. See the file 'docs/LICENSE' or see <http://www.gnu.org/licenses/>
# for copying permission.
#
# -*- coding: utf-8 -*-
# Generated by Django 1.9.7 on 2017-02-22 09:42
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('analysis_sessions','0020_type_file_migration'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='weblog',
            name='whois_related_weblogs',
        ),
        migrations.RemoveField(
            model_name='whoisrelatedweblog',
            name='weblog_domain_a',
        ),
        migrations.DeleteModel(
            name='WhoisRelatedWeblog',
        ),
        migrations.AddField(
            model_name='weblog',
            name='whois_related_weblogs',
            field=models.ManyToManyField(related_name='_weblog_whois_related_weblogs_+', to='analysis_sessions.Weblog'),
        ),

    ]