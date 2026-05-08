import fs from "fs";
import pool from "../src/db/index.js";

const priorityMap = { high: 3, medium: 2, low: 1 };

fs.readFile("./data/tasks.json", "utf8", (err, content) => {
  if (err) throw err;
  const data = JSON.parse(content);

  const seed = (index) => {
    if (index === data.length) {
      return pool.end();
    }

    const t = data[index];
    const sql = "INSERT INTO tasks (title, due_date, priority, is_done) VALUES ($1, $2, $3, $4)";
    const values = [t.title, t.date, priorityMap[t.priority] || 1, t.completed];

    pool.query(sql, values, (err) => {
      if (err) throw err;
      seed(index + 1);
    });
  };

  seed(0);
});