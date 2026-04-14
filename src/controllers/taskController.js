export class TaskController {
  #service;

  constructor(service) {
    this.#service = service;
  }

  getDashboard = async (_req, res, next) => {
    try {
      const tasks = await this.#service.fetchAllTasks();

      const sortBy = _req.query.sort;
      const currentOrder = _req.query.order || "asc";

      const displayTasks = sortBy
        ? this.#service.sortTasks(tasks, sortBy, currentOrder)
        : tasks;
      res.render("index", {
        page: "home",
        tasks: displayTasks,
        currentSort: sortBy,
        currentOrder: currentOrder,
      });
    } catch (error) {
      next(error);
    }
  };
}
