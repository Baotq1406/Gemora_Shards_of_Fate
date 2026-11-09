import "dotenv/config";

export function databaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value || value.includes("REPLACE_WITH_")) {
    throw new Error("Set DATABASE_URL in apps/game-server/.env before starting the backend.");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL URL.");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || url.pathname.length < 2) {
    throw new Error("DATABASE_URL must be a PostgreSQL URL with a database name.");
  }
  return value;
}

export function serverAddress(): { host: string; port: number } {
  const port = Number(process.env.PORT ?? "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535.");
  }
  return { host: process.env.HOST || "127.0.0.1", port };
}
