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
      status === "LOCKED" ? "Demo account locked." : "Demo account unlocked.",
    );
  };

  const saveHero = (hero: Hero) => {
    setHeroes((items) =>
      items.map((item) => (item.id === hero.id ? hero : item)),
    );
    setPanel(null);
    setToast("Hero changes saved in demo memory.");
  };

  const saveStage = (stage: Stage) => {
    setStages((items) =>
      items.map((item) => (item.id === stage.id ? stage : item)),
    );
    setPanel(null);
    setToast("Stage changes saved in demo memory.");
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
            aria-label="Open menu"
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
              <span>Preview state</span>
              <select
                value={previewState}
                onChange={(event) =>
                  setPreviewState(event.target.value as PreviewState)
                }
              >
                <option value="normal">Normal</option>
                <option value="loading">Loading</option>
                <option value="empty">Empty</option>
                <option value="error">Error</option>
              </select>
            </label>
            <span className="demo-badge">Sample data</span>
            <div className="admin-profile" aria-label="Current account">
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
              ? "Lock demo account?"
              : "Unlock demo account?"
          }
          message={`Status changes for ${confirmPlayer.username} last only until the page is reloaded.`}
          confirmLabel={
            confirmPlayer.status === "ACTIVE" ? "Lock account" : "Unlock"
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
        <nav aria-label="Admin navigation">
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
        title="No data yet"
        description="No sample records were found for this page."
        action="Return to normal view"
        onAction={onRetry}
      />
    );
  if (state === "error")
    return (
      <PageMessage
        icon="!"
        title="Unable to load sample data"
        description="This is an error preview. You can try again now."
        action="Try again"
        onAction={onRetry}
        tone="error"
      />
    );
  return <>{children}</>;
}

function LoadingState() {
  return (
    <div className="loading-grid" aria-label="Loading data">
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
          <h2>Operations overview</h2>
          <p>Metrics use the same sample dataset for the selected period.</p>
        </div>
        <div className="segmented">
          <button
            type="button"
            className={days === 7 ? "active" : ""}
            onClick={() => setDays(7)}
          >
            7 days
          </button>
          <button
            type="button"
            className={days === 30 ? "active" : ""}
            onClick={() => setDays(30)}
          >
            30 days
          </button>
        </div>
      </div>
      <div className="stat-grid">
        <StatCard
          label="Total players"
          value={players.length.toString()}
          hint={`${players.filter((item) => item.status === "ACTIVE").length} active`}
          icon="♙"
          tone="violet"
        />
        <StatCard
          label="Battles won"
          value={won.toString()}
          hint={`${visibleBattles.length ? Math.round((won / visibleBattles.length) * 100) : 0}% of battles`}
          icon="✓"
          tone="green"
        />
        <StatCard
          label="Battles lost"
          value={lost.toString()}
          hint={`${visibleBattles.length} battles in this period`}
          icon="×"
          tone="orange"
        />
      </div>
      <section className="card">
        <div className="card-header">
          <div>
            <h2>Recent activity</h2>
            <p>Latest battles in the last {days} days</p>
          </div>
          <span className="record-count">{visibleBattles.length} records</span>
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
          <h2>Player list</h2>
          <p>Accounts and progress from sample data</p>
        </div>
        <span className="record-count">{filtered.length} players</span>
      </div>
      <div className="filters">
        <label className="search-field">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, or ID"
            aria-label="Search players"
          />
        </label>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "ALL" | PlayerStatus)
          }
          aria-label="Filter by status"
        >
          <option value="ALL">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="LOCKED">Locked</option>
        </select>
      </div>
      {filtered.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Level</th>
                <th>Highest stage</th>
                <th>Status</th>
                <th>Last active</th>
                <th>
                  <span className="sr-only">Actions</span>
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
                      View
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
          <h2>Hero content</h2>
          <p>Edit sample content; reloading restores the data</p>
        </div>
        <span className="record-count">{filtered.length} Hero</span>
      </div>
      <div className="filters">
        <label className="search-field">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search heroes"
            aria-label="Search heroes"
          />
        </label>
        <select
          value={element}
          onChange={(event) => setElement(event.target.value)}
          aria-label="Filter by element"
        >
          <option value="ALL">All elements</option>
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
                <th>Element</th>
                <th>Role</th>
                <th>Status</th>
                <th>Updated</th>
                <th>
                  <span className="sr-only">Actions</span>
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
                      Edit
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
          <h2>Campaign stages</h2>
          <p>Sample stage order, types, and gold rewards</p>
        </div>
        <span className="record-count">{filtered.length} stages</span>
      </div>
      <div className="filters compact">
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          aria-label="Filter by stage type"
        >
          <option value="ALL">All stage types</option>
          {["Tutorial", "Normal", "Elite", "Boss"].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Stage</th>
              <th>Type</th>
              <th>Gold reward</th>
              <th>Status</th>
              <th>
                <span className="sr-only">Actions</span>
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
                <td>{stage.goldReward.toLocaleString("en-US")}</td>
                <td>
                  <StatusBadge value={stage.status} />
                </td>
                <td>
                  <button
                    className="text-button"
                    type="button"
                    onClick={() => onEdit(stage)}
                  >
                    Edit
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
          <h2>Battle log</h2>
          <p>Read-only sample battle results</p>
        </div>
        <span className="record-count">{filtered.length} battles</span>
      </div>
      <div className="filters compact">
        <select
          value={result}
          onChange={(event) =>
            setResult(event.target.value as "ALL" | BattleResult)
          }
          aria-label="Filter by result"
        >
          <option value="ALL">All results</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
          <option value="ABANDONED">Abandoned</option>
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
            <th>Battle</th>
            <th>Player</th>
            <th>Stage</th>
            <th>Result</th>
            <th>Turns</th>
            <th>Time</th>
            <th>
              <span className="sr-only">Actions</span>
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
                  Details
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
      <strong>No matching results</strong>
      <p>Try a different search term or filter.</p>
    </div>
  );
}

function StatusBadge({ value }: { value: string }) {
  const labels: Record<string, string> = {
    ACTIVE: "Active",
    LOCKED: "Locked",
    PUBLISHED: "Published",
    DRAFT: "Draft",
    WON: "Won",
    LOST: "Lost",
    ABANDONED: "Abandoned",
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
            <p>Sample details</p>
            <h2 id="panel-title">{panelTitle(panel)}</h2>
          </div>
          <button
            className="icon-button"
            type="button"
            aria-label="Close panel"
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
          <dt>Highest stage</dt>
          <dd>Stage {player.highestStage}</dd>
        </div>
        <div>
          <dt>Last active</dt>
          <dd>{formatDateTime(player.lastActive)}</dd>
        </div>
      </dl>
      <div className="notice">
        This action only changes data in prototype memory.
      </div>
      <button
        className={
          player.status === "ACTIVE" ? "danger-button" : "primary-button"
        }
        type="button"
        onClick={onToggle}
      >
        {player.status === "ACTIVE"
          ? "Lock demo account"
          : "Unlock demo account"}
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
      onSave({ ...draft, name: draft.name.trim(), updatedAt: "09/22/2026" });
  };
  return (
    <form className="panel-body editor-form" onSubmit={submit}>
      <label>
        Hero name
        <input
          required
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </label>
      <label>
        Element
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
        Role
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
        Status
        <select
          value={draft.status}
          onChange={(event) =>
            setDraft({ ...draft, status: event.target.value as Hero["status"] })
          }
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </label>
      <div className="notice">
        This is a sample form. Server validation and publishing are not
        connected yet.
      </div>
      <div className="form-actions">
        <button className="secondary-action" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Save sample
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
        Stage name
        <input
          required
          value={draft.name}
          onChange={(event) => setDraft({ ...draft, name: event.target.value })}
        />
      </label>
      <label>
        Type
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
        Status
        <select
          value={draft.status}
          onChange={(event) =>
            setDraft({
              ...draft,
              status: event.target.value as Stage["status"],
            })
          }
        >
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </label>
      <div className="notice">
        Changes will be lost when the page is reloaded.
      </div>
      <div className="form-actions">
        <button className="secondary-action" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Save sample
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
          {battle.stage} · {battle.turns} turns
        </span>
      </div>
      <dl className="detail-list">
        <div>
          <dt>Battle ID</dt>
          <dd>{battle.id}</dd>
        </div>
        <div>
          <dt>Player</dt>
          <dd>{battle.player}</dd>
        </div>
        <div>
          <dt>Stage</dt>
          <dd>{battle.stage}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{formatDateTime(battle.playedAt)}</dd>
        </div>
      </dl>
      <div className="notice">
        Prototype battle logs are read-only and do not contain real action
        sequences.
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
            Cancel
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
      <button type="button" aria-label="Dismiss notification" onClick={onClose}>
        ×
      </button>
    </div>
  );
}
