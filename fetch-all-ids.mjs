// 使い方: cd ~/Desktop/daily-groove && node fetch-all-ids.mjs
// アーティストのBandcampトップページからアルバムURLを自動探索してIDを取得
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const albumsPath = join(__dirname, "data", "albums.ts");

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";

async function fetchHtml(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  return res.text();
}

function extractId(html) {
  if (!html) return null;
  const m1 = html.match(/data-tralbum="([^"]+)"/);
  if (m1) { try { const j = JSON.parse(m1[1].replace(/&quot;/g,'"')); if(j.id) return String(j.id); } catch(e){} }
  const m2 = html.match(/EmbeddedPlayer\/album=(\d+)/); if(m2) return m2[1];
  const m3 = html.match(/"current_album_id"\s*:\s*(\d+)/); if(m3) return m3[1];
  return null;
}

// アーティストのルートURLからアルバムURLを探す
async function findAlbumUrl(artistBase, targetSlug) {
  const html = await fetchHtml(artistBase + "/music");
  if (!html) return null;
  // アルバムリンクを抽出
  const matches = [...html.matchAll(/href="(\/album\/[^"?]+)"/g)];
  const albumUrls = [...new Set(matches.map(m => artistBase + m[1]))];
  if (albumUrls.length === 0) return null;
  
  // targetSlugに最も近いものを返す（なければ最初のアルバム）
  const slug = targetSlug.toLowerCase();
  const match = albumUrls.find(u => u.toLowerCase().includes(slug.split('-').slice(0,3).join('-')));
  return match || albumUrls[0];
}

async function getIdForUrl(url) {
  // 直接URLを試す
  const html = await fetchHtml(url);
  const id = extractId(html);
  if (id) return { id, url };
  
  // 失敗したら アーティストページから正しいURLを探す
  const urlObj = new URL(url);
  const artistBase = urlObj.origin;
  const targetSlug = urlObj.pathname.replace('/album/', '');
  
  const correctUrl = await findAlbumUrl(artistBase, targetSlug);
  if (!correctUrl || correctUrl === url) return { id: null, url };
  
  const html2 = await fetchHtml(correctUrl);
  const id2 = extractId(html2);
  return { id: id2, url: id2 ? correctUrl : url };
}

async function main() {
  let src = readFileSync(albumsPath, "utf-8");
  
  // IDがないURLを収集
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
    
    const { id, url: finalUrl } = await getIdForUrl(url);
    
    if (id) {
      // URLが変わった場合は両方更新
      if (finalUrl !== url) {
        src = src.replace(`bandcampUrl: "${url}",`, `bandcampUrl: "${finalUrl}",\n    bandcampId: "${id}",`);
        console.log(`✅ ${id} (URL修正: ${finalUrl.split('/').pop()})`);
      } else {
        src = src.replace(`bandcampUrl: "${url}",`, `bandcampUrl: "${url}",\n    bandcampId: "${id}",`);
        console.log(`✅ ${id}`);
      }
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
}
main().catch(console.error);
