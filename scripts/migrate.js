#!/usr/bin/env node
import fs from "fs";
import path from "path";

const cmd = process.argv[2] || "up";
const migrationsDir = path.resolve("migrations");

function getMigrations() {
  if (!fs.existsSync(migrationsDir)) return [];
  return fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

async function applyMigration(file) {
  console.log(`Applying: ${file}`);
  console.log(
    `(hypothetical) psql $DB_URL -f ${path.join(migrationsDir, file)}`,
  );
}

async function revertMigration(file) {
  console.log(`Reverting: ${file}`);
  console.log(
    `(hypothetical) -- revert for ${file} depends on migration design`,
  );
}

(async () => {
  const list = getMigrations();
  if (cmd === "up") {
    console.log("MIGRATE UP — will apply all migrations in order");
    for (const f of list) await applyMigration(f);
  } else if (cmd === "down") {
    console.log("MIGRATE DOWN — will revert in reverse order");
    for (const f of list.slice().reverse()) await revertMigration(f);
  } else if (cmd === "refresh") {
    console.log("MIGRATE REFRESH — down then up");
    for (const f of list.slice().reverse()) await revertMigration(f);
    for (const f of list) await applyMigration(f);
  } else {
    console.error("Unknown command", cmd);
    process.exit(2);
  }
})();
