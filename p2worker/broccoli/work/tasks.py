from celery import shared_task
from django.utils import timezone
from .models import Task
from p2worker.task import CompoundTask
from p2worker.job import JobRegistry
import json
import requests # wait, requests is not in venv!

# I'll use urllib.request as a fallback if I can't find requests
try:
    import requests
    USE_REQUESTS = True
except ImportError:
    import urllib.request
    import urllib.parse
    USE_REQUESTS = False

def send_task_to_worker(worker_url, ct_dict):
    """Sends the CompoundTask to another worker via HTTP."""
    data = json.dumps(ct_dict).encode("utf-8")
    if USE_REQUESTS:
        try:
            r = requests.post(f"{worker_url}/work/tasks/", data=data, headers={"Content-Type": "application/json"})
            return r.status_code == 201
        except Exception:
            return False
    else:
        try:
            req = urllib.request.Request(f"{worker_url}/work/tasks/", data=data, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req) as response:
                return response.status == 201
        except Exception:
            return False

@shared_task
def process_compound_task(task_id_str):
    try:
        task = Task.objects.get(task_id=task_id_str)
        task.status = "running"
        task.save()
        
        ct = CompoundTask.from_dict(task.compound_task)
        subtask = ct.current_subtask()
        
        if subtask:
            try:
                # 1. Execute the subtask
                result = JobRegistry.execute(subtask.job_type, subtask.params)
                
                # 2. Advance the CompoundTask
                ct.advance(result)
                
                # 3. Update the local Task record
                task.compound_task = ct.to_dict()
                task.save()
                
                # 4. Decide next step
                if ct.is_complete():
                    task.status = "completed"
                    task.completed_at = timezone.now()
                    task.save()
                    
                    # Call final_callback if it exists
                    if ct.final_callback:
                        # (Omitted: implementation of contacting final callback)
                        pass
                else:
                    # Not complete, where should it go?
                    # For now, let's keep it here if we are not busy
                    from p2worker.mesh import CapacityTracker
                    tracker = CapacityTracker()
                    capacity = tracker.get_current_capacity()
                    
                    if capacity["available_tasks"] > 0:
                        # We can do more steps ourselves
                        process_compound_task.delay(str(task.task_id))
                    else:
                        # We are too busy, send to someone else!
                        # Look for suggested workers or mesh workers
                        from broccoli.mesh.models import Worker
                        next_workers = ct.suggested_next_workers or [w.url for w in Worker.objects.exclude(is_self=True)[:5]]
                        
                        sent = False
                        for worker_url in next_workers:
                            if send_task_to_worker(worker_url, ct.to_dict()):
                                sent = True
                                break
                        
                        if not sent:
                            # If no one can take it, maybe wait and retry here
                            process_compound_task.apply_async((str(task.task_id),), countdown=30)
                            
            except Exception as e:
                task.status = "error"
                # (Omitted: more detailed error info in task metadata)
                task.save()
                
                # If we have an on_error strategy, use it
                if ct.on_error:
                    # (Omitted: implement error management strategy)
                    pass
    except Task.DoesNotExist:
        pass
