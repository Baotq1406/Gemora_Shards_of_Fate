import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCookieAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { SchemaObject } from '@nestjs/swagger';

const string = (extra: Partial<SchemaObject> = {}): SchemaObject => ({ type: 'string', ...extra });
export const object = (properties: Record<string, SchemaObject>, required = Object.keys(properties)): SchemaObject => ({ type: 'object', properties, required, additionalProperties: false });
const uuid = string({ format: 'uuid' });
export const avatarKey = string({ enum: ['crystal-dragon', 'moon', 'sun', 'leaf', 'crystal'], example: 'crystal-dragon' });
export const playerSchema = object({ id: uuid, playerName: string({ example: 'Anh Sao' }), avatarKey, onboardingCompletedAt: string({ format: 'date-time' }) });
const methods = object({ password: { type: 'boolean' }, google: { type: 'boolean' } });
export const userSchema = object({
  id: uuid, email: string({ format: 'email' }), role: string({ enum: ['PLAYER', 'ADMIN'] }),
  profile: { ...object({ id: uuid, displayName: string() }), nullable: true },
  player: { ...playerSchema, nullable: true }, onboardingState: string({ enum: ['READY', 'NEEDS_PROFILE'] }), authMethods: methods,
});
export const userResponse = object({ user: userSchema });
export const providersResponse = methods;
const email = string({ example: 'swagger-player@example.test', description: 'Được trim và chuyển chữ thường; tối đa 300 ký tự đầu vào, 254 sau chuẩn hóa.' });
const password = string({ minLength: 1, maxLength: 128, format: 'password', example: 'Gemora test password 2026!' });
export const loginBody = object({ email, password });
export const registerBody = object({ email, password: { ...password, minLength: 15 }, displayName: string({ description: 'Tên hiển thị tài khoản cũ, không phải tên nhân vật. Mặc định Adventurer; 2–50 ký tự sau trim.', example: 'Adventurer' }) }, ['email', 'password']);
export const linkBody = object({ password });
export const onboardingBody = object({
  playerName: string({ maxLength: 128, example: 'Anh Sao', description: 'Chuẩn hóa NFC, trim và gộp khoảng trắng. Sau chuẩn hóa: 3–16 ký tự, bắt đầu bằng chữ/số, cho phép chữ, số, dấu kết hợp, khoảng trắng và _. Không dùng tên dành riêng. Tên duy nhất không phân biệt hoa/thường, có phân biệt dấu.' }),
  avatarKey: { ...avatarKey, default: 'crystal-dragon' },
}, ['playerName']);
export const homeResponse = object({ player: playerSchema, features: object(Object.fromEntries(['adventure', 'arena', 'team', 'heroes', 'inventory'].map(key => [key, string({ enum: ['coming_soon'] })]))) });
const errorSchema = object({ statusCode: { type: 'integer' }, message: string(), code: string({ description: 'Chỉ có ở một số lỗi nghiệp vụ.' }) }, ['statusCode', 'message']);
const errors: Record<number, string> = {
  400: 'Dữ liệu không hợp lệ.', 401: 'Chưa đăng nhập, phiên hết hạn hoặc thông tin xác thực không đúng.',
  403: 'Origin không khớp APP_ORIGIN, thiếu Content-Type application/json hoặc chưa tạo nhân vật (PROFILE_REQUIRED).',
  409: 'Email/tên đã được sử dụng hoặc nhân vật đã được tạo.', 413: 'Payload vượt 16 KB.',
  429: 'Vượt giới hạn gọi API; xem Retry-After.', 500: 'Lỗi xử lý nội bộ.', 503: 'Dịch vụ chưa sẵn sàng.',
};

// Explicit schemas also work in tsx development, without a compiler plugin.
export function ApiContract(summary: string, options: {
  description?: string; body?: SchemaObject; response?: SchemaObject; status?: number;
  session?: boolean; errors?: number[]; headers?: Record<string, { description: string; schema: SchemaObject }>;
} = {}) {
  return applyDecorators(
    ApiOperation({ summary, description: options.description }),
    ApiResponse({ status: options.status ?? 200, description: 'Thành công.', ...(options.response ? { schema: options.response } : {}), ...(options.headers ? { headers: options.headers } : {}) }),
    ...(options.body ? [ApiBody({ required: true, schema: options.body })] : []),
    ...(options.session ? [ApiCookieAuth('session')] : []),
    ...[...new Set([...(options.errors ?? []), 500])].map(status => ApiResponse({ status, description: errors[status], schema: errorSchema })),
  );
}

export const sessionHeader = { 'Set-Cookie': { description: 'Cookie phiên HttpOnly do trình duyệt quản lý.', schema: string() } };
export const redirectHeader = { Location: { description: 'Địa chỉ chuyển hướng của trình duyệt.', schema: string({ format: 'uri' }) } };
