import os
import time
from typing import Dict, Any

class CapacityTracker:
    def __init__(self, load_threshold: float = 0.8):
        self.load_threshold = load_threshold
        self.active_tasks: Dict[str, int] = {}
        self.last_check = time.time()

    def update_task_count(self, job_type: str, count: int):
        self.active_tasks[job_type] = count

    def get_current_capacity(self) -> Dict[str, Any]:
        """
        Returns a dictionary representing the current capacity.
        Example: {"load": 0.5, "available_tasks": 10}
        """
        try:
            # os.getloadavg() is only available on Unix
            load1, load5, load15 = os.getloadavg()
            cpu_count = os.cpu_count() or 1
            normalized_load = load1 / cpu_count
        except (AttributeError, OSError):
            # Fallback if not Unix or error
            normalized_load = 0.0

        # Heuristic capacity calculation
        # If load is below threshold, assume we can take more tasks
        # This is a very simple sketch and should be more sophisticated
        available_num_of_average_tasks = max(0, int((self.load_threshold - normalized_load) * 10 * cpu_count))

        return {
            "load": normalized_load,
            "available_tasks": available_num_of_average_tasks,
            "active_tasks": self.active_tasks,
        }
