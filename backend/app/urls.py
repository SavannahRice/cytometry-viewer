from django.urls import path
from . import views

urlpatterns = [
    path('import', views.import_view, name='import_view'),
    path('results', views.results_view, name='results_view'),
    path('results/<str:project_id>/', views.results_view_with_id, name='results_view_with_id'),
    path('results/filter', views.query_results, name='query_results')
]