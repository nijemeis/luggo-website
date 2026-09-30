/** `prisma migrate deploy` with the luggo schema forced onto both connection strings. */
import { spawnSync } from "node:child_process";
import { withSchema } from "../src/lib/db-url";

const env = { ...process.env, DATABASE_URL: withSchema(process.env.DATABASE_URL), DIRECT_DATABASE_URL: withSchema(process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL) };
const r = spawnSync("npx", ["prisma", "migrate", "deploy"], { stdio: "inherit", env });
process.exit(r.status ?? 1);
