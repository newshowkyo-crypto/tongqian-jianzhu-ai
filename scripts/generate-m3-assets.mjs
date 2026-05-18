import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { deflateSync } from 'node:zlib';

const root = process.cwd();
const primary = '#1e5fbf';
const primaryDark = '#0d2950';
const gold = '#d4953a';
const neutral = '#f4f4f5';
const text = '#18181b';

function ensure(file) {
  mkdirSync(dirname(file), { recursive: true });
}

function save(file, content) {
  const abs = join(root, file);
  ensure(abs);
  writeFileSync(abs, content);
}

function svg(width, height, body, extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" ${extra}>
  <defs>
    <linearGradient id="blueGold" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${gold}"/></linearGradient>
    <linearGradient id="lv5" x1="0" x2="1"><stop offset="0" stop-color="#7c3aed"/><stop offset="1" stop-color="#c084fc"/></linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="8" flood-opacity=".12"/></filter>
  </defs>
  ${body}
</svg>
`;
}

function logoMark(fill = primary, accent = gold) {
  return `<g>
    <path d="M40 128 128 36l88 92-28 0-60-62-60 62z" fill="${fill}"/>
    <path d="M74 128h108v82H74z" fill="${fill}" opacity=".92"/>
    <path d="M101 151h54v59h-54z" fill="#fff" opacity=".92"/>
    <path d="M84 128h88l-44-46z" fill="${accent}"/>
  </g>`;
}

function textBlock(x, y, title, subtitle, color = text) {
  return `<text x="${x}" y="${y}" fill="${color}" font-family="Microsoft YaHei, PingFang SC, Arial" font-size="34" font-weight="700">${title}</text>
  <text x="${x}" y="${y + 36}" fill="${color}" opacity=".68" font-family="Inter, Arial" font-size="14" letter-spacing="1.5">${subtitle}</text>`;
}

function crcTable() {
  const table = [];
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}
const crc = crcTable();

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crc[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const check = Buffer.alloc(4);
  check.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, check]);
}

function png(width, height, colorA, colorB = colorA, accentColor = gold) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  const a = hex(colorA);
  const b = hex(colorB);
  const c = hex(accentColor);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const t = (x + y) / (width + height);
      const inBadge = (x - width * 0.72) ** 2 + (y - height * 0.28) ** 2 < (Math.min(width, height) * 0.12) ** 2;
      const r = inBadge ? c[0] : Math.round(a[0] + (b[0] - a[0]) * t);
      const g = inBadge ? c[1] : Math.round(a[1] + (b[1] - a[1]) * t);
      const bl = inBadge ? c[2] : Math.round(a[2] + (b[2] - a[2]) * t);
      const i = row + 1 + x * 4;
      raw[i] = r;
      raw[i + 1] = g;
      raw[i + 2] = bl;
      raw[i + 3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function hex(value) {
  const clean = value.replace('#', '');
  return [0, 2, 4].map((start) => Number.parseInt(clean.slice(start, start + 2), 16));
}

function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  const entries = [];
  let offset = 6 + images.length * 16;
  for (const image of images) {
    const entry = Buffer.alloc(16);
    entry[0] = image.size >= 256 ? 0 : image.size;
    entry[1] = image.size >= 256 ? 0 : image.size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += image.data.length;
    entries.push(entry);
  }
  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

function pdf(title, subtitle, joint = false) {
  const stream = `q
0.05 0.16 0.31 rg 0 650 595 192 re f
0.83 0.58 0.23 rg 64 628 467 5 re f
0.98 0.98 0.98 rg 64 560 467 54 re f
0.1 0.1 0.1 rg BT /F1 28 Tf 72 582 Td (${title}) Tj ET
0.35 0.35 0.35 rg BT /F1 14 Tf 72 520 Td (${subtitle}) Tj ET
0.83 0.58 0.23 rg 64 456 160 1 re f
0.1 0.1 0.1 rg BT /F1 12 Tf 72 430 Td (Tongqian Fanglue - Professional construction business AI report cover) Tj ET
${joint ? '0.9 0.9 0.9 rg 360 520 150 54 re f 0.35 0.35 0.35 rg BT /F1 10 Tf 383 550 Td (CLIENT LOGO) Tj ET' : ''}
Q`;
  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
    '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    `5 0 obj << /Length ${Buffer.byteLength(stream)} >> stream\n${stream}\nendstream endobj`,
  ];
  let offset = 9;
  const xref = ['0000000000 65535 f '];
  for (const object of objects) {
    xref.push(`${String(offset).padStart(10, '0')} 00000 n `);
    offset += Buffer.byteLength(`${object}\n`);
  }
  return `%PDF-1.4\n${objects.join('\n')}\nxref\n0 ${objects.length + 1}\n${xref.join('\n')}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${offset}\n%%EOF\n`;
}

function badgeSvg(level, name, colors, symbol) {
  const fill = colors.fill;
  const stroke = colors.stroke;
  return svg(256, 256, `<circle cx="128" cy="128" r="104" fill="${fill}" stroke="${stroke}" stroke-width="8" filter="url(#softShadow)"/>
  <path d="M76 182c24-14 80-14 104 0" fill="none" stroke="${stroke}" stroke-width="10" stroke-linecap="round"/>
  <path d="${symbol}" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="128" y="148" text-anchor="middle" fill="#fff" font-family="Inter, Arial" font-size="40" font-weight="800">LV${level}</text>
  <text x="128" y="210" text-anchor="middle" fill="${stroke}" font-family="Microsoft YaHei" font-size="18" font-weight="700">${name}</text>`);
}

function iconSvg(label, path) {
  return svg(64, 64, `<rect x="6" y="6" width="52" height="52" rx="12" fill="#f0f6fe"/>
  <path d="${path}" fill="none" stroke="${primary}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="48" cy="18" r="4" fill="${gold}"/>
  <title>${label}</title>`);
}

function illustrationSvg(title, motif) {
  return svg(420, 280, `<rect width="420" height="280" rx="24" fill="#fafafa"/>
  <rect x="52" y="52" width="316" height="176" rx="18" fill="#fff" stroke="#e4e4e7"/>
  <path d="${motif}" fill="none" stroke="${primary}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M84 210h252" stroke="${gold}" stroke-width="4" stroke-linecap="round"/>
  <text x="210" y="246" text-anchor="middle" fill="#52525b" font-family="Microsoft YaHei" font-size="18" font-weight="600">${title}</text>`);
}

function coverSvg(kind, joint) {
  return svg(1080, 1920, `<rect width="1080" height="1920" fill="#fafafa"/>
  <rect width="1080" height="430" fill="${primaryDark}"/>
  <rect x="96" y="386" width="888" height="8" fill="${gold}"/>
  ${logoMark('#fff', gold).replace('<g>', '<g transform="translate(86 76) scale(1.15)">')}
  <text x="96" y="610" fill="${text}" font-family="Microsoft YaHei" font-size="74" font-weight="800">${kind}</text>
  <text x="96" y="690" fill="#52525b" font-family="Microsoft YaHei" font-size="34">AI report cover template</text>
  <rect x="96" y="780" width="888" height="680" rx="28" fill="#fff" stroke="#e4e4e7"/>
  <path d="M160 920h760M160 1040h560M160 1160h660M160 1280h460" stroke="#dde9fc" stroke-width="16" stroke-linecap="round"/>
  ${joint ? '<rect x="684" y="124" width="260" height="112" rx="16" fill="#fff" opacity=".94"/><text x="814" y="188" text-anchor="middle" fill="#71717a" font-family="Inter" font-size="24" font-weight="700">CLIENT LOGO</text>' : ''}
  <text x="96" y="1720" fill="#a1a1aa" font-family="Inter" font-size="26">[PLACEHOLDER_CLIENT_WATERMARK]</text>`);
}

function marketingSvg(title, width, height, vertical = false) {
  return svg(width, height, `<rect width="${width}" height="${height}" fill="#fafafa"/>
  <rect width="${width}" height="${Math.round(height * 0.34)}" fill="${primaryDark}"/>
  <rect x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.3)}" width="${Math.round(width * 0.84)}" height="6" fill="${gold}"/>
  <rect x="${Math.round(width * 0.08)}" y="${Math.round(height * 0.42)}" width="${Math.round(width * 0.84)}" height="${Math.round(height * 0.34)}" rx="18" fill="#fff" stroke="#e4e4e7"/>
  <text x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.55)}" fill="${text}" font-family="Microsoft YaHei" font-size="${vertical ? 54 : 36}" font-weight="800">${title}</text>
  <text x="${Math.round(width * 0.1)}" y="${Math.round(height * 0.65)}" fill="#71717a" font-family="Inter" font-size="${vertical ? 28 : 18}">[PLACEHOLDER_TITLE_AREA]</text>
  <rect x="${Math.round(width * 0.72)}" y="${Math.round(height * 0.76)}" width="${Math.round(width * 0.16)}" height="${Math.round(width * 0.16)}" rx="10" fill="#f4f4f5" stroke="#d4d4d8"/>
  <text x="${Math.round(width * 0.8)}" y="${Math.round(height * 0.85)}" text-anchor="middle" fill="#71717a" font-family="Inter" font-size="16">QR</text>`);
}

const logoDir = 'packages/ui/src/assets/logo';
save(`${logoDir}/logo-color.svg`, svg(520, 256, `${logoMark()}${textBlock(250, 112, '同乾方略', 'TONGQIAN FANGLUE')}`));
save(`${logoDir}/logo-white.svg`, svg(520, 256, `<rect width="520" height="256" fill="${primaryDark}"/>${logoMark('#fff', gold)}${textBlock(250, 112, '同乾方略', 'TONGQIAN FANGLUE', '#fff')}`));
save(`${logoDir}/logo-mono.svg`, svg(520, 256, `${logoMark('#18181b', '#18181b')}${textBlock(250, 112, '同乾方略', 'TONGQIAN FANGLUE')}`));
save(`${logoDir}/logo-text-only.svg`, svg(520, 120, `${textBlock(32, 56, '同乾方略', 'TONGQIAN FANGLUE')}`));
save(`${logoDir}/logo-stacked.svg`, svg(300, 360, `<g transform="translate(22 12)">${logoMark()}</g><text x="150" y="294" text-anchor="middle" fill="${text}" font-family="Microsoft YaHei" font-size="34" font-weight="800">同乾方略</text><text x="150" y="326" text-anchor="middle" fill="#71717a" font-family="Inter" font-size="14">TONGQIAN FANGLUE</text>`));
save(`${logoDir}/subbrand-construction-ai-manager.svg`, svg(680, 180, `${logoMark(primary, gold).replace('<g>', '<g transform="scale(.58)">')}<text x="166" y="76" fill="${text}" font-family="Microsoft YaHei" font-size="34" font-weight="800">建筑 AI 经营管家</text><text x="166" y="112" fill="#71717a" font-family="Inter" font-size="15">Construction AI Business Manager</text>`));
const favicons = [16, 32, 48, 64, 128, 256].map((size) => ({ size, data: png(size, size, primaryDark, primary, gold) }));
save(`${logoDir}/logo-favicon.ico`, ico(favicons));

const badges = [
  [1, '见习管家', { fill: '#71717a', stroke: '#52525b' }, 'M92 116h72M100 92h56M112 142h32'],
  [2, '入职管家', { fill: primary, stroke: '#1a4ea3' }, 'M92 126l24 24 52-64'],
  [3, '资深管家', { fill: '#0891b2', stroke: '#0e7490' }, 'M92 140c24-44 48-44 72 0'],
  [4, '金牌管家', { fill: gold, stroke: '#a06d24' }, 'M88 142c18-48 62-48 80 0M96 104l32-24 32 24'],
  [5, '首席管家', { fill: 'url(#lv5)', stroke: '#7c3aed' }, 'M90 136l14-46 24 32 24-32 14 46M98 150h60'],
];
for (const [level, name, colors, symbol] of badges) {
  save(`packages/ui/src/assets/badges/lv${level}.svg`, badgeSvg(level, name, colors, symbol));
  save(`packages/ui/src/assets/badges/lv${level}-256.png`, png(256, 256, colors.stroke, colors.fill === 'url(#lv5)' ? '#c084fc' : colors.fill, '#ffffff'));
  save(`packages/ui/src/assets/badges/lv${level}-64.png`, png(64, 64, colors.stroke, colors.fill === 'url(#lv5)' ? '#c084fc' : colors.fill, '#ffffff'));
}

const icons = [
  ['opportunity-radar', '机会雷达', 'M18 42a18 18 0 1 1 28-15M32 32l16-16M32 32l10 2'],
  ['tender-center', '招标中心', 'M18 18h28v32H18zM24 26h16M24 34h16M24 42h10'],
  ['contract-review', '合同审查', 'M20 14h18l8 8v28H20zM38 14v10h10M26 36l6 6 10-14'],
  ['qualification-guard', '资质护航', 'M32 12l18 8v12c0 12-8 20-18 24-10-4-18-12-18-24V20z'],
  ['project-site', '项目部', 'M16 48h32M20 48V24l12-8 12 8v24M28 48V34h8v14'],
  ['cashflow', '财务现金流', 'M16 36c8-14 16 14 32 0M16 24h32M24 18v28M40 18v28'],
  ['report-center', '报告中心', 'M18 46V18h28v28M24 38l6-8 6 4 6-12'],
  ['dispatch-hall', '派单大厅', 'M16 22h24M16 34h32M16 46h20M42 18l8 8-8 8'],
  ['agent-management', '智能管家管理', 'M22 44c2-8 18-8 20 0M24 24a8 8 0 1 0 16 0M48 42v8M44 46h8'],
  ['ai-chat', 'AI 对话', 'M18 20h28v18H30l-8 8v-8h-4zM26 28h14'],
  ['knowledge-base', '知识库', 'M18 18h20a8 8 0 0 1 8 8v24H22a4 4 0 0 1-4-4zM26 28h14M26 38h14'],
  ['policy-center', '政策中心', 'M18 48h28M22 44V22h20v22M18 22h28M28 14h8'],
  ['growth-tasks', '上瘾任务', 'M32 14v18l12 8M20 50c8-6 16-6 24 0M18 22h8M38 22h8'],
  ['notifications', '通知', 'M22 42h20M26 42V28a6 6 0 0 1 12 0v14M30 48h4'],
  ['settings', '设置', 'M32 22a10 10 0 1 0 0 20 10 10 0 0 0 0-20M32 14v8M32 42v8M14 32h8M42 32h8'],
  ['premium-services', '同乾方略服务', 'M18 42l14-24 14 24M24 34h16M20 48h24'],
  ['platform-admin', '平台后台', 'M16 18h32v28H16zM16 28h32M26 18v28'],
];
for (const [slug, label, path] of icons) save(`packages/ui/src/assets/icons/${slug}.svg`, iconSvg(label, path));

const illustrations = [
  ['empty-contracts', '暂无合同', 'M150 78h92l28 28v90H150zM242 78v30h30M174 136h72M174 164h56'],
  ['empty-tenders', '暂无招标', 'M146 162h128M170 162V94h80v68M190 116h40M190 140h40'],
  ['empty-projects', '暂无项目', 'M142 190V94l68-34 68 34v96M180 190v-54h60v54'],
  ['empty-reports', '暂无报告', 'M150 82h120v116H150zM176 122h68M176 150h48M176 178h72'],
  ['empty-opportunities', '暂无机会', 'M210 76a54 54 0 1 0 0 108 54 54 0 0 0 0-108M210 110v38M210 162v2'],
];
for (const [slug, label, motif] of illustrations) save(`packages/ui/src/assets/illustrations/${slug}.svg`, illustrationSvg(label, motif));

const reportKinds = ['contract-review', 'tender-framework', 'qualification-upgrade', 'policy-fund', 'business-overview'];
for (const kind of reportKinds) {
  for (const variant of ['standard', 'co-branded']) {
    const joint = variant === 'co-branded';
    save(`apps/api/src/report-templates/covers/${kind}-${variant}.pdf`, pdf(kind, variant, joint));
    save(`apps/api/src/report-templates/covers/${kind}-${variant}-h5.svg`, coverSvg(kind, joint));
    save(`apps/api/src/report-templates/covers/${kind}-${variant}-h5.png`, png(1080, 1920, primaryDark, '#f0f6fe', gold));
  }
}

for (const name of ['policy-insight', 'case-study', 'industry-analysis', 'product-feature', 'agent-recruiting', 'customer-story', 'festival', 'risk-warning']) {
  save(`docs/marketing/assets/wechat-mp-covers/${name}.svg`, marketingSvg(name, 900, 500));
  save(`docs/marketing/assets/wechat-mp-covers/${name}.png`, png(900, 500, primaryDark, neutral, gold));
}

for (const name of ['income-calendar', 'level-up-lv4', 'customer-invitation', 'premium-service', 'case-brag']) {
  save(`docs/marketing/assets/agent-share-cards/${name}-square.svg`, marketingSvg(name, 1080, 1080));
  save(`docs/marketing/assets/agent-share-cards/${name}-square.png`, png(1080, 1080, primaryDark, '#fdf6e7', gold));
  save(`docs/marketing/assets/agent-share-cards/${name}-vertical.svg`, marketingSvg(name, 1080, 1920, true));
  save(`docs/marketing/assets/agent-share-cards/${name}-vertical.png`, png(1080, 1920, primaryDark, '#fdf6e7', gold));
}

for (const [slug, label] of [
  ['debt-strategy', '化债策略'], ['abs-reits', 'ABS-REITs'], ['soe-financing', '央国企融资'], ['compliance-check', '合规体检'], ['overseas-consulting', '出海咨询'],
  ['digital-transform', '数字化转型'], ['capital-operation', '资本运作'], ['group-restructure', '集团重组'], ['tender-planning', '招投标策划'], ['general-counsel', '法务总顾问'],
]) {
  save(`packages/ui/src/assets/services/${slug}.svg`, svg(256, 256, `<rect x="22" y="22" width="212" height="212" rx="36" fill="#fdf6e7" stroke="#ead3a8"/>
  <path d="M74 164c26-62 82-62 108 0M92 116h72M108 88h40" fill="none" stroke="${gold}" stroke-width="12" stroke-linecap="round"/>
  <text x="128" y="210" text-anchor="middle" fill="#a06d24" font-family="Microsoft YaHei" font-size="20" font-weight="700">${label}</text>`));
}

const personas = [
  ['serious-consultant', primaryDark, '严肃顾问'],
  ['warm-steward', '#d4953a', '温暖管家'],
  ['sharp-analyst', primary, '干练分析师'],
  ['senior-lawyer', '#27272a', '资深律师'],
];
for (const [persona, color, label] of personas) {
  for (const expression of ['thinking', 'smile', 'serious', 'celebrate']) {
    save(`apps/web/src/assets/ai-assistant/${persona}-${expression}.svg`, svg(512, 512, `<rect width="512" height="512" rx="112" fill="#fafafa"/>
    <circle cx="256" cy="196" r="82" fill="${color}" opacity=".94"/>
    <path d="M158 418c22-82 174-82 196 0" fill="${color}" opacity=".16"/>
    <circle cx="226" cy="184" r="8" fill="#fff"/><circle cx="286" cy="184" r="8" fill="#fff"/>
    <path d="${expression === 'smile' || expression === 'celebrate' ? 'M224 224c20 20 44 20 64 0' : expression === 'thinking' ? 'M226 228h60' : 'M224 232c20-10 44-10 64 0'}" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
    <text x="256" y="462" text-anchor="middle" fill="${text}" font-family="Microsoft YaHei" font-size="28" font-weight="700">${label}</text>`));
    save(`apps/web/src/assets/ai-assistant/${persona}-${expression}.png`, png(512, 512, color, '#fafafa', gold));
  }
}

save('packages/ui/src/assets/splash/desktop-splash.svg', svg(1920, 1080, `<rect width="1920" height="1080" fill="${primaryDark}"/>${logoMark('#fff', gold).replace('<g>', '<g transform="translate(760 330) scale(1.55)">')}<text x="960" y="760" text-anchor="middle" fill="#fff" font-family="Microsoft YaHei" font-size="64" font-weight="800">同乾方略</text><text x="960" y="820" text-anchor="middle" fill="#dde9fc" font-family="Microsoft YaHei" font-size="28">建筑 AI 经营管家</text>`));
save('packages/ui/src/assets/splash/desktop-splash.png', png(1920, 1080, primaryDark, primary, gold));
save('packages/ui/src/assets/splash/wechat-mini-banner.svg', marketingSvg('建筑 AI 经营管家', 750, 320));
save('packages/ui/src/assets/splash/wechat-mini-banner.png', png(750, 320, primaryDark, '#f0f6fe', gold));
for (const size of [57, 60, 72, 76, 114, 120, 128, 144, 152, 167, 180, 192, 256, 512, 1024]) {
  save(`packages/ui/src/assets/app-icons/app-icon-${size}.png`, png(size, size, primaryDark, primary, gold));
}

const manifest = {
  generatedAt: new Date().toISOString(),
  palette: { gold, primary, primaryDark },
  checksum: createHash('sha256').update(`${Date.now()}`).digest('hex').slice(0, 12),
  note: 'M3 deterministic design asset suite. Raster files are generated from the same brand palette as SVG sources.',
};
save('packages/ui/src/assets/manifest.json', `${JSON.stringify(manifest, null, 2)}\n`);
