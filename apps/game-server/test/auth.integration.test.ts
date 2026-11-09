import 'reflect-metadata';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, afterEach, before, beforeEach, test } from 'node:test';
import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { ExpressAdapter } from '@nestjs/platform-express';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/configure-app.js';
import { PrismaService } from '../src/database/prisma.service.js';
import { AuthSettings } from '../src/auth/auth.settings.js';
import { AuthSecurity, digest } from '../src/auth/auth.security.js';
import { GoogleProvider, type GoogleProfile } from '../src/auth/google.provider.js';

if (!process.env.TEST_DATABASE_URL || !new URL(process.env.TEST_DATABASE_URL).pathname.endsWith('_test')) {
  throw new Error('TEST_DATABASE_URL must point to a separate _test database.');
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
process.env.APP_ORIGIN = 'http://localhost:8080';
process.env.GOOGLE_CLIENT_ID = 'test-client';
process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:8080/api/v1/auth/google/callback';
const prefix = 'auth-' + randomUUID();
const password = 'A long test password 2026!';
const email = () => `${prefix}-${randomUUID()}@example.test`;
let db: PrismaService;
let app: NestExpressApplication;
let base: string;
let provider: FakeGoogle;
class FakeGoogle extends GoogleProvider {
  readonly codes = new Map<string, GoogleProfile>();
  override async verifyCode(code: string): Promise<GoogleProfile> {
    const result = this.codes.get(code);
    if (!result) throw new UnauthorizedException('private-provider-error');
    return result;
  }
  add(address = email(), subject = randomUUID()) {
    const code = randomUUID();
    this.codes.set(code, { subject, email: address, displayName: 'Google Player' });
    return { code, subject, email: address };
  }
}
class Browser {
  readonly jar = new Map<string, string>();
  async request(route: string, method = 'GET', body?: unknown, origin = 'http://localhost:8080') {
    const res = await fetch(base + route, {
      method, redirect: 'manual', headers: {
        'Origin': origin, 'Content-Type': 'application/json',
        Cookie: [...this.jar].map(([k, v]) => `${k}=${v}`).join('; '),
      }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    for (const cookie of res.headers.getSetCookie()) {
      const [pair] = cookie.split(';'); const pos = pair!.indexOf('=');
      const key = pair!.slice(0, pos), value = pair!.slice(pos + 1);
      if (value) this.jar.set(key, value); else this.jar.delete(key);
    }
    return res;
  }
  async start() {
    const res = await this.request('/google/start'); assert.equal(res.status, 302);
    const url = new URL(res.headers.get('location')!);
    assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
    assert.ok(url.searchParams.get('nonce'));
    return url.searchParams.get('state')!;
  }
  finish(state: string, code: string) { return this.request(`/google/callback?state=${state}&code=${code}`); }
}
async function register(browser: Browser, address = email()) {
  const res = await browser.request('/register', 'POST', { displayName: 'Test Player', email: address, password });
  assert.equal(res.status, 201); return (await res.json()).user;
}
async function login(browser: Browser, address: string) {
  const res = await browser.request('/login', 'POST', { email: address, password });
  assert.equal(res.status, 200); return res;
}

test('player onboarding persists once, rejects duplicate names and supports avatar changes', async () => {
  const a = new Browser(), b = new Browser();
  const first = await register(a); const second = await register(b);
  await login(a, first.email); await login(b, second.email);
  assert.equal((await (await a.request('/me')).json()).user.onboardingState, 'NEEDS_PROFILE');
  assert.equal((await a.request('/../players/me/home')).status, 403);
  const name = 'Ánh' + randomUUID().slice(0, 8);
  const body = { playerName: name };
  const results = await Promise.all([a.request('/../players/me/onboarding', 'POST', body), b.request('/../players/me/onboarding', 'POST', body)]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  const winner = results[0]!.status === 200 ? a : b;
  const created = (await results.find(r => r.status === 200)!.json()).user;
  assert.equal(created.onboardingState, 'READY');
  assert.equal(created.player.avatarKey, 'crystal-dragon');
  const replay = (await (await winner.request('/../players/me/onboarding', 'POST', body)).json()).user;
  assert.deepEqual(replay.player, created.player);
  assert.equal((await winner.request('/../players/me/onboarding', 'POST', { playerName: 'OtherName' })).status, 409);
  assert.equal((await winner.request('/../players/me/avatar', 'POST', { avatarKey: 'invalid' })).status, 400);
  assert.equal((await winner.request('/../players/me/avatar', 'POST', { avatarKey: 'moon' })).status, 200);
  assert.equal((await (await winner.request('/../players/me/home')).json()).player.avatarKey, 'moon');
  assert.equal((await (await winner.request('/me')).json()).user.player.playerName, name);
  await winner.request('/logout', 'POST', {});
  assert.equal((await winner.request('/../players/me/home')).status, 401);
});

test('two sessions of one account cannot overwrite onboarding; invalid input and origins are rejected', async () => {
  const a = new Browser(), b = new Browser(); const user = await register(a);
  await login(a, user.email); await login(b, user.email);
  for (const playerName of ['ab', 'admin', 'A\nB', '🙂🙂🙂', '1\u0301ab']) {
    assert.equal((await a.request('/../players/me/onboarding', 'POST', { playerName })).status, 400);
  }
  assert.equal((await a.request('/../players/me/onboarding', 'POST', { playerName: 'OkayName', userId: user.id })).status, 400);
  assert.equal((await a.request('/../players/me/onboarding', 'POST', { playerName: 'OkayName' }, 'https://other.invalid')).status, 403);
  const replies = await Promise.all([a.request('/../players/me/onboarding', 'POST', { playerName: 'A' + randomUUID().slice(0,8) }), b.request('/../players/me/onboarding', 'POST', { playerName: 'B' + randomUUID().slice(0,8) })]);
  assert.deepEqual(replies.map(r => r.status).sort(), [200, 409]);
});

before(async () => { db = new PrismaService(); await db.$connect(); });
beforeEach(async () => {
  const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(GoogleProvider)
    .useFactory({ factory: (settings: AuthSettings) => new FakeGoogle(settings), inject: [AuthSettings] }).compile();
  app = module.createNestApplication<NestExpressApplication>(new ExpressAdapter(), { logger: false });
  provider = app.get(GoogleProvider) as FakeGoogle;
  configureApp(app); await app.listen(0, '127.0.0.1');
  base = await app.getUrl() + '/api/v1/auth';
});
afterEach(async () => { await app.close(); });
after(async () => { await db.user.deleteMany({ where: { normalizedEmail: { startsWith: prefix } } }); await db.$disconnect(); });

test('registration validates input, normalizes email, hashes password and does not grant admin', async () => {
  const browser = new Browser(), address = email();
  const res = await browser.request('/register', 'POST', { email: address.toUpperCase(), displayName: ' Player ', password });
  assert.equal(res.status, 201);
  const data = await res.json();
  assert.equal(data.user.email, address); assert.equal(data.user.role, 'PLAYER');
  assert.equal(data.user.profile.displayName, 'Player'); assert.ok(!JSON.stringify(data).includes('passwordHash'));
  const stored = await db.user.findUniqueOrThrow({ where: { normalizedEmail: address } });
  assert.notEqual(stored.passwordHash, password); assert.ok(await argon2.verify(stored.passwordHash!, password));
  assert.equal((await browser.request('/me')).status, 401);
  assert.equal((await browser.request('/register', 'POST', { email: address, displayName: 'Test', password })).status, 409);
  assert.equal((await browser.request('/register', 'POST', { email: email(), displayName: 'Test', password, role: 'ADMIN' })).status, 400);
  assert.equal((await browser.request('/register', 'POST', { email: email(), displayName: 'Test', password: 'short' })).status, 400);
});

test('concurrent duplicate registrations create exactly one account/profile', async () => {
  const address = email(), body = { email: address, password, displayName: 'Concurrent' };
  const responses = await Promise.all([new Browser().request('/register', 'POST', body), new Browser().request('/register', 'POST', body)]);
  assert.deepEqual(responses.map(r => r.status).sort(), [201, 409]);
  assert.equal(await db.user.count({ where: { normalizedEmail: address } }), 1);
});

test('separate browser sessions survive app restart; logout revokes only current session', async () => {
  const chrome = new Browser(), brave = new Browser(), address = email();
  const user = await register(chrome, address);
  const response = await login(chrome, address);
  assert.match(response.headers.get('set-cookie')!, /HttpOnly/); assert.match(response.headers.get('set-cookie')!, /SameSite=Lax/i);
  await login(brave, address);
  const oldToken = chrome.jar.get('gemora_session')!;
  assert.notEqual(oldToken, brave.jar.get('gemora_session'));
  const session = await db.authSession.findUniqueOrThrow({ where: { tokenHash: digest(oldToken) } });
  assert.notEqual(session.tokenHash, oldToken);
  await app.close();
  const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(GoogleProvider).useValue(provider).compile();
  app = module.createNestApplication<NestExpressApplication>(new ExpressAdapter(), { logger: false }); configureApp(app);
  await app.listen(0, '127.0.0.1'); base = await app.getUrl() + '/api/v1/auth';
  assert.equal((await (await chrome.request('/me')).json()).user.id, user.id);
  await db.playerProfile.update({ where: { userId: user.id }, data: { displayName: 'Updated' } });
  assert.equal((await (await brave.request('/me')).json()).user.profile.displayName, 'Updated');
  assert.equal((await chrome.request('/logout', 'POST', {})).status, 204);
  assert.equal((await chrome.request('/logout', 'POST', {})).status, 204);
  chrome.jar.set('gemora_session', oldToken);
  assert.equal((await chrome.request('/me')).status, 401);
  assert.equal((await brave.request('/me')).status, 200);
});

test('wrong credentials, expired sessions and locked accounts are rejected', async () => {
  const browser = new Browser(), address = email(); const user = await register(browser, address);
  const wrong = await browser.request('/login', 'POST', { email: address, password: 'wrong' });
  const unknown = await browser.request('/login', 'POST', { email: email(), password: 'wrong' });
  assert.equal(wrong.status, 401); assert.deepEqual(await wrong.json(), await unknown.json());
  await login(browser, address);
  await db.authSession.updateMany({ where: { userId: user.id }, data: { expiresAt: new Date(0) } });
  assert.equal((await browser.request('/me')).status, 401);
  await login(browser, address);
  await db.user.update({ where: { id: user.id }, data: { status: 'LOCKED' } });
  assert.equal((await browser.request('/me')).status, 401);
  assert.equal((await browser.request('/login', 'POST', { email: address, password })).status, 401);
});

test('CSRF, oversized payloads, and excessive login attempts are blocked', async () => {
  const browser = new Browser(), address = email();
  assert.equal((await browser.request('/register', 'POST', { email: address, password, displayName: 'Xx' }, 'https://evil.test')).status, 403);
  assert.equal((await browser.request('/register', 'POST', { email: address, password, displayName: 'Xx' }, '')).status, 403);
  assert.equal((await browser.request('/login', 'POST', { email: address, password: 'a'.repeat(20000) })).status, 413);
  for (let i = 0; i < 10; i++) assert.equal((await browser.request('/login', 'POST', { email: address, password })).status, 401);
  assert.equal((await browser.request('/login', 'POST', { email: address, password })).status, 429);
});

test('Google first login, return login and locked-account rejection', async () => {
  const chrome = new Browser(), brave = new Browser(), identity = provider.add();
  assert.equal((await chrome.finish(await chrome.start(), identity.code)).headers.get('location'), 'http://localhost:8080/?auth=success');
  const first = (await (await chrome.request('/me')).json()).user;
  assert.deepEqual(first.authMethods, { password: false, google: true });
  const stored = await db.user.findUniqueOrThrow({ where: { id: first.id }, include: { identities: true } });
  assert.equal(stored.passwordHash, null); assert.equal(stored.identities[0]?.providerSubject, identity.subject);
  assert.equal((await brave.finish(await brave.start(), identity.code)).status, 303);
  assert.equal((await (await brave.request('/me')).json()).user.id, first.id);
  assert.equal((await brave.request('/login', 'POST', { email: identity.email, password })).status, 401);
  await db.user.update({ where: { id: first.id }, data: { status: 'LOCKED' } });
  const another = new Browser();
  assert.match((await another.finish(await another.start(), identity.code)).headers.get('location')!, /google_failed$/);
  assert.equal(another.jar.get('gemora_session'), undefined);
});

test('Google collision requires explicit password-confirmed linking, preserving the existing account', async () => {
  const local = new Browser(), google = new Browser(), address = email();
  const user = await register(local, address); const identity = provider.add(address);
  const collision = await google.finish(await google.start(), identity.code);
  assert.match(collision.headers.get('location')!, /account_link_required$/);
  assert.equal(google.jar.get('gemora_session'), undefined);
  await login(local, address); const oldToken = local.jar.get('gemora_session');
  assert.equal((await local.request('/google/link', 'POST', { password: 'wrong' })).status, 401);
  const link = await local.request('/google/link', 'POST', { password }); assert.equal(link.status, 200);
  const state = new URL((await link.json()).authorizationUrl).searchParams.get('state')!;
  assert.match((await local.finish(state, identity.code)).headers.get('location')!, /success$/);
  assert.notEqual(oldToken, local.jar.get('gemora_session'));
  assert.equal((await db.authSession.findUniqueOrThrow({ where: { tokenHash: digest(oldToken!) } })).revokedAt !== null, true);
  await google.finish(await google.start(), identity.code);
  assert.equal((await (await google.request('/me')).json()).user.id, user.id);
  assert.equal(await db.user.count({ where: { normalizedEmail: address } }), 1);
});

test('Google state, browser binding, cancellation, replay and provider failure never create a session', async () => {
  const browser = new Browser(), other = new Browser(), identity = provider.add();
  const state = await browser.start();
  assert.match((await other.finish(state, identity.code)).headers.get('location')!, /google_failed$/);
  const originalCookie = browser.jar.get('gemora_oauth')!;
  assert.match((await browser.finish(state, identity.code)).headers.get('location')!, /success$/);
  browser.jar.set('gemora_oauth', originalCookie);
  assert.match((await browser.finish(state, identity.code)).headers.get('location')!, /google_failed$/);
  const canceled = new Browser(), canceledState = await canceled.start();
  assert.match((await canceled.request(`/google/callback?state=${canceledState}&error=access_denied`)).headers.get('location')!, /google_cancelled$/);
  assert.equal(canceled.jar.get('gemora_session'), undefined);
  const failure = new Browser();
  const fail = await failure.finish(await failure.start(), 'invalid-provider-code');
  assert.match(fail.headers.get('location')!, /google_failed$/);
  assert.ok(!(await fail.text()).includes('private-provider-error'));
  assert.equal(failure.jar.get('gemora_session'), undefined);
});

test('a changed session or mismatching Google email cannot link an account', async () => {
  const browser = new Browser(), address = email(); const user = await register(browser, address); await login(browser, address);
  const link = await browser.request('/google/link', 'POST', { password });
  const state = new URL((await link.json()).authorizationUrl).searchParams.get('state')!;
  assert.match((await browser.finish(state, provider.add().code)).headers.get('location')!, /google_link_conflict$/);
  assert.equal(await db.authIdentity.count({ where: { userId: user.id } }), 0);
  const next = await browser.request('/google/link', 'POST', { password });
  const nextState = new URL((await next.json()).authorizationUrl).searchParams.get('state')!;
  browser.jar.delete('gemora_session');
  assert.match((await browser.finish(nextState, provider.add(address).code)).headers.get('location')!, /session_changed$/);
});

test('concurrent Google first logins create one identity and one profile', async () => {
  const a = new Browser(), b = new Browser(), identity = provider.add();
  const states = await Promise.all([a.start(), b.start()]);
  const results = await Promise.all([a.finish(states[0]!, identity.code), b.finish(states[1]!, identity.code)]);
  for (const res of results) assert.match(res.headers.get('location')!, /success$/);
  const ua = (await (await a.request('/me')).json()).user;
  const ub = (await (await b.request('/me')).json()).user;
  assert.equal(ua.id, ub.id); assert.equal(ua.profile.id, ub.profile.id);
});

test('Google reports unavailable when not configured; local auth remains available', async () => {
  const settings = app.get(AuthSettings);
  Object.defineProperty(settings, 'google', { value: null });
  assert.deepEqual(await (await new Browser().request('/providers')).json(), { password: true, google: false });
  assert.equal((await new Browser().request('/google/start')).status, 503);
  await register(new Browser());
});

test('secure cookies follow HTTPS settings; rate limiter remains bounded and fails closed', async () => {
  const settings = app.get(AuthSettings); Object.defineProperty(settings, 'secure', { value: true });
  const browser = new Browser(), address = email(); await register(browser, address);
  assert.match((await login(browser, address)).headers.get('set-cookie')!, /; Secure/);
  const limiter = app.get(AuthSecurity); limiter.limit('isolated', 1, 10000);
  assert.throws(() => limiter.limit('isolated', 1, 10000), /Too many requests/);
});
