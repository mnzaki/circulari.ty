# Billion Worker Clusters

If we eliminate the central task database,

and use a "CompoundTask" structure that describes a plan of steps (each a subtask)
including error management (who to talk to on failure), and suggested next
workers (who can do the required next tasks, if known)

and pass this full "CompoundTask" around from worker to worker, each worker
doing one of the subtasks and accumulating the final result,

and set a final task of contacting a management layer,

and make each worker check on the next worker's progress (potentially 2-step),

and normalize worker-worker connections by having busy workers suggest less busy
ones during connection request,

and make workers with similar task types connect in a special group to share
more info, while also connecting to a sample of workers of other task types,

and give workers the ability to spawn new workers if their collective of workers
with similar task types decide it is necessary,

then the central Management layer is reduced to a secretary API,

and we can scale to Billions easily.


## How

p2worker has a django server configured with sqlite and
celery worker queues. It takes a directory path as argument to where the tasks
are defined. The server is called broccoli of course.

p2worker itself is a python library that implements the core needed bits used by
the broccoli.mesh app and possibly needed in the other apps.

The broccoli.mesh django app exposes an HTTP interface to talk to other
p2workers about mesh networking concerns. It keeps track of other workers as
explained above, and has a notion of "capacity" which is calculated by keeping
track of unix load and associating it with number and type of task going on at a
given time, then returning current "available num of average tasks". Current
capacity is communicated to other workers during health requests, which happen
every `HEALTH_CHECK_INTERVAL` defaulting to 5 seconds.

The broccoli.work django app exposes a Task ingestion REST interface.
It stores submitted job info as a task locally in sqlite, along with target worker that it
was submitted to (mostly us, but can be a reroute)
Once a Task is requested for viewing after it's completion at least once, it is
scheduled for eviction from the database after a configurable timeout.
Also Let's dissambiguate: "Job" is the type (TranscodeVideo, ConvertImage, etc) and "Task" refers to an actual instance. These thing

The broccoli.clients app exposes a simple user-oriented HTML interface which
acts as the main entry point to the cluster, as accessed from any worker, with
SSO login only (no local DB) with google and github. 
The interface comes preseeded with a list of known workers (to
whichever worker is serving the interface) along with their current capacity. It
then choose a target worker and requests to do a job.
