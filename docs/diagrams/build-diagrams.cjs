// Regenerate with Node.js, @viz-js/viz and sharp available via NODE_PATH.
const fs = require('node:fs');
const path = require('node:path');
const { instance } = require('@viz-js/viz');
const sharp = require('sharp');
const out = __dirname;
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const quote = s => JSON.stringify(s);
const diagrams = [];
function graph(id, title, subtitle, body, notes, erd = false) {
  const dot = `digraph Gemora {
graph [bgcolor="white", pad="0.35", nodesep="0.5", ranksep="0.7", splines=polyline, rankdir=TB, fontname="Arial", fontsize=17, color="black"];
node [shape=box, style=filled, fillcolor="white", color="black", fontcolor="black", fontname="Arial", fontsize=17, penwidth=1.4, margin="0.18,0.12"];
edge [color="black", fontcolor="black", fontname="Arial", fontsize=14, penwidth=1.25, arrowsize=0.7${erd ? ', arrowhead=none' : ''}];
${body}
}`;
  diagrams.push({ id, title, subtitle, dot, notes, erd });
}
function entity(id, name, fields) {
  return `${id} [shape=plain label=<<TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" CELLPADDING="8" COLOR="black" BGCOLOR="white"><TR><TD ALIGN="LEFT" BORDER="1" SIDES="B"><FONT POINT-SIZE="17"><B>${esc(name)}</B></FONT></TD></TR>${fields.map(f => `<TR><TD ALIGN="LEFT"><FONT POINT-SIZE="14">${esc(f)}</FONT></TD></TR>`).join('')}</TABLE>>];`;
}
const n = (id, text, extra = '') => `${id} [label=${quote(text)} ${extra}];`;
const rel = (a, b, label) => `${a} -> ${b} [label=${quote(label)}];`;

graph('01-system-architecture', 'Kiến trúc tổng thể', 'Client trình bày • Backend quyết định • PostgreSQL lưu dữ liệu', `
${n('game', 'GAME CLIENT\nVite + TypeScript + PixiJS\nInput • HUD • animation')}
${n('admin', 'ADMIN DASHBOARD\nReact + TypeScript\nBảng • form • publish')}
{rank=same; game; admin;}
${n('api', 'GAME SERVER — NestJS\nAuth / Profile / Hero / Team / Stage\nBattle / Reward / Inventory / Admin')}
${n('core', 'GAME-CORE\nBoard • combat • AI • seeded RNG\nLogic thuần, không truy cập DB')}
${n('prisma', 'PRISMA\nTruy vấn • transaction\nSchema + migrations')}
${n('db', 'POSTGRESQL\nTài khoản • hero • tiến trình\nBattle snapshot • action • ledger', 'shape=cylinder')}
${n('types', 'SHARED-TYPES\nDTO / action / event công khai')}
${n('assets', 'STATIC ASSETS\nẢnh • âm thanh • atlas')}
game -> api [label="HTTPS / REST", dir=both]; admin -> api [label="HTTPS / Admin API", dir=both];
api -> core [label="Tính kết quả", dir=both]; api -> prisma [label="Đọc / ghi", dir=both]; prisma -> db [label="SQL", dir=both];
{rank=same; core; prisma;}
{rank=same; types; assets;}
types -> game [style=dashed]; types -> api [style=dashed, constraint=false]; types -> admin [style=dashed];
assets -> game [style=dashed];
`, ['Mũi tên hai chiều: trao đổi dữ liệu. Nét đứt: phụ thuộc hỗ trợ.', 'MVP PvE dùng REST. Game client và Admin không kết nối trực tiếp database.', 'Prisma nằm ở backend; game-core không chứa HTTP, ORM hay renderer.']);

graph('02-erd-player', 'ERD — Tài khoản, hero và đội hình', 'Mỗi người chơi có một profile, một đội MVP và một kho', `
${entity('u','User',['PK id','UQ normalizedEmail','passwordHash / role / status'])}
${entity('session','RefreshSession',['PK id · FK userId','tokenHash / expiresAt','revokedAt / tokenFamily'])}
${entity('p','PlayerProfile',['PK id · FK UQ userId','UQ username','level / exp / gold'])}
${entity('hero','PlayerHero',['PK id · FK playerId','FK heroCode','level / exp / acquiredAt'])}
${entity('catalog','HeroCatalog',['PK code','Định danh hero ổn định'])}
${entity('team','Team',['PK id · FK UQ playerId','version'])}
${entity('member','TeamMember',['PK (teamId, slot)','FK teamId / playerHeroId','isLeader'])}
${entity('inv','Inventory',['PK id · FK UQ playerId'])}
${entity('stack','InventoryItem',['PK (inventoryId, itemDefinitionId)','FK inventoryId / itemDefinitionId','quantity ≥ 0'])}
${entity('item','ItemDefinition',['PK id · UQ code','name / description'])}
u -> session [label="1 : 0..N"]; u -> p [label="1 : 1"];
p -> hero [label="1 : 0..N"]; p -> team [label="1 : 1"]; p -> inv [label="1 : 1"];
catalog -> hero [label="1 : 0..N"]; team -> member [label="1 : 3 khi lưu đội"];
hero -> member [label="1 : 0..1 trong MVP"]; inv -> stack [label="1 : 0..N"]; item -> stack [label="1 : 0..N"];
{rank=same; u; catalog; item;}
{rank=same; hero; team; inv;}
`, ['PK: khóa chính; FK: khóa ngoại; UQ: duy nhất. 1 : 0..N là một bản ghi có thể có nhiều bản ghi con.', 'Quan hệ 1:1 là trạng thái nghiệp vụ sau khởi tạo; backend tạo User/Profile/Inventory/Team trong transaction. Đội được lưu hợp lệ phải có đúng 3 hero cùng chủ và một leader.', 'UQ: PlayerHero(playerId, heroCode); TeamMember(teamId, playerHeroId). Số 3 và điều kiện cùng chủ cần kiểm tra ở backend.', 'HeroCatalog giữ định danh qua các phiên bản. HP/energy đang dùng thuộc Battle, không thuộc PlayerHero.'], true);

graph('03-erd-content', 'ERD — Nội dung game có phiên bản', 'Định danh ổn định cho tiến trình • Bản phát hành cố định cho từng trận', `
${entity('r','ContentRelease',['PK id · UQ version','DRAFT / PUBLISHED / ARCHIVED','publishedAt'])}
${entity('hd','HeroDefinition',['PK id · FK releaseId','FK heroCode → HeroCatalog','element / role / stats / growth'])}
${entity('skill','SkillDefinition',['PK id · FK releaseId','code / cost / cooldown','target / effect JSONB'])}
${entity('hs','HeroSkill',['PK (heroDefinitionId, skillId)','FK heroDefinitionId / skillId'])}
${entity('world','World',['PK id','name / order'])}
${entity('chapter','Chapter',['PK id · FK worldId','name / order'])}
${entity('stage','Stage',['PK id · FK chapterId','code / order ổn định'])}
${entity('sv','StageVersion',['PK id · FK stageId / releaseId','prerequisites / turnLimit'])}
${entity('enemy','EnemyDefinition',['PK id · FK releaseId','code / stats / AI / skills'])}
${entity('se','StageEnemy',['PK (stageVersionId, slot)','FK stageVersionId / enemyId'])}
${entity('reward','RewardDefinition',['PK id · FK stageVersionId','CLEAR / FIRST_CLEAR','bundle: Gold / EXP / item / hero'])}
${entity('balance','BalanceConfig',['PK id · FK UQ releaseId','upgradeCosts / combatConfig'])}
r -> hd [label="1 : 0..N"]; r -> skill [label="1 : 0..N"]; r -> sv [label="1 : 0..N"]; r -> enemy [label="1 : 0..N"]; r -> balance [label="1 : 1 khi publish"];
world -> chapter [label="1 : 0..N"]; chapter -> stage [label="1 : 0..N"]; stage -> sv [label="1 : 0..N"];
hd -> hs [label="1 : 0..N"]; skill -> hs [label="1 : 0..N"];
sv -> se [label="1 : 0..N"]; enemy -> se [label="1 : 0..N"]; sv -> reward [label="1 : 0..N"];
{rank=same; hd; skill; sv; enemy; balance;}
`, ['UQ: (releaseId, heroCode), (releaseId, skill code), (releaseId, enemy code), (releaseId, stageId).', 'Mũi nối thể hiện quan hệ cấu trúc. Khi publish cần kiểm tra đủ hero/skill/enemy/reward, tham chiếu cùng release và prerequisite không có vòng lặp.', 'Reward bundle là JSONB có schema; server kiểm tra item/hero code. RewardDefinition kế thừa release qua StageVersion.', 'Nội dung đã publish không sửa trực tiếp. Trận mới chụp snapshot; thay nội dung không sửa trận đang chạy.'], true);

graph('04-erd-battle', 'ERD — Trận đấu, tiến trình và phần thưởng', 'Lưu từng hành động • Cấp thưởng một lần • Giữ lịch sử biến động', `
${entity('p','PlayerProfile',['PK id','gold / level / exp'])}
${entity('stage','Stage',['PK id','Định danh màn ổn định'])}
${entity('release','ContentRelease',['PK id','Nội dung đã publish'])}
${entity('b','Battle',['PK id · FK playerId / stageId','FK contentReleaseId','status / sequence / engineVersion','initialSnapshot / currentState JSONB','seed / rngState riêng tư'])}
${entity('progress','PlayerStageProgress',['PK (playerId, stageId)','FK playerId / stageId','bestStars / clearCount','firstClearGrantedAt'])}
${entity('action','BattleAction',['PK id · FK battleId','sequence / clientActionId','requestHash / payload','storedResponse / stateHash'])}
${entity('grant','RewardGrant',['PK id · FK battleId / playerId','UQ grantKey','rewardBundle / createdAt'])}
${entity('ledger','CurrencyLedger',['PK id · FK playerId','operationId / reason','FK battleId (có thể trống)','delta / balanceAfter'])}
${entity('receipt','OperationReceipt',['PK id · FK playerId','operationType / requestId','requestHash / storedResponse'])}
p -> b [label="1 : 0..N"]; stage -> b [label="1 : 0..N"]; release -> b [label="1 : 0..N"];
p -> progress [label="1 : 0..N"]; stage -> progress [label="1 : 0..N"];
b -> action [label="1 : 0..N"]; b -> grant [label="1 : 0..N"]; b -> ledger [label="0..1 : 0..N"];
p -> receipt [label="1 : 0..N"];
{rank=same; p; stage; release;}
{rank=same; b; progress; receipt;}
`, ['FK playerId của RewardGrant/CurrencyLedger được ghi trong bảng; lược bớt đường nối về Profile để dễ đọc. Profile có 0..N grant và ledger.', 'BattleAction: UQ(battleId, clientActionId) và UQ(battleId, sequence). OperationReceipt: UQ(playerId, operationType, requestId).', 'grantKey thưởng thường gắn battleId; first-clear gắn playerId + stageId. Mỗi player có tối đa một Battle CREATED/ACTIVE.', 'AdminAuditLog (phụ trợ, không vẽ): id, actorId → User, action, target, before/after, requestId, createdAt. Google AuthIdentity ngoài phạm vi MVP này.'], true);

graph('05-player-game-flow', 'Luồng chơi tổng thể', 'Vòng chơi MVP: chọn đội → vượt màn → nhận thưởng → nâng hero', `
${n('boot','Mở game\nTải tài nguyên + kiểm tra phiên','shape=oval')}
${n('auth','Phiên hợp lệ?','shape=diamond')}
${n('login','Đăng nhập / Đăng ký\nTài khoản mới nhận roster khởi đầu')}
${n('home','HOME\nProfile • Gold • tiến trình')}
${n('team','Hero / Đội hình\nChọn 3 hero + 1 leader')}
${n('campaign','Campaign\nChọn màn đã mở')}
${n('resume','Tiếp tục trận đang dở\nTải state đã lưu')}
${n('start','Server kiểm tra đội + màn\nTạo battle và snapshot')}
${n('battle','BATTLE\nSkill → swap → combat → enemy')}
${n('result','Kết quả?','shape=diamond')}
${n('win','WON\nServer cấp thưởng + cập nhật sao/mở màn')}
${n('loss','LOST / ABANDONED\nKhông nhận thưởng trong MVP')}
${n('screen','RESULT\nHiện kết quả đã chốt')}
${n('upgrade','Kho / Nâng hero\nXem giá → xác nhận → cập nhật')}
boot -> auth; auth -> home [label="Có"]; auth -> login [label="Không"]; login -> home [label="Xác thực thành công"];
home -> team; team -> campaign [label="Lưu đội hợp lệ"]; home -> campaign [label="Dùng đội đã lưu"]; home -> resume [label="Có trận đang dở"];
campaign -> start; start -> battle [label="Hợp lệ"]; start -> campaign [label="Chưa đủ điều kiện", constraint=false]; resume -> battle;
battle -> result; result -> win [label="Thắng"]; result -> loss [label="Thua / bỏ trận"]; win -> screen; loss -> screen;
screen -> upgrade [label="Có tài nguyên"]; screen -> home [label="Về Home", constraint=false]; upgrade -> home [label="Chuẩn bị trận tiếp theo", constraint=false];
`, ['Đội/màn không hợp lệ: báo lỗi và giữ nguyên dữ liệu. Đăng nhập thất bại: ở lại form để thử lại.', 'Mất mạng hoặc tải lại trang không đồng nghĩa bỏ trận. Abandon chỉ xảy ra khi người chơi xác nhận.', 'Thưởng được server cấp khi chốt WON. Màn Result chỉ đọc kết quả, không cấp thưởng lần nữa.']);

graph('06-battle-turn-flow', 'Một lượt chiến đấu PvE', 'Server tính luật • Client phát animation từ event trả về', `
${n('begin','Bắt đầu player turn\nPLAYER_SKILL: giảm cooldown','shape=oval')}
${n('skills','Chọn focus / dùng 0–3 skill\nTối đa một lần mỗi hero sống')}
${n('skillwin','Địch đã bị hạ hết?','shape=diamond')}
${n('swap','PLAYER_SWAP\nChọn hai gem kề nhau')}
${n('valid','Swap hợp lệ?','shape=diamond')}
${n('resolve','RESOLVE\nMatch → special → gravity/refill\nCascade → Resonance → energy')}
${n('attack','Hero còn sống basic attack\nTheo Speed, bỏ qua target đã chết')}
${n('woncheck','Toàn bộ địch hết HP?','shape=diamond')}
${n('enemy','ENEMY\nĐịch sống hành động theo Speed')}
${n('tick','Tick status\nKiểm tra điều kiện kết thúc')}
${n('terminal','Có kết quả terminal?','shape=diamond')}
${n('next','Sang player turn kế tiếp')}
${n('won','WON\nChốt thưởng một lần','shape=oval')}
${n('end','WON / LOST\nChốt theo kết quả engine','shape=oval')}
begin -> skills; skills -> skillwin; skillwin -> won [label="Có"]; skillwin -> swap [label="Không / bỏ qua skill"];
swap -> valid; valid -> swap [label="Không: không tiêu lượt", constraint=false]; valid -> resolve [label="Có"];
resolve -> attack; attack -> woncheck; woncheck -> won [label="Có"]; woncheck -> enemy [label="Không"];
enemy -> tick; tick -> terminal; terminal -> end [label="Có"]; terminal -> next [label="Không"]; next -> begin [label="Lặp", constraint=false];
`, ['Từ chối action sai phase, hero chết, thiếu energy, còn cooldown hoặc target sai; action lỗi không đổi state.', 'Kiểm tra terminal ngay khi effect có thể kết thúc trận; không buộc swap hay cho địch đã chết phản công. Mũi skill → WON diễn đạt quy tắc này.', 'Hết HP đội hoặc chạm giới hạn lượt → LOST; địch chết do status có thể → WON. Cần chốt thứ tự ưu tiên nếu hai phe cùng chết trong một tick.', 'Vượt safety cap cascade: báo lỗi và rollback action, không cấp thưởng. Bỏ trận có xác nhận → ABANDONED (xem sơ đồ trạng thái).']);

graph('08-battle-state', 'Vòng đời một trận đấu', 'Kết quả terminal không nhận thêm hành động gameplay', `
${n('request','Yêu cầu bắt đầu\nAccount + đội + stage hợp lệ','shape=oval')}
${n('created','CREATED\nGhi snapshot / content / engine version')}
${n('active','ACTIVE\nState + sequence + action log')}
${n('won','WON\nThắng, cấp thưởng','shape=doublecircle')}
${n('lost','LOST\nThua, không thưởng','shape=doublecircle')}
${n('abandoned','ABANDONED\nBỏ trận, không thưởng','shape=doublecircle')}
request -> created; created -> active [label="Khởi tạo thành công"];
active -> active [label="Action hợp lệ → sequence + 1"];
active -> won [label="Hạ toàn bộ địch"]; active -> lost [label="Hết HP đội / giới hạn lượt"]; active -> abandoned [label="Xác nhận bỏ trận"];
{rank=same; won; lost; abandoned;}
`, ['Tạo và kích hoạt có thể nằm trong cùng transaction; lỗi khởi tạo rollback, không để CREATED mồ côi.', 'Tải lại hoặc mất mạng: vẫn ACTIVE; resume từ state đã commit. Action sai không tạo chuyển trạng thái.', 'Trận kết thúc chỉ đọc result/replay. Bấm chơi lại tạo battleId mới; không đưa WON/LOST về ACTIVE.', 'Tối đa một Battle CREATED/ACTIVE trên mỗi player; chống start trùng bằng requestId và ràng buộc database.']);

graph('09-hero-upgrade-flow', 'Luồng nâng hero và bảo vệ tài nguyên', 'Một yêu cầu → một lần nâng → một kết quả đã lưu', `
${n('ui','Client xem giá và chỉ số mới\nNgười chơi xác nhận nâng','shape=oval')}
${n('request','Gửi heroId + requestId\nexpectedLevel / quoteVersion')}
${n('auth','Server xác thực + ownership\nĐọc receipt theo requestId')}
${n('retry','Đã xử lý cùng yêu cầu?','shape=diamond')}
${n('old','Trả kết quả đã lưu\nCùng ID khác payload: báo lỗi')}
subgraph cluster_tx { label="MỘT DATABASE TRANSACTION"; color=black; style=dashed;
${n('lock','Khóa Profile → Hero → Item\nKiểm tra lại receipt')}
${n('again','Receipt đã có sau khi khóa?','shape=diamond')}
${n('check','Đủ tài nguyên, đúng giá/level\nvà chưa chạm cap?','shape=diamond')}
${n('change','Trừ Gold / material có điều kiện\nTăng level hero')}
${n('persist','Ghi CurrencyLedger + OperationReceipt')}
${n('commit','COMMIT')}
lock -> again; again -> check [label="Chưa"]; check -> change [label="Có"]; change -> persist; persist -> commit;
}
${n('fail','ROLLBACK / trả lỗi\nGiữ nguyên level và tài nguyên')}
${n('done','Client cập nhật hero + Gold + kho\nTrận sau dùng chỉ số mới','shape=oval')}
ui -> request; request -> auth; auth -> retry; retry -> old [label="Có"]; retry -> lock [label="Chưa"];
again -> old [label="Có: kết thúc transaction đọc"];
check -> fail [label="Không"]; persist -> fail [label="Lỗi ghi", style=dashed]; commit -> done; old -> done [label="Nếu payload khớp"];
`, ['Nếu mất response sau commit, client gửi lại cùng requestId; không tạo ID mới cho lần retry.', 'Receipt kiểm tra lại dưới khóa để hai request trùng đồng thời không nâng hai lần; nếu tìm thấy thì trả kết quả cũ.', 'Expected level/quote version đã đổi: yêu cầu xác nhận lại. Quyền sở hữu sai hoặc auth lỗi: dừng trước transaction.', 'Nâng hero không sửa snapshot của trận đã bắt đầu. Luồng này là thiết kế, chưa phải API đã triển khai.']);

// Sequence diagram: explicit coordinates keep lifelines and labels predictable.
function sequence() {
  const width=1500, height=1150, xs=[150,500,880,1270];
  const parts=[`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="white"/><defs><marker id="arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto"><path d="M0,0 L10,4 L0,8" fill="black"/></marker></defs><g font-family="Arial, sans-serif" fill="black" stroke="none">`];
  ['GAME CLIENT','BACKEND API','GAME-CORE','POSTGRESQL'].forEach((s,i)=>parts.push(`<rect x="${xs[i]-120}" y="25" width="240" height="55" fill="white" stroke="black" stroke-width="1.6"/><text x="${xs[i]}" y="59" text-anchor="middle" font-size="19" font-weight="bold">${s}</text><line x1="${xs[i]}" x2="${xs[i]}" y1="80" y2="1105" stroke="black" stroke-dasharray="7 7"/>`));
  parts.push('<rect x="355" y="260" width="1040" height="615" fill="none" stroke="black" stroke-width="1.5"/><rect x="356" y="261" width="610" height="32" fill="white"/><text x="370" y="284" font-size="17" font-weight="bold">TRANSACTION — state, action và reward cùng commit</text>');
  function arrow(from,to,y,label,dashed=false){const a=xs[from],b=xs[to],w=label.length*8.8;parts.push(`<line x1="${a}" y1="${y}" x2="${b}" y2="${y}" stroke="black" stroke-width="1.5" ${dashed?'stroke-dasharray="7 5"':''} marker-end="url(#arrow)"/><rect x="${(a+b-w)/2}" y="${y-33}" width="${w}" height="26" fill="white"/><text x="${(a+b)/2}" y="${y-13}" text-anchor="middle" font-size="17">${esc(label)}</text>`);}
  function note(x,y,w,lines){parts.push(`<rect x="${x}" y="${y}" width="${w}" height="${lines.length*25+22}" fill="white" stroke="black"/><text x="${x+12}" y="${y+27}" font-size="17">${lines.map((s,i)=>`<tspan x="${x+12}" dy="${i?25:0}">${esc(s)}</tspan>`).join('')}</text>`);}
  arrow(0,1,145,'1. action + clientActionId + expectedSequence');
  note(380,171,325,['2. Auth + ownership + format','Chỉ xử lý action của chính mình']);
  arrow(1,3,337,'3. Khóa Battle; kiểm tra actionId / requestHash / sequence');
  arrow(3,1,405,'4. State + snapshot + RNG nội bộ',true);
  arrow(1,2,475,'5. validate + reduceBattle');
  arrow(2,1,542,'6. State mới + events + RNG',true);
  arrow(1,3,611,'7. Lưu state, sequence và BattleAction');
  arrow(1,3,700,'8. Nếu WON: grant → Gold/item/EXP → progress + ledger');
  arrow(1,3,775,'9. COMMIT');
  arrow(3,1,839,'10. Xác nhận commit',true);
  arrow(1,0,950,'11. Events + public state + sequence',true);
  note(28,982,320,['12. Animation → đồng bộ state','Mở input khi phase cho phép']);
  note(610,950,790,['Nhánh khác: ID cũ + payload khớp → trả response đã lưu.','Sequence sai → 409; client tải lại state. Lỗi ghi → rollback.','Timeout → retry cùng ID. Seed/RNG nội bộ không trả ra client.']);
  parts.push('</g></svg>');
  return {id:'07-action-sequence',title:'Trao đổi khi người chơi thực hiện một hành động',subtitle:'Gửi ý định → tính kết quả → lưu nguyên tử → phát animation',svg:parts.join(''),notes:['Auth và ownership luôn được kiểm tra trước khi trả lại response của action cũ.', 'Transaction không gọi dịch vụ mạng ngoài. Kiểm soát cạnh tranh bằng khóa hoặc cập nhật có điều kiện và unique constraints.', 'First-clear dùng khóa player + stage; clear thường dùng battle. Không cấp thưởng trong GET result.']};
}
diagrams.push(sequence());
diagrams.sort((a,b)=>a.id.localeCompare(b.id));

function writeIndividualPages(diagrams, html) {
  const head = html.slice(0, html.indexOf('<body>'));
  const footer = html.slice(html.indexOf('<footer>'));
  const sections = [...html.matchAll(/<section id="([^"]+)">[\s\S]*?<\/section>/g)];
  const byId = new Map(sections.map(match => [match[1], match[0]]));
  for (const [i, d] of diagrams.entries()) {
    const section = byId.get(d.id);
    if (!section) throw new Error(`Missing diagram section: ${d.id}`);
    const previous = diagrams[i - 1];
    const next = diagrams[i + 1];
    const navigation = `<nav aria-label="Chuyển sơ đồ"><a href="index.html">Danh sách sơ đồ</a>${previous ? `<a href="${previous.id}.html">← Sơ đồ trước</a>` : ''}${next ? `<a href="${next.id}.html">Sơ đồ tiếp theo →</a>` : ''}</nav>`;
    const pageHead = head.replace(/<title>.*?<\/title>/, `<title>${esc(d.title)} — Gemora</title>`);
    const page = `${pageHead}<body><header><div class="number">GEMORA / SƠ ĐỒ ${i + 1} TRÊN ${diagrams.length}</div><p>Thiết kế MVP đề xuất · Nền trắng, chữ và đường nối đen</p>${navigation}</header><main>${section}${navigation}</main>${footer}`;
    fs.writeFileSync(path.join(out, d.id + '.html'), page);
  }
  const list = diagrams.map(d => `<li style="margin:0 0 22px"><a href="${d.id}.html"><strong>${esc(d.title)}</strong></a><p>${esc(d.subtitle)}</p><a href="${d.id}.svg">SVG</a> · <a href="${d.id}.png">PNG</a></li>`).join('');
  const index = `${head}<body><header><div class="number">GEMORA / SHARDS OF FATE</div><h1>Danh sách sơ đồ</h1><p>Mỗi sơ đồ nằm trong một trang riêng. Chọn một mục để xem; dùng nút trước/tiếp theo để chuyển.</p><p>Thiết kế MVP đề xuất, chưa phải backend đã triển khai.</p></header><main><ol>${list}</ol></main>${footer}`;
  fs.writeFileSync(path.join(out, 'index.html'), index);
}

async function main(){
  const viz=await instance();
  for(const d of diagrams){
    const svg=d.svg || viz.renderString(d.dot,{format:'svg',engine:'dot'});
    fs.writeFileSync(path.join(out,d.id+'.svg'),svg);
    if(d.dot) fs.writeFileSync(path.join(out,d.id+'.dot'),d.dot+'\n');
    await sharp(Buffer.from(svg),{density:170}).resize({width:2200,withoutEnlargement:true}).flatten({background:'#ffffff'}).png().toFile(path.join(out,d.id+'.png'));
  }
  const html=`<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gemora — Sơ đồ thiết kế MVP</title><style>
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#fff;color:#000;font:16px/1.65 Arial,sans-serif}header,main,footer{max-width:1500px;margin:auto;padding:32px}header{border-bottom:2px solid #000}h1{font-size:34px;margin:8px 0}h2{font-size:25px;line-height:1.35;margin:0 0 6px}p{margin:8px 0}a{color:#000;text-underline-offset:4px}nav{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}nav a,.tools a,button{border:1px solid #000;padding:7px 12px;background:#fff;color:#000;text-decoration:none;font:inherit;cursor:pointer}a:hover,button:hover{outline:1px solid #000}section{padding:34px 0 42px;border-bottom:1px solid #000;scroll-margin-top:16px}.section-head{display:flex;gap:20px;align-items:start;justify-content:space-between}.number{font-size:14px;letter-spacing:2px;font-weight:bold}.tools{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0}.diagram{overflow:auto;border:1px solid #000;background:#fff;padding:18px}.diagram img{display:block;width:100%;min-width:850px;height:auto;max-width:none}.diagram.large img{width:180%;min-width:1300px}.notes{max-width:1100px;padding-left:22px;font-size:15px}footer{font-size:14px}button:focus-visible,a:focus-visible{outline:3px solid black;outline-offset:3px}@media(max-width:700px){header,main,footer{padding:20px}h1{font-size:28px}.section-head{display:block}}@media print{nav,.tools{display:none}header,main,footer{padding:12px}section{break-before:page;border:0}.diagram{border:0;padding:0;overflow:visible}.diagram img,.diagram.large img{width:100%;min-width:0}h2{font-size:20px}.notes{font-size:11px}}
</style></head><body><header><div class="number">GEMORA / SHARDS OF FATE</div><h1>Sơ đồ thiết kế MVP</h1><p>Nền trắng · Chữ đen · Đường nối đen · ${diagrams.length} sơ đồ</p><p>Thiết kế đề xuất từ PRD, GDD và kế hoạch database. Chưa phản ánh backend đã triển khai.</p><nav>${diagrams.map(d=>`<a href="#${d.id}">${d.id.slice(0,2)} · ${esc(d.title)}</a>`).join('')}</nav></header><main>${diagrams.map(d=>`<section id="${d.id}"><div class="section-head"><div><div class="number">SƠ ĐỒ ${d.id.slice(0,2)}</div><h2>${esc(d.title)}</h2><p>${esc(d.subtitle)}</p></div></div><div class="tools"><button type="button" aria-pressed="false" onclick="const box=this.parentElement.nextElementSibling;const on=box.classList.toggle('large');this.textContent=on?'Thu về vừa trang':'Phóng to 180%';this.setAttribute('aria-pressed',String(on))">Phóng to 180%</button><a href="${d.id}.svg" target="_blank" rel="noopener">Mở SVG</a><a href="${d.id}.png" download>Tải PNG</a>${d.dot?`<a href="${d.id}.dot" download>Nguồn DOT</a>`:''}</div><div class="diagram"><img src="${d.id}.svg" alt="${esc(d.title)}"></div><ul class="notes">${d.notes.map(s=>`<li>${esc(s)}</li>`).join('')}</ul></section>`).join('')}</main><footer><p>Nguồn: <a href="../PRD.md">PRD</a> · <a href="../GDD.md">GDD</a> · <a href="../DATABASE_CLIENT_BACKEND_PLAN.md">Kế hoạch database / client / backend</a></p><p>File SVG và PNG mở được độc lập. Trang này hoạt động offline, không tải thư viện hoặc font ngoài.</p></footer></body></html>`;
  writeIndividualPages(diagrams, html);
  const md=`# Sơ đồ Gemora — MVP\n\n[Mở trang xem toàn bộ](index.html). Trang HTML mở trực tiếp trong trình duyệt, hoạt động offline; có phóng to, SVG và tải PNG.\n\nĐây là thiết kế đề xuất, dựa trên [PRD](../PRD.md), [GDD](../GDD.md), [kế hoạch database](../DATABASE_CLIENT_BACKEND_PLAN.md). Không dùng schema rút gọn trong bài học Prisma làm schema chính thức.\n\n## Danh mục\n\n| Số | Nội dung | File |\n| --- | --- | --- |\n${diagrams.map(d=>`| ${d.id.slice(0,2)} | ${d.title} | [SVG](${d.id}.svg) · [PNG](${d.id}.png) |`).join('\n')}\n\n## Cách đọc\n\n- ERD: PK = khóa chính, FK = khóa ngoại, UQ = duy nhất. Nhãn quan hệ đọc từ bảng nguồn sang bảng đích trong file DOT. 1 : 0..N nghĩa là một bản ghi có từ 0 đến nhiều bản ghi con.\n- Flow: chữ nhật = bước xử lý, hình thoi = điều kiện, bầu dục = điểm bắt đầu/kết thúc. Nhãn Có/Không ghi ngay trên nhánh.\n- Sơ đồ sequence: đọc từ trên xuống; đường dọc là vòng đời thành phần, nét đứt ngang là response, khung lớn là transaction.\n- ERD được chia theo miền; bảng Profile/Stage/Release xuất hiện lại để giữ ngữ cảnh, không phải tạo thêm bảng trùng. Các FK phụ được ghi trong bảng/ghi chú.\n\n## Ghi chú thiết kế theo từng sơ đồ\n\n${diagrams.map(d=>`### ${d.id.slice(0,2)}. ${d.title}\n\n${d.notes.map(s=>'- '+s).join('\n')}`).join('\n\n')}\n\n## Các quyết định cần chốt khi triển khai\n\n- Nếu status làm cả hai phe chết trong cùng tick, cần chốt thứ tự ưu tiên WON/LOST trong GDD và engine tests.\n- Backend phải bảo đảm profile/kho/đội sau khởi tạo, đúng ba hero và một leader; quan hệ 1:1/1:3 trên hình mô tả nghiệp vụ, không tự được bảo đảm bằng mỗi FK.\n- Nội dung publish phải đủ và tham chiếu cùng release; các quan hệ 0..N vẫn cho phép draft chưa hoàn thiện.\n- Sơ đồ nội dung cụ thể hóa RewardDefinition thành bundle JSONB liên kết StageVersion. Cần validate schema và các item/hero code khi publish.\n\n## Chỉnh sửa và tái tạo\n\nCác file .dot là nguồn Graphviz có thể mở trong trình sửa text. Sơ đồ sequence dùng SVG với tọa độ cố định. File build-diagrams.cjs chứa nguồn của toàn bộ bộ sơ đồ và dựng lại HTML/SVG/PNG; sửa trong script nếu muốn giữ kết quả khi chạy lại.\n\nYêu cầu Node.js và hai package @viz-js/viz, sharp có sẵn trong đường tìm module (NODE_PATH hoặc môi trường riêng). Chạy từ bất kỳ thư mục nào bằng đường dẫn tới script; output luôn nằm cạnh script. Không cần thay package.json của game.\n\n\`\`\`powershell\nnode D:\\Gemora_Shards_of_Fate\\docs\\diagrams\\build-diagrams.cjs\n\`\`\`\n`;
  const individualLinks = diagrams.map(d => `- [${d.id.slice(0,2)}. ${d.title}](${d.id}.html)`).join('\n');
  fs.writeFileSync(path.join(out,'README.md'),md.replace('[Mở trang xem toàn bộ](index.html).', '[Mở danh sách sơ đồ](index.html). Mỗi sơ đồ có một trang HTML riêng và nút trước/tiếp theo.').replace('## Danh mục', `## Mở từng sơ đồ\n\n${individualLinks}\n\n## Danh mục`));
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(diagrams.map(({id,title,subtitle,notes})=>({id,title,subtitle,notes})),null,2));
  // Compact contact sheet for a quick visual check.
  const thumbs=await Promise.all(diagrams.map(async d=>{
    const label=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="700" height="60"><rect width="100%" height="100%" fill="white"/><text x="15" y="36" font-family="Arial" font-size="19">${esc(d.id.slice(0,2)+' · '+d.title)}</text></svg>`);
    const pic=await sharp(path.join(out,d.id+'.png')).resize(660,440,{fit:'inside'}).toBuffer();
    const meta=await sharp(pic).metadata();
    return sharp({create:{width:700,height:520,channels:3,background:'#fff'}}).composite([{input:label,left:0,top:0},{input:pic,left:Math.floor((700-meta.width)/2),top:65}]).png().toBuffer();
  }));
  await sharp({create:{width:2100,height:1560,channels:3,background:'#fff'}}).composite(thumbs.map((input,i)=>({input,left:(i%3)*700,top:Math.floor(i/3)*520}))).png().toFile(path.join(out,'overview.png'));
  console.log(`Generated ${diagrams.length} individual HTML pages with SVG + PNG, index, sources and README.`);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
