import fs from "fs";
import pool from "../src/db/index.js";
import { handleFatalError } from "./helpers.js";

const priorityMap = { high: 3, medium: 2, low: 1 };
const data = JSON.parse(fs.readFileSync("./data/tasks.json", "utf8"));

data.forEach((task) => {
  const sql =
    "INSERT INTO tasks (title, due_date, priority, is_done) VALUES ($1, $2, $3, $4)";
  const values = [
    task.title,
    task.date,
    priorityMap[task.priority] || 1,
    task.completed,
  ];
  pool.query(sql, values).catch(handleFatalError("Failed to insert task:"));
});

setTimeout(
  () =>
    pool
      .end()
      .catch(handleFatalError("Fatal error closing the database pool:")),
  2000,
);
