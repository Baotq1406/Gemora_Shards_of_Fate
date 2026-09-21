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
  completed: boolean;
}

const app = document.querySelector<HTMLDivElement>("#app") as HTMLDivElement;
if (!app) throw new Error("Không tìm thấy phần tử #app để khởi tạo giao diện.");

let playButton: HTMLButtonElement | null = null;
let modalRoot: HTMLDivElement | null = null;
let submitTimer: number | null = null;

const state: AuthState = {
  mode: "login",
  values: { displayName: "", email: "", password: "", confirmPassword: "" },
  errors: {},
  isSubmitting: false,
  passwordVisible: false,
  message: "",
  completed: false,
};

function renderLanding(): void {
  app.innerHTML = `
    <main class="landing" aria-labelledby="game-title">
      <div class="stars" aria-hidden="true"></div>
      <section class="landing-content">
        <div class="brand-mark"><span class="brand-gem"></span> A realm of fractured fate</div>
        <h1 class="game-title" id="game-title">GEMORA</h1>
        <p class="game-subtitle">Shards of Fate</p>
        <p class="game-tagline">Ghép ngọc, tập hợp anh hùng và viết nên vận mệnh.</p>
        <button class="play-button" id="play-now" type="button">Chơi ngay</button>
        <p class="landing-note">Prototype giao diện · Chưa kết nối máy chủ</p>
      </section>
    </main>`;

  playButton = document.querySelector<HTMLButtonElement>("#play-now");
  playButton?.addEventListener("click", openAuthModal);
}

function resetSensitiveState(): void {
  state.values.password = "";
  state.values.confirmPassword = "";
  state.errors = {};
  state.isSubmitting = false;
  state.passwordVisible = false;
  state.message = "";
  state.completed = false;
  if (submitTimer !== null) {
    window.clearTimeout(submitTimer);
    submitTimer = null;
  }
}

function openAuthModal(): void {
  state.mode = "login";
  resetSensitiveState();
  document.body.classList.add("modal-open");
  renderAuthModal();
}

function closeAuthModal(): void {
  resetSensitiveState();
  modalRoot?.remove();
  modalRoot = null;
  document.body.classList.remove("modal-open");
  document.removeEventListener("keydown", handleModalKeydown);
  playButton?.focus();
}

function switchMode(mode: AuthMode): void {
  if (state.mode === mode) return;
  state.mode = mode;
  state.values.password = "";
  state.values.confirmPassword = "";
  state.errors = {};
  state.passwordVisible = false;
  state.message = "";
  state.completed = false;
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
            ? `<button class="toggle-password" type="button" data-toggle-password aria-label="${state.passwordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}">${state.passwordVisible ? "Ẩn" : "Hiện"}</button>`
            : ""
        }
      </div>
      <p class="field-error" id="${name}-error">${error}</p>
    </div>`;
}

function renderAuthModal(): void {
  const previousActiveId = document.activeElement?.id;
  modalRoot?.remove();
  document.removeEventListener("keydown", handleModalKeydown);
  modalRoot = document.createElement("div");
  modalRoot.className = "modal-backdrop";
  modalRoot.innerHTML = `
    <section class="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title" aria-describedby="auth-description">
      <header class="modal-header">
        <p class="modal-eyebrow">Gemora · Shards of Fate</p>
        <h2 class="modal-title" id="auth-title">Chào mừng đến Gemora</h2>
        <p class="sr-only" id="auth-description">Đăng nhập hoặc tạo tài khoản để tiếp tục.</p>
      </header>
      <button class="close-button" type="button" aria-label="Đóng cửa sổ đăng nhập">×</button>
      <div class="auth-layout">${state.completed ? successTemplate() : authContentTemplate()}</div>
    </section>`;
  document.body.append(modalRoot);
  bindModalEvents();
  document.addEventListener("keydown", handleModalKeydown);

  if (previousActiveId)
    modalRoot.querySelector<HTMLElement>(`#${previousActiveId}`)?.focus();
  else modalRoot.querySelector<HTMLElement>(".close-button")?.focus();
}

function authContentTemplate(): string {
  const isLogin = state.mode === "login";
  const formTitle = isLogin ? "Đăng nhập" : "Tạo tài khoản";
  return `
    <div class="auth-main">
      <div class="tabs" role="tablist" aria-label="Chọn hình thức xác thực">
        <button class="tab-button" id="login-tab" type="button" role="tab" aria-selected="${isLogin}" data-mode="login">Đăng nhập</button>
        <button class="tab-button" id="register-tab" type="button" role="tab" aria-selected="${!isLogin}" data-mode="register">Đăng ký</button>
      </div>
      <form class="auth-form" novalidate>
        ${!isLogin ? fieldTemplate("displayName", "Tên hiển thị", "text", "nickname", "Ví dụ: MoonSeeker") : ""}
        ${fieldTemplate("email", "Email", "email", "email", "ban@example.com")}
        ${fieldTemplate("password", "Mật khẩu", "password", isLogin ? "current-password" : "new-password", "Nhập mật khẩu")}
        ${!isLogin ? fieldTemplate("confirmPassword", "Xác nhận mật khẩu", "password", "new-password", "Nhập lại mật khẩu") : ""}
        <button class="submit-button" type="submit" ${state.isSubmitting ? "disabled" : ""}>
          ${state.isSubmitting ? "Đang xử lý…" : formTitle}
        </button>
      </form>
    </div>
    <aside class="auth-social" aria-label="Đăng nhập bằng dịch vụ khác">
      <p class="social-title">Tiếp tục nhanh hơn</p>
      <p class="social-copy">Sử dụng tài khoản Google để tiếp tục khi tính năng được kết nối.</p>
      <button class="google-button" type="button"><span class="google-icon" aria-hidden="true">G</span>Tiếp tục với Google</button>
      <p class="status-message" aria-live="polite" ${state.message ? "" : "hidden"}>${state.message}</p>
    </aside>`;
}

function successTemplate(): string {
  const action = state.mode === "login" ? "đăng nhập" : "đăng ký";
  return `
    <div class="success-panel">
      <div class="success-icon" aria-hidden="true">✓</div>
      <h2>Đã hoàn tất ${action} mẫu</h2>
      <p>Giao diện đã xử lý thành công. Tài khoản chưa được tạo hoặc xác thực vì prototype chưa kết nối máy chủ.</p>
      <button class="secondary-button" type="button" data-return-landing>Quay về màn chào</button>
    </div>`;
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
    .querySelector<HTMLButtonElement>("[data-toggle-password]")
    ?.addEventListener("click", () => {
      state.passwordVisible = !state.passwordVisible;
      renderAuthModal();
    });
  modalRoot
    .querySelector<HTMLButtonElement>(".google-button")
    ?.addEventListener("click", () => {
      state.message =
        "Đăng nhập Google sẽ được kết nối ở giai đoạn tích hợp xác thực.";
      renderAuthModal();
    });
  modalRoot
    .querySelector<HTMLFormElement>(".auth-form")
    ?.addEventListener("submit", handleSubmit);
}

function handleSubmit(event: SubmitEvent): void {
  event.preventDefault();
  if (state.isSubmitting) return;
  state.errors = validateForm();
  if (Object.keys(state.errors).length > 0) {
    renderAuthModal();
    const firstInvalid = Object.keys(state.errors)[0] as FieldName | undefined;
    if (firstInvalid)
      modalRoot?.querySelector<HTMLInputElement>(`#${firstInvalid}`)?.focus();
    return;
  }
  state.isSubmitting = true;
  state.message = "";
  renderAuthModal();
  submitTimer = window.setTimeout(() => {
    state.isSubmitting = false;
    state.completed = true;
    state.values.password = "";
    state.values.confirmPassword = "";
    submitTimer = null;
    renderAuthModal();
  }, 700);
}

function validateForm(): Partial<Record<FieldName, string>> {
  const errors: Partial<Record<FieldName, string>> = {};
  const email = state.values.email.trim();
  if (state.mode === "register" && state.values.displayName.trim().length < 2)
    errors.displayName = "Tên hiển thị cần ít nhất 2 ký tự.";
  if (!email) errors.email = "Vui lòng nhập email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Email chưa đúng định dạng.";
  if (!state.values.password) errors.password = "Vui lòng nhập mật khẩu.";
  else if (state.mode === "register" && state.values.password.length < 8)
    errors.password = "Mật khẩu cần ít nhất 8 ký tự trong prototype.";
  if (
    state.mode === "register" &&
    state.values.confirmPassword !== state.values.password
  )
    errors.confirmPassword = "Mật khẩu xác nhận chưa trùng khớp.";
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

renderLanding();
