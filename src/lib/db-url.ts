/**
 * All Luggo tables live in the Postgres schema `luggo`, so the shop can share a database
 * or cluster with other apps without touching their tables (including Prisma's own
 * _prisma_migrations). Connection strings from DigitalOcean don't carry a schema, so it
 * is added here for both the app and the migrate step.
 */
export const DB_SCHEMA = "luggo";

export function withSchema(raw: string | undefined): string | undefined {
  if (!raw) return raw;
  const url = new URL(raw);
  if (!url.searchParams.has("schema")) url.searchParams.set("schema", DB_SCHEMA);
  return url.toString();
}
