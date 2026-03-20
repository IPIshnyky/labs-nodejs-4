import { Router } from "express";

import * as taskController from "./taskController.js";
const router = Router();

router.get("/", taskController.getAllTasks);
export default router;
