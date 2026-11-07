import { Inject, Injectable, ServiceUnavailableException, UnauthorizedException } from "@nestjs/common";
import { OAuth2Client, CodeChallengeMethod } from "google-auth-library";
import { createHash } from "node:crypto";
import { AuthSettings } from "./auth.settings.js";
import { displayNameInput, emailInput } from "./auth.validation.js";

export interface GoogleProfile { subject: string; email: string; displayName: string }

@Injectable()
export class GoogleProvider {
  constructor(@Inject(AuthSettings) private readonly settings: AuthSettings) {}
  protected client(): OAuth2Client {
    const config = this.settings.google;
    if (!config) throw new ServiceUnavailableException('Đăng nhập Google chưa được cấu hình.');
    return new OAuth2Client({ clientId: config.clientId, clientSecret: config.clientSecret,
      redirectUri: config.redirectUri, transporterOptions: { timeout: 10000, retry: false } });
  }
  authorizationUrl(state: string, nonce: string, verifier: string): string {
    return this.client().generateAuthUrl({
      scope: ['openid', 'email', 'profile'], access_type: 'online', prompt: 'select_account',
      state, nonce, code_challenge_method: CodeChallengeMethod.S256,
      code_challenge: createHash('sha256').update(verifier).digest('base64url'),
    });
  }
  async verifyCode(code: string, verifier: string, nonce: string): Promise<GoogleProfile> {
    try {
      const client = this.client();
      const { tokens } = await client.getToken({ code, codeVerifier: verifier });
      if (!tokens.id_token) throw new Error('No ID token');
      const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: this.settings.google!.clientId });
      const payload = ticket.getPayload();
      if (!payload || (payload as unknown as Record<string, unknown>).nonce !== nonce || payload.email_verified !== true ||
          payload.exp <= Math.floor(Date.now() / 1000) ||
          !payload.sub || payload.sub.length > 255) throw new Error('Invalid identity');
      let displayName = 'Người chơi Gemora';
      try { displayName = displayNameInput(payload.name); } catch { /* Valid default if Google has no usable name. */ }
      return { subject: payload.sub, email: emailInput(payload.email), displayName };
    } catch {
      // Provider errors may contain codes/tokens/client secrets. Never pass them into Nest logs or responses.
      throw new UnauthorizedException('Không thể xác minh đăng nhập Google. Vui lòng thử lại.');
    }
  }
}
