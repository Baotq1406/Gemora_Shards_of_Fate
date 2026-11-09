import type { AuthUser } from "@gemora/shared-types";
import { auth } from "../api/auth";
import { ApiError, errorMessage } from "../api/http";

export type Session =
  | { status: "checking" | "guest"; user: null; message: string }
  | { status: "authenticated"; user: AuthUser; message: string }
  | { status: "error"; user: null; message: string };

export async function readSession(): Promise<Session> {
  try {
    const { user } = await auth.me();
    return { status: "authenticated", user, message: "" };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401)
      return { status: "guest", user: null, message: "" };
    return { status: "error", user: null, message: errorMessage(error) };
  }
}
