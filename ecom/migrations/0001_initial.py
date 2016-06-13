# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import datetime


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Product',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('ModelName', models.CharField(max_length=300)),
                ('slug', models.SlugField(max_length=150)),
                ('description', models.TextField()),
                ('photo', models.ImageField(upload_to=b'product_photo', blank=True)),
                ('manufacturer', models.CharField(max_length=300, blank=True)),
                ('price_in_dollars', models.DecimalField(max_digits=6, decimal_places=2)),
                ('Quantity', models.IntegerField(null=True, blank=True)),
                ('Serial_No', models.DecimalField(null=True, max_digits=6, decimal_places=2, blank=True)),
            ],
        ),
        migrations.CreateModel(
            name='Sale',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('CustomerName', models.CharField(max_length=255)),
                ('slug', models.SlugField(max_length=150)),
                ('Address', models.TextField()),
                ('pub_date', models.DateTimeField(default=datetime.datetime(2016, 5, 31, 13, 5, 37, 454000))),
                ('Sale_Quantity', models.IntegerField(default=0)),
                ('Product_Sold', models.ForeignKey(to='ecom.Product')),
            ],
        ),
    ]
