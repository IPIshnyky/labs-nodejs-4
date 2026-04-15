export class TaskService {
  #repo;

  constructor(repo) {
    this.#repo = repo;
  }

  async fetchAllTasks() {
    return this.#repo.getAll();
  }

  async createTask(dto) {
    const title = typeof dto?.title === "string" ? dto.title.trim() : "";
    const date = typeof dto?.date === "string" ? dto.date : "";
    const priority = typeof dto?.priority === "string" ? dto.priority : "";

    if (!title) {
      const err = new Error("Title is required");
      err.status = 400;
      throw err;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) {
      const err = new Error("Date must be in YYYY-MM-DD format");
      err.status = 400;
      throw err;
    }

    if (!["low", "medium", "high"].includes(priority)) {
      const err = new Error("Priority must be low, medium, or high");
      err.status = 400;
      throw err;
    }

    const tasks = await this.#repo.getAll();
    const maxId = Array.isArray(tasks)
      ? tasks.reduce((max, task) => {
          const n = Number(task.id);
          return Number.isFinite(n) ? Math.max(max, n) : max;
        }, 0)
      : 0;

    const newTask = {
      id: String(maxId + 1),
      title,
      date,
      priority,
      completed: false,
    };

    await this.#repo.add(newTask);
    return newTask;
  }

  sortTasks(tasks, criteria, order = "asc") {
    const sortedTasks = [...tasks];
    const modifier = order === "desc" ? -1 : 1;

    switch (criteria) {
      case "title":
        return sortedTasks.sort(
          (a, b) => a.title.localeCompare(b.title) * modifier,
        );
      case "date":
        return sortedTasks.sort(
          (a, b) => (new Date(a.date) - new Date(b.date)) * modifier,
        );
      case "priority":
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        return sortedTasks.sort(
          (a, b) =>
            (priorityOrder[a.priority] - priorityOrder[b.priority]) * modifier,
        );
      case "status":
        return sortedTasks.sort(
          (a, b) =>
            (a.completed === b.completed ? 0 : a.completed ? 1 : -1) * modifier,
        );
      default:
        return sortedTasks;
    }
  }
}
