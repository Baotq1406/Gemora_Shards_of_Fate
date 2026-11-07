import { BadRequestException } from "@nestjs/common";

export function objectInput(value: unknown, fields: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !fields.includes(key))) {
    throw new BadRequestException("Dữ liệu gửi lên không hợp lệ.");
  }
  return value as Record<string, unknown>;
}
export function emailInput(value: unknown): string {
  if (typeof value !== 'string' || value.length > 300) throw new BadRequestException("Email không hợp lệ.");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || /[\u0000-\u001f\u007f]/.test(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequestException("Email không hợp lệ.");
  }
  return email;
}
export function passwordInput(value: unknown, registration = false): string {
  if (typeof value !== 'string' || [...value].length < (registration ? 15 : 1) || [...value].length > 128) {
    throw new BadRequestException(registration ? "Mật khẩu cần từ 15 đến 128 ký tự." : "Mật khẩu không hợp lệ.");
  }
  return value;
}
export function displayNameInput(value: unknown): string {
  if (typeof value !== 'string') throw new BadRequestException("Tên hiển thị không hợp lệ.");
  const name = value.trim();
  if ([...name].length < 2 || [...name].length > 50 || /[\u0000-\u001f\u007f]/.test(name)) {
    throw new BadRequestException("Tên hiển thị cần từ 2 đến 50 ký tự.");
  }
  return name;
}
