const preferenceKey = "gemora.home.motion";
const preferenceEvent = "gemora-home-motion";
let memoryPreference = true;

export function homeMotionEnabled(): boolean {
  try {
    return localStorage.getItem(preferenceKey) !== "off";
  } catch {
    return memoryPreference;
  }
}

export function setHomeMotion(enabled: boolean): void {
  memoryPreference = enabled;
  try {
    localStorage.setItem(preferenceKey, enabled ? "on" : "off");
  } catch {
    // The setting still works for this session when storage is unavailable.
  }
  window.dispatchEvent(new Event(preferenceEvent));
}

/** Owns one scheduler for Home; never runs while hidden, offscreen or modal. */
export function bindHomeAnimation(root: HTMLElement): () => void {
  // Cache only within this mounted Home, rather than across screen transitions.
  const atlases = new Map<string, Promise<void>>();
  function loadAtlas(url: string): Promise<void> {
    let pending = atlases.get(url);
    if (!pending) {
      const image = new Image();
      image.src = url;
      pending = image.decode().finally(() => {
        image.removeAttribute("src");
      });
      atlases.set(url, pending);
    }
    return pending;
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let disposed = false;
  let raf = 0;
  let previous = 0;
  const pets = Array.from(
    root.querySelectorAll<HTMLElement>("[data-companion]"),
    (element, index) => ({
      element,
      sprite: element.querySelector<HTMLElement>(".h-pet-sprite")!,
      url: `/art/companions/animated/${element.dataset.companion}-v1.webp`,
      visible: false,
      ready: false,
      loading: false,
      failed: false,
      generation: 0,
      frame: 0,
      remaining: 1100 + index * 630,
      accent: false,
      nextAccent: 8000 + index * 2700,
      elapsed: 0,
      sleeping: element.dataset.companion === "fire",
    }),
  );
  const enabled = () =>
    homeMotionEnabled() && !reduced.matches && !document.hidden && !root.inert;
  function paint(pet: (typeof pets)[number], frame: number): void {
    pet.element.dataset.frame = String(frame);
    pet.sprite.style.backgroundPosition = `${((frame % 4) * 100) / 3}% ${(Math.floor(frame / 4) * 100) / 3}%`;
  }
  function tick(time: number): void {
    raf = 0;
    if (disposed || !enabled()) return;
    const delta = previous ? Math.min(time - previous, 100) : 0;
    previous = time;
    for (const pet of pets) {
      if (!pet.ready || !pet.visible) continue;
      pet.elapsed += delta;
      pet.remaining -= delta;
      if (pet.remaining > 0) continue;
      if (pet.frame === 7 || pet.frame === 15) {
        pet.frame = 0;
        pet.accent = false;
      } else if (pet.frame === 0 && pet.elapsed >= pet.nextAccent) {
        pet.frame = 8;
        pet.accent = true;
        pet.nextAccent =
          pet.elapsed + (pet.sleeping ? 16000 : 9000) + Math.random() * 7000;
      } else {
        pet.frame++;
      }
      paint(pet, pet.frame);
      pet.remaining =
        pet.frame === 0
          ? (pet.sleeping ? 2200 : 1300) + Math.random() * 900
          : pet.accent
            ? 150
            : pet.sleeping
              ? 280
              : pet.frame === 4
                ? 95
                : 150;
    }
    if (pets.some((pet) => pet.ready && pet.visible))
      raf = requestAnimationFrame(tick);
  }
  function sync(): void {
    cancelAnimationFrame(raf);
    raf = 0;
    previous = 0;
    if (disposed) return;
    const animate = enabled();
    for (const pet of pets) {
      const pixels =
        pet.element.getBoundingClientRect().width * window.devicePixelRatio;
      const suffix = pixels <= 128 ? "-small" : "";
      const url = `/art/companions/animated/${pet.element.dataset.companion}-v1${suffix}.webp`;
      if (url !== pet.url) {
        pet.generation++;
        pet.url = url;
        pet.ready = false;
        pet.loading = false;
        pet.failed = false;
        pet.sprite.style.removeProperty("background-image");
        delete pet.element.dataset.ready;
      }
      if (!homeMotionEnabled() || reduced.matches) {
        pet.generation++;
        pet.ready = false;
        pet.loading = false;
        pet.sprite.style.removeProperty("background-image");
        delete pet.element.dataset.ready;
        atlases.clear();
        pet.frame = 0;
        pet.accent = false;
        paint(pet, 0);
      }
      if (animate && pet.visible && !pet.ready && !pet.loading && !pet.failed) {
        pet.loading = true;
        const generation = pet.generation;
        void loadAtlas(pet.url)
          .then(() => {
            if (disposed || generation !== pet.generation) return;
            pet.loading = false;
            pet.sprite.style.backgroundImage = `url("${pet.url}")`;
            pet.ready = true;
            pet.element.dataset.ready = "true";
            paint(pet, 0);
            sync();
          })
          .catch(() => {
            if (!disposed && generation === pet.generation) {
              pet.loading = false;
              pet.failed = true;
            }
            // The matching static frame remains visible if the atlas fails.
          });
      }
    }
    if (animate && pets.some((pet) => pet.ready && pet.visible))
      raf = requestAnimationFrame(tick);
  }
  const intersection = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const pet = pets.find((item) => item.element === entry.target);
        if (pet) pet.visible = entry.isIntersecting;
      }
      sync();
    },
    { root: root.querySelector(".h-scene"), threshold: 0.1 },
  );
  pets.forEach((pet) => intersection.observe(pet.element));
  const modal = new MutationObserver(sync);
  const resize = new ResizeObserver(sync);
  pets.forEach((pet) => resize.observe(pet.element));
  modal.observe(root, { attributes: true, attributeFilter: ["inert"] });
  document.addEventListener("visibilitychange", sync);
  window.addEventListener(preferenceEvent, sync);
  reduced.addEventListener("change", sync);
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    intersection.disconnect();
    modal.disconnect();
    resize.disconnect();
    atlases.clear();
    for (const pet of pets) {
      pet.sprite.style.removeProperty("background-image");
      delete pet.element.dataset.ready;
    }
    document.removeEventListener("visibilitychange", sync);
    window.removeEventListener(preferenceEvent, sync);
    reduced.removeEventListener("change", sync);
  };
}
