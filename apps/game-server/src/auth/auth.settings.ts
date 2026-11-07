import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthSettings {
  readonly origin: string;
  readonly secure: boolean;
  readonly ttlMs: number;
  readonly google: { clientId: string; clientSecret: string; redirectUri: string } | null;

  constructor() {
    const origin = new URL(process.env.APP_ORIGIN || "http://localhost:8080");
    if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password ||
        origin.pathname !== '/' || origin.search || origin.hash) throw new Error("APP_ORIGIN không hợp lệ.");
    this.origin = origin.origin;
    this.secure = origin.protocol === 'https:';
    if (process.env.NODE_ENV === 'production' && !this.secure) throw new Error("Production cần HTTPS.");
    const days = Number(process.env.SESSION_TTL_DAYS || '7');
    if (!Number.isInteger(days) || days < 1 || days > 30) throw new Error("SESSION_TTL_DAYS phải từ 1 đến 30.");
    this.ttlMs = days * 86400000;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    this.google = clientId && clientSecret && redirectUri ? { clientId, clientSecret, redirectUri } : null;
    if (this.google) {
      const redirect = new URL(this.google.redirectUri);
      if (redirect.origin !== this.origin || redirect.pathname !== '/api/v1/auth/google/callback' ||
          redirect.search || redirect.hash || redirect.username || redirect.password) {
        throw new Error("Google callback phải cùng APP_ORIGIN và đúng đường dẫn đã cấu hình.");
      }
    }
  }
}
