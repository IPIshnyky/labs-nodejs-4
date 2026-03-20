import * as taskRepo from "./taskRepo.js";

/**
 * @returns {Promise<Task[]>}
 */
export const getAllTasks = async () => {
  return await taskRepo.getAllTasks();
};
