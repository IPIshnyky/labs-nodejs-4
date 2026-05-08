import { readFile } from "fs/promises";
import pool from "../src/db/index.js";
import { handleFatalError } from "./helpers.js";

const priorityMap = { high: 3, medium: 2, low: 1 };

async function runSeeder() {
  try {
    const content = await readFile("./data/tasks.json", "utf8");
    const data = JSON.parse(content);

    for (const t of data) {
      const sql =
        "INSERT INTO tasks (title, due_date, priority, is_done) VALUES ($1, $2, $3, $4)";
      const values = [
        t.title,
        t.date,
        priorityMap[t.priority] || 1,
        t.completed,
      ];
      await pool.query(sql, values);
    }
  } catch (err) {
    handleFatalError("Seeding failed:")(err);
  } finally {
    await pool
      .end()
      .catch(handleFatalError("Fatal error closing the database pool:"));
  }
}

runSeeder();
