import json
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views import View
from django.utils import timezone
from .models import Task
from p2worker.task import CompoundTask, SubTask
from django.conf import settings
from datetime import timedelta

class TaskView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            # data should be the CompoundTask dict
            ct = CompoundTask.from_dict(data)
            
            # Store it locally
            task = Task.objects.create(
                task_id=ct.id,
                compound_task=ct.to_dict(),
                status="pending",
                target_worker=getattr(settings, "WORKER_URL", "http://localhost:8000"),
            )
            
            # Start processing (via celery task)
            from .tasks import process_compound_task
            process_compound_task.delay(str(task.task_id))
            
            return JsonResponse({"status": "submitted", "task_id": str(task.task_id)}, status=201)
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            return HttpResponseBadRequest(f"Invalid Task data: {str(e)}")

    def get(self, request, task_id):
        try:
            task = Task.objects.get(task_id=task_id)
            
            # If it's completed, schedule for eviction if not already scheduled
            if task.status == "completed" and not task.evict_at:
                timeout = getattr(settings, "EVICTION_TIMEOUT", 3600)
                task.evict_at = timezone.now() + timedelta(seconds=timeout)
                task.save()
                
            return JsonResponse({
                "task_id": str(task.task_id),
                "status": task.status,
                "compound_task": task.compound_task,
                "created_at": task.created_at,
                "completed_at": task.completed_at,
                "evict_at": task.evict_at,
            })
        except Task.DoesNotExist:
            return HttpResponseNotFound("Task not found")
