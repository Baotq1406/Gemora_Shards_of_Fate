import "dotenv/config";

export function databaseUrl(): string {
  const value = process.env.DATABASE_URL;
  if (!value || value.includes("REPLACE_WITH_")) {
    throw new Error("Điền DATABASE_URL trong apps/game-server/.env trước khi chạy backend.");
  }
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("DATABASE_URL không phải URL PostgreSQL hợp lệ.");
  }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || url.pathname.length < 2) {
    throw new Error("DATABASE_URL phải là URL PostgreSQL có tên database.");
  }
  return value;
}

export function serverAddress(): { host: string; port: number } {
  const port = Number(process.env.PORT ?? "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT phải là số nguyên trong khoảng 1–65535.");
  }
  return { host: process.env.HOST || "127.0.0.1", port };
}
