import type { AuthResponse, PlayerIdentity } from "@gemora/shared-types";
import { request } from "./http";
export const players = {
  create: (playerName: string, avatarKey: string) =>
    request<AuthResponse>("/players/me/onboarding", { playerName, avatarKey }),
  home: () => request<{ player: PlayerIdentity }>("/players/me/home"),
  avatar: (avatarKey: string) =>
    request<{ player: PlayerIdentity }>("/players/me/avatar", { avatarKey }),
};
