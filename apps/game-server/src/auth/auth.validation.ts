import { BadRequestException } from "@nestjs/common";

export function objectInput(value: unknown, fields: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      Object.keys(value).some(key => !fields.includes(key))) {
    throw new BadRequestException("Invalid request payload.");
  }
  return value as Record<string, unknown>;
}
export function emailInput(value: unknown): string {
  if (typeof value !== 'string' || value.length > 300) throw new BadRequestException("Invalid email address.");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || /[\u0000-\u001f\u007f]/.test(email) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new BadRequestException("Invalid email address.");
  }
  return email;
}
export function passwordInput(value: unknown, registration = false): string {
  if (typeof value !== 'string' || [...value].length < (registration ? 15 : 1) || [...value].length > 128) {
    throw new BadRequestException(registration ? "Password must be between 15 and 128 characters." : "Invalid password.");
  }
  return value;
}
export function displayNameInput(value: unknown): string {
  if (typeof value !== 'string') throw new BadRequestException("Invalid display name.");
  const name = value.trim();
  if ([...name].length < 2 || [...name].length > 50 || /[\u0000-\u001f\u007f]/.test(name)) {
    throw new BadRequestException("Display name must be between 2 and 50 characters.");
  }
  return name;
}
