import { startPlayerPreview } from "./preview/player-preview";
import { players } from "./api/players";
import type { AuthProvidersResponse } from "@gemora/shared-types";
import { auth } from "./api/auth";
import { ApiError, errorMessage } from "./api/http";
import { readSession, type Session } from "./auth/session";

type AuthMode = "login" | "register";
type FieldName = "displayName" | "email" | "password" | "confirmPassword";

interface AuthValues {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface AuthState {
  mode: AuthMode;
  values: AuthValues;
  errors: Partial<Record<FieldName, string>>;
  isSubmitting: boolean;
  passwordVisible: boolean;
  message: string;
}

const app = document.querySelector<HTMLDivElement>("#app") as HTMLDivElement;
if (!app) throw new Error("Could not find #app to initialize the interface.");

let playButton: HTMLButtonElement | null = null;
let modalRoot: HTMLDivElement | null = null;
let session: Session = { status: "checking", user: null, message: "" };
let providers: AuthProvidersResponse | null = null;
let providerError = false;
let notice = "";
let mutationPending = false;
let modalVersion = 0;
let sessionVersion = 0;
let refreshPending = false;
let linking = false;
let accountOpen = false;
let gamePlayerKey = "";

const state: AuthState = {
  mode: "login",
  values: { displayName: "", email: "", password: "", confirmPassword: "" },
  errors: {},
  isSubmitting: false,
  passwordVisible: false,
  message: "",
};

let gameDispose: (() => void) | undefined;
let gameUser = "";
let gameReady = false;
let uncertainCreate = false;
function gameNotice(message: string, retry: () => void): void {
  app.querySelector(".g-connection-notice")?.remove();
  const box = document.createElement("div");
  box.className = "g-connection-notice";
  box.setAttribute("role", "status");
  const text = document.createElement("span");
  text.textContent = message;
  const button = document.createElement("button");
  button.textContent = "Retry";
  button.addEventListener("click", retry);
  box.append(text, button);
  app.prepend(box);
}
async function loadHome(): Promise<void> {
  if (
    session.status !== "authenticated" ||
    session.user.onboardingState !== "READY"
  )
    return;
  const id = session.user.id,
    version = sessionVersion;
  try {
    const { player } = await players.home();
    if (version !== sessionVersion || session.user?.id !== id) return;
    session.user.player = player;
    app.querySelector(".g-connection-notice")?.remove();
    renderLanding();
  } catch (error) {
    if (version !== sessionVersion || session.user?.id !== id) return;
    if (
      error instanceof ApiError &&
      (error.status === 401 || error.code === "PROFILE_REQUIRED")
    ) {
      await refreshSession();
      return;
    }
    gameNotice(errorMessage(error), () => void loadHome());
  }
}
function renderLanding(): void {
  if (session.status === "checking") {
    app.innerHTML =
      '<main class="landing"><p role="status">Checking your session…</p></main>';
    return;
  }
  if (session.status === "authenticated") {
    const user = session.user;
    const ready = user.onboardingState === "READY";
    const playerKey = JSON.stringify(user.player);
    if (
      gameDispose &&
      gameUser === user.id &&
      gameReady === ready &&
      gamePlayerKey === playerKey
    )
      return;
    const justCreated = gameUser === user.id && !gameReady && ready;
    gameDispose?.();
    gameUser = user.id;
    gameReady = ready;
    gamePlayerKey = playerKey;
    uncertainCreate = false;
    history.replaceState(null, "", ready ? "/home" : "/create-player");
    gameDispose = startPlayerPreview(ready ? "home" : "create-player", {
      player: user.player,
      justCreated,
      account: openAccount,
      create: async (name, avatar) => {
        if (mutationPending) return;
        mutationPending = true;
        const version = ++sessionVersion;
        try {
          if (uncertainCreate) {
            const restored = await auth.me();
            if (restored.user.id !== user.id)
              throw new ApiError(
                401,
                "Your account changed. Please sign in again.",
              );
            if (restored.user.onboardingState === "READY") {
              session = {
                status: "authenticated",
                user: restored.user,
                message: "",
              };
              renderLanding();
              return;
            }
            uncertainCreate = false;
          }
          const result = await players.create(name, avatar);
          if (version !== sessionVersion) return;
          session = { status: "authenticated", user: result.user, message: "" };
          renderLanding();
        } catch (error) {
          if (version !== sessionVersion) return;
          if (error instanceof ApiError && error.status === 401) {
            session = { status: "guest", user: null, message: "" };
            renderLanding();
            return;
          }
          if (
            error instanceof ApiError &&
            (error.status === 0 ||
              error.status >= 500 ||
              error.code === "PROFILE_ALREADY_COMPLETED")
          ) {
            uncertainCreate = true;
            try {
              const result = await auth.me();
              if (version !== sessionVersion) return;
              if (result.user.id !== user.id) {
                session = {
                  status: "authenticated",
                  user: result.user,
                  message: "",
                };
                renderLanding();
                return;
              }
              if (result.user.onboardingState === "READY") {
                session = {
                  status: "authenticated",
                  user: result.user,
                  message: "",
                };
                renderLanding();
                return;
              }
              uncertainCreate = false;
            } catch {
              /* Keep reconciliation required before another write. */
            }
          }
          throw error;
        } finally {
          mutationPending = false;
        }
      },
      avatar: async (key) => {
        const version = ++sessionVersion;
        mutationPending = true;
        try {
          let player;
          try {
            player = (await players.avatar(key)).player;
          } catch (error) {
            if (
              error instanceof ApiError &&
              (error.status === 0 || error.status >= 500)
            )
              player = (await players.home()).player;
            else throw error;
          }
          if (version !== sessionVersion || session.user?.id !== user.id)
            throw new Error("Session changed.");
          session.user.player = player;
          return player;
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            session = { status: "guest", user: null, message: "" };
            renderLanding();
          }
          throw error;
        } finally {
          mutationPending = false;
        }
      },
    });
    if (ready) void loadHome();
    return;
  }
  gameDispose?.();
  gameDispose = undefined;
  gameUser = "";
  if (location.pathname !== "/") history.replaceState(null, "", "/");
  app.innerHTML = `
    <main class="landing" aria-labelledby="game-title">
      <div class="landing-companion" aria-hidden="true"><img src="/art/gemora-baby-dragon.png" alt="" width="320" height="320" /></div>
      <section class="landing-content">
        <h1 class="game-title" id="game-title">GEMORA</h1>
        <p class="game-subtitle">Shards of Fate</p>
        <button class="play-button" id="play-now" type="button">Play Now</button>
        <p class="landing-note" id="account-status" aria-live="polite"></p>
        <div class="account-actions"></div>
        <p class="landing-note" id="account-notice" role="status"></p>
      </section>
    </main>`;

  playButton = document.querySelector<HTMLButtonElement>("#play-now");
  bindLanding();
}

function resetSensitiveState(): void {
  state.values.password = "";
  state.values.confirmPassword = "";
  state.errors = {};
  state.isSubmitting = false;
  state.passwordVisible = false;
  state.message = "";
}

function openAuthModal(link = false): void {
  if (mutationPending) return;
  linking = link;
  modalVersion++;
  state.mode = "login";
  resetSensitiveState();
  document.body.classList.add("modal-open");
  renderAuthModal();
}

function closeAuthModal(): void {
  accountOpen = false;
  app.inert = false;
  modalVersion++;
  resetSensitiveState();
  modalRoot?.remove();
  modalRoot = null;
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleModalKeydown);
  if (gameDispose)
    app.querySelector<HTMLButtonElement>('[data-info="Account"]')?.focus();
  else playButton?.focus();
}

function switchMode(mode: AuthMode): void {
  if (mutationPending || state.mode === mode) return;
  modalVersion++;
  state.mode = mode;
  state.values.password = "";
  state.values.confirmPassword = "";
  state.errors = {};
  state.passwordVisible = false;
  state.message = "";
  renderAuthModal();
}

function fieldTemplate(
  name: FieldName,
  label: string,
  type: string,
  autocomplete: string,
  placeholder: string,
): string {
  const error = state.errors[name] ?? "";
  const value = escapeAttribute(state.values[name]);
  const passwordField = type === "password";
  const actualType = passwordField && state.passwordVisible ? "text" : type;
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <div class="${passwordField ? "password-wrap" : ""}">
        <input id="${name}" name="${name}" type="${actualType}" value="${value}"
          autocomplete="${autocomplete}" placeholder="${placeholder}"
          aria-invalid="${Boolean(error)}" aria-describedby="${name}-error" />
        ${
          passwordField
            ? `<button class="toggle-password" type="button" data-toggle-password aria-label="${state.passwordVisible ? "Hide password" : "Show password"}">${state.passwordVisible ? "Hide" : "Show"}</button>`
            : ""
        }
      </div>
      <p class="field-error" id="${name}-error">${error}</p>
    </div>`;
}

function renderAuthModal(): void {
  accountOpen = false;
  app.inert = true;
  const previousActiveId = document.activeElement?.id;
  modalRoot?.remove();
  document.removeEventListener("keydown", handleModalKeydown);
  modalRoot = document.createElement("div");
  modalRoot.className = "modal-backdrop";
  modalRoot.innerHTML = `
    <section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" aria-describedby="auth-description">
      <header class="modal-header">
        <p class="modal-eyebrow">Gemora · Shards of Fate</p>
        <h2 class="modal-title" id="auth-title">Welcome to Gemora</h2>
        <p class="sr-only" id="auth-description">Sign in or create an account to continue.</p>
      </header>
      <button class="close-button" type="button" aria-label="Close sign-in dialog">×</button>
      <div class="auth-layout">${linking ? linkTemplate() : authContentTemplate()}</div>
    </section>`;
  document.body.append(modalRoot);
  bindModalEvents();
  document.addEventListener("keydown", handleModalKeydown);

  const focus = previousActiveId
    ? document.getElementById(previousActiveId)
    : null;
  if (focus && modalRoot.contains(focus)) focus.focus();
  else modalRoot.querySelector<HTMLElement>(".close-button")?.focus();
  modalRoot
    .querySelectorAll<HTMLInputElement | HTMLButtonElement>(
      "input, [data-mode], [data-toggle-password]",
    )
    .forEach((element) => {
      element.disabled = mutationPending;
    });
}

function authContentTemplate(): string {
  const isLogin = state.mode === "login";
  const formTitle = isLogin ? "Sign in" : "Create account";
  return `
    <div class="auth-main">
      <div class="tabs" role="tablist" aria-label="Choose an authentication method">
        <button class="tab-button" id="login-tab" type="button" role="tab" aria-selected="${isLogin}" data-mode="login">Sign in</button>
        <button class="tab-button" id="register-tab" type="button" role="tab" aria-selected="${!isLogin}" data-mode="register">Sign up</button>
      </div>
      <form class="auth-form" novalidate>
        ${fieldTemplate("email", "Email", "email", "email", "you@example.com")}
        ${fieldTemplate("password", "Password", "password", isLogin ? "current-password" : "new-password", "Enter your password")}
        ${!isLogin ? fieldTemplate("confirmPassword", "Confirm password", "password", "new-password", "Re-enter your password") : ""}
        <button class="submit-button" type="submit" ${state.isSubmitting ? "disabled" : ""}>
          ${state.isSubmitting ? "Processing…" : formTitle}
        </button>
      </form>
    </div>
    <aside class="auth-social" aria-label="Sign in with another service">
      <p class="social-title">A faster way to continue</p>
      <p class="social-copy">${providers?.google ? "Continue with your Google account." : providerError ? "Unable to check Google availability." : "Google sign-in is not configured on this server."}</p>
      <button class="google-button" type="button" ${!providers?.google || mutationPending ? "disabled" : ""}><span class="google-icon" aria-hidden="true">G</span>Continue with Google</button>
      <p class="status-message" aria-live="polite" ${state.message ? "" : "hidden"}>${escapeAttribute(state.message)}</p>
      ${providerError ? '<button type="button" class="secondary-button" data-retry-providers>Retry Google availability</button>' : ""}
    </aside>`;
}

function bindModalEvents(): void {
  if (!modalRoot) return;
  modalRoot
    .querySelector<HTMLButtonElement>(".close-button")
    ?.addEventListener("click", closeAuthModal);
  modalRoot
    .querySelector<HTMLButtonElement>("[data-return-landing]")
    ?.addEventListener("click", closeAuthModal);
  modalRoot
    .querySelectorAll<HTMLButtonElement>("[data-mode]")
    .forEach((button) => {
      button.addEventListener("click", () =>
        switchMode(button.dataset.mode as AuthMode),
      );
    });
  modalRoot.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
    input.addEventListener("input", () => {
      const name = input.name as FieldName;
      state.values[name] = input.value;
      delete state.errors[name];
      input.setAttribute("aria-invalid", "false");
      const error = modalRoot?.querySelector<HTMLElement>(`#${name}-error`);
      if (error) error.textContent = "";
    });
  });
  modalRoot
    .querySelectorAll<HTMLButtonElement>("[data-toggle-password]")
    .forEach((button) =>
      button.addEventListener("click", () => {
        state.passwordVisible = !state.passwordVisible;
        renderAuthModal();
      }),
    );
  modalRoot
    .querySelector<HTMLButtonElement>(".google-button")
    ?.addEventListener("click", () => {
      if (providers?.google && !mutationPending)
        window.location.assign("/api/v1/auth/google/start");
    });
  modalRoot
    .querySelector("[data-retry-providers]")
    ?.addEventListener("click", () => void loadProviders());
  modalRoot
    .querySelector<HTMLFormElement>(".link-form")
    ?.addEventListener("submit", handleLink);
  modalRoot
    .querySelector<HTMLFormElement>(".auth-form")
    ?.addEventListener("submit", handleSubmit);
}

function hasControlCharacter(value: string): boolean {
  return [...value].some(
    (char) => char.codePointAt(0)! < 32 || char.codePointAt(0) === 127,
  );
}

function validateForm(): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  const email = state.values.email.trim();
  if (!email) errors.email = "Please enter your email.";
  else if (
    email.length > 254 ||
    hasControlCharacter(email) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    errors.email = "Please enter a valid email address.";
  if (!state.values.password) errors.password = "Please enter your password.";
  else if (
    [...state.values.password].length > 128 ||
    (state.mode === "register" && [...state.values.password].length < 15)
  )
    errors.password =
      state.mode === "register"
        ? "Password must be between 15 and 128 characters."
        : "Password must be at most 128 characters.";
  if (
    state.mode === "register" &&
    state.values.confirmPassword !== state.values.password
  )
    errors.confirmPassword = "Passwords do not match.";
  return errors;
}

function handleModalKeydown(event: KeyboardEvent): void {
  if (!modalRoot) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeAuthModal();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = Array.from(
    modalRoot.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function escapeAttribute(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function bindLanding(): void {
  const status = app.querySelector<HTMLElement>("#account-status")!;
  status.textContent =
    session.status === "authenticated"
      ? `Welcome, ${session.user.profile?.displayName || session.user.email}`
      : session.status === "checking"
        ? "Checking your session…"
        : session.status === "error"
          ? session.message
          : "";
  app.querySelector<HTMLElement>("#account-notice")!.textContent = notice;
  playButton!.disabled = mutationPending || session.status === "checking";
  playButton!.textContent =
    session.status === "authenticated"
      ? "My account"
      : session.status === "error"
        ? "Retry connection"
        : "Play Now";
  playButton?.addEventListener("click", () => {
    if (session.status === "error") void refreshSession();
    else if (session.status === "authenticated") {
      notice = "You are signed in. Gameplay is still in development.";
      renderLanding();
    } else openAuthModal();
  });
  const actions = app.querySelector<HTMLElement>(".account-actions")!;
  if (session.status === "authenticated") {
    if (session.user.authMethods.password && !session.user.authMethods.google) {
      const link = document.createElement("button");
      link.className = "secondary-button";
      link.textContent = providers?.google
        ? "Link Google account"
        : "Google linking unavailable";
      link.disabled = mutationPending || !providers?.google;
      link.addEventListener("click", () => openAuthModal(true));
      actions.append(link);
    }
    const logout = document.createElement("button");
    logout.className = "secondary-button";
    logout.textContent = mutationPending ? "Processing…" : "Sign out";
    logout.disabled = mutationPending;
    logout.addEventListener("click", () => void signOut());
    actions.append(logout);
  }
}

function openAccount(): void {
  if (mutationPending || session.status !== "authenticated") return;
  closeAuthModal();
  accountOpen = true;
  app.inert = true;
  modalRoot = document.createElement("div");
  modalRoot.className = "modal-backdrop";
  modalRoot.innerHTML = `<section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="account-title"><h2 id="account-title">Account</h2><button class="close-button" aria-label="Close account">×</button><p>${escapeAttribute(session.user.email)}</p><p role="status">${escapeAttribute(notice)}</p>${session.user.authMethods.password && !session.user.authMethods.google ? `<button class="secondary-button" data-link ${!providers?.google ? "disabled" : ""}>Link Google account</button>` : ""}<button class="secondary-button" data-logout>Sign out</button></section>`;
  document.body.append(modalRoot);
  document.body.classList.add("modal-open");
  modalRoot
    .querySelector(".close-button")
    ?.addEventListener("click", closeAuthModal);
  modalRoot
    .querySelector("[data-link]")
    ?.addEventListener("click", () => openAuthModal(true));
  modalRoot.querySelector("[data-logout]")?.addEventListener("click", () => {
    closeAuthModal();
    void signOut();
  });
  document.addEventListener("keydown", handleModalKeydown);
  modalRoot.querySelector<HTMLButtonElement>("button")?.focus();
}

function linkTemplate(): string {
  return `<div class="auth-main">
    <h2>Link your Google account</h2>
    <p>Confirm your Gemora password, then choose the Google account with the same email.</p>
    <form class="link-form">
      ${fieldTemplate("password", "Password", "password", "current-password", "Enter your password")}
      <button class="submit-button" type="submit" ${mutationPending ? "disabled" : ""}>${mutationPending ? "Processing…" : "Continue to Google"}</button>
    </form>
    <p class="status-message" role="status">${escapeAttribute(state.message)}</p>
  </div>`;
}

async function handleSubmit(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (mutationPending) return;
  state.errors = validateForm();
  if (Object.keys(state.errors).length > 0) {
    renderAuthModal();
    document.getElementById(Object.keys(state.errors)[0])?.focus();
    return;
  }
  const version = modalVersion;
  const mode = state.mode;
  const { email, password } = state.values;
  mutationPending = state.isSubmitting = true;
  sessionVersion++;
  state.message = "";
  renderLanding();
  renderAuthModal();
  try {
    if (mode === "register") {
      await auth.register({
        email: email.trim(),
        password,
      });
      notice = "Account created. Sign in with your email and password.";
      if (version === modalVersion) {
        state.mode = "login";
        state.message = notice;
      }
    } else {
      const { user } = await auth.login({ email: email.trim(), password });
      session = { status: "authenticated", user, message: "" };
      notice = "Signed in successfully. Gameplay is still in development.";
      if (version === modalVersion) closeAuthModal();
    }
  } catch (error) {
    notice = errorMessage(error);
    if (version === modalVersion) state.message = notice;
    // A lost response can follow a committed login; reconcile without retrying POST.
    if (
      mode === "login" &&
      error instanceof ApiError &&
      (error.status === 0 || error.status >= 500)
    ) {
      session = await readSession();
      if (session.status === "authenticated") {
        notice = "Your session has been restored.";
        if (version === modalVersion) closeAuthModal();
      }
    }
  } finally {
    mutationPending = state.isSubmitting = false;
    state.values.password = state.values.confirmPassword = "";
    state.passwordVisible = false;
    renderLanding();
    if (modalRoot) renderAuthModal();
  }
}

async function handleLink(event: SubmitEvent): Promise<void> {
  event.preventDefault();
  if (mutationPending) return;
  if (!state.values.password) {
    state.errors.password = "Please enter your password.";
    renderAuthModal();
    return;
  }
  const version = modalVersion;
  const password = state.values.password;
  mutationPending = state.isSubmitting = true;
  sessionVersion++;
  state.message = "";
  renderLanding();
  renderAuthModal();
  try {
    const { authorizationUrl } = await auth.linkGoogle(password);
    if (version === modalVersion) window.location.assign(authorizationUrl);
  } catch (error) {
    notice = errorMessage(error);
    // Link returns 401 for both a bad password and a lost session. Check /me.
    if (error instanceof ApiError && error.status === 401) {
      session = await readSession();
      if (session.status !== "authenticated" && version === modalVersion)
        closeAuthModal();
    }
    if (version === modalVersion) state.message = notice;
  } finally {
    mutationPending = state.isSubmitting = false;
    state.values.password = "";
    state.passwordVisible = false;
    renderLanding();
    if (modalRoot) renderAuthModal();
  }
}

async function signOut(): Promise<void> {
  if (mutationPending) return;
  mutationPending = true;
  sessionVersion++;
  renderLanding();
  try {
    await auth.logout();
    session = { status: "guest", user: null, message: "" };
    notice = "You have signed out.";
    closeAuthModal();
  } catch (error) {
    notice = `Sign-out could not be confirmed. ${errorMessage(error)}`;
    const next = await readSession();
    if (next.status === "guest") session = next;
  } finally {
    mutationPending = false;
    renderLanding();
    if (session.status === "authenticated") openAccount();
  }
}

async function refreshSession(): Promise<void> {
  if (mutationPending || refreshPending) return;
  refreshPending = true;
  const version = ++sessionVersion;
  const previousUser = session.user?.id;
  const next = await readSession();
  refreshPending = false;
  if (version !== sessionVersion) return;
  if (next.status === "error" && gameDispose) {
    notice = next.message;
    gameNotice(notice, () => void refreshSession());
    return;
  }
  app.querySelector(".g-connection-notice")?.remove();
  session = next;
  if (previousUser && next.user?.id !== previousUser) {
    notice =
      next.status === "guest"
        ? "Your session ended. Please sign in again."
        : next.message;
    if (modalRoot) closeAuthModal();
  }
  renderLanding();
}

async function loadProviders(): Promise<void> {
  try {
    providers = await auth.providers();
    providerError = false;
  } catch {
    providers = null;
    providerError = true;
  }
  renderLanding();
  if (modalRoot) {
    if (accountOpen) openAccount();
    else renderAuthModal();
  }
}

const callback = new URL(window.location.href);
const authResult = callback.searchParams.get("auth");
if (authResult) {
  const messages: Record<string, string> = {
    success: "Checking your Google sign-in…",
    account_link_required:
      "This email already has an account. Sign in with your password, then choose Link Google account.",
    google_link_conflict:
      "This Google account cannot be linked. Use the Google account with the same email.",
    session_changed: "Your session changed. Please try Google sign-in again.",
    google_cancelled: "Google sign-in was cancelled.",
    google_failed: "Google sign-in failed. Please try again.",
  };
  notice =
    messages[authResult] ||
    "Unable to complete Google sign-in. Please try again.";
  callback.searchParams.delete("auth");
  window.history.replaceState(
    null,
    "",
    callback.pathname + callback.search + callback.hash,
  );
}
renderLanding();
void loadProviders();
void refreshSession().then(() => {
  if (authResult === "success") {
    notice =
      session.status === "authenticated"
        ? "Google account verified. You are signed in."
        : session.status === "error"
          ? "Unable to confirm Google sign-in. Retry the connection."
          : "Google sign-in did not create an active session. Please try again.";
    renderLanding();
  }
  if (authResult === "account_link_required" && session.status === "guest")
    openAuthModal();
});
window.addEventListener("popstate", () => {
  if (session.status === "authenticated")
    history.replaceState(
      null,
      "",
      session.user.onboardingState === "READY" ? "/home" : "/create-player",
    );
  else renderLanding();
});
window.addEventListener("focus", () => void refreshSession());
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") void refreshSession();
});
