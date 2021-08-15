from django.conf.urls import url
from .views import index, graph, science_projects


urlpatterns = [
    url('', index),
    url(r'^$', graph),
    url(r'^api/projects', science_projects, name='projects'),
]
