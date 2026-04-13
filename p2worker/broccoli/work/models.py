from django.db import models
from django.utils import timezone
import uuid

class Task(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("running", "Running"),
        ("completed", "Completed"),
        ("error", "Error"),
    ]

    task_id = models.UUIDField(default=uuid.uuid4, primary_key=True)
    compound_task = models.JSONField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    target_worker = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    evict_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.task_id} ({self.status})"

    class Meta:
        ordering = ["-created_at"]
