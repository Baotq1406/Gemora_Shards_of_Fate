import { PrismaService } from "../src/database/prisma.service.js";

async function main(): Promise<void> {
  const prisma = new PrismaService();
  try {
    await prisma.$queryRaw`SELECT 1`;
    await prisma.user.findFirst({ select: { id: true } });
    await prisma.playerProfile.findFirst({ select: { id: true } });
    await prisma.authSession.findFirst({ select: { id: true } });
    await prisma.authIdentity.findFirst({ select: { id: true } });
    console.log("Kết nối PostgreSQL và kiểm tra bốn bảng auth thành công.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(() => {
  console.error("Kiểm tra thất bại. Kiểm tra DATABASE_URL, PostgreSQL và chạy npm run db:migrate:apply.");
  process.exitCode = 1;
});
