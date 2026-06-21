# ═══════════════════════════════════════════════════════════
# Taskmaster Control Tower
# ═══════════════════════════════════════════════════════════

# List all tasks
task-list:
    @python3 ../_taskmaster/task_list.py

# Show the next ready task
task-next:
    @python3 ../_taskmaster/task_next.py

# Show task details
task-show id:
    @python3 ../_taskmaster/task_show.py {{id}}

# Mark task as in-progress
task-start id:
    @python3 ../_taskmaster/task_start.py {{id}}

# Mark task as done
task-done id:
    @python3 ../_taskmaster/task_done.py {{id}}

# Create a sprint markdown file from task IDs
sprint-start name *tasks:
    @python3 ../_taskmaster/sprint_start.py "--tasks={{tasks}}" "{{name}}"

# Launch the interactive Dev Portal and Control Tower
task-web:
    @python3 ../_taskmaster/server.py

