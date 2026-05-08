import { readFile } from "fs/promises";
import pool from "../src/db/index.js";
import { handleFatalError } from "./helpers.js";

const priorityMap = { high: 3, medium: 2, low: 1 };

readFile("./data/tasks.json", "utf8")
  .then(JSON.parse)
  .then((data) => {
    const tasks = data.map((t) => {
      const sql =
        "INSERT INTO tasks (title, due_date, priority, is_done) VALUES ($1, $2, $3, $4)";
      const values = [
        t.title,
        t.date,
        priorityMap[t.priority] || 1,
        t.completed,
      ];
      return pool.query(sql, values);
    });
    return Promise.all(tasks);
  })
  .finally(() =>
    pool
      .end()
      .catch(handleFatalError("Fatal error closing the database pool:")),
  )
  .catch(handleFatalError("Seeding failed:"));
