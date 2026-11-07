import 'reflect-metadata';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import { test } from 'node:test';
import { OAuth2Client } from 'google-auth-library';
import { AuthSettings } from '../src/auth/auth.settings.js';
import { GoogleProvider } from '../src/auth/google.provider.js';

process.env.APP_ORIGIN = 'http://localhost:8080';
process.env.GOOGLE_CLIENT_ID = 'test-audience';
process.env.GOOGLE_CLIENT_SECRET = 'test-secret';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost:8080/api/v1/auth/google/callback';
const keys = generateKeyPairSync('rsa', { modulusLength: 2048 });
const now = Math.floor(Date.now() / 1000);
const claims = { iss: 'https://accounts.google.com', aud: 'test-audience', sub: 'google-subject',
  iat: now, exp: now + 3600, email: 'player@example.test', email_verified: true, nonce: 'test-nonce', name: 'Player' };
function jwt(payload: object, wrongKey = false): string {
  const unsigned = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'test-key' })).toString('base64url') + '.' + Buffer.from(JSON.stringify(payload)).toString('base64url');
  const key = wrongKey ? generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey : keys.privateKey;
  return unsigned + '.' + sign('RSA-SHA256', Buffer.from(unsigned), key).toString('base64url');
}
class OfflineProvider extends GoogleProvider {
  token = jwt(claims);
  protected override client(): OAuth2Client {
    const client = new OAuth2Client('test-audience');
    client.getToken = (async () => ({ tokens: { id_token: this.token }, res: null })) as typeof client.getToken;
    client.getFederatedSignonCertsAsync = async () => ({ certs: { 'test-key': keys.publicKey.export({ type: 'spki', format: 'pem' }).toString() }, format: 'PEM' as Awaited<ReturnType<OAuth2Client['getFederatedSignonCertsAsync']>>['format'] });
    return client;
  }
}
test('Google verifier accepts a correctly signed identity with matching nonce', async () => {
  const provider = new OfflineProvider(new AuthSettings());
  assert.deepEqual(await provider.verifyCode('code', 'verifier', 'test-nonce'), { subject: 'google-subject', email: 'player@example.test', displayName: 'Player' });
});
for (const [name, patch] of Object.entries({
  audience: { aud: 'other-app' }, issuer: { iss: 'https://attacker.test' }, expiry: { iat: now - 7200, exp: now - 3600 },
  nonce: { nonce: 'wrong' }, unverifiedEmail: { email_verified: false }, missingEmail: { email: undefined }, missingSubject: { sub: '' },
})) {
  test(`Google verifier rejects invalid ${name}`, async () => {
    const provider = new OfflineProvider(new AuthSettings()); provider.token = jwt({ ...claims, ...patch });
    await assert.rejects(provider.verifyCode('code', 'verifier', 'test-nonce'), /Không thể xác minh/);
  });
}
test('Google verifier rejects tokens signed by another key', async () => {
  const provider = new OfflineProvider(new AuthSettings()); provider.token = jwt(claims, true);
  await assert.rejects(provider.verifyCode('code', 'verifier', 'test-nonce'), /Không thể xác minh/);
});
