from django.urls import path, include
from django.contrib import admin
from django.views.decorators.csrf import ensure_csrf_cookie
from program import views

urlpatterns = [
    path('api/', include('app.urls')),
    path('admin/', admin.site.urls),
    path('csrf/', views.csrf),
    path('ping/', views.ping),
]