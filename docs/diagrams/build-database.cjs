// Rebuild only the current auth ERD. No database connection or mutation.
const fs = require('node:fs');
const path = require('node:path');
const schema = fs.readFileSync(path.join(__dirname, '../../apps/game-server/prisma/schema.prisma'), 'utf8');
const tables = [
  { name: 'User', label: 'Tài khoản và quyền truy cập', x: 48, y: 450, color: '#1d4ed8', rows: [
    ['id', 'UUID', 'PK'], ['normalizedEmail', 'VARCHAR(254)', 'UQ'], ['passwordHash', 'TEXT', 'NULL'],
    ['role', 'UserRole', 'PLAYER'], ['status', 'UserStatus', 'ACTIVE'],
    ['createdAt', 'TIMESTAMPTZ(3)', 'now()'], ['updatedAt', 'TIMESTAMPTZ(3)', 'Prisma'],
  ] },
  { name: 'PlayerProfile', label: 'Hồ sơ hiển thị của người chơi', x: 930, y: 164, color: '#0f766e', rows: [
    ['id', 'UUID', 'PK'], ['userId', 'UUID', 'FK · UQ'], ['displayName', 'VARCHAR(50)', ''],
    ['createdAt', 'TIMESTAMPTZ(3)', 'now()'], ['updatedAt', 'TIMESTAMPTZ(3)', 'Prisma'],
  ] },
  { name: 'AuthIdentity', label: 'Liên kết Google • khóa duy nhất theo cặp', x: 930, y: 540, color: '#b45309', rows: [
    ['id', 'UUID', 'PK'], ['userId', 'UUID', 'FK · UQ2'], ['provider', 'AuthProvider', 'UQ1,2'],
    ['providerSubject', 'TEXT', 'UQ1'], ['createdAt', 'TIMESTAMPTZ(3)', 'now()'],
  ] },
  { name: 'AuthSession', label: 'Phiên đăng nhập trên trình duyệt', x: 930, y: 916, color: '#7c3aed', rows: [
    ['id', 'UUID', 'PK'], ['userId', 'UUID', 'FK'], ['tokenHash', 'VARCHAR(64)', 'UQ'],
    ['expiresAt', 'TIMESTAMPTZ(3)', ''], ['revokedAt', 'TIMESTAMPTZ(3)', 'NULL'],
    ['createdAt', 'TIMESTAMPTZ(3)', 'now()'],
  ] },
];
// Refuse to silently produce a diagram with missing or obsolete physical columns.
for (const table of tables) {
  const body = schema.match(new RegExp(`model ${table.name} \\{([\\s\\S]*?)\\n\\}`))?.[1];
  if (!body) throw new Error(`Missing model ${table.name}`);
  const physical = body.split('\n').map(line => line.trim().split(/\s+/)).filter(parts =>
    /^(String|DateTime|UserRole|UserStatus|AuthProvider)\??$/.test(parts[1] || '')).map(parts => parts[0]);
  if (JSON.stringify(physical) !== JSON.stringify(table.rows.map(row => row[0]))) {
    throw new Error(`Update diagram metadata for ${table.name}: schema columns changed`);
  }
}
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const text = (x, y, value, size = 18, color = '#334155', extra = '') =>
  `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" ${extra}>${esc(value)}</text>`;
const out = ['<svg xmlns="http://www.w3.org/2000/svg" width="1540" height="1500" viewBox="0 0 1540 1500">',
  '<rect width="1540" height="1500" fill="#f8fafc"/>',
  '<g font-family="Segoe UI, Arial, sans-serif">',
  text(48, 48, 'GEMORA / DATABASE REVIEW', 16, '#64748b', 'font-weight="700" letter-spacing="2"'),
  text(48, 96, 'Tài khoản, hồ sơ và phiên đăng nhập', 34, '#0f172a', 'font-weight="700"'),
  text(48, 132, 'Cấu trúc đã triển khai • 04/11/2026 • API đăng ký / đăng nhập chưa triển khai', 19),
];
// Lines join User.id to the child userId row. Counts describe rows per parent.
const parentY = 450 + 88 + 24;
const profileY = 164 + 88 + 48 + 24;
const sessionY = 916 + 88 + 48 + 24;
const identityY = 540 + 88 + 48 + 24;
out.push(`<path d="M598 ${parentY} H744 V${profileY} H930 M744 ${parentY} V${sessionY} H930 M744 ${identityY} H930" fill="none" stroke="#475569" stroke-width="2.5"/>`);
for (const [x, y] of [[598,parentY],[930,profileY],[930,sessionY],[930,identityY]]) out.push(`<circle cx="${x}" cy="${y}" r="5" fill="#475569"/>`);
out.push(text(614, parentY - 12, '1', 22, '#1d4ed8', 'font-weight="700"'),
  text(866, profileY - 14, '0..1', 22, '#0f766e', 'font-weight="700"'),
  text(861, sessionY - 14, '0..N', 22, '#7c3aed', 'font-weight="700"'),
  text(866, identityY - 14, '0..1', 22, '#b45309', 'font-weight="700"'),
  text(768, identityY - 46, 'Google', 17),
  text(768, profileY - 46, 'Có hồ sơ', 17), text(768, sessionY - 46, 'Có các phiên', 17));
for (const t of tables) {
  const h = 88 + t.rows.length * 48 + 12;
  out.push(`<rect x="${t.x}" y="${t.y}" width="550" height="${h}" rx="12" fill="white" stroke="#cbd5e1"/>`,
    `<path d="M${t.x+12} ${t.y} H${t.x+538} Q${t.x+550} ${t.y} ${t.x+550} ${t.y+12} V${t.y+80} H${t.x} V${t.y+12} Q${t.x} ${t.y} ${t.x+12} ${t.y}" fill="${t.color}"/>`,
    text(t.x+20,t.y+34,t.name,26,'white','font-weight="700"'), text(t.x+20,t.y+62,t.label,17,'#f1f5f9'));
  t.rows.forEach((r, i) => {
    const top=t.y+88+i*48;
    if (i%2===0) out.push(`<rect x="${t.x+1}" y="${top}" width="548" height="48" fill="#f8fafc"/>`);
    out.push(text(t.x+18,top+30,r[0],18,'#0f172a','font-weight="600"'),
      text(t.x+230,top+30,r[1],16), text(t.x+442,top+30,r[2],15,t.color,'font-weight="700"'));
  });
}
out.push(text(48, 990, 'Đọc quan hệ', 22, '#0f172a', 'font-weight="700"'),
  text(48, 1026, 'Một User có 0 hoặc 1 PlayerProfile.'),
  text(48, 1058, 'Một User có 0 hoặc 1 liên kết Google.'),
  text(48, 1090, 'Một User có 0 hoặc nhiều AuthSession.'),
  text(48, 1122, 'Xóa User: ba loại bản ghi con bị xóa theo.'),
  text(48, 1180, 'AuthIdentity: các khóa UNIQUE ghép', 20, '#0f172a', 'font-weight="700"'),
  text(48, 1216, 'UQ1 = (provider, providerSubject)'),
  text(48, 1248, 'UQ2 = (userId, provider)'),
  '<line x1="48" y1="1370" x2="1492" y2="1370" stroke="#cbd5e1"/>',
  text(48, 1410, 'PK: khóa chính   •   FK: khóa ngoại   •   UQ: không trùng   •   NULL: cho phép chưa có giá trị', 18),
  text(48, 1450, 'passwordHash và revokedAt cho phép NULL. AuthProvider hiện chỉ có GOOGLE. API auth chưa triển khai.', 17),
  '</g></svg>');
const svg = out.join('\n');
fs.writeFileSync(path.join(__dirname, 'auth-database.svg'), svg);
fs.writeFileSync(path.join(__dirname, 'index.html'), `<!doctype html>
<html lang="vi"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gemora — Database hiện tại</title><style>
body{margin:0;background:#f8fafc;color:#0f172a;font:17px/1.6 'Segoe UI',sans-serif}header,footer{padding:20px 32px}nav{display:flex;gap:24px;flex-wrap:wrap}a{color:#1d4ed8}main{overflow:auto;padding:0 24px}img{display:block;width:100%;min-width:1000px;height:auto}p{max-width:1000px}button{font:inherit;padding:6px 12px;border:1px solid #cbd5e1;background:white;border-radius:6px;cursor:pointer}
</style><header><nav><a href="../DATABASE_REVIEW.md">Giải thích từng trường và đánh giá thiết kế</a><a href="auth-database.svg">SVG</a><a href="auth-database.png">PNG</a><button id="zoom">Phóng to 150%</button></nav></header>
<main><img id="diagram" src="auth-database.svg" alt="User có 0 hoặc 1 PlayerProfile, 0 hoặc 1 Google AuthIdentity và 0 hoặc nhiều AuthSession; các bảng con tham chiếu User.id qua userId."></main>
<footer><p>Bốn bảng trên phản ánh schema hiện tại. Luồng đăng nhập, xác minh mật khẩu và kiểm tra phiên sẽ được triển khai trong backend. Tài liệu giải thích đầy đủ nằm ở DATABASE_REVIEW.md.</p></footer>
<script>let large=false;document.getElementById('zoom').onclick=()=>{large=!large;document.getElementById('diagram').style.width=large?'150%':'100%';document.getElementById('zoom').textContent=large?'Vừa chiều rộng':'Phóng to 150%';};</script></html>`);
if (process.argv[2]) {
  const { Resvg } = require(path.resolve(process.argv[2]));
  const result = new Resvg(svg, { font: { loadSystemFonts: true }, fitTo: { mode: 'width', value: 2310 } }).render();
  fs.writeFileSync(path.join(__dirname, 'auth-database.png'), result.asPng());
}
console.log('Generated auth ERD: 4 tables, 23 physical columns, 3 foreign keys.');
