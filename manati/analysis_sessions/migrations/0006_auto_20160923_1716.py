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
# Generated by Django 1.9.7 on 2016-09-23 17:16
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models, transaction,connection
import django.db.models.deletion
import django.utils.timezone
import jsonfield.fields
import model_utils.fields
import json
import datetime
from manati.analysis_sessions.models import Weblog,AnalysisSession,AnalysisSessionUsers,User
from django.contrib.auth.hashers import make_password

# create super user
def create_admin_user(apps, schema_editor):
    User = apps.get_registered_model('auth', 'User')
    admin = User(
        username='root',
        email='admin@manati.com',
        password=make_password('Rootpassword2017'),
        is_superuser=True,
        last_login=datetime.datetime.now(),
        is_staff=True
    )
    admin.save()
    return admin

def dictfetchall(cursor):
    "Return all rows from a cursor as a dict"
    columns = [col[0] for col in cursor.description]
    return [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]


def get_all_weblogs(self, id=None):
    with connection.cursor() as cursor:
        if id:
            cursor.execute("SELECT * FROM manati_weblogs WHERE id = %s", [id])
        else:
            cursor.execute("SELECT * FROM manati_weblogs")
        row = dictfetchall(cursor)
    return row

def update_attributes_raw_weblog(id, attributes_json, new_id):
    with connection.cursor() as cursor:
        cursor.execute("UPDATE manati_weblogs SET attributes = %s, id = %s WHERE id = %s", [attributes_json, new_id, id])


def update_weblogs(apps, schema_editor):
    # Weblog.objects.all().update(id="".join([F('id'), str(":"), F('analysis_session_id')]))
    for weblog in Weblog.objects.all():
        old_attributes = get_all_weblogs(weblog.id)[0]
        old_attributes.pop("id", None)
        old_attributes.pop("created_at", None)
        old_attributes.pop('verdict', None)
        old_attributes.pop('updated_at', None)
        old_attributes.pop('register_status', None)
        old_attributes.pop('analysis_session_id', None)
        old_attributes.pop('attributes', None)
        old_attributes.pop('mod_attributes', None)
        new_id = str(weblog.analysis_session_id) + ":" + str(weblog.id)
        attributes = json.dumps(old_attributes)
        update_attributes_raw_weblog(str(weblog.id), attributes,new_id)

    for weblog in Weblog.objects.all():
        if len(weblog.id.split(':')) <= 1:
            weblog.delete()

    current_users = User.objects.filter(is_superuser=True)
    if not current_users.count() > 0:
        current_user = create_admin_user(apps, schema_editor)
    else:
        current_user = current_users.first()

    for analysis_session in AnalysisSession.objects.all():
        AnalysisSessionUsers.objects.create(analysis_session_id=analysis_session.id,
                                            user_id=current_user.id,
                                            columns_order=json.dumps({}))

class Migration(migrations.Migration):
    dependencies = [
        ('contenttypes', '0002_remove_content_type_name'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('analysis_sessions','0005_auto_20160923_1716'),
    ]

    operations = [
        ## updating Weblogs IDs and updating copying old attributes to new parameter IDs
        # migrations.RunPython(update_weblogs), # TO - DO repair this method without using django model Weblog
        migrations.RunSQL('SET CONSTRAINTS ALL IMMEDIATE',
                          reverse_sql=migrations.RunSQL.noop),

    ]
