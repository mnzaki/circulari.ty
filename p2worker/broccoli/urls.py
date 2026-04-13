from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("mesh/", include("broccoli.mesh.urls")),
    path("work/", include("broccoli.work.urls")),
    path("clients/", include("broccoli.clients.urls")),
]
