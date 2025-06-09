from django.db import models
from django.db.models import Sum


class Scientist(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    company = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Project(models.Model):
    project_name = models.CharField(max_length=255)
    date = models.DateField()
    user = models.ForeignKey(Scientist, on_delete=models.CASCADE)

    def __str__(self):
        return self.project_name


class Subject(models.Model):
    subject_name = models.CharField(max_length=255)
    condition = models.CharField(max_length=255)
    age = models.IntegerField()
    sex = models.CharField(max_length=20)
    treatment = models.CharField(max_length=255)
    # Allow null for condition='healthy', else boolean
    response = models.BooleanField(null=True, blank=True) 
    project = models.ForeignKey(Project, on_delete=models.CASCADE)


    def __str__(self):
        return self.name


class Sample(models.Model):
    sample_name = models.CharField(max_length=255)
    sample_type = models.CharField(max_length=255)
    time_from_treatment_start = models.IntegerField(null=True, blank=True)  # Allow null for 'healthy' subjects
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)

    def __str__(self):
        return self.sample_name

    def total_cell_count(self):
        return self.cell_set.aggregate(total=Sum('count'))['total'] or None
    

class Cell(models.Model):
    CELL_TYPE_CHOICES = [
        ('cd8_t_cell', 'CD8 T Cell'),
        ('cd4_t_cell', 'CD4 T Cell'),
        ('nk_cell', 'NK Cell'),
        ('monocyte', 'Monocyte'),
    ]
    type = models.CharField(max_length=20, choices=CELL_TYPE_CHOICES)
    count = models.IntegerField()
    sample = models.ForeignKey(Sample, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.type} ({self.count})'