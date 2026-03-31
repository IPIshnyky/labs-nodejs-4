export class TaskController {
  #service;

  constructor(service) {
    this.#service = service;
  }

  getDashboard = async (_req, res, next) => {
    try {
      const tasks = await this.#service.fetchAllTasks();
      res.render("index", { page: "home", tasks });
    } catch (error) {
      next(error);
    }
  };
}
