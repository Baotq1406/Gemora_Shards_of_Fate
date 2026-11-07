import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import type { Request } from "express";
import { AuthService, type AuthenticatedSession } from "./auth.service.js";
import { readToken } from "./auth.security.js";

export interface AuthenticatedRequest extends Request { auth: AuthenticatedSession }
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    req.auth = await this.auth.current(readToken(req));
    return true;
  }
}
