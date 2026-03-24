"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, Album, DayRecord, loadState, saveState, todayString } from "@/lib/store";

// ─────────────────────────────────────────────────────────────
// デザイントークン
// ─────────────────────────────────────────────────────────────
const C = {
  red:     "#E8000D",
  black:   "#111111",
  bg:      "#F5F4F0",
  white:   "#FFFFFF",
  gray1:   "#3C3C3E",
  gray2:   "#636366",
  gray3:   "#AEAEB2",
  border:  "#E2E1DC",
  card:    "#FFFFFF",
} as const;

// ─────────────────────────────────────────────────────────────
// 小コンポーネント
// ─────────────────────────────────────────────────────────────

function Badge({ children, color = C.red, textColor = C.white, small }: {
  children: React.ReactNode; color?: string; textColor?: string; small?: boolean;
}) {
  return (
    <span style={{
      background: color, color: textColor,
      borderRadius: 4, padding: small ? "2px 6px" : "3px 9px",
      fontFamily: "'Bangers', cursive",
      fontSize: small ? 10 : 12, letterSpacing: "0.06em",
      display: "inline-block", lineHeight: 1.4,
    }}>{children}</span>
  );
}

function ProgressBar({ value, max, color = C.red }: { value: number; max: number; color?: string }) {
  const pct = Math.min(value / Math.max(max, 1), 1);
  return (
    <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
      <div style={{ height: "100%", background: color, width: `${Math.round(pct * 100)}%`, transition: "width 0.4s ease" }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// プレイヤーサイドパネル
// ─────────────────────────────────────────────────────────────
function PlayerPanel({
  album, mode, state, unlockedTracks, trackStartOverride, animatingKey,
  HYPE_PHRASES, onClose, onDig, onTrackSelect,
}: {
  album: Album; mode: "today" | "collection"; state: AppState;
  unlockedTracks: Record<string, boolean>; trackStartOverride: Record<string, number>;
  animatingKey: string | null; HYPE_PHRASES: string[];
  onClose: () => void;
  onDig: (albumId: string, idx: number, e: React.MouseEvent) => void;
  onTrackSelect: (albumId: string, idx: number) => void;
}) {
  const isCol = mode === "collection";
  const listened = state.listenedTracks[album.id] ?? 0;
  const total = album.tracks.length || 10;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex" }}>
      <div onClick={onClose} style={{ flex: 1, background: "rgba(0,0,0,0.45)", backdropFilter: "blur(3px)" }} />
      <div style={{
        width: 500, background: C.white, display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 48px rgba(0,0,0,0.18)",
        animation: "panelIn 0.28s cubic-bezier(0.4,0,0.2,1)",
      }}>
        {/* ヘッダー */}
        <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 72, height: 72, borderRadius: 10, overflow: "hidden",
              background: "#1a1a2e", flexShrink: 0 }}>
              {album.imageUrl
                ? <img src={album.imageUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>🎵</div>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                <Badge small color={C.gray2}>#{album.genre}</Badge>
                {isCol && <Badge small>COLLECTED</Badge>}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.black, lineHeight: 1.3,
                overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                {album.title}
              </div>
              <div style={{ fontSize: 13, color: C.gray2, marginTop: 3 }}>{album.artist}</div>
            </div>
            <button onClick={onClose} style={{
              background: "#F2F2F7", border: "none", borderRadius: "50%",
              width: 30, height: 30, cursor: "pointer", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.gray2} strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          {!isCol && (
            <div style={{ marginTop: 12 }}>
              <ProgressBar value={listened} max={total} color={listened >= total ? "#34C759" : C.red} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                <span style={{ fontSize: 12, color: listened >= total ? "#34C759" : C.red, fontWeight: 600 }}>
                  {listened >= total ? "✓ Added to Collection" : "In Progress"}
                </span>
                <span style={{ fontSize: 11, color: C.gray3 }}>{listened} / {total} tracks</span>
              </div>
            </div>
          )}
        </div>

        {/* Bandcamp プレイヤー */}
        {album.bandcampId && (
          <iframe key={album.bandcampId} style={{ border: 0, width: "100%", height: 300, flexShrink: 0 }} seamless
            src={`https://bandcamp.com/EmbeddedPlayer/album=${album.bandcampId}/size=large/bgcol=ffffff/linkcol=e8000d/artwork=small/transparent=true/`} />
        )}

        {/* トラックラベル */}
        <div style={{ padding: "7px 16px 6px", background: "linear-gradient(135deg,#062020,#0a3028)",
          borderBottom: "0.5px solid #144030", flexShrink: 0 }}>
          <span style={{ fontSize: 10, color: "#408870", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            {isCol ? "Tracklist" : "Unearth each track"}
          </span>
        </div>

        {/* トラックリスト */}
        <div style={{ flex: 1, overflowY: "auto", background: "linear-gradient(180deg,#071c1c,#041414)" }}>
          {album.tracks.map((track, i) => {
            const isListened = i < listened;
            const key = `${album.id}-${i}`;
            const isNext = !isCol && i === (trackStartOverride[album.id] ?? listened);
            const isUnlocked = !isCol && !!unlockedTracks[key];
            const phrase = HYPE_PHRASES[(album.id.charCodeAt(0) + i * 7) % HYPE_PHRASES.length];
            return (
              <div key={track.id}
                onClick={() => { if (!isCol && !isListened && i !== (state.listenedTracks[album.id] ?? 0)) onTrackSelect(album.id, i); }}
                style={{
                  display: "flex", alignItems: "center", padding: "8px 14px",
                  borderBottom: "0.5px solid #0e2828",
                  background: isListened ? "linear-gradient(90deg,#0a2828,#081e1e)" : isNext && isUnlocked ? "linear-gradient(90deg,#142010,#0c1808)" : "transparent",
                  borderLeft: !isCol && isNext && isUnlocked ? "2.5px solid #E8000D" : "2.5px solid transparent",
                  opacity: !isCol && !isListened && !isUnlocked && !isNext ? 0.35 : 1,
                }}>
                <div style={{ width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginRight: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isListened ? "linear-gradient(135deg,#40c8a0,#20a078)" : !isCol && isNext && isUnlocked ? "transparent" : "#0e2424",
                  border: !isCol && isNext && isUnlocked ? "1.5px solid #ff6040" : "none" }}>
                  {isListened
                    ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                    : !isCol && isNext && isUnlocked ? <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ff6040" }} /> : null}
                </div>
                <span style={{ flex: 1, fontSize: 13, paddingRight: 6,
                  color: isListened ? "#80c8b0" : !isCol && isNext && isUnlocked ? "white" : isCol ? "#80c8b0" : "#2a4840",
                  fontWeight: !isCol && isNext && isUnlocked ? 600 : 400 }}>{track.title}</span>
                {track.duration && <span style={{ fontSize: 11, color: "#3a5a50", marginRight: 6, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{track.duration}</span>}
                {!isCol && isNext && (isUnlocked ? (
                  <button key={`${key}-u`} onClick={e => { e.stopPropagation(); onDig(album.id, i, e); }} style={{
                    background: C.red, border: "none", borderRadius: 20, padding: "7px 14px",
                    cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
                    transform: animatingKey === key ? "scale(0.88)" : "scale(1)",
                    transition: "transform 0.12s cubic-bezier(0.34,1.56,0.64,1)",
                    boxShadow: animatingKey === key ? "0 1px 4px rgba(232,0,13,0.3)" : "0 3px 10px rgba(232,0,13,0.45)",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
                    <span style={{ fontFamily: "'Bangers', cursive", fontSize: 16, color: C.white }}>{phrase}</span>
                  </button>
                ) : (
                  <div style={{ width: 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                    {[0,1,2].map(d => <div key={d} style={{ width: 3, height: 3, borderRadius: "50%", background: "#1a3830" }} />)}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// アルバムカード（ピック選択用・大）
// ─────────────────────────────────────────────────────────────
function AlbumPickCard({ album, index, picked, disabled, onPick }: {
  album: Album; index: number; picked: boolean; disabled: boolean; onPick: (a: Album) => void;
}) {
  return (
    <button onClick={() => onPick(album)} disabled={disabled} style={{
      background: picked ? "#FEF2F2" : C.card,
      border: `2px solid ${picked ? C.red : "transparent"}`,
      borderRadius: 16, cursor: disabled ? "default" : "pointer",
      textAlign: "left", padding: 0, overflow: "hidden",
      boxShadow: picked ? "0 4px 20px rgba(232,0,13,0.15)" : "0 2px 12px rgba(0,0,0,0.07)",
      opacity: disabled ? 0.45 : 1,
      transition: "transform 0.15s ease, box-shadow 0.15s ease",
      display: "flex", flexDirection: "column",
    }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(0,0,0,0.13)"; } }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = picked ? "0 4px 20px rgba(232,0,13,0.15)" : "0 2px 12px rgba(0,0,0,0.07)"; }}>
      {/* アート */}
      <div style={{ width: "100%", aspectRatio: "1/1", background: "#1a1a2e", position: "relative", overflow: "hidden" }}>
        {album.imageUrl
          ? <img src={album.imageUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🎵</div>}
        <div style={{ position: "absolute", top: 10, left: 12, fontSize: 12, fontWeight: 700,
          color: "rgba(255,255,255,0.9)", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        {picked && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(232,0,13,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: C.red, borderRadius: 10, padding: "6px 18px" }}>
              <span style={{ fontFamily: "'Bangers', cursive", fontSize: 26, color: C.white, letterSpacing: "0.06em" }}>YES!</span>
            </div>
          </div>
        )}
      </div>
      {/* テキスト */}
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em",
          textTransform: "uppercase", color: picked ? C.red : C.gray3, marginBottom: 5 }}>
          #{album.genre}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: picked ? C.black : C.gray1,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 3 }}>
          {album.title}
        </div>
        <div style={{ fontSize: 13, color: C.gray2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {album.artist}
        </div>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────
// Groove カード（ピック後の2枚）
// ─────────────────────────────────────────────────────────────
function GrooveCard({ album, state, onPlay }: {
  album: Album; state: AppState; onPlay: () => void;
}) {
  const listened = state.listenedTracks[album.id] ?? 0;
  const total = album.tracks.length || 10;
  const completed = listened >= total;
  const pct = Math.min(listened / total, 1);
  return (
    <div style={{ background: C.card, borderRadius: 20, overflow: "hidden",
      boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
      {/* バナー */}
      <div style={{ position: "relative", height: 260, background: "#1a1a2e" }}>
        {album.imageUrl && (
          <img src={album.imageUrl} alt={album.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.65 }} />
        )}
        {completed && (
          <div style={{ position: "absolute", top: 16, right: 16 }}>
            <Badge>LISTENED!</Badge>
          </div>
        )}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "28px 24px",
          background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 100%)" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)", marginBottom: 6 }}>#{album.genre.toUpperCase()} · {album.year}</div>
          <div style={{ fontFamily: "'Bangers', cursive", fontSize: 32, color: C.white,
            lineHeight: 1.1, letterSpacing: "0.03em",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {album.title.toUpperCase()}
          </div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.75)", marginTop: 6 }}>{album.artist}</div>
        </div>
      </div>
      {/* 進捗 */}
      <div style={{ padding: "16px 24px 14px", borderBottom: `1px solid ${C.border}` }}>
        <ProgressBar value={listened} max={total} color={completed ? "#34C759" : C.red} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: completed ? "#34C759" : C.red }}>
            {completed ? "✓ Added to Collection" : "In Progress"}
          </span>
          <span style={{ fontSize: 12, color: C.gray3 }}>{listened} / {total} tracks</span>
        </div>
      </div>
      {/* ボタン */}
      <div style={{ padding: "16px 24px" }}>
        {album.bandcampId ? (
          <button onClick={onPlay} style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, padding: "14px", background: C.black, borderRadius: 12, border: "none",
            cursor: "pointer", transition: "opacity 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.85"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.white }}>Play on Bandcamp</span>
          </button>
        ) : (
          <a href={album.bandcampUrl} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, padding: "14px", background: C.black, borderRadius: 12, textDecoration: "none",
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.white }}>Open on Bandcamp ↗</span>
          </a>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// メインコンポーネント
// ─────────────────────────────────────────────────────────────
type NavTab = "today" | "collection" | "history" | "profile";

export default function DesktopPage() {
  const [state, setState] = useState<AppState | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<NavTab>("today");

  const [playerAlbumId, setPlayerAlbumId] = useState<string | null>(null);
  const [playerMode, setPlayerMode] = useState<"today" | "collection">("today");

  const [unlockedTracks, setUnlockedTracks] = useState<Record<string, boolean>>({});
  const [trackStartOverride, setTrackStartOverride] = useState<Record<string, number>>({});
  const [animatingKey, setAnimatingKey] = useState<string | null>(null);
  const lockTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const remainingMsRef = useRef<Record<string, number>>({});
  const timerStartedAtRef = useRef<Record<string, number>>({});

  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const particleIdRef = useRef(0);

  const [historyDate, setHistoryDate] = useState<string | null>(null);

  // オンボーディング
  const [onbStep, setOnbStep] = useState<null | "welcome" | 1 | 2 | 3 | 4>(null);

  const HYPE_PHRASES = ["DIG!"];

  // ── fetch ──────────────────────────────────────────────────
  const fetchDiscover = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const page = Math.floor(Math.random() * 30);
      const res = await fetch(`/api/bandcamp-discover?page=${page}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      if (!data.albums?.length) throw new Error("No albums returned");
      const albums: Album[] = data.albums.map((a: {
        id: string; title: string; artist: string; genre?: string;
        bandcampUrl: string; bandcampId: string; imageUrl?: string;
        tracks?: { id: string; number: number; title: string; duration: string }[];
      }) => ({
        id: a.id, title: a.title, artist: a.artist,
        year: new Date().getFullYear(), genre: a.genre || "Indie",
        emoji: "🎵", color: "#1a1a2e",
        bandcampUrl: a.bandcampUrl, bandcampId: a.bandcampId, imageUrl: a.imageUrl,
        tracks: (a.tracks && a.tracks.length > 0)
          ? a.tracks.map((t, i) => ({ ...t, id: `${a.id}-${i + 1}` }))
          : Array.from({ length: 10 }, (_, i) => ({ id: `${a.id}-${i + 1}`, number: i + 1, title: `Track ${i + 1}`, duration: "" })),
      }));
      setState(prev => {
        if (!prev) return prev;
        const ns = { ...prev, suggestedAlbums: albums, todayAlbums: [], listenedTracks: {}, lastPickedDate: todayString() };
        saveState(ns); return ns;
      });
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Unknown error"); }
    finally { setLoading(false); }
  }, []);

  // ── 初期化 ─────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const loaded = loadState();
    const today = todayString();
    if (loaded.lastPickedDate !== today || !loaded.suggestedAlbums?.length) {
      let history = loaded.history ?? [];
      if (loaded.lastPickedDate && loaded.suggestedAlbums?.length > 0) {
        if (!history.find(h => h.date === loaded.lastPickedDate)) {
          history = [{ date: loaded.lastPickedDate, allAlbums: loaded.suggestedAlbums, pickedAlbums: loaded.todayAlbums }, ...history].slice(0, 365);
        }
      }
      const ns = { ...loaded, suggestedAlbums: [], todayAlbums: [], listenedTracks: {}, lastPickedDate: today, history };
      saveState(ns); setState(ns);
    } else { setState(loaded); }
  }, []);

  // onboardingDone判定
  useEffect(() => {
    if (mounted && state && !state.onboardingDone && onbStep === null) {
      setOnbStep("welcome");
    }
  }, [mounted, state, onbStep]);

  useEffect(() => {
    if (mounted && state && !state.suggestedAlbums.length && !loading && !error) fetchDiscover();
  }, [mounted, state, loading, error, fetchDiscover]);

  // ── タイマー ───────────────────────────────────────────────
  const tk = (albumId: string, i: number) => `${albumId}-${i}`;
  const dur2sec = (d: string) => { const p = d.split(":").map(Number); return (p[0] ?? 0) * 60 + (p[1] ?? 0); };

  function startSingleTimer(album: Album, idx: number) {
    const key = tk(album.id, idx);
    if (lockTimersRef.current[key]) clearTimeout(lockTimersRef.current[key]);
    let ms = remainingMsRef.current[key];
    if (ms === undefined) {
      const s = album.tracks[idx]?.duration ? dur2sec(album.tracks[idx].duration) : 180;
      ms = Math.max(3000, Math.round(s * (0.2 + Math.random() * 0.3) * 1000));
      remainingMsRef.current[key] = ms;
    }
    timerStartedAtRef.current[key] = Date.now();
    lockTimersRef.current[key] = setTimeout(() => {
      delete remainingMsRef.current[key]; delete timerStartedAtRef.current[key];
      setUnlockedTracks(p => ({ ...p, [key]: true }));
    }, ms);
  }

  function pauseTimers() {
    Object.keys(lockTimersRef.current).forEach(key => {
      clearTimeout(lockTimersRef.current[key]);
      const s = timerStartedAtRef.current[key], r = remainingMsRef.current[key];
      if (s !== undefined && r !== undefined) remainingMsRef.current[key] = Math.max(0, r - (Date.now() - s));
    });
    lockTimersRef.current = {}; timerStartedAtRef.current = {};
  }

  function startTimers(album: Album, startIdx: number) {
    // remainingMsRefが空のときだけ初回扱い（unlockedTracksはstate管理なのでリロード後に誤判定しないよう除外）
    const first = Object.keys(remainingMsRef.current).length === 0;
    if (first) {
      let cum = 0;
      album.tracks.forEach((tr, i) => {
        if (i < startIdx || remainingMsRef.current[tk(album.id, i)] !== undefined) return;
        const s = tr.duration ? dur2sec(tr.duration) : 180;
        cum += Math.max(3000, Math.round(s * (0.2 + Math.random() * 0.3) * 1000));
        remainingMsRef.current[tk(album.id, i)] = cum;
      });
    }
    startSingleTimer(album, startIdx);
  }

  useEffect(() => () => { Object.values(lockTimersRef.current).forEach(id => clearTimeout(id)); }, []);

  function openPlayer(album: Album, mode: "today" | "collection") {
    if (mode === "today") {
      const startIdx = state?.listenedTracks[album.id] ?? 0;
      const nextKey = tk(album.id, startIdx);
      // タイマーが走っていない場合のみ起動（再オープン時は残り時間から再開）
      if (!lockTimersRef.current[nextKey]) {
        startTimers(album, startIdx);
      }
    }
    setPlayerMode(mode); setPlayerAlbumId(album.id);
  }
  function closePlayer() { pauseTimers(); setPlayerAlbumId(null); }

  // ── DIG ────────────────────────────────────────────────────
  function fireParticle(el: HTMLElement | null) {
    const id = ++particleIdRef.current;
    const r = el?.getBoundingClientRect();
    const emojis = ["🎵","🎶","🎸","🥁","🎷","🎺","🎹","🐛"];
    setParticles(p => [...p, { id, x: r ? r.left + r.width / 2 : window.innerWidth / 2, y: r ? r.top + r.height / 2 : window.innerHeight / 2, emoji: emojis[Math.floor(Math.random() * emojis.length)] }]);
    setTimeout(() => setParticles(p => p.filter(x => x.id !== id)), 900);
  }

  function handleDig(albumId: string, idx: number, e: React.MouseEvent) {
    if (!state) return;
    const album = state.todayAlbums.find(a => a.id === albumId) ?? state.collection.find(a => a.id === albumId);
    if (!album) return;
    const total = album.tracks.length || 10;
    let done = false;
    setState(prev => {
      if (!prev) return prev;
      const lk = { ...prev.listenedTracks, [albumId]: idx + 1 };
      let col = prev.collection;
      if (idx + 1 >= total && !col.find(a => a.id === albumId)) { col = [...col, album]; done = true; }
      const ns = { ...prev, listenedTracks: lk, collection: col };
      saveState(ns); return ns;
    });
    setTrackStartOverride(p => { const n = { ...p }; delete n[albumId]; return n; });
    setAnimatingKey(`${albumId}-${idx}`);
    setTimeout(() => setAnimatingKey(null), 200);
    if (idx + 1 < album.tracks.length) startSingleTimer(album, idx + 1);
    fireParticle(e.currentTarget as HTMLElement);
    if (done) setTimeout(() => { setShowCelebration(true); setTimeout(() => setShowCelebration(false), 2800); }, 400);
  }

  function handleTrackSelect(albumId: string, i: number) {
    if (!state) return;
    const cur = state.listenedTracks[albumId] ?? 0;
    setTrackStartOverride(p => ({ ...p, [albumId]: i }));
    setUnlockedTracks(p => { const n = { ...p }; delete n[tk(albumId, cur)]; return n; });
    const album = state.todayAlbums.find(a => a.id === albumId);
    if (album) startSingleTimer(album, i);
  }

  function pickAlbum(album: Album) {
    if (!state || state.todayAlbums.length >= 2) return;
    if (state.todayAlbums.find(a => a.id === album.id)) {
      const ns = { ...state, todayAlbums: state.todayAlbums.filter(a => a.id !== album.id) };
      saveState(ns); setState(ns); return;
    }
    const newPicked = [...state.todayAlbums, album];
    const ns = { ...state, todayAlbums: newPicked };
    saveState(ns); setState(ns);
    // オンボーディング連動
    if (onbStep === 1) setOnbStep(2);
    else if (onbStep === 2) setTimeout(() => setOnbStep(3), 300);
  }

  function finishOnboarding() {
    if (!state) return;
    const ns = { ...state, onboardingDone: true };
    saveState(ns); setState(ns); setOnbStep(null);
  }

  // ─── 早期リターン ──────────────────────────────────────────
  if (!mounted) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Bangers', cursive", fontSize: 44, color: C.red, letterSpacing: "0.08em" }}>EARWORM</div>
    </div>
  );
  if (!state) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Bangers', cursive", fontSize: 44, color: C.red, letterSpacing: "0.08em" }}>EARWORM</div>
    </div>
  );

  const done = state.todayAlbums.length >= 2;
  const playerAlbum = playerAlbumId
    ? (state.todayAlbums.find(a => a.id === playerAlbumId) ?? state.collection.find(a => a.id === playerAlbumId))
    : null;

  const NAV_TABS: { id: NavTab; label: string }[] = [
    { id: "today",      label: "Today" },
    { id: "collection", label: "Collection" },
    { id: "history",    label: "History" },
    { id: "profile",    label: "Profile" },
  ];

  // ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes panelIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes celebText {
          0%   { opacity: 0; transform: scale(0.5); }
          30%  { opacity: 1; transform: scale(1.08); }
          70%  { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.95); }
        }
        @keyframes flyUp {
          0%   { opacity: 1; transform: translate(0,0) scale(1); }
          100% { opacity: 0; transform: translate(calc(var(--tx)*1px),calc(var(--ty)*1px)) scale(0.3); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; background: ${C.bg}; font-family: -apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
      `}</style>


      {/* ══════════════════════════════════════════════
          ONBOARDING: WELCOME（フルスクリーン）
      ══════════════════════════════════════════════ */}
      {onbStep === "welcome" && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9000,
          background: "#0a0a0a",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.5s ease",
        }}>
          <div style={{ display: "flex", gap: 80, alignItems: "center", maxWidth: 960, padding: "0 48px", width: "100%" }}>
            {/* 左：ロゴ + キャッチ */}
            <div style={{ flexShrink: 0 }}>
              <div style={{ fontFamily: "'Bangers', cursive", fontSize: 80, color: C.red,
                letterSpacing: "0.08em", lineHeight: 1, marginBottom: 12 }}>EARWORM</div>
              <div style={{ fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)", marginBottom: 48 }}>Daily Music Discovery</div>
              <button onClick={() => setOnbStep(1)} style={{
                background: C.red, border: "none", borderRadius: 14,
                padding: "16px 40px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: 12,
                boxShadow: "0 8px 32px rgba(232,0,13,0.4)",
                whiteSpace: "nowrap",
              }}>
                <span style={{ fontFamily: "'Bangers', cursive", fontSize: 26,
                  letterSpacing: "0.1em", color: C.white }}>START PICKING</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
              <div style={{ marginTop: 20, fontSize: 11, color: "rgba(255,255,255,0.2)",
                letterSpacing: "0.1em" }}>Powered by Bandcamp Discover</div>
            </div>

            {/* 右：コンセプト3カード */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
              {[
                { num: "10", label: "毎日10枚届く", sub: "Bandcampから選ばれた新しい音楽が毎日10枚", icon: "🎵" },
                { num: "02", label: "2枚だけ選ぶ", sub: "直感でPICK、すべて聴けばコレクションへ", icon: "✌️" },
                { num: "∞", label: "聴いて積む", sub: "コレクションが日々育っていく", icon: "📀" },
              ].map(({ num, label, sub, icon }, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 20,
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 14, padding: "18px 24px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  animation: `slideUpFade 0.5s ${0.15 + i * 0.12}s ease both`,
                }}>
                  <div style={{
                    fontFamily: num === "∞" ? "Georgia, serif" : "'Bangers', cursive",
                    fontSize: num === "∞" ? "36px" : "34px",
                    lineHeight: 1, color: C.red, width: 52, textAlign: "center", flexShrink: 0,
                  }}>{num}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{sub}</div>
                  </div>
                  <div style={{ fontSize: 26, flexShrink: 0 }}>{icon}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          ONBOARDING: コーチマーク (STEP 1〜4)
      ══════════════════════════════════════════════ */}
      {onbStep !== null && onbStep !== "welcome" && (
        <div style={{ position: "fixed", inset: 0, zIndex: 8000, pointerEvents: "none" }}>
          {/* 半透明オーバーレイ */}
          <div style={{
            position: "absolute", inset: 0,
            background: onbStep === 4
              ? "rgba(0,0,0,0.55)"
              : "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 55%, rgba(0,0,0,0.0) 100%)",
          }} />

          {/* コーチカード */}
          <div style={{
            position: "absolute",
            bottom: onbStep === 4 ? "auto" : 48,
            top: onbStep === 4 ? "50%" : "auto",
            left: "50%",
            transform: onbStep === 4 ? "translate(-50%,-50%)" : "translateX(-50%)",
            width: 520, pointerEvents: "auto",
            animation: "slideUpFade 0.3s ease both",
          }}>
            <div style={{
              background: "rgba(12,12,12,0.97)",
              borderRadius: 20, padding: "24px 28px 22px",
              border: `1px solid rgba(232,0,13,0.25)`,
              boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            }}>
              {/* ステップインジケーター */}
              <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
                {[1,2,3,4].map(s => (
                  <div key={s} style={{
                    height: 3, flex: 1, borderRadius: 2,
                    background: (s as number) <= (onbStep as number) ? C.red : "rgba(255,255,255,0.12)",
                    transition: "background 0.3s",
                  }} />
                ))}
              </div>

              <div style={{ fontFamily: "'Bangers', cursive", fontSize: 28, color: C.white,
                letterSpacing: "0.04em", lineHeight: 1.2, marginBottom: 8 }}>
                {onbStep === 1 && "毎日10枚が届いた。2枚選ぼう。"}
                {onbStep === 2 && "いい感じ。もう1枚。"}
                {onbStep === 3 && "これが YOUR DAILY GROOVE。"}
                {onbStep === 4 && "Collection に積み上がっていく。"}
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 20 }}>
                {onbStep === 1 && "アルバムをクリックして2枚ピックしよう。"}
                {onbStep === 2 && "ピックした2枚が今日の Groove になる。"}
                {onbStep === 3 && "Play on Bandcamp で聴きながらトラックを掘り起こすとコレクションに追加される。"}
                {onbStep === 4 && "毎日2枚。それだけ。さあ、今日の Groove を始めよう。"}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {(onbStep === 1 || onbStep === 2) ? (
                  <>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                      ↑ アルバムをクリックして選んでみよう
                    </span>
                    <button onClick={() => {
                      if (onbStep === 1) setOnbStep(2);
                      else setOnbStep(3);
                    }} style={{
                      background: "transparent", border: "none", cursor: "pointer",
                      fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "underline",
                    }}>スキップ</button>
                  </>
                ) : (
                  <button onClick={() => {
                    if (onbStep === 3) { setTab("collection"); setOnbStep(4); }
                    else finishOnboarding();
                  }} style={{
                    width: "100%", background: C.red, border: "none", borderRadius: 12,
                    padding: "13px", cursor: "pointer",
                    fontFamily: "'Bangers', cursive", fontSize: 22,
                    letterSpacing: "0.06em", color: C.white,
                    boxShadow: "0 4px 16px rgba(232,0,13,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}>
                    {onbStep === 3 ? "Collection を見る →" : "START PICKING!"}
                  </button>
                )}
              </div>
            </div>

            {/* スキップリンク */}
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <button onClick={finishOnboarding} style={{
                background: "transparent", border: "none", cursor: "pointer",
                fontSize: 11, color: "rgba(255,255,255,0.2)", textDecoration: "underline",
              }}>チュートリアルをスキップ</button>
            </div>
          </div>
        </div>
      )}

      {/* パーティクル */}
      {particles.map(p => (
        <div key={p.id} style={{ position: "fixed", zIndex: 9999, left: p.x, top: p.y,
          pointerEvents: "none", fontSize: 22,
          animation: "flyUp 0.85s ease forwards",
          "--tx": String(window.innerWidth * 0.8 - p.x),
          "--ty": String(-120),
        } as React.CSSProperties}>{p.emoji}</div>
      ))}

      {/* お祝い */}
      {showCelebration && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9998, display: "flex",
          alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ fontFamily: "'Bangers', cursive", fontSize: 72, color: C.red, textAlign: "center",
            animation: "celebText 2.8s ease forwards", textShadow: "0 4px 28px rgba(232,0,13,0.35)", lineHeight: 1.1 }}>
            ADDED TO<br/>COLLECTION!
          </div>
        </div>
      )}

      {/* プレイヤー */}
      {playerAlbum && (
        <PlayerPanel album={playerAlbum} mode={playerMode} state={state}
          unlockedTracks={unlockedTracks} trackStartOverride={trackStartOverride}
          animatingKey={animatingKey} HYPE_PHRASES={HYPE_PHRASES}
          onClose={closePlayer} onDig={handleDig} onTrackSelect={handleTrackSelect} />
      )}

      {/* ═══════════ LAYOUT ═══════════ */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ── HEADER ── */}
        <header style={{
          position: "sticky", top: 0, zIndex: 100,
          background: "rgba(245,244,240,0.95)", backdropFilter: "blur(12px)",
          borderBottom: `3px solid ${C.black}`,
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px",
            display: "flex", alignItems: "center", gap: 48, height: 64 }}>
            {/* ロゴ */}
            <div style={{ fontFamily: "'Bangers', cursive", fontSize: 36, color: C.red,
              letterSpacing: "0.08em", lineHeight: 1, flexShrink: 0 }}>EARWORM</div>

            {/* ナビ */}
            <nav style={{ display: "flex", gap: 4, flex: 1 }}>
              {NAV_TABS.map(({ id, label }) => (
                <button key={id} onClick={() => setTab(id)} style={{
                  padding: "8px 18px", borderRadius: 8, border: "none",
                  background: tab === id ? C.red : "transparent",
                  color: tab === id ? C.white : C.gray2,
                  fontWeight: tab === id ? 700 : 400, fontSize: 14,
                  cursor: "pointer", transition: "background 0.15s, color 0.15s",
                }}
                  onMouseEnter={e => { if (tab !== id) (e.currentTarget as HTMLElement).style.background = C.border; }}
                  onMouseLeave={e => { if (tab !== id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                  {label}
                </button>
              ))}
            </nav>

            {/* 右側：日付 + Refresh + コレクション数 */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              <span style={{ fontSize: 12, color: C.gray3, letterSpacing: "0.1em" }}>
                {state.lastPickedDate}
              </span>
              {!done && (
                <button onClick={fetchDiscover} disabled={loading} title="Refresh albums" style={{
                  background: "transparent", border: `2px solid ${C.black}`,
                  borderRadius: "50%", width: 34, height: 34,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.35 : 1,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.black} strokeWidth="2.5" strokeLinecap="round">
                    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                    <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
                  </svg>
                </button>
              )}
              <div style={{ background: C.red, borderRadius: 20, padding: "6px 14px",
                display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="white" stroke="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14l-4-4 1.41-1.41L11 13.17l6.59-6.59L19 8l-8 8z"/>
                </svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.white }}>
                  {state.collection.length} Collected
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* オンボーディング進行中バナー */}
        {onbStep !== null && onbStep !== "welcome" && (
          <div style={{
            background: "rgba(232,0,13,0.07)", borderBottom: `1px solid rgba(232,0,13,0.15)`,
            padding: "8px 40px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: C.red }}>
              Tutorial — Step {onbStep} / 4
            </span>
            <button onClick={finishOnboarding} style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: 11, color: C.gray3, textDecoration: "underline",
            }}>スキップ</button>
          </div>
        )}

        {/* ── CONTENT ── */}
        <main style={{ flex: 1, maxWidth: 1200, margin: "0 auto", width: "100%", padding: "48px 40px 80px" }}>

          {/* ════ TODAY ════ */}
          {tab === "today" && (
            <div>
              {/* ページタイトル */}
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: C.red, marginBottom: 8 }}>
                  Bandcamp Discover · {state.lastPickedDate}
                </div>
                <h1 style={{ margin: 0, fontFamily: "'Bangers', cursive", fontSize: 64,
                  color: C.black, letterSpacing: "0.04em", lineHeight: 1 }}>
                  {done ? "YOUR DAILY GROOVE" : state.todayAlbums.length === 1 ? "ONE MORE!" : "PICK YOUR 2!"}
                </h1>
                {!done && state.todayAlbums.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
                    {state.todayAlbums.map(a => (
                      <Badge key={a.id}>{a.title}</Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* ローディング */}
              {loading && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "80px 0", gap: 16 }}>
                  <div style={{ fontFamily: "'Bangers', cursive", fontSize: 52, color: C.red }}>LOADING...</div>
                  <div style={{ fontSize: 14, color: C.gray2 }}>Discovering new music from Bandcamp</div>
                </div>
              )}

              {/* エラー */}
              {error && !loading && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "80px 0", gap: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 52 }}>😵</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: C.black }}>Connection Error</div>
                  <div style={{ fontSize: 14, color: C.gray2, maxWidth: 320 }}>{error}</div>
                  <button onClick={fetchDiscover} style={{
                    background: C.red, color: C.white, border: "none", borderRadius: 12,
                    padding: "12px 32px", cursor: "pointer",
                    fontFamily: "'Bangers', cursive", fontSize: 24, letterSpacing: "0.05em",
                  }}>TRY AGAIN</button>
                </div>
              )}

              {/* PICK SELECTION：3カラムグリッド */}
              {!loading && !error && !done && state.suggestedAlbums.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                  {state.suggestedAlbums.map((album, i) => (
                    <AlbumPickCard key={album.id} album={album} index={i}
                      picked={!!state.todayAlbums.find(a => a.id === album.id)}
                      disabled={done && !state.todayAlbums.find(a => a.id === album.id)}
                      onPick={pickAlbum} />
                  ))}
                </div>
              )}

              {/* YOUR DAILY GROOVE */}
              {done && (
                <div>
                  {/* ピック2枚 */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, marginBottom: 48 }}>
                    {state.todayAlbums.map(album => (
                      <GrooveCard key={album.id} album={album} state={state}
                        onPlay={() => openPlayer(album, "today")} />
                    ))}
                  </div>

                  {/* Today's 10 グリッド */}
                  {state.suggestedAlbums.length > 0 && (
                    <div>
                      <div style={{ display: "flex", alignItems: "baseline",
                        justifyContent: "space-between", marginBottom: 14 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em",
                          textTransform: "uppercase", color: C.gray3 }}>Today's 10</span>
                        <span style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>
                          {state.todayAlbums.length}/2 picked
                        </span>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 6 }}>
                        {state.suggestedAlbums.map((album, idx) => {
                          const isPicked = !!state.todayAlbums.find(a => a.id === album.id);
                          return (
                            <a key={album.id} href={album.bandcampUrl} target="_blank" rel="noopener noreferrer"
                              title={`${album.title} — ${album.artist}`}
                              style={{ display: "block", aspectRatio: "1/1", borderRadius: 6,
                                overflow: "hidden", position: "relative", background: "#1a1a2e",
                                textDecoration: "none", outline: isPicked ? `2px solid ${C.red}` : "none", outlineOffset: 1 }}>
                              {album.imageUrl
                                ? <img src={album.imageUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: isPicked ? "none" : "grayscale(100%) brightness(0.55)" }} />
                                : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, opacity: isPicked ? 1 : 0.35 }}>🎵</div>}
                              <div style={{ position: "absolute", top: 2, left: 3, fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.9)", textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                                {String(idx + 1).padStart(2, "0")}
                              </div>
                              {isPicked && (
                                <div style={{ position: "absolute", inset: 0, background: "rgba(232,0,13,0.28)", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                                  <div style={{ background: C.red, borderRadius: 4, padding: "2px 6px", boxShadow: "0 2px 6px rgba(0,0,0,0.4)" }}>
                                    <span style={{ fontFamily: "'Bangers', cursive", fontSize: 14, color: C.white, letterSpacing: "0.05em" }}>PICKED!</span>
                                  </div>
                                </div>
                              )}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════ COLLECTION ════ */}
          {tab === "collection" && (
            <div>
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: C.red, marginBottom: 8 }}>My Collection</div>
                <h1 style={{ margin: 0, fontFamily: "'Bangers', cursive", fontSize: 64,
                  color: C.black, letterSpacing: "0.04em", lineHeight: 1 }}>
                  {state.collection.length} ALBUMS
                </h1>
              </div>

              {/* Today's picks in progress */}
              {state.todayAlbums.length > 0 && (
                <div style={{ marginBottom: 40 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em",
                    textTransform: "uppercase", color: C.red, marginBottom: 16 }}>Today — In Progress</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
                    {state.todayAlbums.map(album => (
                      <GrooveCard key={album.id} album={album} state={state}
                        onPlay={() => openPlayer(album, "today")} />
                    ))}
                  </div>
                </div>
              )}

              {state.collection.length === 0 && state.todayAlbums.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "80px 0", gap: 16, textAlign: "center" }}>
                  <div style={{ fontSize: 52 }}>🎵</div>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>No Albums Yet</div>
                  <div style={{ fontSize: 14, color: C.gray2, maxWidth: 300, lineHeight: 1.6 }}>
                    Pick 2 albums and dig each track to add them here.
                  </div>
                </div>
              ) : (
                <div>
                  {state.collection.length > 0 && (
                    <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em",
                      textTransform: "uppercase", color: C.gray3, marginBottom: 16 }}>Collected</div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
                    {state.collection.map((album, index) => (
                      <div key={album.id} style={{ background: C.card, borderRadius: 14,
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 16px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                        <div style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden",
                          background: "#1a1a2e", flexShrink: 0 }}>
                          {album.imageUrl
                            ? <img src={album.imageUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🎵</div>}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, color: C.red, fontWeight: 600,
                            letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>
                            #{album.genre}
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.black,
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                            {album.title}
                          </div>
                          <div style={{ fontSize: 12, color: C.gray2, marginTop: 2 }}>{album.artist}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                          <span style={{ fontSize: 11, color: C.red, fontWeight: 600, marginRight: 4 }}>
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          {album.bandcampId && (
                            <button onClick={() => openPlayer(album, "collection")} style={{
                              background: C.black, border: "none", borderRadius: 6,
                              width: 28, height: 28, display: "flex", alignItems: "center",
                              justifyContent: "center", cursor: "pointer",
                            }}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                            </button>
                          )}
                          <a href={album.bandcampUrl} target="_blank" rel="noopener noreferrer"
                            style={{ padding: "4px 6px", display: "flex", alignItems: "center" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.gray3} strokeWidth="2" strokeLinecap="round">
                              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ════ HISTORY ════ */}
          {tab === "history" && (
            <div>
              <div style={{ marginBottom: 36 }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: C.red, marginBottom: 8 }}>Past Discoveries</div>
                <h1 style={{ margin: 0, fontFamily: "'Bangers', cursive", fontSize: 64,
                  color: C.black, letterSpacing: "0.04em", lineHeight: 1 }}>HISTORY</h1>
              </div>

              {historyDate ? (
                /* 日付詳細 */
                <div>
                  <button onClick={() => setHistoryDate(null)} style={{
                    display: "flex", alignItems: "center", gap: 6, background: "transparent",
                    border: "none", cursor: "pointer", marginBottom: 24, color: C.gray2,
                    fontSize: 13, padding: 0,
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.gray2} strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                    Back to History
                  </button>
                  {(() => {
                    const isToday = historyDate === "today";
                    const rec: DayRecord | undefined = isToday
                      ? { date: state.lastPickedDate, allAlbums: state.suggestedAlbums, pickedAlbums: state.todayAlbums }
                      : (state.history ?? []).find(h => h.date === historyDate);
                    if (!rec) return <div style={{ color: C.gray3 }}>No data</div>;
                    return (
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: C.black, marginBottom: 24 }}>
                          {isToday ? "Today" : rec.date} — {rec.pickedAlbums.length} picked
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 32 }}>
                          {rec.allAlbums.map((album, idx) => {
                            const isPicked = !!rec.pickedAlbums.find(p => p.id === album.id);
                            return (
                              <a key={album.id} href={album.bandcampUrl} target="_blank" rel="noopener noreferrer"
                                style={{ display: "block", aspectRatio: "1/1", borderRadius: 10,
                                  overflow: "hidden", position: "relative", background: "#1a1a2e",
                                  textDecoration: "none", outline: isPicked ? `3px solid ${C.red}` : "none", outlineOffset: 2 }}>
                                {album.imageUrl
                                  ? <img src={album.imageUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover", filter: isPicked ? "none" : "grayscale(100%) brightness(0.55)" }} />
                                  : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, opacity: isPicked ? 1 : 0.35 }}>🎵</div>}
                                <div style={{ position: "absolute", top: 5, left: 7, fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.9)", textShadow: "0 1px 4px rgba(0,0,0,0.8)" }}>
                                  {String(idx + 1).padStart(2, "0")}
                                </div>
                                {isPicked && (
                                  <div style={{ position: "absolute", inset: 0, background: "rgba(232,0,13,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Badge>PICKED!</Badge>
                                  </div>
                                )}
                              </a>
                            );
                          })}
                        </div>
                        {rec.pickedAlbums.length > 0 && (
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em",
                              textTransform: "uppercase", color: C.gray3, marginBottom: 14 }}>Picked</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
                              {rec.pickedAlbums.map(album => (
                                <div key={album.id} style={{ background: C.card, borderRadius: 14,
                                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
                                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                                  <div style={{ width: 52, height: 52, borderRadius: 8, overflow: "hidden", background: "#1a1a2e", flexShrink: 0 }}>
                                    {album.imageUrl && <img src={album.imageUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                                  </div>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: C.black, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{album.title}</div>
                                    <div style={{ fontSize: 12, color: C.gray2, marginTop: 2 }}>{album.artist}</div>
                                  </div>
                                  <a href={album.bandcampUrl} target="_blank" rel="noopener noreferrer" style={{ padding: 4 }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.gray3} strokeWidth="2" strokeLinecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/></svg>
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* 日付一覧 */
                <div>
                  {/* Today */}
                  <div onClick={() => setHistoryDate("today")} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "16px 20px", borderRadius: 12, marginBottom: 8,
                    background: "#FEF2F2", border: `1px solid rgba(232,0,13,0.15)`,
                    cursor: "pointer",
                  }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.red }}>Today</div>
                      <div style={{ fontSize: 12, color: C.gray2, marginTop: 2 }}>{state.lastPickedDate} · {state.todayAlbums.length}/2 picked</div>
                    </div>
                    <div style={{ display: "flex", gap: 5 }}>
                      {state.suggestedAlbums.slice(0, 6).map(a => (
                        <div key={a.id} style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", background: "#1a1a2e" }}>
                          {a.imageUrl && <img src={a.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: state.todayAlbums.find(t => t.id === a.id) ? "none" : "grayscale(100%) brightness(0.55)" }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                  {(state.history ?? []).map(day => (
                    <div key={day.date} onClick={() => setHistoryDate(day.date)} style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "16px 20px", borderRadius: 12, marginBottom: 8,
                      background: C.card, border: `1px solid ${C.border}`,
                      cursor: "pointer", transition: "background 0.12s",
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFAF8"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.card; }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: C.black }}>{day.date}</div>
                        <div style={{ fontSize: 12, color: C.gray2, marginTop: 2 }}>{day.pickedAlbums.length}/2 picked</div>
                      </div>
                      <div style={{ display: "flex", gap: 5 }}>
                        {day.allAlbums.slice(0, 6).map(a => (
                          <div key={a.id} style={{ width: 36, height: 36, borderRadius: 6, overflow: "hidden", background: "#1a1a2e" }}>
                            {a.imageUrl && <img src={a.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: day.pickedAlbums.find(p => p.id === a.id) ? "none" : "grayscale(100%) brightness(0.55)" }} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {(state.history ?? []).length === 0 && (
                    <div style={{ padding: "60px 0", textAlign: "center", color: C.gray3, fontSize: 14 }}>
                      No history yet — come back tomorrow!
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ════ PROFILE ════ */}
          {tab === "profile" && (
            <div>
              <div style={{ marginBottom: 40 }}>
                <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: C.red, marginBottom: 8 }}>Profile</div>
                <h1 style={{ margin: 0, fontFamily: "'Bangers', cursive", fontSize: 64,
                  color: C.black, letterSpacing: "0.04em", lineHeight: 1 }}>YOUR STATS</h1>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32, maxWidth: 600 }}>
                {[
                  { value: state.collection.length, label: "Collected" },
                  { value: Object.keys(state.listenedTracks).length, label: "Listened" },
                  { value: 0, label: "Streak" },
                ].map(({ value, label }) => (
                  <div key={label} style={{ background: C.card, borderRadius: 16, padding: "24px 20px 20px",
                    textAlign: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                    <div style={{ fontFamily: "'Bangers', cursive", fontSize: 48, color: C.red, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: 12, color: C.gray2, marginTop: 8, letterSpacing: "0.06em" }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: C.card, borderRadius: 16, padding: 28,
                maxWidth: 560, boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>
                <div style={{ fontSize: 14, color: C.gray2, lineHeight: 1.8 }}>
                  Every day, 10 albums are discovered from <strong style={{ color: C.black }}>Bandcamp</strong>.<br/>
                  Pick 2. Listen to each track.<br/>
                  They are added to your collection.
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
