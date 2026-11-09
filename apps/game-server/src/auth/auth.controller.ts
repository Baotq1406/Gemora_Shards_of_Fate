import { Body, Controller, Get, HttpCode, Inject, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthFlowError, AuthService, publicUser } from "./auth.service.js";
import { AuthSettings } from "./auth.settings.js";
import { AuthSecurity, SESSION_COOKIE, OAUTH_COOKIE, readToken, setToken, clearToken } from "./auth.security.js";
import { SessionGuard, type AuthenticatedRequest } from "./session.guard.js";
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ApiContract, linkBody, loginBody, object, providersResponse, redirectHeader, registerBody, sessionHeader, userResponse } from '../api-contracts.js';

@Controller('auth')
@ApiTags('Auth')
@UseGuards(AuthSecurity)
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService, @Inject(AuthSettings) private readonly settings: AuthSettings) {}

  @Get('providers')
  @ApiContract('Xem phương thức đăng nhập khả dụng', { response: providersResponse, errors: [429] })
  providers() { return { password: true, google: this.settings.google !== null }; }

  @Post('register')
  @ApiContract('Đăng ký tài khoản', { body: registerBody, response: userResponse, status: 201, description: 'Tạo tài khoản, chưa đăng nhập và chưa tạo nhân vật.', errors: [400, 403, 409, 413, 429] })
  register(@Body() body: unknown) { return this.auth.register(body); }

  @Post('login')
  @ApiContract('Đăng nhập bằng email', { body: loginBody, response: userResponse, headers: sessionHeader, description: 'Sau khi thành công, trình duyệt lưu cookie phiên HttpOnly và tự gửi cho các API tiếp theo.', errors: [400, 401, 403, 413, 429] })
  @HttpCode(200)
  async login(@Body() body: unknown, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.login(body, readToken(req));
    setToken(res, this.settings, SESSION_COOKIE, result.token, this.settings.ttlMs);
    clearToken(res, this.settings, OAUTH_COOKIE);
    return { user: result.user };
  }

  @Get('me')
  @ApiContract('Xem tài khoản và nhân vật của phiên hiện tại', { session: true, response: userResponse, errors: [401, 429] })
  @UseGuards(SessionGuard)
  me(@Req() req: AuthenticatedRequest) { return { user: publicUser(req.auth.user) }; }

  @Post('logout')
  @ApiContract('Đăng xuất', { body: object({}), status: 204, headers: sessionHeader, description: 'Gửi JSON {}. Thu hồi phiên và xóa cookie. Không có nội dung phản hồi; cũng thành công khi không còn phiên.', errors: [403, 413, 429] })
  @HttpCode(204)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.auth.logout(readToken(req));
    clearToken(res, this.settings, SESSION_COOKIE);
    clearToken(res, this.settings, OAUTH_COOKIE);
  }

  @Get('google/start')
  @ApiContract('Bắt đầu đăng nhập Google', { status: 302, headers: redirectHeader, description: 'Mở /api/v1/auth/google/start trên thanh địa chỉ trình duyệt. Không dùng Execute: luồng Google cần điều hướng cả trang.', errors: [429, 503] })
  start(@Req() req: Request, @Res() res: Response) {
    const result = this.auth.beginGoogle('LOGIN', readToken(req));
    setToken(res, this.settings, OAUTH_COOKIE, result.browser, 300000);
    res.redirect(302, result.url);
  }

  @Post('google/link')
  @ApiContract('Liên kết Google với tài khoản hiện tại', { session: true, body: linkBody, response: object({ authorizationUrl: { type: 'string', format: 'uri' } }), description: 'Xác nhận mật khẩu rồi mở authorizationUrl trong cùng trình duyệt. Chọn Google có cùng email tài khoản.', errors: [400, 401, 403, 413, 429, 503] })
  @UseGuards(SessionGuard)
  @HttpCode(200)
  async link(@Body() body: unknown, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.auth.beginLink(body, readToken(req));
    setToken(res, this.settings, OAUTH_COOKIE, result.browser, 300000);
    return { authorizationUrl: result.url };
  }

  @Get('google/callback')
  @ApiContract('Nhận kết quả từ Google', { status: 303, headers: redirectHeader, description: 'Google tự gọi với state/code hoặc error. Cần cookie và yêu cầu OAuth đã bắt đầu; không thử độc lập. Chuyển về /?auth=success hoặc mã lỗi; gọi me để xác minh phiên.', errors: [429] })
  @ApiQuery({ name: 'state', required: false, type: String, description: 'State do luồng OAuth tạo.' })
  @ApiQuery({ name: 'code', required: false, type: String, description: 'Authorization code do Google cung cấp.' })
  @ApiQuery({ name: 'error', required: false, type: String, description: 'Lỗi từ Google, ví dụ access_denied.' })
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
