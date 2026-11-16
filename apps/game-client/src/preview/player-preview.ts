import {
  bindHomeAnimation,
  homeMotionEnabled,
  setHomeMotion,
} from "./home-animation";
import { companionPets } from "./companion-pets";
import type { PlayerIdentity } from "@gemora/shared-types";
import { errorMessage } from "../api/http";
import "./player-preview.css";
import "./cute-theme.css";
import "./onboarding-frame.css";
import "./home-landmarks.css";
import { showFacility, type FacilityState } from "./home-facilities";
import {
  bindCampaign,
  campaignMarkup,
  type CampaignState,
} from "../campaign/campaign";

type Screen = "create-player" | "home" | "campaign";
type SymbolName =
  | "gem"
  | "moon"
  | "sun"
  | "leaf"
  | "swords"
  | "map"
  | "bag"
  | "heroes"
  | "monster"
  | "pack"
  | "settings"
  | "arrow"
  | "lock"
  | "spark"
  | "sound"
  | "close"
  | "check"
  | "edit";
const paths: Record<SymbolName, string> = {
  edit: '<path d="m15 4 5 5M4 20l5-1L21 7a2 2 0 0 0-5-5L4 14l-1 7Z"/>',
  gem: '<path d="m12 2 8 7-8 13L4 9l8-7Z"/><path d="M4 9h16M12 2 8 9l4 13 4-13-4-7Z"/>',
  moon: '<path d="M20 15.4A8.8 8.8 0 0 1 8.6 4 8.8 8.8 0 1 0 20 15.4Z"/><path d="m17 2 .8 2.2L20 5l-2.2.8L17 8l-.8-2.2L14 5l2.2-.8L17 2Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4.2 4.2l2.1 2.1m11.4 11.4 2.1 2.1m0-15.6-2.1 2.1M6.3 17.7l-2.1 2.1"/>',
  leaf: '<path d="M20 3C8 1 2 7 5 15c3 8 16 4 15-12Z"/><path d="M3 22 16 8M8 17v-6m0 6h7"/>',
  swords:
    '<path d="m4 2 3 1 12 14-2 2L3 7 4 2Zm16 0-3 1-5 6m-3 3-4 5 2 2 5-4M3 15l6 6m6-18 6 6M2 22l4-4m12 0 4 4M15 21l6-6"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16"/>',
  bag: '<path d="M5 7h14l2 14H3L5 7Z"/><path d="M8 8V5a4 4 0 0 1 8 0v3M9 13h6"/>',
  monster:
    '<path d="M5 9 3 3l6 3h6l6-3-2 6v6a7 7 0 0 1-14 0V9Z"/><circle cx="9" cy="12" r="1"/><circle cx="15" cy="12" r="1"/><path d="m9 17 3 2 3-2"/>',
  pack: '<ellipse cx="12" cy="16" rx="6" ry="5"/><ellipse cx="4" cy="9" rx="2" ry="3"/><ellipse cx="9" cy="5" rx="2" ry="3"/><ellipse cx="15" cy="5" rx="2" ry="3"/><ellipse cx="20" cy="9" rx="2" ry="3"/>',
  heroes:
    '<circle cx="12" cy="7" r="3"/><path d="M6 21v-4a6 6 0 0 1 12 0v4M3 18v-3a4 4 0 0 1 3-4m15 7v-3a4 4 0 0 0-3-4"/>',
  settings:
    '<path d="m9 3 6 0 1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1 1-3Z"/><circle cx="12" cy="12" r="3"/>',
  arrow: '<path d="M3 12h17m-6-6 6 6-6 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
  spark:
    '<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Z"/>',
  sound:
    '<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
};
const avatars: {
  key: SymbolName;
  name: string;
  color: string;
  image?: string;
}[] = [
  {
    key: "gem",
    name: "Crystal dragon",
    color: "dragon",
    image: "/art/gemora-baby-dragon.webp",
  },
  {
    key: "moon",
    name: "Moon",
    color: "blue",
  },
  {
    key: "sun",
    name: "Sun",
    color: "gold",
  },
  {
    key: "leaf",
    name: "Leaf",
    color: "green",
  },
  {
    key: "gem",
    name: "Crystal",
    color: "violet",
  },
];
const svg = (name: SymbolName, extra = "") =>
  `<svg class="g-icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );

export interface PlayerUIOptions {
  justCreated?: boolean;
  player: PlayerIdentity | null;
  create: (name: string, avatar: string) => Promise<void>;
  avatar: (key: string) => Promise<PlayerIdentity>;
  account: () => void;
}
const avatarKeys = ["crystal-dragon", "moon", "sun", "leaf", "crystal"];
export function startPlayerPreview(
  initial: Screen,
  live?: PlayerUIOptions,
): () => void {
  const root = document.querySelector<HTMLDivElement>("#app")!;
  document.documentElement.lang = "en";
  document.body.classList.add("gemora-preview");
  let screen = initial;
  let avatarIndex = Math.max(
    0,
    avatarKeys.indexOf(live?.player?.avatarKey || "crystal-dragon"),
  );
  let playerName = live?.player?.playerName || "";
  let disposed = false;
  let busy = false;
  let closeDialog: (() => void) | undefined;
  let hintIndex = 0;
  let disposeCampaign: (() => void) | undefined;
  let disposeHome: (() => void) | undefined;
  const campaignState: CampaignState = { selected: 3, scrollTop: null };

  function change(next: Screen): void {
    closeDialog?.();
    screen = next;
    const url = new URL(location.href);
    if (live) {
      url.pathname = "/" + screen;
      url.search = "";
    } else url.searchParams.set("preview", screen);
    url.searchParams.delete("realm");
    if (next === "campaign" && campaignState.realm) {
      url.searchParams.set("realm", campaignState.realm);
    }
    history.pushState(null, "", url);
    render();
  }

  function restoreScreen(): void {
    const target = live
      ? location.pathname.slice(1)
      : new URLSearchParams(location.search).get("preview");
    if (live && !live.player) return;
    if (
      target === "home" ||
      target === "campaign" ||
      (!live && target === "create-player")
    ) {
      closeDialog?.();
      screen = target;
      render();
    }
  }

  function previewNav(): string {
    if (live) return "";
    return `<div class="g-preview-bar"><span><i></i> UI PREVIEW</span><nav aria-label="Preview screen"><button data-screen="create-player" aria-pressed="${screen === "create-player"}">Create player</button><button data-screen="home" aria-pressed="${screen === "home"}">Home</button></nav><a href="/">Back to sign in ${svg("arrow")}</a></div>`;
  }
  function brand(): string {
    return `<a class="g-brand" href="${live ? "/home" : "?preview=home"}" aria-label="Gemora home">${svg("gem")}<span>GEMORA<small>SHARDS OF FATE</small></span></a>`;
  }
  function portrait(index = avatarIndex): string {
    const avatar = avatars[index];
    return `<span class="g-avatar-circle ${avatar.color}">${avatar.image ? `<img src="${avatar.image}" alt="">` : svg(avatar.key)}</span>`;
  }
  function avatarButton(): string {
    return `<button type="button" class="g-avatar-edit" data-change-avatar aria-label="Change avatar" aria-haspopup="dialog">${portrait()}<span class="g-edit-badge">${svg("edit")}</span></button>`;
  }
  function createScreen(): string {
    return `<main class="g-world g-create g-create-compact">
      <header class="g-top">${brand()}</header>
      <div class="g-onboarding">
        <div class="g-compact-companion"><p class="g-speech-bubble">Welcome to Gemora!</p><img src="/art/gemora-baby-dragon.webp" alt="Baby crystal dragon waving hello"></div>
        <section class="g-create-panel" aria-labelledby="create-title">
          <h1 id="create-title">What’s your name?</h1>
          <div class="g-avatar-center">${avatarButton()}</div>
          <form id="g-create-form" novalidate>
            <div class="g-label-row"><label for="g-player-name">Name</label><button type="button" class="g-text-button" id="g-suggest" aria-label="Suggest a name">${svg("spark")}</button></div>
            <div class="g-name-wrap"><input id="g-player-name" autocomplete="off" maxlength="40" placeholder="Your name" value="${escape(playerName)}" aria-describedby="g-name-hint g-name-error"></div>
            <p class="g-field-hint" id="g-name-hint">3–16 characters</p>
            <p class="g-field-error" id="g-name-error" role="status"></p>
            <button class="g-primary g-play-button" type="submit">Let's play ${svg("arrow")}</button>
          </form>
        </section>
      </div>
      <footer class="g-footer">${live ? '<button class="g-text-button" data-info="Account">Account</button>' : "<span>Preview · Changes aren't saved</span>"}</footer>
    </main>`;
  }

  const facilityState: FacilityState = { pet: 0, item: "blade", filter: "All" };
  function homeScreen(): string {
    const name = playerName || "Moonleaf";
    const landmarks = [
      ["portal", "Adventure PvE", "Adventure", "PvE"],
      ["pets", "Pets", "Pets", ""],
      ["forge", "Forge", "Forge", ""],
      ["arena", "Arena PvP", "Arena", "PvP · Soon"],
    ];
    const companion = (landmark: string): string => {
      const pet = companionPets.find((pet) => pet.home.landmark === landmark);
      if (!pet) return "";
      return `<span class="h-companion-pet h-companion-${pet.id}" data-companion="${pet.id}"><img src="/art/companions/animated/${pet.id}-still-v1.webp" alt="${pet.name}, ${pet.element} dragon companion" draggable="false" width="256" height="256"><span class="h-pet-sprite" aria-hidden="true"></span></span>`;
    };
    return `<main class="g-world g-home h-home"><header class="h-header"><button class="h-profile" data-info="Player profile" aria-label="Player profile: ${escape(name)}">${portrait()}<strong>${escape(name)}</strong></button>${brand()}<div class="h-tools"><button data-info="Preview">Preview</button><button data-info="Settings" aria-label="Settings">${svg("settings")}</button><button data-info="Account" aria-label="Account">${svg("heroes")}</button></div></header>
    <section class="h-scene" aria-label="Gem Island"><h1 class="h-location">Gem Island</h1><div class="h-island"><div class="h-landmarks">${landmarks.map(([id, action, label, sub]) => `<div class="h-landmark-slot h-slot-${id}"><button class="h-landmark h-${id}" data-info="${action}" aria-label="${action}"><svg class="h-hit" viewBox="0 0 100 100" aria-hidden="true"><polygon points="15,35 35,10 65,8 85,30 94,80 75,95 22,95 6,80"/></svg><span class="h-building"><img src="/art/home/${id}-v1.webp" srcset="/art/home/${id}-v1-small.webp 384w, /art/home/${id}-v1.webp 768w" sizes="(max-width:699px) 40vw, (max-width:1099px) 38vw, 28vw" width="768" height="768" alt="" draggable="false">${id === "arena" ? '<img class="h-lock" src="/art/campaign/island-lock-v1.webp" alt="" width="64" height="64">' : ""}<span class="h-sign"><strong>${label}</strong>${sub ? `<small>${sub}</small>` : ""}</span></span></button>${companion(id)}</div>`).join("")}</div></div>
    <button class="h-quest" data-info="First quest" aria-label="First quest">${svg("map")} Quest</button></section>
    <nav class="h-dock" aria-label="Game navigation">${["Team", "Monsters", "Guide"].map((label, i) => `<button data-info="${label}">${svg((["pack", "monster", "map"] as SymbolName[])[i])}<span>${label}</span></button>`).join("")}<button class="h-bag" data-info="Inventory" aria-label="Bag"><img src="/art/home/bag-v1-small.webp" alt="" width="64" height="64"><span>Bag</span></button></nav></main>`;
  }

  function openDialog(
    content: string,
    bind?: (overlay: HTMLDivElement, close: () => void) => void,
  ): void {
    const returnFocus = document.activeElement as HTMLElement;
    const overlay = document.createElement("div");
    overlay.className = "g-dialog-backdrop";
    overlay.innerHTML = `<section class="g-dialog" role="dialog" aria-modal="true" aria-labelledby="g-dialog-title"><button class="g-icon-button g-dialog-close" data-close aria-label="Close">${svg("close")}</button>${content}</section>`;
    document.body.append(overlay);
    root.inert = true;
    closeDialog?.();
    const close = () => {
      closeDialog = undefined;
      root.inert = false;
      overlay.remove();
      document.removeEventListener("keydown", key);
      if (returnFocus.isConnected) returnFocus.focus();
      else
        root
          .querySelector<HTMLButtonElement>(
            screen === "create-player"
              ? "[data-change-avatar]"
              : '[data-info="Player profile"]',
          )
          ?.focus();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const buttons = Array.from(
          overlay.querySelectorAll<HTMLElement>(
            "button:not(:disabled), input:not(:disabled), a[href]",
          ),
        );
        if (e.shiftKey && document.activeElement === buttons[0]) {
          e.preventDefault();
          buttons[buttons.length - 1]?.focus();
        } else if (
          !e.shiftKey &&
          document.activeElement === buttons[buttons.length - 1]
        ) {
          e.preventDefault();
          buttons[0].focus();
        }
      }
    };
    overlay
      .querySelectorAll("[data-close]")
      .forEach((b) => b.addEventListener("click", close));
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeDialog = close;
    document.addEventListener("keydown", key);
    bind?.(overlay, close);
    overlay.querySelector<HTMLButtonElement>("button")?.focus();
  }

  function showAvatarPicker(): void {
    openDialog(
      `<h2 id="g-dialog-title">Choose an avatar</h2><div class="g-avatar-picker" role="group" aria-label="Avatars">${avatars.map((avatar, index) => `<button class="g-avatar-choice" data-avatar="${index}" aria-pressed="${index === avatarIndex}" aria-label="${avatar.name}">${portrait(index)}<span>${avatar.name}</span>${index === avatarIndex ? `<i>${svg("check")}</i>` : ""}</button>`).join("")}</div><button class="g-text-button" data-close>Keep current avatar</button>`,
      (overlay, close) => {
        overlay
          .querySelectorAll<HTMLButtonElement>("[data-avatar]")
          .forEach((button) =>
            button.addEventListener("click", async () => {
              if (busy) return;
              const next = Number(button.dataset.avatar);
              if (live && screen === "home") {
                busy = true;
                overlay
                  .querySelectorAll<HTMLButtonElement>("button")
                  .forEach((b) => (b.disabled = true));
                try {
                  const player = await live.avatar(avatarKeys[next]);
                  if (disposed) return;
                  avatarIndex = Math.max(
                    0,
                    avatarKeys.indexOf(player.avatarKey),
                  );
                } catch (error) {
                  if (disposed) return;
                  close();
                  openDialog(
                    `<h2 id="g-dialog-title">Unable to save avatar</h2><p>${escape(errorMessage(error))}</p>`,
                  );
                  return;
                } finally {
                  busy = false;
                }
              } else avatarIndex = next;
              render();
              close();
            }),
          );
      },
    );
  }

  function showInfo(title: string): void {
    if (title === "Home") return;
    if (title === "Settings") {
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      openDialog(
        `<h2 id="g-dialog-title">Settings</h2><label class="h-motion-setting"><span>Creature animations<small>${reduced ? "Reduced motion is enabled on your device." : "Bring your island companions to life."}</small></span><input type="checkbox" data-home-motion ${homeMotionEnabled() ? "checked" : ""} ${reduced ? "disabled" : ""}></label><button class="g-text-button" data-settings-account>Account</button><button class="g-text-button" data-settings-preview>About this preview</button>`,
        (overlay, close) => {
          overlay
            .querySelector<HTMLInputElement>("[data-home-motion]")
            ?.addEventListener("change", (event) =>
              setHomeMotion((event.target as HTMLInputElement).checked),
            );
          overlay
            .querySelector("[data-settings-account]")
            ?.addEventListener("click", () => {
              close();
              showInfo("Account");
            });
          overlay
            .querySelector("[data-settings-preview]")
            ?.addEventListener("click", () => {
              close();
              showInfo("Preview");
            });
        },
      );
      return;
    }
    if (title === "Team" || title === "Monsters") {
      openDialog(
        `<span class="g-dialog-emblem">${svg(title === "Team" ? "pack" : "monster")}</span><h2 id="g-dialog-title">${title}</h2><p>${title === "Team" ? "Build your monster team. Team formation is coming soon." : "Your monster collection is coming soon. Visit Pets to preview monster upgrades."}</p>`,
      );
      return;
    }
    if (["Pets", "Forge", "Inventory"].includes(title)) {
      showFacility(
        title === "Inventory" ? "Bag" : (title as "Pets" | "Forge"),
        openDialog,
        facilityState,
      );
      return;
    }
    if (title === "Preview" || title === "First quest") {
      openDialog(
        `<h2 id="g-dialog-title">${title === "Preview" ? "Preview" : "First light"}</h2><p>${title === "Preview" ? "Progress, pets and items are samples. Battles and upgrades are coming soon." : "Sample quest · Explore Whispering Woods. Quest tracking and rewards are coming soon."}</p>`,
      );
      return;
    }
    if (title === "Adventure PvE") {
      change("campaign");
      return;
    }
    if (live && title === "Account") {
      live.account();
      return;
    }
    if (title === "Player profile") {
      openDialog(
        `<h2 id="g-dialog-title">Profile</h2><div class="g-profile-avatar">${portrait()}</div><p>${escape(playerName || "Moonleaf")}</p><button class="g-primary" data-profile-avatar>Change avatar ${svg("edit")}</button>`,
        (overlay, close) => {
          overlay
            .querySelector("[data-profile-avatar]")
            ?.addEventListener("click", () => {
              close();
              showAvatarPicker();
            });
        },
      );
      return;
    }
    openDialog(
      `<span class="g-dialog-emblem">${svg(title.includes("PvP") ? "swords" : "gem")}</span><p class="g-mini-label">${live ? "GEMORA" : "GEMORA · PREVIEW"}</p><h2 id="g-dialog-title">${escape(title)}</h2><p>${title.includes("PvP") ? "PvP is coming soon." : "Coming soon. Explore the UI while we build this feature."}</p><button class="g-primary g-dialog-confirm" data-close>Got it ${svg("arrow")}</button>`,
    );
  }

  function render(): void {
    disposeHome?.();
    disposeHome = undefined;
    disposeCampaign?.();
    disposeCampaign = undefined;
    root.innerHTML =
      (screen === "create-player" ? previewNav() : "") +
      (screen === "create-player"
        ? createScreen()
        : screen === "campaign"
          ? campaignMarkup()
          : homeScreen());
    if (screen === "home") disposeHome = bindHomeAnimation(root);
    if (screen === "campaign") {
      disposeCampaign = bindCampaign(root, campaignState, () => change("home"));
    }
    if (live) {
      root
        .querySelectorAll(".g-currency, .g-level, .g-objective")
        .forEach((el) => el.remove());
      root.querySelectorAll(".g-footer span").forEach((el) => {
        if (el.textContent?.includes("Preview")) el.remove();
      });
      const action = root.querySelector(".g-mode-action");
      if (action) action.textContent = "Open map";
      const tag = root.querySelector(".g-mode-tag");
      if (tag) tag.textContent = "MAP PREVIEW";
    }
    root
      .querySelectorAll<HTMLButtonElement>("[data-screen]")
      .forEach((b) =>
        b.addEventListener("click", () => change(b.dataset.screen as Screen)),
      );
    root
      .querySelectorAll<HTMLButtonElement>("[data-info]")
      .forEach((b) =>
        b.addEventListener("click", () => showInfo(b.dataset.info!)),
      );
    root
      .querySelector("[data-change-avatar]")
      ?.addEventListener("click", showAvatarPicker);
    const input = root.querySelector<HTMLInputElement>("#g-player-name");
    input?.addEventListener("input", () => {
      playerName = input.value;
      root.querySelector("#g-name-error")!.textContent = "";
      input.removeAttribute("aria-invalid");
    });
    root.querySelector("#g-suggest")?.addEventListener("click", () => {
      const names = ["Moonleaf", "Starling", "Dewdrop", "Skylark"];
      playerName = names[hintIndex++ % names.length];
      input!.value = playerName;
      input!.dispatchEvent(new Event("input"));
      input!.focus();
    });
    root
      .querySelector("#g-create-form")
      ?.addEventListener("submit", async (e) => {
        e.preventDefault();
        if (busy) return;
        const name = playerName.normalize("NFC").trim().replace(/\s+/g, " ");
        if (
          [...name].length < 3 ||
          [...name].length > 16 ||
          !/^[\p{L}\p{N}][\p{L}\p{M}\p{N}_ ]*$/u.test(name)
        ) {
          root.querySelector("#g-name-error")!.textContent =
            "Use 3–16 characters: letters, numbers, spaces or underscores.";
          input!.setAttribute("aria-invalid", "true");
          input!.focus();
          return;
        }
        playerName = name;
        if (live) {
          busy = true;
          const form = root.querySelector<HTMLFormElement>("#g-create-form")!;
          form.setAttribute("aria-busy", "true");
          root
            .querySelectorAll<HTMLInputElement | HTMLButtonElement>(
              "input,button",
            )
            .forEach((el) => (el.disabled = true));
          const button =
            form.querySelector<HTMLButtonElement>("[type=submit]")!;
          button.textContent = "Creating…";
          try {
            await live.create(name, avatarKeys[avatarIndex]);
          } catch (error) {
            if (!disposed) {
              render();
              root.querySelector("#g-name-error")!.textContent =
                errorMessage(error);
              root.querySelector<HTMLInputElement>("#g-player-name")?.focus();
            }
          } finally {
            busy = false;
          }
          return;
        }
        change("home");
      });
  }
  document.body.classList.toggle("gemora-live", !!live);
  window.addEventListener("popstate", restoreScreen);
  render();
  return () => {
    disposed = true;
    disposeHome?.();
    disposeCampaign?.();
    window.removeEventListener("popstate", restoreScreen);
    closeDialog?.();
    root.inert = false;
    document.body.classList.remove("gemora-preview", "gemora-live");
  };
}
