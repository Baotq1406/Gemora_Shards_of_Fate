import { CanActivate, ExecutionContext, ForbiddenException, HttpException, HttpStatus, Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import type { Request, Response } from "express";
import { createHash, randomBytes } from "node:crypto";
import { AuthSettings } from "./auth.settings.js";

export const SESSION_COOKIE = 'gemora_session';
export const OAUTH_COOKIE = 'gemora_oauth';
export const randomToken = () => randomBytes(32).toString('hex');
export const digest = (value: string) => createHash('sha256').update(value).digest('hex');

// Accept only the exact token format issued by this server, with no decoding ambiguity.
export function readToken(req: Request, name = SESSION_COOKIE): string | undefined {
  const values = (req.headers.cookie || '').split(';').map(v => v.trim()).filter(v => v.startsWith(name + '='));
  if (values.length !== 1) return undefined;
  const value = values[0]!.slice(name.length + 1);
  return /^[a-f0-9]{64}$/.test(value) ? value : undefined;
}
export function setToken(res: Response, settings: AuthSettings, name: string, value: string, maxAge: number): void {
  res.cookie(name, value, { httpOnly: true, secure: settings.secure, sameSite: 'lax', path: '/', maxAge });
}
export function clearToken(res: Response, settings: AuthSettings, name: string): void {
  res.clearCookie(name, { httpOnly: true, secure: settings.secure, sameSite: 'lax', path: '/' });
}

@Injectable()
export class AuthSecurity implements CanActivate, OnModuleDestroy {
  private readonly buckets = new Map<string, { count: number; until: number }>();
  private readonly timer = setInterval(() => this.prune(), 60000).unref();
  constructor(@Inject(AuthSettings) private readonly settings: AuthSettings) {}
  private prune(): void { for (const [key, value] of this.buckets) if (value.until <= Date.now()) this.buckets.delete(key); }
  onModuleDestroy(): void { clearInterval(this.timer); }

  limit(key: string, max: number, duration: number): void {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket || bucket.until <= now) {
      if (this.buckets.size >= 10000) this.prune();
      if (!this.buckets.has(key) && this.buckets.size >= 10000) throw new HttpException('Vui lòng thử lại sau.', 429);
      bucket = { count: 0, until: now + duration };
      this.buckets.set(key, bucket);
    }
    if (++bucket.count > max) throw new HttpException('Bạn thao tác quá nhanh. Vui lòng thử lại sau.', HttpStatus.TOO_MANY_REQUESTS);
  }
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (!['GET', 'HEAD'].includes(req.method)) {
      // Exact Origin + JSON-only writes block browser CSRF; never infer origin from Host.
      if (req.headers.origin !== this.settings.origin || !req.is('application/json')) {
        throw new ForbiddenException('Nguồn yêu cầu không hợp lệ.');
      }
    }
    // Do not trust arbitrary X-Forwarded-For. Configure a trusted proxy explicitly before deployment.
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    this.limit('all:' + ip, 180, 60000);
    const handler = context.getHandler().name;
    if (['login', 'register', 'link', 'start', 'callback'].includes(handler)) {
      this.limit('auth:' + ip, 40, 900000);
      if (handler === 'login' && typeof req.body?.email === 'string') {
        const email = req.body.email.slice(0, 300).trim().toLowerCase();
        this.limit('email:' + digest(email), 10, 900000);
      }
    }
    return true;
  }
}
