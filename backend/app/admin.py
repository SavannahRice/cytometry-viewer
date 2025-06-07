from django.contrib import admin
from .models import Project, Subject, Sample, Cell

admin.site.register([Project, Subject, Sample, Cell])