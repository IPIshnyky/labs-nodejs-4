import { readFile, writeFile } from "fs/promises";

export class TaskRepo {
  #tasksPath;

  constructor(tasksPath) {
    this.#tasksPath = tasksPath;
  }

  async getAll() {
    const data = await readFile(this.#tasksPath, "utf-8");
    return JSON.parse(data);
  }

  add(task) {
    return readFile(this.#tasksPath, "utf-8")
      .then((data) => JSON.parse(data))
      .then((tasks) => {
        const nextTasks = Array.isArray(tasks) ? tasks : [];
        nextTasks.push(task);

        return writeFile(
          this.#tasksPath,
          `${JSON.stringify(nextTasks, null, 2)}\n`,
        );
      })
      .then(() => task);
  }
}
