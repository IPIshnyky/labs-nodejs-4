import { readFile } from "fs/promises";

export class TaskRepo {
  #tasksPath;

  constructor(tasksPath) {
    this.#tasksPath = tasksPath;
  }

  async getAll() {
    const data = await readFile(this.#tasksPath, "utf-8");
    return JSON.parse(data);
  }
}
