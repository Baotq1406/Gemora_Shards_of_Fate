import { Body, Controller, Get, HttpCode, Inject, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthFlowError, AuthService, publicUser } from "./auth.service.js";
import { AuthSettings } from "./auth.settings.js";
import { AuthSecurity, SESSION_COOKIE, OAUTH_COOKIE, readToken, setToken, clearToken } from "./auth.security.js";
import { SessionGuard, type AuthenticatedRequest } from "./session.guard.js";

@Controller('auth')
@UseGuards(AuthSecurity)
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService, @Inject(AuthSettings) private readonly settings: AuthSettings) {}

  @Get('providers')
  providers() { return { password: true, google: this.settings.google !== null }; }

  @Post('register')
  register(@Body() body: unknown) { return this.auth.register(body); }

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: unknown, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(body, readToken(req));
    setToken(res, this.settings, SESSION_COOKIE, result.token, this.settings.ttlMs);
    clearToken(res, this.settings, OAUTH_COOKIE);
    return { user: result.user };
  }

  @Get('me')
  @UseGuards(SessionGuard)
  me(@Req() req: AuthenticatedRequest) { return { user: publicUser(req.auth.user) }; }

  @Post('logout')
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(readToken(req));
    clearToken(res, this.settings, SESSION_COOKIE);
    clearToken(res, this.settings, OAUTH_COOKIE);
  }

  @Get('google/start')
  start(@Req() req: Request, @Res() res: Response) {
    const result = this.auth.beginGoogle('LOGIN', readToken(req));
    setToken(res, this.settings, OAUTH_COOKIE, result.browser, 300000);
    res.redirect(302, result.url);
  }

  @Post('google/link')
  @UseGuards(SessionGuard)
  @HttpCode(200)
  async link(@Body() body: unknown, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.beginLink(body, readToken(req));
    setToken(res, this.settings, OAUTH_COOKIE, result.browser, 300000);
    return { authorizationUrl: result.url };
  }

  @Get('google/callback')
  async callback(@Query() query: Record<string, unknown>, @Req() req: Request, @Res() res: Response) {
    let status = 'success';
    try {
      const result = await this.auth.finishGoogle(query, readToken(req, OAUTH_COOKIE), readToken(req));
      setToken(res, this.settings, SESSION_COOKIE, result.token, this.settings.ttlMs);
    } catch (error) {
      status = error instanceof AuthFlowError ? error.code : 'google_failed';
    }
    clearToken(res, this.settings, OAUTH_COOKIE);
    res.redirect(303, `${this.settings.origin}/?auth=${status}`);
  }
}
