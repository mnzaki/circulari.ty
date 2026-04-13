import json
from django.http import JsonResponse, HttpResponseBadRequest
from django.views import View
from django.utils import timezone
from .models import Worker
from p2worker.mesh import CapacityTracker

class HealthCheckView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            requester_url = data.get("url")
            requester_capacity = data.get("capacity")
            requester_tasks = data.get("task_types", [])

            if not requester_url:
                return HttpResponseBadRequest("Missing URL")

            # Update or create the requester worker
            worker, created = Worker.objects.update_or_create(
                url=requester_url,
                defaults={
                    "capacity": requester_capacity,
                    "task_types": requester_tasks,
                    "last_seen": timezone.now(),
                    "is_self": False,
                }
            )

            # Calculate our own capacity
            tracker = CapacityTracker()
            # For now, we don't have a way to count active tasks, just return general load
            # This should be updated by the work app
            my_capacity = tracker.get_current_capacity()

            # Suggest other workers if we are busy
            suggested_workers = []
            if my_capacity["available_tasks"] < 2:
                # Find some other workers with similar task types
                other_workers = Worker.objects.filter(is_self=False).exclude(url=requester_url)[:5]
                suggested_workers = [w.url for w in other_workers]

            return JsonResponse({
                "status": "ok",
                "capacity": my_capacity,
                "suggested_next_workers": suggested_workers,
            })
        except json.JSONDecodeError:
            return HttpResponseBadRequest("Invalid JSON")

    def get(self, request):
        # Basic GET for simple health check
        tracker = CapacityTracker()
        return JsonResponse({
            "status": "ok",
            "capacity": tracker.get_current_capacity(),
        })
