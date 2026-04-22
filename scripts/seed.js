#!/usr/bin/env node
import fs from "fs";
import path from "path";

const seedSql = path.resolve("scripts", "seed.sql");
console.log("Running seed (hypothetical) — adapt to your DB client.");
if (fs.existsSync(seedSql)) {
  console.log(`Found ${seedSql}`);
  console.log(`(hypothetical) psql $DB_URL -f ${seedSql}`);
} else {
  console.log(
    "No seed SQL found. You can add scripts/seed.sql or implement seeding logic here.",
  );
}
