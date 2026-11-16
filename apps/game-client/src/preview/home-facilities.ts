import { companionPets as pets } from "./companion-pets";
export interface FacilityState {
  pet: number;
  item: string;
  filter: string;
}
type Kind = "Pets" | "Forge" | "Bag";
type Open = (
  content: string,
  bind?: (overlay: HTMLDivElement, close: () => void) => void,
) => void;
const items = [
  {
    id: "blade",
    name: "Ember blade",
    type: "Equipment",
    icon: "⚔",
    count: 1,
    stat: "Attack",
    current: 12,
    next: 15,
  },
  {
    id: "guard",
    name: "Leafguard",
    type: "Equipment",
    icon: "⬡",
    count: 1,
    stat: "Defense",
    current: 8,
    next: 10,
  },
  {
    id: "shard",
    name: "Crystal shard",
    type: "Materials",
    icon: "◆",
    count: 8,
    stat: "",
    current: 0,
    next: 0,
  },
  {
    id: "ore",
    name: "Iron ore",
    type: "Materials",
    icon: "▰",
    count: 12,
    stat: "",
    current: 0,
    next: 0,
  },
];

export function showFacility(
  initial: Kind,
  open: Open,
  state: FacilityState,
): void {
  let kind = initial;
  open('<div class="h-facility"></div>', (overlay) => {
    overlay.querySelector(".g-dialog")!.classList.add("h-facility-dialog");
    const host = overlay.querySelector<HTMLElement>(".h-facility")!;
    const draw = () => {
      const item = items.find((i) => i.id === state.item) || items[0];
      const list =
        kind === "Forge"
          ? items.filter((i) => i.type === "Equipment")
          : items.filter(
              (i) => state.filter === "All" || i.type === state.filter,
            );
      const detail =
        kind === "Pets"
          ? `<img class="h-pet-portrait" src="${pets[state.pet].image}" alt="${pets[state.pet].name}"><h3>${pets[state.pet].name}</h3><p>Lv. 1 → Lv. 2</p><div class="h-stat">Attack <b>12 → 15</b></div><p class="h-cost">100 Gold · 3 Crystal shards</p>`
          : `<span class="h-item-art" aria-hidden="true">${item.icon}</span><h3>${item.name}</h3>${kind === "Forge" ? `<p>Lv. 1 → Lv. 2</p><div class="h-stat">${item.stat} <b>${item.current} → ${item.next}</b></div><p class="h-cost">100 Gold · 2 Iron ore</p>` : `<p>${item.type} · ×${item.count}</p>`}`;
      host.innerHTML = `<header><h2 id="g-dialog-title">${kind}</h2><span class="h-sample">Preview · Sample collection</span></header>${kind === "Bag" ? `<div class="h-filters" aria-label="Item filters">${["All", "Equipment", "Materials"].map((f) => `<button data-filter="${f}" aria-pressed="${state.filter === f}">${f}</button>`).join("")}</div>` : ""}<div class="h-facility-body"><div class="h-collection" aria-label="${kind === "Pets" ? "Choose a pet" : "Choose an item"}">${kind === "Pets" ? pets.map((p, i) => `<button data-pet="${i}" aria-pressed="${state.pet === i}"><img class="h-pet-thumb" src="${p.image}" alt=""><strong>${p.name}</strong><small>Lv. 1</small></button>`).join("") : list.map((i) => `<button data-item="${i.id}" aria-pressed="${state.item === i.id}"><span class="h-item-icon" aria-hidden="true">${i.icon}</span><strong>${i.name}</strong><small>×${i.count}</small></button>`).join("") || "<p>No items in this category.</p>"}</div><section class="h-detail" aria-label="Selection details">${detail}${kind === "Bag" ? (item.type === "Equipment" ? '<button class="g-primary" data-to-forge>Go to Forge</button>' : "<p>Used for upgrades</p>") : '<button class="g-primary" disabled>Upgrade</button><p class="h-unavailable">Upgrades coming soon</p>'}</section></div><p class="h-sample-note">Sample values only. Your account and items are unchanged.</p>`;
    };
    host.addEventListener("click", (e) => {
      const button = (e.target as Element).closest<HTMLButtonElement>("button");
      if (!button) return;
      let focus = "";
      if (button.dataset.pet !== undefined) {
        state.pet = Number(button.dataset.pet);
        focus = `[data-pet="${state.pet}"]`;
      } else if (button.dataset.item) {
        state.item = button.dataset.item;
        focus = `[data-item="${state.item}"]`;
      } else if (button.dataset.filter) {
        state.filter = button.dataset.filter;
        const first = items.find(
          (i) => state.filter === "All" || i.type === state.filter,
        );
        if (
          first &&
          !items.some(
            (i) =>
              i.id === state.item &&
              (state.filter === "All" || i.type === state.filter),
          )
        )
          state.item = first.id;
        focus = `[data-filter="${state.filter}"]`;
      } else if (button.hasAttribute("data-to-forge")) {
        kind = "Forge";
        focus = `[data-item="${state.item}"]`;
      } else return;
      draw();
      host.querySelector<HTMLElement>(focus)?.focus();
    });
    if (
      kind === "Forge" &&
      items.find((i) => i.id === state.item)?.type !== "Equipment"
    )
      state.item = "blade";
    draw();
  });
}
