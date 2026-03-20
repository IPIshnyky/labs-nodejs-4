import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

/** @typedef {import("./types.js").Task} Task  */

const __dirname = dirname(fileURLToPath(import.meta.url));
const TASKS_PATH = join(__dirname, "../data/tasks.json");

/**
 * @returns {Promise<Task[]>}
 */
export const getAllTasks = async () => {
  const data = await readFile(TASKS_PATH, "utf-8");
  return JSON.parse(data);
};
