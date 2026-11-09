import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { test } from 'node:test';
import pg from 'pg';

const url = process.env.TEST_DATABASE_URL;
if (!url || !new URL(url).pathname.endsWith('_test')) throw new Error('A separate _test database is required.');

async function transaction(work) {
  const db = new pg.Client({ connectionString: url });
  await db.connect();
  try {
    await db.query('BEGIN');
    await work(db);
  } finally {
    await db.query('ROLLBACK');
    await db.end();
  }
}
async function profile(db) {
  const id = randomUUID();
  await db.query('INSERT INTO "User" (id,"normalizedEmail","passwordHash","updatedAt") VALUES ($1,$2,$3,now())', [id, `${id}@example.test`, 'test-fixture']);
  await db.query('INSERT INTO "PlayerProfile" (id,"userId","displayName","updatedAt") VALUES ($1,$1,$2,now())', [id, 'Legacy account']);
  return id;
}
function complete(db, id, name, key = name.normalize('NFC').toLowerCase(), avatar = 'crystal-dragon', completed = true) {
  return db.query('UPDATE "PlayerProfile" SET "playerName"=$2,"normalizedPlayerName"=$3,"avatarKey"=$4,"onboardingCompletedAt"=$5 WHERE id=$1', [id, name, key, avatar, completed ? new Date() : null]);
}

test('legacy profiles retain their name and start incomplete', () => transaction(async db => {
  const id = await profile(db);
  const { rows: [row] } = await db.query('SELECT * FROM "PlayerProfile" WHERE id=$1', [id]);
  assert.equal(row.displayName, 'Legacy account');
  for (const key of ['playerName', 'normalizedPlayerName', 'avatarKey', 'onboardingCompletedAt']) assert.equal(row[key], null);
  await profile(db); // Multiple incomplete profiles may have NULL unique keys.
}));

test('confirmed Unicode names and avatar changes preserve profile identity', () => transaction(async db => {
  const id = await profile(db);
  await complete(db, id, 'Ánh Ngọc');
  await db.query('UPDATE "PlayerProfile" SET "avatarKey"=$2 WHERE id=$1', [id, 'moon']);
  const { rows: [row] } = await db.query('SELECT * FROM "PlayerProfile" WHERE id=$1', [id]);
  assert.equal(row.playerName, 'Ánh Ngọc');
  assert.equal(row.normalizedPlayerName, 'ánh ngọc');
  assert.equal(row.avatarKey, 'moon');
  assert.ok(row.onboardingCompletedAt);
}));

test('case variants cannot claim the same player name', () => transaction(async db => {
  await complete(db, await profile(db), 'Ánh Ngọc');
  await assert.rejects(complete(db, await profile(db), 'ánh ngọc'), { code: '23505' });
}));

for (const [label, name, key, avatar, completed] of [
  ['short name', 'ab', 'ab', 'moon', true],
  ['spaces only', '   ', '   ', 'moon', true],
  ['leading space', ' Moon', ' moon', 'moon', true],
  ['repeated spaces', 'Moon  Leaf', 'moon  leaf', 'moon', true],
  ['control characters', 'Moon\nLeaf', 'moon\nleaf', 'moon', true],
  ['non-NFC name', 'A\u0301nh', 'ánh', 'moon', true],
  ['incorrect normalized key', 'Moonleaf', 'another-name', 'moon', true],
  ['unknown avatar', 'Moonleaf', 'moonleaf', 'unknown', true],
  ['missing avatar', 'Moonleaf', 'moonleaf', null, true],
  ['missing key', 'Moonleaf', null, 'moon', true],
  ['missing completion marker', 'Moonleaf', 'moonleaf', 'moon', false],
]) {
  test(`rejects ${label}`, () => transaction(async db => {
    await assert.rejects(complete(db, await profile(db), name, key, avatar, completed), { code: '23514' });
  }));
}

test('rejects overlong names', () => transaction(async db => {
  await assert.rejects(complete(db, await profile(db), 'a'.repeat(17)), { code: '22001' });
}));
