import { ConflictException, Inject, Injectable, OnModuleDestroy, OnModuleInit, UnauthorizedException, ServiceUnavailableException } from "@nestjs/common";
import * as argon2 from "argon2";
import type { AuthUser } from "@gemora/shared-types";
import { PrismaService } from "../database/prisma.service.js";
import { Prisma } from "../generated/prisma/client.js";
import { AuthSettings } from "./auth.settings.js";
import { digest, randomToken } from "./auth.security.js";
import { GoogleProvider, type GoogleProfile } from "./google.provider.js";
import { displayNameInput, emailInput, objectInput, passwordInput } from "./auth.validation.js";

const userInclude = { profile: true, identities: { select: { provider: true } } } as const;
type Account = Prisma.UserGetPayload<{ include: typeof userInclude }>;
type Tx = Prisma.TransactionClient;
export interface AuthenticatedSession { user: Account; sessionId: string; tokenHash: string }
export class AuthFlowError extends Error {
  constructor(readonly code: 'account_link_required' | 'google_link_conflict' | 'session_changed' | 'google_cancelled' | 'google_failed') { super(code); }
}
interface Attempt {
  browserHash: string; nonce: string; verifier: string; expiresAt: number;
  intent: 'LOGIN' | 'LINK'; sessionHash?: string; userId?: string;
}
export function publicUser(user: Account): AuthUser {
  return {
    id: user.id, email: user.normalizedEmail, role: user.role,
    profile: user.profile ? { id: user.profile.id, displayName: user.profile.displayName } : null,
    authMethods: { password: user.passwordHash !== null, google: user.identities.some(i => i.provider === 'GOOGLE') },
  };
}

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  private readonly attempts = new Map<string, Attempt>();
  private readonly attemptTimer = setInterval(() => this.pruneAttempts(), 60000).unref();
  private readonly sessionTimer: NodeJS.Timeout;
  private dummyHash = '';
  constructor(
    @Inject(PrismaService) private readonly db: PrismaService,
    @Inject(AuthSettings) private readonly settings: AuthSettings,
    @Inject(GoogleProvider) private readonly google: GoogleProvider,
  ) {
    this.sessionTimer = setInterval(() => {
      void this.db.authSession.deleteMany({ where: { expiresAt: { lt: new Date() } } }).catch(() => {});
    }, 3600000).unref();
  }
  async onModuleInit(): Promise<void> { this.dummyHash = await this.hashPassword(randomToken()); }
  onModuleDestroy(): void { clearInterval(this.attemptTimer); clearInterval(this.sessionTimer); this.attempts.clear(); }
  private pruneAttempts(): void {
    for (const [key, attempt] of this.attempts) if (attempt.expiresAt <= Date.now()) this.attempts.delete(key);
  }
  private hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
  }
  private async checkPassword(user: Account | null, password: string): Promise<boolean> {
    const matches = await argon2.verify(user?.passwordHash || this.dummyHash, password).catch(() => false);
    return matches && !!user?.passwordHash && user.status === 'ACTIVE';
  }
  async register(body: unknown) {
    const input = objectInput(body, ['displayName', 'email', 'password']);
    const displayName = displayNameInput(input.displayName);
    const normalizedEmail = emailInput(input.email);
    const passwordHash = await this.hashPassword(passwordInput(input.password, true));
    try {
      const user = await this.db.user.create({ data: {
        normalizedEmail, passwordHash, role: 'PLAYER', status: 'ACTIVE', profile: { create: { displayName } },
      }, include: userInclude });
      return { user: publicUser(user) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email này chưa thể dùng để đăng ký. Hãy đăng nhập bằng phương thức đã có.');
      }
      throw error;
    }
  }
  private async newSession(tx: Tx, userId: string, oldToken?: string) {
    const user = await tx.user.findUnique({ where: { id: userId }, include: userInclude });
    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('Không thể đăng nhập tài khoản này.');
    if (oldToken) await tx.authSession.updateMany({ where: { tokenHash: digest(oldToken), revokedAt: null }, data: { revokedAt: new Date() } });
    const token = randomToken();
    await tx.authSession.create({ data: { userId, tokenHash: digest(token), expiresAt: new Date(Date.now() + this.settings.ttlMs) } });
    return { token, user: publicUser(user) };
  }
  async login(body: unknown, oldToken?: string) {
    const input = objectInput(body, ['email', 'password']);
    const email = emailInput(input.email);
    const password = passwordInput(input.password);
    const user = await this.db.user.findUnique({ where: { normalizedEmail: email }, include: userInclude });
    if (!await this.checkPassword(user, password)) throw new UnauthorizedException('Email hoặc mật khẩu không đúng.');
    return this.db.$transaction(tx => this.newSession(tx, user!.id, oldToken));
  }
  async current(token?: string, tx: Tx = this.db): Promise<AuthenticatedSession> {
    if (!token) throw new UnauthorizedException('Vui lòng đăng nhập.');
    const tokenHash = digest(token);
    const session = await tx.authSession.findUnique({ where: { tokenHash }, include: { user: { include: userInclude } } });
    if (!session || session.revokedAt || session.expiresAt <= new Date() || session.user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Phiên đăng nhập không còn hiệu lực.');
    }
    return { user: session.user, sessionId: session.id, tokenHash };
  }
  async logout(token?: string): Promise<void> {
    if (token) await this.db.authSession.updateMany({ where: { tokenHash: digest(token), revokedAt: null }, data: { revokedAt: new Date() } });
  }
  beginGoogle(intent: 'LOGIN' | 'LINK', currentToken?: string, userId?: string) {
    this.pruneAttempts();
    if (this.attempts.size >= 2000) throw new ServiceUnavailableException('Vui lòng thử lại sau.');
    const state = randomToken(), browser = randomToken(), nonce = randomToken(), verifier = randomToken();
    const url = this.google.authorizationUrl(state, nonce, verifier);
    this.attempts.set(digest(state), {
      browserHash: digest(browser), nonce, verifier, expiresAt: Date.now() + 300000, intent,
      sessionHash: currentToken ? digest(currentToken) : undefined, userId,
    });
    return { url, browser };
  }
  async beginLink(body: unknown, token?: string) {
    const input = objectInput(body, ['password']);
    const session = await this.current(token);
    if (!await this.checkPassword(session.user, passwordInput(input.password))) throw new UnauthorizedException('Không thể xác nhận mật khẩu.');
    return this.beginGoogle('LINK', token, session.user.id);
  }
  private takeAttempt(state: unknown, browser?: string, currentToken?: string): Attempt {
    if (typeof state !== 'string' || !/^[a-f0-9]{64}$/.test(state) || !browser) throw new AuthFlowError('google_failed');
    const key = digest(state), attempt = this.attempts.get(key);
    if (!attempt || attempt.expiresAt <= Date.now() || attempt.browserHash !== digest(browser)) throw new AuthFlowError('google_failed');
    this.attempts.delete(key); // Atomic before awaiting any I/O; the callback cannot be replayed.
    if (attempt.sessionHash !== (currentToken ? digest(currentToken) : undefined)) throw new AuthFlowError('session_changed');
    return attempt;
  }
  async finishGoogle(query: Record<string, unknown>, browser?: string, currentToken?: string) {
    const attempt = this.takeAttempt(query.state, browser, currentToken);
    if (query.error === 'access_denied') throw new AuthFlowError('google_cancelled');
    if (query.error || typeof query.code !== 'string' || !query.code || query.code.length > 4096) throw new AuthFlowError('google_failed');
    const profile = await this.google.verifyCode(query.code, attempt.verifier, attempt.nonce);
    try {
      return await this.db.$transaction(tx => this.applyGoogle(tx, profile, attempt, currentToken));
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
      // A concurrent callback may have committed this identity. Re-read within a new transaction.
      if (attempt.intent === 'LOGIN') {
        const existing = await this.db.authIdentity.findUnique({ where: { provider_providerSubject: { provider: 'GOOGLE', providerSubject: profile.subject } } });
        if (existing) return this.db.$transaction(tx => this.newSession(tx, existing.userId, currentToken));
        throw new AuthFlowError('account_link_required');
      }
      throw new AuthFlowError('google_link_conflict');
    }
  }
  private async applyGoogle(tx: Tx, profile: GoogleProfile, attempt: Attempt, currentToken?: string) {
    const identity = await tx.authIdentity.findUnique({ where: { provider_providerSubject: { provider: 'GOOGLE', providerSubject: profile.subject } } });
    if (attempt.intent === 'LINK') {
      const current = await this.current(currentToken, tx);
      if (current.user.id !== attempt.userId || current.tokenHash !== attempt.sessionHash) throw new AuthFlowError('session_changed');
      if (current.user.normalizedEmail !== profile.email || (identity && identity.userId !== current.user.id)) throw new AuthFlowError('google_link_conflict');
      const existing = await tx.authIdentity.findUnique({ where: { userId_provider: { userId: current.user.id, provider: 'GOOGLE' } } });
      if (existing && existing.providerSubject !== profile.subject) throw new AuthFlowError('google_link_conflict');
      // Claim the current session before linking. A concurrent logout or link can win only once.
      const revoked = await tx.authSession.updateMany({
        where: { id: current.sessionId, revokedAt: null, expiresAt: { gt: new Date() } },
        data: { revokedAt: new Date() },
      });
      if (revoked.count !== 1) throw new AuthFlowError('session_changed');
      if (!identity) await tx.authIdentity.create({ data: { userId: current.user.id, provider: 'GOOGLE', providerSubject: profile.subject } });
      return this.newSession(tx, current.user.id);
    }
    if (identity) return this.newSession(tx, identity.userId, currentToken);
    if (await tx.user.findUnique({ where: { normalizedEmail: profile.email }, select: { id: true } })) throw new AuthFlowError('account_link_required');
    const user = await tx.user.create({ data: {
      normalizedEmail: profile.email, passwordHash: null, role: 'PLAYER', status: 'ACTIVE',
      profile: { create: { displayName: profile.displayName } },
      identities: { create: { provider: 'GOOGLE', providerSubject: profile.subject } },
    } });
    return this.newSession(tx, user.id, currentToken);
  }
}
