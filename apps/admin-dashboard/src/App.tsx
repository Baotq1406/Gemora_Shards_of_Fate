import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  formatDateTime,
  initialBattles,
  initialHeroes,
  initialPlayers,
  initialStages,
  pageMeta,
} from "./data";
import type {
  Battle,
  BattleResult,
  Hero,
  PageId,
  Player,
  PlayerStatus,
  PreviewState,
  Stage,
} from "./data";

type PanelState =
  | { kind: "player"; item: Player }
  | { kind: "hero"; item: Hero }
  | { kind: "stage"; item: Stage }
  | { kind: "battle"; item: Battle };

const navigation = Object.entries(pageMeta) as Array<
  [PageId, (typeof pageMeta)[PageId]]
>;

export function App() {
  const [page, setPage] = useState<PageId>("overview");
  const [previewState, setPreviewState] = useState<PreviewState>("normal");
  const [menuOpen, setMenuOpen] = useState(false);
  const [players, setPlayers] = useState(initialPlayers);
  const [heroes, setHeroes] = useState(initialHeroes);
  const [stages, setStages] = useState(initialStages);
  const [panel, setPanel] = useState<PanelState | null>(null);
  const [confirmPlayer, setConfirmPlayer] = useState<Player | null>(null);
  const [toast, setToast] = useState("");

  const changePage = (next: PageId) => {
    setPage(next);
    setPanel(null);
    setMenuOpen(false);
  };

  const togglePlayerStatus = () => {
    if (!confirmPlayer) return;
    const status: PlayerStatus =
      confirmPlayer.status === "ACTIVE" ? "LOCKED" : "ACTIVE";
    setPlayers((items) =>
      items.map((item) =>
        item.id === confirmPlayer.id ? { ...item, status } : item,
      ),
    );
    setPanel(null);
    setConfirmPlayer(null);
    setToast(
      status === "LOCKED"
        ? "Đã khóa tài khoản mẫu."
        : "Đã mở khóa tài khoản mẫu.",
    );
  };

  const saveHero = (hero: Hero) => {
    setHeroes((items) =>
      items.map((item) => (item.id === hero.id ? hero : item)),
    );
    setPanel(null);
    setToast("Đã lưu thay đổi Hero trong bộ nhớ mẫu.");
  };

  const saveStage = (stage: Stage) => {
    setStages((items) =>
      items.map((item) => (item.id === stage.id ? stage : item)),
    );
    setPanel(null);
    setToast("Đã lưu thay đổi Màn chơi trong bộ nhớ mẫu.");
  };

  return (
    <div className="admin-shell">
      <Sidebar
        page={page}
        open={menuOpen}
        onNavigate={changePage}
        onClose={() => setMenuOpen(false)}
      />
      <div className="admin-main">
        <header className="topbar">
          <button
            className="icon-button menu-button"
            type="button"
            aria-label="Mở menu"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </button>
          <div className="page-heading">
            <h1>{pageMeta[page].label}</h1>
            <p>{pageMeta[page].description}</p>
          </div>
          <div className="topbar-actions">
            <label className="preview-picker">
              <span>Trạng thái xem trước</span>
              <select
                value={previewState}
                onChange={(event) =>
                  setPreviewState(event.target.value as PreviewState)
                }
              >
                <option value="normal">Bình thường</option>
                <option value="loading">Đang tải</option>
                <option value="empty">Trống</option>
                <option value="error">Lỗi</option>
              </select>
            </label>
            <span className="demo-badge">Dữ liệu mẫu</span>
            <div className="admin-profile" aria-label="Tài khoản hiện tại">
              <span className="avatar">AD</span>
              <span>
                <strong>Admin demo</strong>
                <small>Prototype</small>
              </span>
            </div>
          </div>
        </header>

        <main className="content">
          <PreviewBoundary
            state={previewState}
            onRetry={() => setPreviewState("normal")}
          >
            {page === "overview" && (
              <OverviewPage
                players={players}
                battles={initialBattles}
                onOpen={(item) => setPanel({ kind: "battle", item })}
              />
            )}
            {page === "players" && (
              <PlayersPage
                players={players}
                onOpen={(item) => setPanel({ kind: "player", item })}
              />
            )}
            {page === "heroes" && (
              <HeroesPage
                heroes={heroes}
                onEdit={(item) => setPanel({ kind: "hero", item })}
              />
            )}
            {page === "stages" && (
              <StagesPage
                stages={stages}
                onEdit={(item) => setPanel({ kind: "stage", item })}
              />
            )}
            {page === "battles" && (
              <BattlesPage
                battles={initialBattles}
                onOpen={(item) => setPanel({ kind: "battle", item })}
              />
            )}
          </PreviewBoundary>
        </main>
      </div>

      {panel && (
        <DetailPanel
          panel={panel}
          onClose={() => setPanel(null)}
          onTogglePlayer={(item) => setConfirmPlayer(item)}
          onSaveHero={saveHero}
          onSaveStage={saveStage}
        />
      )}
      {confirmPlayer && (
        <ConfirmDialog
          title={
            confirmPlayer.status === "ACTIVE"
              ? "Khóa tài khoản mẫu?"
              : "Mở khóa tài khoản mẫu?"
          }
          message={`Thay đổi trạng thái của ${confirmPlayer.username} chỉ được giữ đến khi tải lại trang.`}
          confirmLabel={
            confirmPlayer.status === "ACTIVE" ? "Khóa tài khoản" : "Mở khóa"
          }
          danger={confirmPlayer.status === "ACTIVE"}
          onCancel={() => setConfirmPlayer(null)}
          onConfirm={togglePlayerStatus}
        />
      )}
      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </div>
  );
}

function Sidebar({
  page,
  open,
  onNavigate,
  onClose,
}: {
  page: PageId;
  open: boolean;
  onNavigate: (page: PageId) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={`sidebar-scrim ${open ? "visible" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="admin-brand">
          <span className="brand-symbol">◆</span>
          <span>
            <strong>GEMORA</strong>
            <small>ADMIN CONSOLE</small>
          </span>
        </div>
        <nav aria-label="Điều hướng quản trị">
          {navigation.map(([id, item]) => (
            <button
              key={id}
              className={`nav-item ${page === id ? "active" : ""}`}
              type="button"
              onClick={() => onNavigate(id)}
              aria-current={page === id ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span className="status-dot" />
          Prototype frontend<strong>v0.1</strong>
        </div>
      </aside>
    </>
  );
}

function PreviewBoundary({
  state,
  onRetry,
  children,
}: {
  state: PreviewState;
  onRetry: () => void;
  children: ReactNode;
}) {
  if (state === "loading") return <LoadingState />;
  if (state === "empty")
    return (
      <PageMessage
        icon="◇"
        title="Chưa có dữ liệu"
        description="Không tìm thấy bản ghi cho trang này trong dữ liệu mẫu."
        action="Về trạng thái bình thường"
        onAction={onRetry}
      />
    );
  if (state === "error")
    return (
      <PageMessage
        icon="!"
        title="Không thể tải dữ liệu mẫu"
        description="Đây là trạng thái lỗi dùng để duyệt giao diện. Bạn có thể thử lại ngay."
        action="Thử lại"
        onAction={onRetry}
        tone="error"
      />
    );
  return <>{children}</>;
}

function LoadingState() {
  return (
    <div className="loading-grid" aria-label="Đang tải dữ liệu">
      <div className="skeleton-card wide" />
      <div className="skeleton-card" />
      <div className="skeleton-card" />
      <div className="skeleton-table">
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function PageMessage({
  icon,
  title,
  description,
  action,
  onAction,
  tone = "neutral",
}: {
  icon: string;
  title: string;
  description: string;
  action: string;
  onAction: () => void;
  tone?: "neutral" | "error";
}) {
  return (
    <section className={`page-message ${tone}`}>
      <span className="message-icon">{icon}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <button className="primary-button" type="button" onClick={onAction}>
        {action}
      </button>
    </section>
  );
}

function OverviewPage({
  players,
  battles,
  onOpen,
}: {
  players: Player[];
  battles: Battle[];
  onOpen: (battle: Battle) => void;
}) {
  const [days, setDays] = useState<7 | 30>(7);
  const cutoff = new Date("2026-09-22T23:59:59Z");
  cutoff.setUTCDate(cutoff.getUTCDate() - days);
  const visibleBattles = battles.filter(
    (battle) => new Date(battle.playedAt) >= cutoff,
  );
  const won = visibleBattles.filter((battle) => battle.result === "WON").length;
  const lost = visibleBattles.filter(
    (battle) => battle.result === "LOST",
  ).length;
  return (
    <div className="page-stack">
      <div className="section-toolbar">
        <div>
          <h2>Tổng quan vận hành</h2>
          <p>Số liệu được tính từ cùng bộ fixture trong khoảng đã chọn.</p>
        </div>
        <div className="segmented">
          <button
            type="button"
            className={days === 7 ? "active" : ""}
            onClick={() => setDays(7)}
          >
            7 ngày
          </button>
          <button
            type="button"
            className={days === 30 ? "active" : ""}
            onClick={() => setDays(30)}
          >
            30 ngày
          </button>
        </div>
      </div>
      <div className="stat-grid">
        <StatCard
          label="Tổng người chơi"
          value={players.length.toString()}
          hint={`${players.filter((item) => item.status === "ACTIVE").length} đang hoạt động`}
          icon="♙"
          tone="violet"
        />
        <StatCard
          label="Trận thắng"
          value={won.toString()}
          hint={`${visibleBattles.length ? Math.round((won / visibleBattles.length) * 100) : 0}% số trận`}
          icon="✓"
          tone="green"
        />
        <StatCard
          label="Trận thua"
          value={lost.toString()}
          hint={`${visibleBattles.length} trận trong kỳ`}
          icon="×"
          tone="orange"
        />
      </div>
      <section className="card">
        <div className="card-header">
          <div>
            <h2>Hoạt động gần đây</h2>
            <p>Các trận mới nhất trong khoảng {days} ngày</p>
          </div>
          <span className="record-count">{visibleBattles.length} bản ghi</span>
        </div>
        <BattleTable battles={visibleBattles.slice(0, 6)} onOpen={onOpen} />
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string;
  hint: string;
  icon: string;
  tone: string;
}) {
  return (
    <article className="stat-card">
      <span className={`stat-icon ${tone}`}>{icon}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{hint}</small>
      </div>
    </article>
  );
}

function PlayersPage({
  players,
  onOpen,
}: {
  players: Player[];
  onOpen: (player: Player) => void;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | PlayerStatus>("ALL");
  const filtered = players.filter((player) => {
    const matchesQuery = `${player.username} ${player.email} ${player.id}`
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesQuery && (status === "ALL" || player.status === status);
  });
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Danh sách người chơi</h2>
          <p>Tài khoản và tiến trình trong dữ liệu mẫu</p>
        </div>
        <span className="record-count">{filtered.length} người chơi</span>
      </div>
      <div className="filters">
        <label className="search-field">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm tên, email hoặc ID"
            aria-label="Tìm người chơi"
          />
        </label>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "ALL" | PlayerStatus)
          }
          aria-label="Lọc trạng thái"
        >
          <option value="ALL">Mọi trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="LOCKED">Đã khóa</option>
        </select>
      </div>
      {filtered.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Người chơi</th>
                <th>Level</th>
                <th>Stage cao nhất</th>
                <th>Trạng thái</th>
                <th>Hoạt động cuối</th>
                <th>
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((player) => (
                <tr key={player.id}>
                  <td>
                    <strong>{player.username}</strong>
                    <small>
                      {player.email} · {player.id}
                    </small>
                  </td>
                  <td>{player.level}</td>
                  <td>Stage {player.highestStage}</td>
                  <td>
                    <StatusBadge value={player.status} />
                  </td>
                  <td>{formatDateTime(player.lastActive)}</td>
                  <td>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => onOpen(player)}
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <InlineEmpty />
      )}
    </section>
  );
}

function HeroesPage({
  heroes,
  onEdit,
}: {
  heroes: Hero[];
  onEdit: (hero: Hero) => void;
}) {
  const [query, setQuery] = useState("");
  const [element, setElement] = useState("ALL");
  const filtered = heroes.filter(
    (hero) =>
      hero.name.toLowerCase().includes(query.toLowerCase()) &&
      (element === "ALL" || hero.element === element),
  );
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Nội dung Hero</h2>
          <p>Chỉnh sửa bản mẫu; reload sẽ khôi phục dữ liệu</p>
        </div>
        <span className="record-count">{filtered.length} Hero</span>
      </div>
      <div className="filters">
        <label className="search-field">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm Hero"
            aria-label="Tìm Hero"
          />
        </label>
        <select
          value={element}
          onChange={(event) => setElement(event.target.value)}
          aria-label="Lọc nguyên tố"
        >
          <option value="ALL">Mọi nguyên tố</option>
          {["Fire", "Water", "Nature", "Light", "Dark"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      {filtered.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Hero</th>
                <th>Nguyên tố</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Cập nhật</th>
                <th>
                  <span className="sr-only">Thao tác</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((hero) => (
                <tr key={hero.id}>
                  <td>
                    <strong>{hero.name}</strong>
                    <small>{hero.id}</small>
                  </td>
                  <td>
                    <ElementBadge element={hero.element} />
                  </td>
                  <td>{hero.role}</td>
                  <td>
                    <StatusBadge value={hero.status} />
                  </td>
                  <td>{hero.updatedAt}</td>
                  <td>
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => onEdit(hero)}
                    >
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <InlineEmpty />
      )}
    </section>
  );
}

function StagesPage({
  stages,
  onEdit,
}: {
  stages: Stage[];
  onEdit: (stage: Stage) => void;
}) {
  const [type, setType] = useState("ALL");
  const filtered = stages.filter(
    (stage) => type === "ALL" || stage.type === type,
  );
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Màn chơi Campaign</h2>
          <p>Thứ tự, loại và phần thưởng Gold mẫu</p>
        </div>
        <span className="record-count">{filtered.length} màn</span>
      </div>
      <div className="filters compact">
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          aria-label="Lọc loại màn"
        >
          <option value="ALL">Mọi loại màn</option>
          {["Tutorial", "Normal", "Elite", "Boss"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Thứ tự</th>
              <th>Màn chơi</th>
              <th>Loại</th>
              <th>Gold reward</th>
              <th>Trạng thái</th>
              <th>
                <span className="sr-only">Thao tác</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((stage) => (
              <tr key={stage.id}>
                <td>
                  <span className="order-chip">{stage.order}</span>
                </td>
                <td>
                  <strong>{stage.name}</strong>
                  <small>{stage.id}</small>
                </td>
                <td>{stage.type}</td>
                <td>{stage.goldReward.toLocaleString("vi-VN")}</td>
                <td>
                  <StatusBadge value={stage.status} />
                </td>
                <td>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => onEdit(stage)}
                  >
                    Chỉnh sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BattlesPage({
  battles,
  onOpen,
}: {
  battles: Battle[];
  onOpen: (battle: Battle) => void;
}) {
  const [result, setResult] = useState<"ALL" | BattleResult>("ALL");
  const filtered = battles.filter(
    (battle) => result === "ALL" || battle.result === result,
  );
  return (
    <section className="card">
      <div className="card-header">
        <div>
          <h2>Nhật ký trận đấu</h2>
          <p>Dữ liệu chỉ đọc để theo dõi kết quả mẫu</p>
        </div>
        <span className="record-count">{filtered.length} trận</span>
      </div>
      <div className="filters compact">
        <select
          value={result}
          onChange={(event) =>
            setResult(event.target.value as "ALL" | BattleResult)
          }
          aria-label="Lọc kết quả"
        >
          <option value="ALL">Mọi kết quả</option>
          <option value="WON">Chiến thắng</option>
          <option value="LOST">Thất bại</option>
          <option value="ABANDONED">Đã rời trận</option>
        </select>
      </div>
      <BattleTable battles={filtered} onOpen={onOpen} />
    </section>
  );
}

function BattleTable({
  battles,
  onOpen,
}: {
  battles: Battle[];
  onOpen: (battle: Battle) => void;
}) {
  if (!battles.length) return <InlineEmpty />;
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Trận</th>
            <th>Người chơi</th>
            <th>Stage</th>
            <th>Kết quả</th>
            <th>Số lượt</th>
            <th>Thời gian</th>
            <th>
              <span className="sr-only">Thao tác</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {battles.map((battle) => (
            <tr key={battle.id}>
              <td>
                <strong>{battle.id}</strong>
              </td>
              <td>{battle.player}</td>
              <td>{battle.stage}</td>
              <td>
                <StatusBadge value={battle.result} />
              </td>
              <td>{battle.turns}</td>
              <td>{formatDateTime(battle.playedAt)}</td>
              <td>
                <button
                  className="text-button"
                  type="button"
                  onClick={() => onOpen(battle)}
                >
                  Chi tiết
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InlineEmpty() {
  return (
    <div className="inline-empty">
      <span>⌕</span>
      <strong>Không có kết quả phù hợp</strong>
      <p>Thử thay đổi từ khóa hoặc bộ lọc.</p>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const labels: Record<string, string> = {
    ACTIVE: "Hoạt động",
    LOCKED: "Đã khóa",
    PUBLISHED: "Đã phát hành",
    DRAFT: "Bản nháp",
    WON: "Chiến thắng",
    LOST: "Thất bại",
    ABANDONED: "Đã rời",
  };
  return (
    <span className={`status-badge status-${value.toLowerCase()}`}>
      <i />
      {labels[value] ?? value}
    </span>
  );
}

function ElementBadge({ element }: { element: Hero["element"] }) {
  return (
    <span className={`element-badge element-${element.toLowerCase()}`}>
      {element}
    </span>
  );
}

function DetailPanel({
  panel,
  onClose,
  onTogglePlayer,
  onSaveHero,
  onSaveStage,
}: {
  panel: PanelState;
  onClose: () => void;
  onTogglePlayer: (player: Player) => void;
  onSaveHero: (hero: Hero) => void;
  onSaveStage: (stage: Stage) => void;
}) {
  return (
    <div className="panel-backdrop" role="presentation">
      <aside
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        <div className="panel-header">
          <div>
            <p>Chi tiết mẫu</p>
            <h2 id="panel-title">{panelTitle(panel)}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Đóng panel"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {panel.kind === "player" && (
          <PlayerDetail
            player={panel.item}
            onToggle={() => onTogglePlayer(panel.item)}
          />
        )}
        {panel.kind === "hero" && (
          <HeroEditor
            key={panel.item.id}
            hero={panel.item}
            onCancel={onClose}
            onSave={onSaveHero}
          />
        )}
        {panel.kind === "stage" && (
          <StageEditor
            key={panel.item.id}
            stage={panel.item}
            onCancel={onClose}
            onSave={onSaveStage}
          />
        )}
        {panel.kind === "battle" && <BattleDetail battle={panel.item} />}
      </aside>
    </div>
  );
}

function panelTitle(panel: PanelState): string {
  if (panel.kind === "player") return panel.item.username;
  if (panel.kind === "hero") return panel.item.name;
  if (panel.kind === "stage") return panel.item.name;
  return panel.item.id;
}

function PlayerDetail({
  player,
  onToggle,
}: {
  player: Player;
  onToggle: () => void;
}) {
  return (
    <div className="panel-body">
      <div className="profile-summary">
        <span className="large-avatar">
          {player.username.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <strong>{player.username}</strong>
          <span>{player.email}</span>
          <StatusBadge value={player.status} />
        </div>
      </div>
      <dl className="detail-list">
        <div>
          <dt>Player ID</dt>
          <dd>{player.id}</dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd>{player.level}</dd>
        </div>
        <div>
          <dt>Stage cao nhất</dt>
          <dd>Stage {player.highestStage}</dd>
        </div>
        <div>
          <dt>Hoạt động cuối</dt>
          <dd>{formatDateTime(player.lastActive)}</dd>
        </div>
      </dl>
      <div className="notice">
        Thao tác này chỉ đổi dữ liệu trong bộ nhớ prototype.
      </div>
      <button
        className={
          player.status === "ACTIVE" ? "danger-button" : "primary-button"
        }
        type="button"
        onClick={onToggle}
      >
        {player.status === "ACTIVE"
          ? "Khóa tài khoản mẫu"
          : "Mở khóa tài khoản mẫu"}
      </button>
    </div>
  );
}

function HeroEditor({
  hero,
  onCancel,
  onSave,
}: {
  hero: Hero;
  onCancel: () => void;
  onSave: (hero: Hero) => void;
}) {
  const [draft, setDraft] = useState(hero);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (draft.name.trim())
      onSave({ ...draft, name: draft.name.trim(), updatedAt: "22/09/2026" });
  };
  return (
    <form className="panel-body editor-form" onSubmit={submit}>
      <label>
        Tên Hero
        <input
          required
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </label>
      <label>
        Nguyên tố
        <select
          value={draft.element}
          onChange={(event) =>
            setDraft({
              ...draft,
              element: event.target.value as Hero["element"],
            })
          }
        >
          {["Fire", "Water", "Nature", "Light", "Dark"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Vai trò
        <select
          value={draft.role}
          onChange={(event) =>
            setDraft({ ...draft, role: event.target.value as Hero["role"] })
          }
        >
          {["Striker", "Tank", "Support", "Healer"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Trạng thái
        <select
          value={draft.status}
          onChange={(event) =>
            setDraft({ ...draft, status: event.target.value as Hero["status"] })
          }
        >
          <option value="DRAFT">Bản nháp</option>
          <option value="PUBLISHED">Đã phát hành</option>
        </select>
      </label>
      <div className="notice">
        Đây là form UI mẫu, chưa có quy trình publish hoặc validation từ server.
      </div>
      <div className="form-actions">
        <button className="secondary-action" type="button" onClick={onCancel}>
          Hủy
        </button>
        <button className="primary-button" type="submit">
          Lưu bản mẫu
        </button>
      </div>
    </form>
  );
}

function StageEditor({
  stage,
  onCancel,
  onSave,
}: {
  stage: Stage;
  onCancel: () => void;
  onSave: (stage: Stage) => void;
}) {
  const [draft, setDraft] = useState(stage);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (draft.name.trim() && draft.goldReward >= 0)
      onSave({ ...draft, name: draft.name.trim() });
  };
  return (
    <form className="panel-body editor-form" onSubmit={submit}>
      <label>
        Tên màn chơi
        <input
          required
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </label>
      <label>
        Loại
        <select
          value={draft.type}
          onChange={(event) =>
            setDraft({ ...draft, type: event.target.value as Stage["type"] })
          }
        >
          {["Tutorial", "Normal", "Elite", "Boss"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </label>
      <label>
        Gold reward
        <input
          type="number"
          min="0"
          required
          value={draft.goldReward}
          onChange={(event) =>
            setDraft({ ...draft, goldReward: Number(event.target.value) })
          }
        />
      </label>
      <label>
        Trạng thái
        <select
          value={draft.status}
          onChange={(event) =>
            setDraft({
              ...draft,
              status: event.target.value as Stage["status"],
            })
          }
        >
          <option value="DRAFT">Bản nháp</option>
          <option value="PUBLISHED">Đã phát hành</option>
        </select>
      </label>
      <div className="notice">Dữ liệu thay đổi sẽ mất khi reload trang.</div>
      <div className="form-actions">
        <button className="secondary-action" type="button" onClick={onCancel}>
          Hủy
        </button>
        <button className="primary-button" type="submit">
          Lưu bản mẫu
        </button>
      </div>
    </form>
  );
}

function BattleDetail({ battle }: { battle: Battle }) {
  return (
    <div className="panel-body">
      <div className="result-hero">
        <StatusBadge value={battle.result} />
        <strong>{battle.player}</strong>
        <span>
          {battle.stage} · {battle.turns} lượt
        </span>
      </div>
      <dl className="detail-list">
        <div>
          <dt>Battle ID</dt>
          <dd>{battle.id}</dd>
        </div>
        <div>
          <dt>Người chơi</dt>
          <dd>{battle.player}</dd>
        </div>
        <div>
          <dt>Màn chơi</dt>
          <dd>{battle.stage}</dd>
        </div>
        <div>
          <dt>Thời gian</dt>
          <dd>{formatDateTime(battle.playedAt)}</dd>
        </div>
      </dl>
      <div className="notice">
        Nhật ký trận ở prototype chỉ đọc và không chứa action sequence thật.
      </div>
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  danger: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="dialog-backdrop">
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <span className={`confirm-icon ${danger ? "danger" : "safe"}`}>
          {danger ? "!" : "✓"}
        </span>
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        <div className="form-actions">
          <button className="secondary-action" type="button" onClick={onCancel}>
            Hủy
          </button>
          <button
            className={danger ? "danger-button" : "primary-button"}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="toast" role="status">
      <span>✓</span>
      <p>{message}</p>
      <button type="button" aria-label="Đóng thông báo" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
