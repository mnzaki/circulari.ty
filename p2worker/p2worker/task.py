import uuid
from typing import List, Dict, Any, Optional

class SubTask:
    def __init__(self, job_type: str, params: Dict[str, Any], status: str = "pending", result: Any = None):
        self.job_type = job_type
        self.params = params
        self.status = status
        self.result = result

    def to_dict(self):
        return {
            "job_type": self.job_type,
            "params": self.params,
            "status": self.status,
            "result": self.result,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        return cls(
            job_type=data["job_type"],
            params=data["params"],
            status=data.get("status", "pending"),
            result=data.get("result"),
        )

class CompoundTask:
    def __init__(
        self,
        plan: List[SubTask],
        task_id: Optional[str] = None,
        current_step: int = 0,
        on_error: Optional[Dict[str, Any]] = None,
        suggested_next_workers: Optional[List[str]] = None,
        final_callback: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        self.id = task_id or str(uuid.uuid4())
        self.plan = plan
        self.current_step = current_step
        self.on_error = on_error or {}
        self.suggested_next_workers = suggested_next_workers or []
        self.final_callback = final_callback
        self.metadata = metadata or {}

    def to_dict(self):
        return {
            "id": self.id,
            "plan": [step.to_dict() for step in self.plan],
            "current_step": self.current_step,
            "on_error": self.on_error,
            "suggested_next_workers": self.suggested_next_workers,
            "final_callback": self.final_callback,
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        return cls(
            task_id=data["id"],
            plan=[SubTask.from_dict(step) for step in data["plan"]],
            current_step=data["current_step"],
            on_error=data.get("on_error"),
            suggested_next_workers=data.get("suggested_next_workers"),
            final_callback=data.get("final_callback"),
            metadata=data.get("metadata"),
        )

    def current_subtask(self) -> Optional[SubTask]:
        if 0 <= self.current_step < len(self.plan):
            return self.plan[self.current_step]
        return None

    def advance(self, result: Any = None):
        if 0 <= self.current_step < len(self.plan):
            self.plan[self.current_step].status = "completed"
            self.plan[self.current_step].result = result
            self.current_step += 1
        return self.is_complete()

    def is_complete(self) -> bool:
        return self.current_step >= len(self.plan)
