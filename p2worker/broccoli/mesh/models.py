from django.db import models
from django.utils import timezone

class Worker(models.Model):
    url = models.URLField(unique=True)
    capacity = models.JSONField(default=dict)
    last_seen = models.DateTimeField(default=timezone.now)
    task_types = models.JSONField(default=list)
    is_self = models.BooleanField(default=False)

    def __str__(self):
        return self.url

    class Meta:
        ordering = ["-last_seen"]
