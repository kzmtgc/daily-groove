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

// data-tralbum属性からトラックリストを取得
async function fetchTracks(albumUrl: string): Promise<TrackInfo[]> {
  try {
    const res = await fetch(albumUrl, {
      headers: HEADERS,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const html = await res.text();

    // data-tralbum属性を取得（script[data-tralbum]またはdiv[data-tralbum]）
    const m = html.match(/data-tralbum="([^"]+)"/);
    if (!m) return [];

    // HTMLエンティティをデコード
    const json = m[1]
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");

    const data = JSON.parse(json) as {
      trackinfo?: Array<{
        track_num?: number;
        title?: string;
        duration?: number;
      }>;
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

export async function GET(req: NextRequest) {
  const page =
    req.nextUrl.searchParams.get("page") ??
    String(Math.floor(Math.random() * 20));
  const genre = req.nextUrl.searchParams.get("genre") ?? "all";

  try {
    const discoverUrl = `https://bandcamp.com/api/discover/3/get_web?g=${genre}&s=new&p=${page}&gn=0&f=all&w=0`;
    const discoverRes = await fetch(discoverUrl, {
      headers: HEADERS,
      cache: "no-store",
    });
    if (!discoverRes.ok) {
      return NextResponse.json({ error: "Bandcamp API error" }, { status: 502 });
    }
    const discoverData = await discoverRes.json();

    const items: DiscoverItem[] = (discoverData.items ?? []).filter(
      (item: DiscoverItem) => item.url_hints?.subdomain && item.url_hints?.slug
    );

    if (!items.length) {
      return NextResponse.json({ albums: [] });
    }

    const selected = items.slice(0, 10);

    // 各アルバムのトラック情報を並列取得
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

    return NextResponse.json({ albums, total: discoverData.total_count });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
