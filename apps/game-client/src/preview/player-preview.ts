import type { PlayerIdentity } from "@gemora/shared-types";
import { errorMessage } from "../api/http";
import "./player-preview.css";
import "./cute-theme.css";
import "./onboarding-frame.css";

type Screen = "create-player" | "home";
type SymbolName =
  | "gem"
  | "moon"
  | "sun"
  | "leaf"
  | "swords"
  | "map"
  | "bag"
  | "heroes"
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
    image: "/art/gemora-baby-dragon.png",
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
  let completed = live?.justCreated || false;
  let hintIndex = 0;

  function change(next: Screen): void {
    screen = next;
    const url = new URL(location.href);
    if (live) {
      url.pathname = "/" + screen;
      url.search = "";
    } else url.searchParams.set("preview", screen);
    history.replaceState(null, "", url);
    render();
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
        <div class="g-compact-companion"><p class="g-speech-bubble">Welcome to Gemora!</p><img src="/art/gemora-baby-dragon.png" alt="Baby crystal dragon waving hello"></div>
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

  function homeScreen(): string {
    const name = playerName || "Moonleaf";
    return `<main class="g-world g-home">
      <header class="g-top">${brand()}<div class="g-home-location">${svg("spark")} GEM ISLAND <span>SAFE ZONE</span></div><div class="g-top-actions"><div class="g-currency"><span>G</span><strong>1,250</strong><small>GOLD</small></div><button class="g-icon-button" data-info="Settings" aria-label="Settings">${svg("settings")}</button><button class="g-icon-button" data-info="Account" aria-label="Account">${svg("heroes")}</button></div></header>
      <div class="g-lobby-body">
        <aside class="g-lobby-left">
          <button class="g-player-card" data-info="Player profile">${portrait()}<span><strong>${escape(name)}</strong><small>New adventurer</small><span class="g-level"><b>Lv. 01</b><i><em></em></i><small>0 / 100</small></span></span></button>
          <section class="g-objective"><div class="g-mini-label">${svg("map")} YOUR JOURNEY</div><h2>First light</h2><p>Find the lost shard in Whispering Woods.</p><div><span class="g-objective-dot"></span> Clear stage 1–1 <span>0/1</span></div><button class="g-text-button" data-info="First quest">View quest ${svg("arrow")}</button></section>
          <div class="g-tip">${svg("spark")}<p>Match gems to power up your team.</p></div>
        </aside>
        <section class="g-lobby-center" aria-label="Gem Island"><div class="g-sanctuary-label"><span>YOUR ADVENTURE STARTS HERE</span><h1>Gem Island</h1><p>A little home for big adventures.</p></div><button class="g-world-point" data-info="Crystal shrine" aria-label="Explore the shrine">${svg("gem")}<span>SHRINE</span></button><div class="g-lobby-companion"><p class="g-speech-bubble">${completed ? `Welcome, ${escape(name)}!` : `Welcome back, ${escape(name)}!`}</p><img class="g-lobby-mascot" src="/art/gemora-baby-dragon.png" alt="Baby crystal dragon companion"></div></section>
        <aside class="g-play-modes" aria-label="Game modes">
          <div class="g-mode-heading"><span>CHOOSE YOUR ADVENTURE</span><i></i> 01 / 02</div>
          <button class="g-mode g-pve" data-info="Adventure PvE"><div class="g-mode-top"><span>CAMPAIGN</span><span class="g-mode-tag">CHAPTER I</span></div><div class="g-mode-emblem">${svg("map")}</div><div class="g-mode-copy"><span>EXPLORE THE WORLD</span><h2>Adventure <small>PvE</small></h2><p>New lands. New friends.</p></div><div class="g-mode-action">Start adventure ${svg("arrow")}</div></button>
          <button class="g-mode g-pvp" data-info="Arena PvP"><div class="g-mode-top"><span>ARENA</span><span class="g-locked">${svg("lock")} COMING SOON</span></div><div class="g-pvp-main"><div class="g-mode-emblem">${svg("swords")}</div><div><h2>Arena <small>PvP</small></h2><p>Challenge other adventurers.</p></div></div></button>
          <p class="g-mode-note">${svg("spark")} Your team. Your adventure.</p>
        </aside>
      </div>
      <nav class="g-bottom-nav" aria-label="Game navigation"><button class="active" data-info="Home">${svg("gem")}<span>Home</span></button><button data-info="Team">${svg("heroes")}<span>Team</span></button><button data-info="Heroes">${svg("sun")}<span>Heroes</span></button><button data-info="Inventory">${svg("bag")}<span>Inventory</span></button><span class="g-nav-divider"></span><button data-info="Guide">${svg("map")}<span>Guide</span></button></nav>
      <footer class="g-footer"><span>GEMORA <b>✦</b> SHARDS OF FATE</span><span>Preview · Sample player data</span></footer>
    </main>`;
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
          overlay.querySelectorAll<HTMLButtonElement>("button"),
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
    root.innerHTML =
      previewNav() +
      (screen === "create-player" ? createScreen() : homeScreen());
    if (live) {
      root
        .querySelectorAll(".g-currency, .g-level, .g-objective")
        .forEach((el) => el.remove());
      root.querySelectorAll(".g-footer span").forEach((el) => {
        if (el.textContent?.includes("Preview")) el.remove();
      });
      const action = root.querySelector(".g-mode-action");
      if (action) action.textContent = "Coming soon";
      const tag = root.querySelector(".g-mode-tag");
      if (tag) tag.textContent = "COMING SOON";
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
        completed = true;
        change("home");
      });
  }
  document.body.classList.toggle("gemora-live", !!live);
  render();
  return () => {
    disposed = true;
    closeDialog?.();
    root.inert = false;
    document.body.classList.remove("gemora-preview", "gemora-live");
  };
}
