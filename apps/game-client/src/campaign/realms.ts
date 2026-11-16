export interface Realm {
  id: string;
  name: string;
  element: string;
  color: string;
  description: string;
  dragon: string;
  boss: string;
  challenges: string[];
  previewCleared: number;
  x: number;
  y: number;
}
// Presentation fixtures only. No sample progress is saved to a player account.
export const realms: Realm[] = [
  {
    id: "nature",
    name: "Whispering Woods",
    element: "Nature",
    color: "#6da744",
    description:
      "Follow little footprints into an ancient forest. A crystal guardian sleeps beneath the roots.",
    dragon: "Leafwing drake",
    boss: "Elderbloom",
    previewCleared: 3,
    x: 18,
    y: 73,
    challenges: [
      "First footprints",
      "Mossy clearing",
      "Rootbridge crossing",
      "The grove guardian",
      "Crystal creek",
      "A rustle in the leaves",
      "Wildwood trail",
      "Keeper of the roots",
      "The ancient hollow",
      "Elderbloom’s nest",
    ],
  },
  {
    id: "water",
    name: "Tideglass Isles",
    element: "Water",
    color: "#32b3cc",
    description:
      "Cross sparkling lagoons and coral bridges. Follow the tide to the sea dragon’s hidden sanctuary.",
    dragon: "Coralfin drake",
    boss: "Tidecrown",
    previewCleared: 0,
    x: 29,
    y: 34,
    challenges: [
      "Pearlshore landing",
      "The little lagoon",
      "Coral crossing",
      "Guardian of the tide",
      "Waterfall whispers",
      "Moonpool shallows",
      "The sapphire stream",
      "Keeper of the reef",
      "Beyond the falls",
      "Tidecrown’s cavern",
    ],
  },
  {
    id: "fire",
    name: "Emberfall Peaks",
    element: "Fire",
    color: "#e7793c",
    description:
      "A warm wind carries tiny embers through the peaks. Brave the stone bridges to reach the volcanic den.",
    dragon: "Emberhorn drake",
    boss: "Cindermaw",
    previewCleared: 0,
    x: 52,
    y: 54,
    challenges: [
      "Warmstone trail",
      "Ember meadow",
      "Basalt crossing",
      "The cinder sentinel",
      "Amber crystal pass",
      "Ashwing ridge",
      "The glowing gorge",
      "Keeper of the caldera",
      "Heart of the volcano",
      "Cindermaw’s den",
    ],
  },
  {
    id: "light",
    name: "Dawnspire Sanctuary",
    element: "Light",
    color: "#d5ad38",
    description:
      "Golden bridges weave between the clouds. A radiant dragon watches over the first light of morning.",
    dragon: "Suncrest drake",
    boss: "Solara",
    previewCleared: 0,
    x: 81,
    y: 31,
    challenges: [
      "Cloudstep arrival",
      "Golden gardens",
      "The luminous bridge",
      "Sentinel of dawn",
      "Crystal sun terrace",
      "A sky full of wings",
      "The ivory ascent",
      "Keeper of the halo",
      "At the gates of sunrise",
      "Solara’s sanctuary",
    ],
  },
  {
    id: "dark",
    name: "Moonveil Hollow",
    element: "Dark",
    color: "#a279da",
    description:
      "Follow glowing mushrooms beneath a violet moon. Something magnificent stirs inside the crescent cavern.",
    dragon: "Moonshade drake",
    boss: "Nyxwing",
    previewCleared: 0,
    x: 83,
    y: 76,
    challenges: [
      "Twilight footprints",
      "The glowing grove",
      "Moonmirror crossing",
      "The dusk guardian",
      "Violet crystal trail",
      "Whispers in the hollow",
      "Crescent bridge",
      "Keeper of the eclipse",
      "Beneath the silver moon",
      "Nyxwing’s lair",
    ],
  },
];
export const regionOpen = (index: number) =>
  index === 0 || realms[index - 1].previewCleared === 10;
export function challengeStatus(
  realm: number,
  stage: number,
): "cleared" | "next" | "locked" {
  if (!regionOpen(realm)) return "locked";
  return stage < realms[realm].previewCleared
    ? "cleared"
    : stage === realms[realm].previewCleared
      ? "next"
      : "locked";
}
export const challengeKind = (stage: number) =>
  stage === 9 ? "Boss" : stage === 3 || stage === 7 ? "Elite" : "Challenge";
