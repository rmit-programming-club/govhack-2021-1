from django.shortcuts import render
from django.db import connections
from django.db.models import Count
from django.http import JsonResponse

from .models import Project


# Create your views here.
def graph(request):
    return render(request, 'graph/graph.html')

def science_projects(request):
    data = Project.objects.all()
    return JsonResponse(list(data), safe=False)
