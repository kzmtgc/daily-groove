import { NextRequest, NextResponse } from "next/server";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://bandcamp.com/discover",
  Accept: "text/html,application/json",
};

interface DiscoverItem {
  id: number;
  primary_text?: string;
  secondary_text?: string;
  genre_text?: string;
  tags?: string[];
  art_id?: number;
  url_hints: { subdomain: string; slug: string };
}

interface TrackInfo {
  id: string;
  number: number;
  title: string;
  duration: string;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function fetchTracks(albumUrl: string): Promise<TrackInfo[]> {
  try {
    const res = await fetch(albumUrl, {
      headers: HEADERS,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const html = await res.text();
    const m = html.match(/data-tralbum="([^"]+)"/);
    if (!m) return [];
    const json = m[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
    const data = JSON.parse(json) as {
      trackinfo?: Array<{ track_num?: number; title?: string; duration?: number }>;
    };
    if (!data.trackinfo?.length) return [];
    return data.trackinfo.map((t, i) => ({
      id: String(i + 1),
      number: t.track_num ?? i + 1,
      title: t.title ?? `Track ${i + 1}`,
      duration: t.duration ? formatDuration(t.duration) : "",
    }));
  } catch {
    return [];
  }
}

// 1ジャンルで最大count件のDiscoverアイテムを取得
async function fetchDiscoverItems(genre: string, page: number): Promise<DiscoverItem[]> {
  const url = `https://bandcamp.com/api/discover/3/get_web?g=${genre}&s=new&p=${page}&gn=0&f=all&w=0`;
  const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.items ?? []).filter(
    (item: DiscoverItem) => item.url_hints?.subdomain && item.url_hints?.slug
  );
}

export async function GET(req: NextRequest) {
  const page =
    req.nextUrl.searchParams.get("page") ??
    String(Math.floor(Math.random() * 20));

  // 単一ジャンル（従来）
  const genre = req.nextUrl.searchParams.get("genre") ?? "all";

  // 好みベースのパーソナライズ用パラメータ
  const likedGenresParam = req.nextUrl.searchParams.get("likedGenres"); // "electronic,ambient"
  const dislikedGenresParam = req.nextUrl.searchParams.get("dislikedGenres"); // "rock"

  try {
    let items: DiscoverItem[] = [];

    if (likedGenresParam) {
      // パーソナライズモード：好きなジャンルから取得してブレンド
      const likedGenres = likedGenresParam.split(",").filter(Boolean);
      const dislikedGenres = dislikedGenresParam?.split(",").filter(Boolean) ?? [];

      // 好きなジャンルから均等に取得（各ジャンル最大10件）
      const fetchPromises = likedGenres.map(g =>
        fetchDiscoverItems(g, Math.floor(Math.random() * 15))
      );
      const results = await Promise.all(fetchPromises);

      // 全件をフラットにして重複除去
      const allItems = results.flat();
      const seen = new Set<number>();
      const uniqueItems = allItems.filter(item => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
      });

      // 嫌いなジャンルを除外
      const filtered = uniqueItems.filter(item => {
        const g = (item.genre_text ?? "").toLowerCase();
        return !dislikedGenres.some(dg => g.includes(dg.toLowerCase()));
      });

      // シャッフルして20件取得（後でトラック情報取得→10件に絞る）
      const shuffled = filtered.sort(() => Math.random() - 0.5).slice(0, 20);
      items = shuffled;
    } else {
      // 通常モード
      items = await fetchDiscoverItems(genre, parseInt(page));
    }

    if (!items.length) {
      return NextResponse.json({ albums: [] });
    }

    const selected = items.slice(0, 10);

    const albums = await Promise.all(
      selected.map(async (item) => {
        const albumUrl = `https://${item.url_hints.subdomain}.bandcamp.com/album/${item.url_hints.slug}`;
        const tracks = await fetchTracks(albumUrl);
        return {
          id: String(item.id),
          title: item.primary_text ?? "Unknown Album",
          artist: item.secondary_text ?? "Unknown Artist",
          genre: item.genre_text ?? genre,
          bandcampId: String(item.id),
          bandcampUrl: albumUrl,
          imageUrl: item.art_id
            ? `https://f4.bcbits.com/img/a${item.art_id}_10.jpg`
            : null,
          tracks,
        };
      })
    );

    return NextResponse.json({ albums, total: items.length });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
