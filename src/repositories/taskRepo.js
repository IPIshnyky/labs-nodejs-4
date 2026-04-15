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

  async update(id, updates) {
    const tasks = await this.getAll();
    const index = tasks.findIndex((t) => t.id === id);

    if (index === -1) return null;

    tasks[index] = { ...tasks[index], ...updates };

    await writeFile(this.#tasksPath, `${JSON.stringify(tasks, null, 2)}\n`);
    return tasks[index];
  }
}
