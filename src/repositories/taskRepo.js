import pool from "../db/index.js";

export class TaskRepo {
  #mapRowToTask(row) {
    if (!row) return null;

    const priorityMap = {
      1: "low",
      2: "medium",
      3: "high",
    };

    return {
      id: String(row.id),
      title: row.title,
      date: row.due_date ? row.due_date.toISOString().split("T")[0] : null,
      priority: priorityMap[row.priority] || "low",
      completed: row.is_done,
    };
  }

  #priorityToInt(priority) {
    const map = {
      low: 1,
      medium: 2,
      high: 3,
    };
    return map[priority] || 1;
  }

  async getAll() {
    const result = await pool.query(
      `SELECT id, title, due_date, priority, is_done, created_at 
       FROM tasks 
       ORDER BY created_at DESC`,
    );

    return result.rows.map((row) => this.#mapRowToTask(row));
  }

  async getById(id) {
    const result = await pool.query(
      `SELECT id, title, due_date, priority, is_done, created_at 
       FROM tasks 
       WHERE id = $1`,
      [id],
    );

    return result.rows.length > 0 ? this.#mapRowToTask(result.rows[0]) : null;
  }

  async add(task) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const priorityInt = this.#priorityToInt(task.priority);
      const result = await client.query(
        `INSERT INTO tasks (title, due_date, priority, is_done)
         VALUES ($1, $2, $3, $4)
         RETURNING id, title, due_date, priority, is_done, created_at`,
        [task.title, task.date || null, priorityInt, false],
      );

      await client.query("COMMIT");
      return this.#mapRowToTask(result.rows[0]);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id, updates) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const fields = [];
      const values = [];
      let paramCount = 1;

      if (updates.title !== undefined) {
        fields.push(`title = $${paramCount++}`);
        values.push(updates.title);
      }

      if (updates.date !== undefined) {
        fields.push(`due_date = $${paramCount++}`);
        values.push(updates.date || null);
      }

      if (updates.priority !== undefined) {
        fields.push(`priority = $${paramCount++}`);
        values.push(this.#priorityToInt(updates.priority));
      }

      if (updates.completed !== undefined) {
        fields.push(`is_done = $${paramCount++}`);
        values.push(updates.completed);
      }

      if (fields.length === 0) {
        await client.query("ROLLBACK");
        const existing = await pool.query(
          "SELECT id, title, due_date, priority, is_done, created_at FROM tasks WHERE id = $1",
          [id],
        );
        return existing.rows.length > 0
          ? this.#mapRowToTask(existing.rows[0])
          : null;
      }

      values.push(id);
      const query = `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING id, title, due_date, priority, is_done, created_at`;

      const result = await client.query(query, values);

      await client.query("COMMIT");
      return result.rows.length > 0 ? this.#mapRowToTask(result.rows[0]) : null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `DELETE FROM tasks WHERE id = $1 RETURNING id`,
        [id],
      );

      await client.query("COMMIT");
      return result.rows.length > 0 ? String(result.rows[0].id) : null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
