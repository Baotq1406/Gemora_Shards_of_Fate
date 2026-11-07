import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const type = (error as { type?: string })?.type;
    const status = error instanceof HttpException ? error.getStatus() :
      (type === 'entity.too.large' ? 413 : type === 'entity.parse.failed' ? 400 : 500);
    res.setHeader('Cache-Control', 'no-store');
    if (status === 429) res.setHeader('Retry-After', '900');
    res.status(status).json({ statusCode: status, message: error instanceof HttpException ? error.message :
      (status === 413 ? 'Dữ liệu gửi lên quá lớn.' : 'Không thể xử lý yêu cầu. Vui lòng thử lại.') });
  }
}
