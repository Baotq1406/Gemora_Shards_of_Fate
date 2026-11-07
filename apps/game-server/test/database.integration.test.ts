import "reflect-metadata";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { ServiceUnavailableException } from "@nestjs/common";
import { AppModule } from "../src/app.module.js";
import { PrismaService } from "../src/database/prisma.service.js";
import { HealthController } from "../src/health.controller.js";

const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl || !new URL(testUrl).pathname.endsWith("_test")) {
  throw new Error("TEST_DATABASE_URL phải trỏ đến database riêng có tên kết thúc bằng _test.");
}
process.env.DATABASE_URL = testUrl;
const prisma = new PrismaService();
after(async () => { await prisma.$disconnect(); });

const rollback = new Error("rollback test transaction");
function fixture() {
  return {
    normalizedEmail: `${randomUUID()}@example.test`,
    passwordHash: "test-only-not-a-valid-password-hash",
    profile: { create: { displayName: "Database Test" } },
  };
}

test("create account/profile/session, defaults and cascading ownership", async () => {
  await assert.rejects(prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: fixture(), include: { profile: true } });
    assert.equal(user.role, "PLAYER");
    assert.equal(user.status, "ACTIVE");
    assert.equal(user.profile?.userId, user.id);
    const session = await tx.authSession.create({ data: {
      userId: user.id, tokenHash: randomUUID(), expiresAt: new Date(Date.now() + 60000),
    } });
    assert.equal(session.revokedAt, null);
    await tx.user.delete({ where: { id: user.id } });
    assert.equal(await tx.playerProfile.count({ where: { userId: user.id } }), 0);
    assert.equal(await tx.authSession.count({ where: { userId: user.id } }), 0);
    throw rollback;
  }), (error: unknown) => error === rollback);
});

test("duplicate email is rejected and the entire transaction rolls back", async () => {
  const data = fixture();
  await assert.rejects(prisma.$transaction(async (tx) => {
    await tx.user.create({ data });
    await tx.user.create({ data: { ...data, profile: undefined } });
  }), { code: "P2002" });
  assert.equal(await prisma.user.count({ where: { normalizedEmail: data.normalizedEmail } }), 0);
});

test("one profile per account", async () => {
  await assert.rejects(prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: fixture() });
    await tx.playerProfile.create({ data: { userId: user.id, displayName: "Duplicate" } });
  }), { code: "P2002" });
});

test("session cannot reference a nonexistent user", async () => {
  await assert.rejects(prisma.$transaction(async (tx) => {
    await tx.authSession.create({ data: {
      userId: randomUUID(), tokenHash: randomUUID(), expiresAt: new Date(),
    } });
    throw rollback;
  }), { code: "P2003" });
});

test("session tokens cannot be duplicated", async () => {
  await assert.rejects(prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: fixture() });
    const data = { userId: user.id, tokenHash: randomUUID(), expiresAt: new Date() };
    await tx.authSession.create({ data });
    await tx.authSession.create({ data });
  }), { code: "P2002" });
});

test("HTTP liveness/readiness endpoints and unknown route", async () => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(), { logger: false, abortOnError: false });
  app.setGlobalPrefix("api/v1");
  try {
    await app.listen(0, "127.0.0.1");
    const origin = await app.getUrl();
    const live = await fetch(`${origin}/api/v1/health`);
    assert.equal(live.status, 200);
    assert.deepEqual(await live.json(), { status: "ok" });
    const ready = await fetch(`${origin}/api/v1/health/ready`);
    assert.equal(ready.status, 200);
    assert.deepEqual(await ready.json(), { status: "ok", database: "ready" });
    assert.equal((await fetch(`${origin}/api/v1/auth/login`)).status, 404);
  } finally {
    await app.close();
  }
});

test("Google-only account has no password; identity follows cascading deletion", async () => {
  await assert.rejects(prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: {
      ...fixture(), passwordHash: null,
      identities: { create: { provider: "GOOGLE", providerSubject: randomUUID() } },
    }, include: { identities: true } });
    assert.equal(user.passwordHash, null);
    assert.equal(user.identities.length, 1);
    assert.equal(user.identities[0]?.userId, user.id);
    await tx.user.delete({ where: { id: user.id } });
    assert.equal(await tx.authIdentity.count({ where: { userId: user.id } }), 0);
    throw rollback;
  }), (error: unknown) => error === rollback);
});

test("linking Google preserves local password, profile and session", async () => {
  await assert.rejects(prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: fixture(), include: { profile: true } });
    const session = await tx.authSession.create({ data: {
      userId: user.id, tokenHash: randomUUID(), expiresAt: new Date(Date.now() + 60000),
    } });
    await tx.authIdentity.create({ data: { userId: user.id, provider: "GOOGLE", providerSubject: randomUUID() } });
    const linked = await tx.user.findUniqueOrThrow({ where: { id: user.id }, include: { profile: true, sessions: true } });
    assert.equal(linked.passwordHash, user.passwordHash);
    assert.equal(linked.profile?.id, user.profile?.id);
    assert.equal(linked.sessions[0]?.id, session.id);
    throw rollback;
  }), (error: unknown) => error === rollback);
});

test("one Google identity cannot belong to two accounts; failed link rolls back", async () => {
  const email = fixture().normalizedEmail;
  await assert.rejects(prisma.$transaction(async (tx) => {
    const first = await tx.user.create({ data: { ...fixture(), normalizedEmail: email } });
    const second = await tx.user.create({ data: fixture() });
    const identity = { provider: "GOOGLE" as const, providerSubject: randomUUID() };
    await tx.authIdentity.create({ data: { ...identity, userId: first.id } });
    await tx.authIdentity.create({ data: { ...identity, userId: second.id } });
  }), { code: "P2002" });
  assert.equal(await prisma.user.count({ where: { normalizedEmail: email } }), 0);
});

test("an account can only link one Google identity", async () => {
  await assert.rejects(prisma.$transaction(async (tx) => {
    const user = await tx.user.create({ data: fixture() });
    await tx.authIdentity.create({ data: { userId: user.id, provider: "GOOGLE", providerSubject: randomUUID() } });
    await tx.authIdentity.create({ data: { userId: user.id, provider: "GOOGLE", providerSubject: randomUUID() } });
  }), { code: "P2002" });
});

test("identity cannot reference a nonexistent user", async () => {
  await assert.rejects(prisma.$transaction(async (tx) => {
    await tx.authIdentity.create({ data: { userId: randomUUID(), provider: "GOOGLE", providerSubject: randomUUID() } });
    throw rollback;
  }), { code: "P2003" });
});

test("readiness failure returns 503 without leaking driver details", async () => {
  const failed = { $queryRaw: async () => { throw new Error("secret-connection-string"); } };
  const controller = new HealthController(failed as unknown as PrismaService);
  await assert.rejects(controller.ready(), (error: unknown) => {
    assert.ok(error instanceof ServiceUnavailableException);
    assert.equal(error.getStatus(), 503);
    assert.ok(!error.message.includes("secret-connection-string"));
    return true;
  });
});
