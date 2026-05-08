import pool from "../src/db/index.js";

const SEPARATOR = "=".repeat(60);

async function showTasks(client, label) {
  const result = await client.query(
    "SELECT id, title, due_date, priority, is_done FROM tasks ORDER BY id",
  );
  console.log(`\n--- ${label} ---`);
  if (result.rows.length === 0) {
    console.log("(no tasks)");
  } else {
    console.table(
      result.rows.map((r) => ({
        id: r.id,
        title: r.title,
        due_date: r.due_date?.toISOString().split("T")[0] ?? null,
        priority: r.priority,
        is_done: r.is_done,
      })),
    );
  }
}

async function ensureOverdueTasks(client) {
  const check = await client.query(
    `SELECT id FROM tasks WHERE due_date < CURRENT_DATE AND is_done = false`,
  );

  if (check.rows.length >= 2) return;

  console.log("> Inserting overdue test tasks for demonstration...");
  await client.query(
    `INSERT INTO tasks (title, due_date, priority, is_done) VALUES
     ('Overdue: submit report',   CURRENT_DATE - INTERVAL '5 days', 1, false),
     ('Overdue: review PR',       CURRENT_DATE - INTERVAL '3 days', 2, false),
     ('Overdue: fix login bug',   CURRENT_DATE - INTERVAL '1 day',  1, false)`,
  );
}

// ─── DEMO 1: Successful transaction (COMMIT) ────────────────────────
async function demoCommit() {
  console.log(`\n${SEPARATOR}`);
  console.log("  DEMO 1: Transaction with COMMIT (success path)");
  console.log(SEPARATOR);

  const client = await pool.connect();
  try {
    await ensureOverdueTasks(client);
    await showTasks(client, "State BEFORE transaction");

    await client.query("BEGIN");
    console.log("\n> BEGIN");

    const overdue = await client.query(
      `SELECT id, title, due_date, priority
       FROM tasks
       WHERE due_date < CURRENT_DATE AND is_done = false`,
    );
    console.log(`> SELECT found ${overdue.rows.length} overdue task(s)\n`);

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 7);
    const newDateStr = newDate.toISOString().split("T")[0];

    for (const row of overdue.rows) {
      await client.query(
        `UPDATE tasks SET due_date = $1, priority = 3 WHERE id = $2`,
        [newDateStr, row.id],
      );
      console.log(
        `> UPDATE tasks SET due_date='${newDateStr}', priority=3 WHERE id=${row.id}  -- "${row.title}"`,
      );
    }

    await client.query("COMMIT");
    console.log("\n> COMMIT  ✓  All changes saved to database");

    await showTasks(client, "State AFTER commit");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("> ROLLBACK due to error:", err.message);
  } finally {
    client.release();
  }
}

// ─── DEMO 2: Failed transaction (ROLLBACK) ──────────────────────────
async function demoRollback() {
  console.log(`\n\n${SEPARATOR}`);
  console.log("  DEMO 2: Transaction with ROLLBACK (error path)");
  console.log(SEPARATOR);

  const client = await pool.connect();

  // Reset: make 3 tasks overdue so multiple UPDATEs succeed before the error
  await client.query(
    `UPDATE tasks SET due_date = CURRENT_DATE - INTERVAL '2 days', priority = 1
     WHERE id IN (
       SELECT id FROM tasks WHERE is_done = false ORDER BY id LIMIT 3
     )`,
  );

  try {
    await showTasks(client, "State BEFORE transaction");

    await client.query("BEGIN");
    console.log("\n> BEGIN");

    const overdue = await client.query(
      `SELECT id, title, due_date, priority
       FROM tasks
       WHERE due_date < CURRENT_DATE AND is_done = false
       ORDER BY id`,
    );
    console.log(`> SELECT found ${overdue.rows.length} overdue task(s)\n`);

    if (overdue.rows.length === 0) {
      await client.query("ROLLBACK");
      console.log("> No overdue tasks to demonstrate rollback");
      return;
    }

    const newDate = new Date();
    newDate.setDate(newDate.getDate() + 7);
    const newDateStr = newDate.toISOString().split("T")[0];

    // Update all tasks except the last one — these changes WILL be rolled back
    for (let i = 0; i < overdue.rows.length - 1; i++) {
      const row = overdue.rows[i];
      await client.query(
        `UPDATE tasks SET due_date = $1, priority = 3 WHERE id = $2`,
        [newDateStr, row.id],
      );
      console.log(
        `> UPDATE tasks SET due_date='${newDateStr}', priority=3 WHERE id=${row.id}  -- "${row.title}"  ✓`,
      );
    }

    // Simulate error on the last task
    const last = overdue.rows[overdue.rows.length - 1];
    console.log(
      `\n> !! Simulating error while updating task #${last.id} "${last.title}"...`,
    );
    throw new Error(
      `Constraint violation: task #${last.id} cannot be rescheduled (e.g. blocked by dependency)`,
    );
  } catch (err) {
    await client.query("ROLLBACK");
    console.log(`\n> ROLLBACK  ✗  Error: ${err.message}`);
    console.log(
      "> All previous UPDATEs have been reverted — no partial changes remain",
    );

    await showTasks(client, "State AFTER rollback (data unchanged)");
  } finally {
    client.release();
  }
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║   Transaction Demo: reschedule overdue tasks            ║");
  console.log("║   Multiple UPDATE queries in a single transaction       ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  try {
    await demoCommit();
    await demoRollback();
  } finally {
    await pool.end();
    console.log("\n> Database pool closed");
  }
}

main();
