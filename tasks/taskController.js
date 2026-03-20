import * as taskService from "./taskService.js";

/** @param {import("express").Request} req @param {import("express").Response} res @param {import("express").NextFunction} next */
export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};
