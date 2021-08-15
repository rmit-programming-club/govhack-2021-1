from django.conf.urls import url

from .views import graph, science_projects

urlpatterns = [
    url(r'^$', graph),
    url(r'^api/projects', science_projects, name='projects'),
]
