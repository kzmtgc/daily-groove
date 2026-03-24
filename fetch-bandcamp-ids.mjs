import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const albumsPath = join(__dirname, "data", "albums.ts");

async function getBandcampId(url) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m1 = html.match(/data-tralbum="([^"]+)"/);
    if (m1) { try { const j = JSON.parse(m1[1].replace(/&quot;/g,'"')); if(j.id) return String(j.id); } catch(e){} }
    const m2 = html.match(/EmbeddedPlayer\/album=(\d+)/); if(m2) return m2[1];
    const m3 = html.match(/"current_album_id"\s*:\s*(\d+)/); if(m3) return m3[1];
    return null;
  } catch(e) { return null; }
}

let src = readFileSync(albumsPath, "utf-8");

// bandcampIdがないURLを収集
const toFetch = [];
const urlRegex = /bandcampUrl:\s*"([^"]+)"/g;
let match;
while ((match = urlRegex.exec(src)) !== null) {
  const url = match[1];
  const ctx = src.slice(match.index, match.index + 300);
  if (!ctx.includes("bandcampId:")) toFetch.push(url);
}
const unique = [...new Set(toFetch)];
console.log(`\n取得対象: ${unique.length}件\n`);

let ok = 0, ng = [];
for (const url of unique) {
  const slug = url.replace("https://","").replace(".bandcamp.com","").replace("/album/","　");
  process.stdout.write(`  ${slug} ... `);
  const id = await getBandcampId(url);
  if (id) {
    src = src.replace(`bandcampUrl: "${url}",`, `bandcampUrl: "${url}",\n    bandcampId: "${id}",`);
    console.log(`✅ ${id}`);
    ok++;
  } else {
    console.log(`❌`);
    ng.push(url);
  }
  await new Promise(r => setTimeout(r, 1200));
}

writeFileSync(albumsPath, src);
console.log(`\n✨ 完了: ${ok}件OK`);
if (ng.length) {
  console.log(`\n❌ 要確認 (${ng.length}件):`);
  ng.forEach(u => console.log(`  ${u}`));
}
