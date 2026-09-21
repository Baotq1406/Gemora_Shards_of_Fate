export type PageId = "overview" | "players" | "heroes" | "stages" | "battles";
export type PreviewState = "normal" | "loading" | "empty" | "error";
export type PlayerStatus = "ACTIVE" | "LOCKED";
export type ContentStatus = "DRAFT" | "PUBLISHED";
export type BattleResult = "WON" | "LOST" | "ABANDONED";

export interface Player {
  id: string;
  username: string;
  email: string;
  level: number;
  highestStage: number;
  status: PlayerStatus;
  lastActive: string;
}

export interface Hero {
  id: string;
  name: string;
  element: "Fire" | "Water" | "Nature" | "Light" | "Dark";
  role: "Striker" | "Tank" | "Support" | "Healer";
  status: ContentStatus;
  updatedAt: string;
}

export interface Stage {
  id: string;
  order: number;
  name: string;
  type: "Normal" | "Elite" | "Boss" | "Tutorial";
  goldReward: number;
  status: ContentStatus;
}

export interface Battle {
  id: string;
  player: string;
  stage: string;
  result: BattleResult;
  turns: number;
  playedAt: string;
}

export const pageMeta: Record<
  PageId,
  { label: string; description: string; icon: string }
> = {
  overview: {
    label: "Tổng quan",
    description: "Tình hình hoạt động gần đây của Gemora",
    icon: "⌂",
  },
  players: {
    label: "Người chơi",
    description: "Tìm kiếm và kiểm tra trạng thái tài khoản",
    icon: "♙",
  },
  heroes: {
    label: "Hero",
    description: "Quản lý nội dung hero ở mức prototype",
    icon: "✦",
  },
  stages: {
    label: "Màn chơi",
    description: "Theo dõi thứ tự, loại và phần thưởng stage",
    icon: "◇",
  },
  battles: {
    label: "Nhật ký trận",
    description: "Kiểm tra kết quả và thông tin trận đấu",
    icon: "▤",
  },
};

export const initialPlayers: Player[] = [
  {
    id: "P-1042",
    username: "MoonSeeker",
    email: "moon@example.test",
    level: 12,
    highestStage: 8,
    status: "ACTIVE",
    lastActive: "2026-09-22T01:42:00Z",
  },
  {
    id: "P-1038",
    username: "EmberKnight",
    email: "ember@example.test",
    level: 9,
    highestStage: 6,
    status: "ACTIVE",
    lastActive: "2026-09-21T16:20:00Z",
  },
  {
    id: "P-1027",
    username: "AquaBloom",
    email: "aqua@example.test",
    level: 7,
    highestStage: 5,
    status: "LOCKED",
    lastActive: "2026-09-20T09:14:00Z",
  },
  {
    id: "P-1019",
    username: "Lumi",
    email: "lumi@example.test",
    level: 5,
    highestStage: 4,
    status: "ACTIVE",
    lastActive: "2026-09-19T12:02:00Z",
  },
  {
    id: "P-1015",
    username: "ThornVale",
    email: "thorn@example.test",
    level: 4,
    highestStage: 3,
    status: "ACTIVE",
    lastActive: "2026-09-18T07:33:00Z",
  },
  {
    id: "P-1008",
    username: "Nova",
    email: "nova@example.test",
    level: 2,
    highestStage: 2,
    status: "ACTIVE",
    lastActive: "2026-09-16T20:48:00Z",
  },
];

export const initialHeroes: Hero[] = [
  {
    id: "H-FIR-01",
    name: "Kael",
    element: "Fire",
    role: "Striker",
    status: "PUBLISHED",
    updatedAt: "21/09/2026",
  },
  {
    id: "H-WAT-01",
    name: "Mira",
    element: "Water",
    role: "Healer",
    status: "PUBLISHED",
    updatedAt: "21/09/2026",
  },
  {
    id: "H-NAT-01",
    name: "Sylas",
    element: "Nature",
    role: "Tank",
    status: "PUBLISHED",
    updatedAt: "20/09/2026",
  },
  {
    id: "H-LIG-01",
    name: "Aurelia",
    element: "Light",
    role: "Support",
    status: "DRAFT",
    updatedAt: "22/09/2026",
  },
  {
    id: "H-DAR-01",
    name: "Noctis",
    element: "Dark",
    role: "Striker",
    status: "DRAFT",
    updatedAt: "22/09/2026",
  },
  {
    id: "H-FIR-02",
    name: "Brann",
    element: "Fire",
    role: "Tank",
    status: "DRAFT",
    updatedAt: "19/09/2026",
  },
];

export const initialStages: Stage[] = [
  {
    id: "ST-01",
    order: 1,
    name: "Những mảnh vỡ đầu tiên",
    type: "Tutorial",
    goldReward: 100,
    status: "PUBLISHED",
  },
  {
    id: "ST-02",
    order: 2,
    name: "Lối mòn sương bạc",
    type: "Normal",
    goldReward: 140,
    status: "PUBLISHED",
  },
  {
    id: "ST-03",
    order: 3,
    name: "Khu rừng thức giấc",
    type: "Normal",
    goldReward: 180,
    status: "PUBLISHED",
  },
  {
    id: "ST-04",
    order: 4,
    name: "Canh gác cổ thụ",
    type: "Elite",
    goldReward: 260,
    status: "DRAFT",
  },
  {
    id: "ST-05",
    order: 5,
    name: "Trái tim hư không",
    type: "Boss",
    goldReward: 500,
    status: "DRAFT",
  },
];

export const initialBattles: Battle[] = [
  {
    id: "B-9048",
    player: "MoonSeeker",
    stage: "ST-05",
    result: "WON",
    turns: 14,
    playedAt: "2026-09-22T01:34:00Z",
  },
  {
    id: "B-9047",
    player: "EmberKnight",
    stage: "ST-04",
    result: "LOST",
    turns: 20,
    playedAt: "2026-09-21T16:11:00Z",
  },
  {
    id: "B-9046",
    player: "Lumi",
    stage: "ST-03",
    result: "WON",
    turns: 10,
    playedAt: "2026-09-21T12:26:00Z",
  },
  {
    id: "B-9045",
    player: "AquaBloom",
    stage: "ST-05",
    result: "ABANDONED",
    turns: 6,
    playedAt: "2026-09-20T09:02:00Z",
  },
  {
    id: "B-9044",
    player: "ThornVale",
    stage: "ST-03",
    result: "WON",
    turns: 13,
    playedAt: "2026-09-19T18:44:00Z",
  },
  {
    id: "B-9043",
    player: "Nova",
    stage: "ST-02",
    result: "LOST",
    turns: 20,
    playedAt: "2026-09-18T20:45:00Z",
  },
  {
    id: "B-9039",
    player: "MoonSeeker",
    stage: "ST-04",
    result: "WON",
    turns: 12,
    playedAt: "2026-09-14T05:12:00Z",
  },
  {
    id: "B-9028",
    player: "EmberKnight",
    stage: "ST-03",
    result: "WON",
    turns: 11,
    playedAt: "2026-09-03T08:25:00Z",
  },
];

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
