export class TaskService {
  #repo;

  constructor(repo) {
    this.#repo = repo;
  }

  async fetchAllTasks() {
    return this.#repo.getAll();
  }
}
