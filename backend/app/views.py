from django.shortcuts import render
from django.http import JsonResponse, HttpResponse

def example_view(request):
    return HttpResponse('Hello world!')