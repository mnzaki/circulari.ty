# p2worker: Billion Worker Clusters Sketch

I have sketched out the core components of the Billion Worker Cluster system.

## Architecture

### 1. `p2worker` (Python Library)
The core logic resides in a standalone library:
- `p2worker/task.py`: Defines `CompoundTask` and `SubTask`. This structure is passed between workers and carries the entire plan, current state, and error management strategies.
- `p2worker/mesh.py`: Contains `CapacityTracker` for calculating available capacity based on system load.
- `p2worker/job.py`: A `JobRegistry` where specific job types (e.g., `TranscodeVideo`) are registered and executed.

### 2. `broccoli.mesh` (Discovery & Health)
- Manages a registry of known `Worker` nodes.
- Exposes `/mesh/health/` to respond to health checks and exchange capacity information.
- Implements "rerouting" logic by suggesting other workers when local capacity is low.

### 3. `broccoli.work` (Task Ingestion & Execution)
- Exposes `/work/tasks/` for submitting and tracking `CompoundTask` instances.
- Uses Celery (`broccoli/work/tasks.py`) to process subtasks.
- Implements the "worker-to-worker" passing logic: after completing a subtask, it either proceeds to the next subtask locally or forwards the remaining `CompoundTask` to another worker.

### 4. `broccoli.clients` (User Interface)
- Provides a simple HTML dashboard (`/clients/`) to monitor the cluster and submit new jobs.

## How to Run

1. **Install Dependencies**:
   You will need `django`, `celery`, and optionally `redis` (for the broker) and `requests`.
   ```bash
   pip install django celery redis requests
   ```

2. **Run Migrations**:
   ```bash
   python manage.py migrate
   ```

3. **Start Celery Worker**:
   ```bash
   celery -A broccoli worker --loglevel=info
   ```

4. **Start Django Server**:
   ```bash
   python manage.py runserver
   ```

## Next Steps
- Implement the "Specialization Groups" logic in `broccoli.mesh`.
- Implement SSO login (Google/GitHub) in `broccoli.clients`.
- Add "2-step progress check" between workers.
- Implement the "Secretary API" for the management layer.
