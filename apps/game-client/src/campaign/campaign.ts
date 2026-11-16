import "./campaign.css";
import "./minimal.css";
import "./islands.css";
import { realms, regionOpen, challengeKind, challengeStatus } from "./realms";
const art = "/art/campaign/";
const symbols: Record<string, string> = {
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/>',
  spark: '<path d="m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z"/>',
  nature: '<path d="M20 3C7 1 1 9 6 17s16 0 14-14ZM4 22 16 8"/>',
  water:
    '<path d="M12 2C8 8 4 11 4 15a8 8 0 0 0 16 0c0-4-4-7-8-13Z"/><path d="M8 15q0 4 4 4"/>',
  fire: '<path d="M13 2c2 7-4 7-2 12 2-1 4-3 4-5 8 8 4 13-3 13S1 15 6 9c0 3 1 4 2 4-1-5 5-6 5-11Z"/>',
  light:
    '<circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/>',
  dark: '<path d="M20 15A9 9 0 0 1 9 3a9 9 0 1 0 11 12Z"/><path d="m18 2 1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3Z"/>',
  gem: '<path d="m12 2 9 7-9 13L3 9l9-7ZM3 9h18M12 2 8 9l4 13 4-13-4-7Z"/>',
  back: '<path d="M20 12H4m7-7-7 7 7 7"/>',
  arrow: '<path d="M4 12h16m-7-7 7 7-7 7"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  crown: '<path d="m3 6 5 5 4-8 4 8 5-5-2 14H5L3 6Zm3 10h12"/>',
  swords:
    '<path d="m4 3 3 1 12 14-2 2L3 7l1-4Zm16 0-3 1-5 6m-3 3-4 5 2 2 5-4M3 16l6 6m6 0 6-6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2V5Zm6-2v16m6-14v16"/>',
  target:
    '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/>',
};
const icon = (name: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[name] || symbols.gem}</svg>`;
const dragon = (index: number, boss = false, extra = "") =>
  `<span class="d-dragon ${boss ? "is-boss-art" : ""} ${extra}" style="--dragon-position:${(boss ? [0, 23, 46, 73, 100] : [0, 23.5, 47, 73.5, 100])[index]}%" role="img" aria-label="${boss ? realms[index].boss : realms[index].dragon}"></span>`;
const points = [
  [49, 92],
  [36, 84],
  [59, 76],
  [42, 68],
  [60, 60],
  [36, 52],
  [59, 44],
  [40, 36],
  [57, 28],
  [50, 17],
];
export interface CampaignState {
  selected: number;
  scrollTop: number | null;
  realm?: string;
  scrolls?: Record<string, number>;
  selections?: Record<string, number>;
  previewRealms?: string[];
}
export function campaignMarkup(): string {
  return '<main class="d-campaign"></main>';
}
const lockArt = () =>
  `<img class="d-island-lock" src="${art}island-lock-v1.webp" width="96" height="96" alt="" aria-hidden="true">`;
function header(world: boolean, index = 0): string {
  const r = realms[index];
  return `<header class="d-header"><button class="d-back d-wood" data-action="${world ? "home" : "world"}" aria-label="${world ? "Home" : "World map"}" title="${world ? "Home" : "World map"}">${icon("back")}</button><h1 tabindex="-1" ${world ? 'class="d-world-logo" aria-label="Adventure"' : ""}>${icon(world ? "gem" : r.id)} ${world ? "GEMORA" : r.name}</h1><div class="d-header-right">${world ? "" : `<span class="d-compact-progress" aria-label="${r.previewCleared} of 10 cleared, sample progress">${r.previewCleared}/10</span>`}<button class="d-preview-pill" data-action="preview-info" aria-label="About this preview">Preview ${icon("info")}</button></div></header>`;
}
const islandLayout = [
  {
    x: 20,
    y: 65,
    size: 34,
    shape: "8,32 22,15 48,2 76,14 94,38 93,67 69,91 45,98 17,79 4,54",
  },
  {
    x: 29,
    y: 26,
    size: 29,
    shape: "15,21 42,3 73,12 91,35 98,58 82,80 49,97 18,82 3,51",
  },
  {
    x: 51,
    y: 49,
    size: 32,
    shape: "35,5 63,3 75,29 94,51 96,71 67,88 48,97 22,83 4,57 17,32",
  },
  {
    x: 80,
    y: 25,
    size: 31,
    shape: "28,15 53,2 71,17 91,26 99,59 80,84 46,97 17,79 2,57 9,30",
  },
  {
    x: 81,
    y: 68,
    size: 33,
    shape: "14,20 42,6 77,4 94,30 96,61 74,84 49,96 20,83 4,56",
  },
];
function worldMarkup(): string {
  return `${header(true)}<section class="d-world d-layered-world" aria-label="World map"><div class="d-world-scene"><svg class="d-world-route" viewBox="0 0 1000 660" preserveAspectRatio="none" aria-hidden="true"><path d="M200 430 Q160 240 290 172 T510 323 T800 165 Q950 260 810 449"/></svg><ol class="d-world-regions" aria-label="Elemental realms">${realms
    .map((r, i) => {
      const layout = islandLayout[i],
        open = regionOpen(i);
      return `<li style="--island-x:${layout.x}%;--island-y:${layout.y}%;--island-size:${layout.size}%;--realm-color:${r.color}"><button class="d-island-label ${open ? "is-open" : "is-locked"}" data-realm="${r.id}" aria-label="${r.name}, ${r.element}, ${open ? `${r.previewCleared} of 10 cleared` : "locked"}" aria-haspopup="${open ? "false" : "dialog"}"><svg class="d-island-hit" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="${layout.shape}"/></svg><span class="d-island-visual"><img class="d-island-art" src="${art}island-${r.id}-v2.webp" srcset="${art}island-${r.id}-v2-small.webp 512w, ${art}island-${r.id}-v2.webp 1024w" sizes="(max-width: 700px) 82vw, 34vw" width="1024" height="1024" alt="" draggable="false">${open ? "" : lockArt()}<span class="d-island-name">${icon(r.id)}<strong>${r.name}</strong>${open ? `<span class="d-island-count">${r.previewCleared === 10 ? icon("check") : `${r.previewCleared}/10`}</span>` : ""}</span></span></button></li>`;
    })
    .join(
      "",
    )}</ol></div><div class="d-world-bottom"><img class="d-guide-solo" src="/art/gemora-baby-dragon.webp" alt="Your crystal dragon companion"><button class="d-gold" data-action="continue">Continue ${icon("arrow")}</button></div></section>`;
}
function regionMarkup(index: number): string {
  const r = realms[index],
    route = points.map(([x, y]) => `${x * 10},${y * 15}`).join(" ");
  return `${header(false, index)}<section class="d-region" style="--realm-color:${r.color};--realm-background:url('${art}${r.id}.webp')" aria-label="${r.name} map"><nav class="d-realm-tabs" aria-label="Switch realm">${realms.map((realm, i) => `<button data-realm="${realm.id}" aria-label="${realm.element} realm${regionOpen(i) ? "" : ", locked"}" title="${realm.element}${regionOpen(i) ? "" : " · Locked"}" aria-current="${i === index ? "page" : "false"}" style="--realm-color:${realm.color}">${icon(realm.id)}${i === index ? `<span>${realm.element}</span>` : ""}${regionOpen(i) ? "" : `<i>${icon("lock")}</i>`}</button>`).join("")}</nav><div class="d-region-layout"><div class="d-map-scroll" tabindex="0" aria-label="Scroll the challenge map"><div class="d-map-canvas"><img class="d-region-art" src="${art}${r.id}.webp" alt="" fetchpriority="high"><svg class="d-trail" viewBox="0 0 1000 1500" preserveAspectRatio="none" aria-hidden="true"><polyline points="${route}" fill="none" stroke="#7c5434" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 21" opacity=".65"/><polyline points="${route}" fill="none" stroke="#ffe2a0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 21"/></svg><ol class="d-challenges" aria-label="10 challenges">${r.challenges
    .map((name, s) => {
      const status = challengeStatus(index, s),
        kind = challengeKind(s);
      return `<li style="--node-x:${points[s][0]}%;--node-y:${points[s][1]}%"><button class="d-node ${status} ${kind.toLowerCase()}" data-stage="${s}" aria-label="${r.element} challenge ${s + 1}: ${name}, ${kind}, ${status}" aria-pressed="false">${s === 9 ? dragon(index, true, "d-boss-on-map") : ""}<span class="d-node-gem">${icon(s === 9 ? "crown" : s === 3 || s === 7 ? "swords" : r.id)}<b>${s + 1}</b><i>${icon(status === "cleared" ? "check" : status === "locked" ? "lock" : "gem")}</i></span>${kind !== "Challenge" ? `<span class="d-kind-seal" aria-hidden="true">${icon(kind === "Boss" ? "crown" : "swords")}</span>` : ""}</button>${status === "next" ? '<img class="d-map-companion" src="/art/gemora-baby-dragon.webp" alt="" aria-hidden="true">' : ""}</li>`;
    })
    .join(
      "",
    )}</ol></div></div></div><div class="d-map-controls"><button class="d-wood" data-action="current" aria-label="Current challenge" title="Current challenge">${icon("target")}</button></div></section>`;
}
function detailMarkup(index: number, stage: number): string {
  const r = realms[index],
    kind = challengeKind(stage),
    status = challengeStatus(index, stage);
  const unlock = !regionOpen(index)
    ? `Defeat ${realms[index - 1].boss} to unlock.`
    : `Clear challenge ${stage} to unlock.`;
  return `<div class="d-dialog-top" style="--realm-color:${r.color};background-image:linear-gradient(0deg,#153d3ab0,transparent),url('${art}${r.id}.webp')"><span class="d-ribbon">${kind} ${String(stage + 1).padStart(2, "0")}/10</span>${dragon(index, kind === "Boss")}<span class="d-encounter-badge">${icon(r.id)} ${kind === "Boss" ? r.boss : kind === "Elite" ? `${r.element} elder drake` : r.dragon}</span></div><div class="d-dialog-body"><h2 id="d-detail-title">${r.challenges[stage]}</h2><div class="d-rewards"><button data-resource="gold" aria-label="${100 + index * 50 + stage * 20} Gold, sample reward" title="Gold"><b class="d-coin">G</b><strong>${100 + index * 50 + stage * 20}</strong></button><button data-resource="exp" aria-label="${30 + stage * 10} Hero EXP, sample reward" title="Hero EXP">${icon("spark")}<strong>${30 + stage * 10}</strong></button><button data-resource="shard" aria-label="First clear: one crystal shard, ${status === "cleared" ? "already claimed in sample" : "sample reward"}" title="First clear · Crystal shard">${icon("gem")}<strong>${status === "cleared" ? icon("check") : "×1"}</strong></button></div><p class="d-resource-help" role="status"></p><div class="d-team-slots" aria-label="Party selection unavailable"><i aria-label="Empty party slot">+</i><i aria-label="Empty party slot">+</i><i aria-label="Empty party slot">+</i></div>${status === "locked" ? `<p class="d-unlock">${icon("lock")} ${unlock}</p>` : ""}<button class="d-gold d-battle" disabled>${icon(status === "locked" ? "lock" : "swords")} ${status === "locked" ? "Locked" : status === "cleared" ? "Replay" : "Play"}</button><p class="d-dialog-note">Battles coming soon</p></div>`;
}
function lockedMarkup(index: number, canPreview: boolean): string {
  const previous = realms[index - 1];
  return `<div class="d-lock-details">${lockArt()}<h2 id="d-detail-title">${realms[index].name}</h2><p>Defeat ${previous.boss} to unlock.</p><button class="d-gold" data-unlock-target="${index}">${regionOpen(index - 1) ? "Go to boss" : "Continue"} ${icon("arrow")}</button>${canPreview ? `<button class="d-preview-link" data-view-preview="${index}">View preview</button>` : ""}</div>`;
}

export function bindCampaign(
  root: HTMLElement,
  state: CampaignState,
  home: () => void,
): () => void {
  const host = root.querySelector<HTMLElement>(".d-campaign")!,
    controller = new AbortController(),
    { signal } = controller;
  state.scrolls ??= {};
  state.selections ??= {};
  state.previewRealms ??= [];
  const canPreview =
    import.meta.env.DEV &&
    new URL(location.href).searchParams.get("preview") === "campaign";
  const canEnter = (index: number) =>
    regionOpen(index) ||
    (canPreview && state.previewRealms!.includes(realms[index].id));
  let focusAfterNavigation: number | null = null;
  let realmIndex = -1,
    sheet: HTMLDialogElement | null = null,
    lastTrigger: HTMLElement | null = null,
    frame = 0;
  const openDialog = (content: string, trigger: HTMLElement | null) => {
    lastTrigger = trigger;
    sheet!.querySelector(".d-dialog-content")!.innerHTML = content;
    sheet!.showModal();
    sheet!.scrollTop = 0;
    document.body.classList.add("d-modal-open");
  };
  const saveScroll = () => {
    const scroll = host.querySelector<HTMLElement>(".d-map-scroll");
    if (scroll && realmIndex >= 0)
      state.scrolls![realms[realmIndex].id] = scroll.scrollTop;
  };
  const focusChallenge = (stage: number) => {
    const scroll = host.querySelector<HTMLElement>(".d-map-scroll"),
      node = host.querySelector<HTMLElement>(`[data-stage="${stage}"]`);
    if (scroll && node) {
      scroll.scrollTop =
        node.parentElement!.offsetTop - scroll.clientHeight * 0.52;
      node.focus({ preventScroll: true });
    }
  };
  const draw = () => {
    cancelAnimationFrame(frame);
    realmIndex = realms.findIndex(
      (r) => r.id === new URL(location.href).searchParams.get("realm"),
    );
    const blocked = realmIndex >= 0 && !canEnter(realmIndex) ? realmIndex : -1;
    if (blocked >= 0) {
      realmIndex = -1;
      const url = new URL(location.href);
      url.searchParams.delete("realm");
      history.replaceState(null, "", url);
    }
    if (realmIndex >= 0) state.realm = realms[realmIndex].id;
    if (sheet?.open) sheet.close();
    document.body.classList.remove("d-modal-open");
    lastTrigger = null;
    host.classList.toggle("is-world", realmIndex < 0);
    host.innerHTML =
      (realmIndex < 0 ? worldMarkup() : regionMarkup(realmIndex)) +
      `<dialog class="d-dialog" aria-labelledby="d-detail-title"><div class="d-dialog-toolbar"><button class="d-dialog-close d-wood" aria-label="Close details">${icon("close")}</button></div><div class="d-dialog-content"></div></dialog>`;
    sheet = host.querySelector<HTMLDialogElement>(".d-dialog")!;
    if (realmIndex >= 0) {
      const selected = state.selections![realms[realmIndex].id];
      host
        .querySelector(`[data-stage="${selected}"]`)
        ?.setAttribute("aria-pressed", "true");
    }
    sheet.addEventListener(
      "close",
      () => {
        document.body.classList.remove("d-modal-open");
        lastTrigger?.focus({ preventScroll: true });
      },
      { signal },
    );
    sheet.addEventListener(
      "click",
      (e) => {
        if (e.target === sheet) {
          const rect = sheet!.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            sheet!.close();
        }
      },
      { signal },
    );
    frame = requestAnimationFrame(() => {
      if (realmIndex >= 0) {
        const r = realms[realmIndex],
          scroll = host.querySelector<HTMLElement>(".d-map-scroll")!;
        if (state.scrolls![r.id] !== undefined)
          scroll.scrollTop = state.scrolls![r.id];
        else
          focusChallenge(
            regionOpen(realmIndex) ? Math.min(r.previewCleared, 9) : 0,
          );
      }
      host.querySelector<HTMLElement>("h1")?.focus({ preventScroll: true });
      if (focusAfterNavigation !== null) {
        focusChallenge(focusAfterNavigation);
        focusAfterNavigation = null;
      }
      if (blocked >= 0)
        openDialog(
          lockedMarkup(blocked, canPreview),
          host.querySelector(`[data-realm="${realms[blocked].id}"]`),
        );
    });
  };
  const navigate = (id: string | null, stage: number | null = null) => {
    saveScroll();
    focusAfterNavigation = stage;
    const url = new URL(location.href);
    if (id) {
      url.searchParams.set("realm", id);
      state.realm = id;
    } else url.searchParams.delete("realm");
    history.pushState(null, "", url);
    draw();
  };
  host.addEventListener(
    "click",
    (e) => {
      const button = (e.target as Element).closest<HTMLButtonElement>("button");
      if (!button) return;
      if (button.classList.contains("d-dialog-close")) {
        sheet?.close();
        return;
      }
      if (button.dataset.realm) {
        const index = realms.findIndex((r) => r.id === button.dataset.realm);
        if (index < 0) return;
        // Locked tabs and islands always explain the requirement, even in a previewed realm.
        if (!regionOpen(index))
          openDialog(lockedMarkup(index, canPreview), button);
        else navigate(button.dataset.realm);
        return;
      }
      if (button.dataset.viewPreview !== undefined && canPreview) {
        const index = Number(button.dataset.viewPreview);
        if (!realms[index]) return;
        state.previewRealms!.push(realms[index].id);
        navigate(realms[index].id);
        return;
      }
      if (button.dataset.unlockTarget !== undefined) {
        const previous = Number(button.dataset.unlockTarget) - 1;
        if (previous >= 0 && regionOpen(previous))
          navigate(realms[previous].id, 9);
        else navigate("nature", realms[0].previewCleared);
        return;
      }
      if (button.dataset.resource) {
        const descriptions: Record<string, string> = {
          gold: "Gold · Sample reward",
          exp: "Hero EXP · Sample reward",
          shard: "Crystal shard · First clear reward (sample)",
        };
        sheet!.querySelector(".d-resource-help")!.textContent =
          descriptions[button.dataset.resource] || "";
        return;
      }
      if (button.dataset.stage !== undefined && realmIndex >= 0) {
        state.selected = Number(button.dataset.stage);
        state.selections![realms[realmIndex].id] = state.selected;
        lastTrigger = button;
        host
          .querySelectorAll("[data-stage]")
          .forEach((node) =>
            node.setAttribute("aria-pressed", String(node === button)),
          );
        sheet!.querySelector(".d-dialog-content")!.innerHTML = detailMarkup(
          realmIndex,
          state.selected,
        );
        sheet!.showModal();
        sheet!.scrollTop = 0;
        document.body.classList.add("d-modal-open");
        return;
      }
      switch (button.dataset.action) {
        case "preview-info":
          openDialog(
            '<div class="d-lock-details"><h2 id="d-detail-title">Preview</h2><p>Progress and rewards are samples. Battles and party selection are coming soon.</p></div>',
            button,
          );
          break;
        case "home":
          saveScroll();
          home();
          break;
        case "world":
          navigate(null);
          break;
        case "continue":
          navigate("nature", Math.min(realms[0].previewCleared, 9));
          break;
        case "current":
          focusChallenge(
            regionOpen(realmIndex)
              ? Math.min(realms[realmIndex].previewCleared, 9)
              : 0,
          );
          break;
        case "boss":
          focusChallenge(9);
          break;
      }
    },
    { signal },
  );
  draw();
  return () => {
    cancelAnimationFrame(frame);
    saveScroll();
    controller.abort();
    if (sheet?.open) sheet.close();
    document.body.classList.remove("d-modal-open");
  };
}
