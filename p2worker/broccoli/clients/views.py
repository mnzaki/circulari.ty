from django.shortcuts import render
from django.views import View
from broccoli.mesh.models import Worker
from p2worker.mesh import CapacityTracker

class IndexView(View):
    def get(self, request):
        # Gather all known workers and their capacity
        workers = Worker.objects.all()
        tracker = CapacityTracker()
        my_capacity = tracker.get_current_capacity()
        
        # We also need a way to see our own worker URL
        from django.conf import settings
        my_url = getattr(settings, "WORKER_URL", "http://localhost:8000")
        
        return render(request, "clients/index.html", {
            "workers": workers,
            "my_capacity": my_capacity,
            "my_url": my_url,
        })
