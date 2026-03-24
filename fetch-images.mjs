#!/usr/bin/env node
// albums.ts の全アルバムに imageUrl を追加するスクリプト
// 使い方: node fetch-images.mjs
// ※ daily-groove プロジェクトのルートで実行してください

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const albumsPath = path.join(__dirname, 'data', 'albums.ts');

// albums.ts から bandcampUrl を全部抽出
const src = fs.readFileSync(albumsPath, 'utf8');
const urlMatches = [...src.matchAll(/id:\s*"([^"]+)"[^}]*?bandcampUrl:\s*"([^"]+)"/gs)];

console.log(`Found ${urlMatches.length} albums`);

async function getArtId(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // og:image から取得（最も確実）
    // 例: https://f4.bcbits.com/img/a1234567890_10.jpg
    const ogImg = html.match(/property="og:image"\s+content="(https:\/\/f[34]\.bcbits\.com\/img\/a(\d+)_\d+\.jpg)"/);
    if (ogImg) return { imageUrl: ogImg[1].replace(/_\d+\.jpg$/, '_10.jpg'), artId: ogImg[2] };

    // meta twitter:image
    const twImg = html.match(/name="twitter:image"\s+content="(https:\/\/f[34]\.bcbits\.com\/img\/a(\d+)_\d+\.jpg)"/);
    if (twImg) return { imageUrl: twImg[1].replace(/_\d+\.jpg$/, '_10.jpg'), artId: twImg[2] };

    return null;
  } catch (e) {
    return null;
  }
}

// 並列数を制限して全アルバムを処理
const CONCURRENCY = 5;
const results = {};

// id と bandcampUrl のペアを抽出（より確実な正規表現）
const idUrlPairs = [];
const albumBlocks = src.split(/(?=\{\s*id:)/);
for (const block of albumBlocks) {
  const idMatch = block.match(/id:\s*"([^"]+)"/);
  const urlMatch = block.match(/bandcampUrl:\s*"([^"]+)"/);
  const hasImage = block.includes('imageUrl:');
  if (idMatch && urlMatch) {
    idUrlPairs.push({ id: idMatch[1], url: urlMatch[1], hasImage });
  }
}

console.log(`Parsed ${idUrlPairs.length} id-url pairs`);

// imageUrlがないものだけ処理
const toFetch = idUrlPairs.filter(p => !p.hasImage);
console.log(`Need to fetch: ${toFetch.length} albums`);

async function processInChunks(items, chunkSize) {
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async ({ id, url }) => {
      process.stdout.write(`Fetching [${id}] ${url.slice(0, 60)}... `);
      const result = await getArtId(url);
      if (result) {
        results[id] = result.imageUrl;
        console.log(`✓ art_id=${result.artId}`);
      } else {
        console.log('✗ not found');
      }
    }));
  }
}

await processInChunks(toFetch, CONCURRENCY);

// albums.ts を更新
let updated = src;
let count = 0;

for (const [id, imageUrl] of Object.entries(results)) {
  // id: "xxx" ... bandcampUrl: "yyy" の後に imageUrl を追加（すでになければ）
  const pattern = new RegExp(
    `(id:\\s*"${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?bandcampUrl:\\s*"[^"]*")`,
    'g'
  );
  updated = updated.replace(pattern, (match) => {
    if (match.includes('imageUrl')) return match; // すでにある
    count++;
    return match + `,\n    imageUrl: "${imageUrl}"`;
  });
}

fs.writeFileSync(albumsPath, updated);
console.log(`\n✅ Updated ${count} albums with imageUrl`);
console.log('Restart npm run dev to see changes.');
