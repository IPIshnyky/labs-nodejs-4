export class TaskService {
  #repo;

  constructor(repo) {
    this.#repo = repo;
  }

  async fetchAllTasks() {
    return this.#repo.getAll();
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
