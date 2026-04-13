from django.urls import path
from .views import TaskView

urlpatterns = [
    path("tasks/", TaskView.as_view(), name="task_list"),
    path("tasks/<uuid:task_id>/", TaskView.as_view(), name="task_detail"),
]
