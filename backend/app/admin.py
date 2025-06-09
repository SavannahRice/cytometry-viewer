from django.contrib import admin
from .models import Project, Subject, Sample, Cell, Scientist

admin.site.register([Scientist, Project, Subject, Sample, Cell])