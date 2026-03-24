"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { AppState, DayRecord, loadState, saveState, todayString } from "@/lib/store";

// ── 型定義（albums.ts不要）────────────────────────────────────
export type Album = {
  id: string;
  title: string;
  artist: string;
  year: number;
  genre: string;
  emoji: string;
  color: string;
  bandcampUrl: string;
  bandcampId?: string;
  imageUrl?: string;
  tracks: { id: string; number: number; title: string; duration: string }[];
};

// ── アルバムカードコンポーネント ──────────────────────────────
function AlbumCard({
  album, index, picked, done, onPick,
  RED, GRAY1, GRAY2, GRAY3, BLACK, comicFont, typo,
}: {
  album: Album; index: number; picked: boolean; done: boolean;
  onPick: (a: Album) => void;
  RED: string; GRAY1: string; GRAY2: string; GRAY3: string; BLACK: string;
  comicFont: object; typo: Record<string, object>;
}) {
  return (
    <button
      onClick={() => onPick(album)}
      disabled={done && !picked}
      style={{
        display: "flex", flexDirection: "column" as const, alignItems: "stretch",
        background: picked ? "#FEF2F2" : "white",
        border: picked ? "2px solid " + RED : "2px solid transparent",
        borderRadius: "16px", cursor: done && !picked ? "default" : "pointer",
        textAlign: "left" as const, padding: "0", overflow: "hidden",
        boxShadow: picked ? "0 4px 16px rgba(232,0,13,0.18)" : "0 2px 8px rgba(0,0,0,0.07)",
        opacity: done && !picked ? 0.45 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div style={{
        width: "100%", aspectRatio: "1 / 1", background: "#1a1a2e",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "48px", position: "relative" as const, overflow: "hidden",
      }}>
        {album.imageUrl ? (
          <img src={album.imageUrl} alt={album.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" as const,
                     position: "absolute" as const, inset: 0 }} />
        ) : (
          <span>🎵</span>
        )}
        <div style={{
          position: "absolute" as const, top: "8px", left: "10px",
          ...(typo.caption2 as object), color: "rgba(255,255,255,0.9)", fontWeight: 700,
          letterSpacing: "0.05em", textShadow: "0 1px 4px rgba(0,0,0,0.6)", zIndex: 1,
        }}>
          {String(index + 1).padStart(2, "0")}
        </div>
        {picked && (
          <div style={{
            position: "absolute" as const, inset: 0,
            background: "rgba(232,0,13,0.25)", display: "flex",
            alignItems: "center", justifyContent: "center", zIndex: 2,
          }}>
            <div style={{ ...(comicFont as object), fontSize: "22px", color: "white",
              background: RED, padding: "4px 14px", borderRadius: "8px" }}>YES!</div>
          </div>
        )}
      </div>
      <div style={{ padding: "10px 12px 12px" }}>
        <div style={{ ...(typo.caption2 as object), color: picked ? RED : GRAY3,
          letterSpacing: "0.12em", textTransform: "uppercase" as const, marginBottom: "3px" }}>
          #{album.genre}
        </div>
        <div style={{ ...(typo.headline as object), fontSize: "14px",
          color: picked ? BLACK : GRAY1, whiteSpace: "nowrap" as const,
          overflow: "hidden", textOverflow: "ellipsis", marginBottom: "2px" }}>
          {album.title}
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ ...(typo.footnote as object), fontSize: "11px", color: GRAY2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const,
            flex: 1, marginRight: "6px" }}>{album.artist}</span>
          <span style={{ ...(typo.caption2 as object), color: GRAY3, flexShrink: 0 }}>{album.year}</span>
        </div>
      </div>
    </button>
  );
}

// ── 視聴バナー ────────────────────────────────────────────────
function AlbumBanner({
  album, completed, RED, SEPARATOR, comicFont, typo,
}: {
  album: Album; completed: boolean;
  RED: string; SEPARATOR: string;
  comicFont: object; typo: Record<string, object>;
}) {
  return (
    <div style={{ position: "relative" as const, height: "240px", background: "#1a1a2e",
      overflow: "hidden", display: "flex", alignItems: "flex-end" }}>
      {album.imageUrl && (
        <img src={album.imageUrl} alt={album.title}
          style={{ position: "absolute" as const, inset: 0, width: "100%", height: "100%",
                   objectFit: "cover" as const, opacity: 0.45 }} />
      )}
      {completed && (
        <div style={{ position: "absolute" as const, top: "16px", right: "16px",
          background: RED, color: "white", borderRadius: "6px", padding: "6px 14px",
          ...(comicFont as object), fontSize: "18px", zIndex: 2 }}>LISTENED!</div>
      )}
      <div style={{ position: "relative" as const, zIndex: 1, padding: "24px", width: "100%",
        background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)" }}>
        <div style={{ ...(typo.caption1 as object), letterSpacing: "0.15em",
          textTransform: "uppercase" as const, color: "rgba(255,255,255,0.65)", marginBottom: "6px" }}>
          #{album.genre.toUpperCase()} · {album.year}
        </div>
        <div style={{ ...(comicFont as object), fontSize: "28px", color: "white", lineHeight: "1.1",
          overflow: "hidden", display: "-webkit-box",
          WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
          {album.title.toUpperCase()}
        </div>
        <div style={{ ...(typo.callout as object), color: "rgba(255,255,255,0.75)", marginTop: "4px" }}>
          {album.artist}
        </div>
      </div>
    </div>
  );
}

// ── アイコン ──────────────────────────────────────────────────
const IconToday = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2.5" />
    <path d="M16 2v4M8 2v4M3 10h18" />
    <circle cx="12" cy="16" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
const IconCollection = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
);
const IconProfile = ({ active }: { active: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="3.5" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);


// ── メインコンポーネント ──────────────────────────────────────
export default function Home() {
  const [state, setState] = useState<AppState | null>(null);
  const [tab, setTab] = useState("today");
  const [slideDir, setSlideDir] = useState<"left" | "right" | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [playerAlbumId, setPlayerAlbumId] = useState<string | null>(null);
  const [playerMode, setPlayerMode] = useState<"today" | "collection">("today");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // タイムロック：トラックごとの解禁状態
  const [unlockedTracks, setUnlockedTracks] = useState<Record<string, boolean>>({});
  // Bandcamp側で別トラックから再生したとき、EARWORMのチェック開始位置を上書き
  // albumIdごとのオフセット { albumId: overrideIdx }
  const [trackStartOverride, setTrackStartOverride] = useState<Record<string, number>>({});
  // オンボーディング
  // step: null=通常, "welcome"=初回WS, 1=グリッド説明, 2=1枚後, 3=groove説明, 4=collection説明
  const [onbStep, setOnbStep] = useState<null | "welcome" | 1 | 2 | 3 | 4>(null);

  // カレンダーモーダル
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState<string | null>(null);
  // タップアニメーション中のトラックkey
  const [animatingKey, setAnimatingKey] = useState<string | null>(null);
  // 飛行中のパーティクル { id, x, y, emoji }
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  // 全曲完了時のお祝い表示
  const [showCelebration, setShowCelebration] = useState(false);
  const particleIdRef = useRef(0);
  // タイマーRef（setTimeout ID群）
  const lockTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // 累積タイマー管理：残り待機時間 { "albumId-trackIdx": remainingMs }
  // モーダルを閉じたときに保存し、再度開いたときに残り時間から再開
  const remainingMsRef = useRef<Record<string, number>>({});
  // タイマーが走り始めた時刻
  const timerStartedAtRef = useRef<Record<string, number>>({});
  // postMessageで自動チェックするための参照
  const playerAlbumRef = useRef<string | null>(null);
  const stateRef = useRef<AppState | null>(null);

  // Bandcamp Discoverから10枚取得
  const fetchDiscover = useCallback(async () => {
    setLoading(true);
    setError(null);
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
        id: a.id,
        title: a.title,
        artist: a.artist,
        year: new Date().getFullYear(),
        genre: a.genre || "Indie",
        emoji: "🎵",
        color: "#1a1a2e",
        bandcampUrl: a.bandcampUrl,
        bandcampId: a.bandcampId,
        imageUrl: a.imageUrl,
        // APIから実際のトラックリストを使用。なければプレースホルダー
        tracks: (a.tracks && a.tracks.length > 0)
          ? a.tracks.map((t, i) => ({ ...t, id: `${a.id}-${i + 1}` }))
          : Array.from({ length: 10 }, (_, i) => ({
              id: `${a.id}-${i + 1}`,
              number: i + 1,
              title: `Track ${i + 1}`,
              duration: "",
            })),
      }));

      setState(prev => {
        if (!prev) return prev;
        const ns: AppState = {
          ...prev,
          suggestedAlbums: albums,
          todayAlbums: [],
          listenedTracks: {},
          lastPickedDate: todayString(),
        };
        saveState(ns);
        return ns;
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  // 初期化
  useEffect(() => {
    setMounted(true);
    const loaded = loadState();
    const today = todayString();
    if (loaded.lastPickedDate !== today || !loaded.suggestedAlbums?.length) {
      // 前日のデータを履歴に保存
      let history = loaded.history ?? [];
      if (loaded.lastPickedDate && loaded.suggestedAlbums?.length > 0) {
        const existing = history.find(h => h.date === loaded.lastPickedDate);
        if (!existing) {
          const dayRecord: DayRecord = {
            date: loaded.lastPickedDate,
            allAlbums: loaded.suggestedAlbums,
            pickedAlbums: loaded.todayAlbums,
          };
          history = [dayRecord, ...history].slice(0, 365); // 最大1年分
        }
      }
      const ns: AppState = { ...loaded, suggestedAlbums: [], todayAlbums: [], listenedTracks: {}, lastPickedDate: today, history };
      saveState(ns);
      setState(ns);
    } else {
      // ピック済みの状態でリロードしたときはtoday-doneタブに戻す
      if (loaded.todayAlbums?.length >= 2) {
        setTab("today-done");
      }
      setState(loaded);
    }
    // オンボーディング判定（loadした後に実行）
  }, []);

  // onboardingDoneの監視：stateセット後にオンボーディング開始判定
  useEffect(() => {
    if (mounted && state && !state.onboardingDone && onbStep === null) {
      setOnbStep("welcome");
    }
  }, [mounted, state, onbStep]);

  // suggestedAlbumsが空ならfetch
  useEffect(() => {
    if (mounted && state && state.suggestedAlbums.length === 0 && !loading && !error) {
      fetchDiscover();
    }
  }, [mounted, state, loading, error, fetchDiscover]);

  // デスクトップ幅（900px以上）なら /desktop にリダイレクト
  useEffect(() => {
    if (window.innerWidth >= 900) {
      window.location.replace("/desktop");
      return;
    }
  }, []);

  // stateRefを常に最新に保つ
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { playerAlbumRef.current = playerAlbumId; }, [playerAlbumId]);

  // フレーズリスト
  const HYPE_PHRASES = ["DIG!"];

  // トラックキー生成
  function trackKey(albumId: string, idx: number) { return `${albumId}-${idx}`; }

  // トラックのduration文字列を秒数に変換
  function durationToSec(duration: string): number {
    const parts = duration.split(":").map(Number);
    return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
  }

  // 全タイマーをクリア
  function clearAllLockTimers() {
    Object.values(lockTimersRef.current).forEach(id => clearTimeout(id));
    lockTimersRef.current = {};
  }

  // 1トラック分のタイマーを（残り時間から）起動
  function startSingleTrackTimer(album: Album, trackIdx: number) {
    const key = trackKey(album.id, trackIdx);
    const track = album.tracks[trackIdx];
    if (!track) return;

    // 既存タイマーをクリア
    if (lockTimersRef.current[key]) clearTimeout(lockTimersRef.current[key]);

    // 残り時間が保存されていればそこから再開、なければ初回計算
    let remainingMs = remainingMsRef.current[key];
    if (remainingMs === undefined) {
      const baseSec = track.duration ? durationToSec(track.duration) : 180;
      const ratio = 0.20 + Math.random() * 0.30;
      remainingMs = Math.max(3000, Math.round(baseSec * ratio * 1000));
      remainingMsRef.current[key] = remainingMs;
    }

    // タイマースタート時刻を記録
    timerStartedAtRef.current[key] = Date.now();

    lockTimersRef.current[key] = setTimeout(() => {
      delete remainingMsRef.current[key];
      delete timerStartedAtRef.current[key];
      setUnlockedTracks(prev => ({ ...prev, [key]: true }));
    }, remainingMs);
  }

  // モーダルを閉じるとき — 走っている全タイマーを一時停止（残り時間を保存）
  function pauseAllTimers() {
    Object.keys(lockTimersRef.current).forEach(key => {
      clearTimeout(lockTimersRef.current[key]);
      const startedAt = timerStartedAtRef.current[key];
      const remaining = remainingMsRef.current[key];
      if (startedAt !== undefined && remaining !== undefined) {
        const elapsed = Date.now() - startedAt;
        remainingMsRef.current[key] = Math.max(0, remaining - elapsed);
      }
    });
    lockTimersRef.current = {};
    timerStartedAtRef.current = {};
  }

  // プレイヤーを開いたとき — 現在のisNextトラックのタイマーを起動
  function startTrackLockTimers(album: Album, startIdx: number) {
    // 初回オープンのみunlockedTracksをリセット（再オープンは保持）
    const isFirstOpen = Object.keys(remainingMsRef.current).length === 0
      && Object.keys(unlockedTracks).length === 0;
    if (isFirstOpen) {
      // 全トラックの待機時間を先に決めておく（累積計算のため）
      let cumulativeMs = 0;
      album.tracks.forEach((track, i) => {
        if (i < startIdx) return; // チェック済みはスキップ
        const key = trackKey(album.id, i);
        if (remainingMsRef.current[key] !== undefined) return; // 既に設定済み
        const baseSec = track.duration ? durationToSec(track.duration) : 180;
        const ratio = 0.20 + Math.random() * 0.30;
        const waitMs = Math.max(3000, Math.round(baseSec * ratio * 1000));
        // 累積：前のトラックが解禁されてから次が始まるのではなく、
        // プレイヤーを開いた時点からの累積時間で解禁
        cumulativeMs += waitMs;
        remainingMsRef.current[key] = cumulativeMs;
      });
    }
    // startIdxのタイマーだけ起動（連鎖は各チェック時に行う）
    startSingleTrackTimer(album, startIdx);
  }

  // クリーンアップ
  useEffect(() => { return () => clearAllLockTimers(); }, []);

  // プレイヤーを閉じる（タイマー一時停止・状態保持）
  function closePlayer() {
    pauseAllTimers();
    setPlayerAlbumId(null);
  }

  // 1トラックチェック時：小さなレコードをCollectionタブに飛ばす
  function fireParticle(fromEl: HTMLElement | null) {
    const id = ++particleIdRef.current;
    // 発射元の位置
    const fromRect = fromEl?.getBoundingClientRect();
    const startX = fromRect ? fromRect.left + fromRect.width / 2 : window.innerWidth / 2;
    const startY = fromRect ? fromRect.top + fromRect.height / 2 : window.innerHeight / 2;
    // ランダムなレコード絵文字
    const emojis = ['🎵', '🎶', '🎸', '🥁', '🎷', '🎺', '🎹', '🐛'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    setParticles(prev => [...prev, { id, x: startX, y: startY, emoji }]);
    // アニメーション終了後に削除
    setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 900);
  }

  // 全曲完了時：お祝いアニメーション
  function fireCelebration() {
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2800);
  }

  if (!state || !mounted) {
    return (
      <div style={{ background: "#F5F4F0", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Bangers', cursive", fontSize: "32px", color: "#E8000D", letterSpacing: "0.08em" }}>EARWORM</div>
      </div>
    );
  }

  // スライドアニメーション付きタブ切り替え
  function switchTab(next: string, dir: "left" | "right") {
    setSlideDir(dir);
    setTimeout(() => {
      setTab(next);
      setSlideDir(null);
    }, 380);
  }

  function pickAlbum(album: Album) {
    if (!state || state.todayAlbums.length >= 2) return;
    // すでに選んでいたらキャンセル（トグル）
    if (state.todayAlbums.find(a => a.id === album.id)) {
      const ns = { ...state, todayAlbums: state.todayAlbums.filter(a => a.id !== album.id) };
      saveState(ns);
      setState(ns);
      return;
    }
    const newTodayAlbums = [...state.todayAlbums, album];
    const ns = { ...state, todayAlbums: newTodayAlbums };
    saveState(ns);
    setState(ns);
    // オンボーディング連動
    if (onbStep === 1) setOnbStep(2);
    else if (onbStep === 2) {
      setTimeout(() => { switchTab("today-done", "left"); setOnbStep(3); }, 300);
      return;
    }
    // 2枚目ピックで自動遷移（少し待ってからスライド）
    if (newTodayAlbums.length === 2) {
      setTimeout(() => switchTab("today-done", "left"), 300);
    }
  }

  const done = tab === "today-done" || state.todayAlbums.length >= 2;

  // ── オンボーディング完了 ──────────────────────────────────
  function finishOnboarding() {
    if (!state) { setOnbStep(null); return; }
    const ns = { ...state, onboardingDone: true };
    saveState(ns);
    setState(ns);
    setOnbStep(null);
  }

  // ── コーチマーク設定 ──────────────────────────────────────
  type CoachConfig = {
    message: string;
    subMessage?: string;
    highlightSelector?: string; // 使わず位置は固定
    position: "top" | "bottom" | "center";
    buttonLabel: string;
    onNext: () => void;
    step: number;
    total: number;
  };

  const coachConfig: CoachConfig | null = (() => {
    if (onbStep === 1) return {
      message: "毎日10枚、Bandcampから届く。",
      subMessage: "2枚だけ選ぼう。直感で。",
      position: "top",
      buttonLabel: "わかった、選ぶ →",
      onNext: () => {},   // ユーザーが実際にタップするまで進まない
      step: 1, total: 4,
    };
    if (onbStep === 2) return {
      message: "いい感じ。もう1枚。",
      subMessage: "ピックした2枚が今日のGrooveになる。",
      position: "top",
      buttonLabel: "もう1枚選ぶ →",
      onNext: () => {},
      step: 2, total: 4,
    };
    if (onbStep === 3) return {
      message: "これが YOUR DAILY GROOVE。",
      subMessage: "Bandcampのプレイヤーで聴いてみよう。\nトラックを掘り起こすとコレクションに追加される。",
      position: "top",
      buttonLabel: "コレクションを見る →",
      onNext: () => { switchTab("collection", "left"); setTimeout(() => setOnbStep(4), 420); },
      step: 3, total: 4,
    };
    if (onbStep === 4) return {
      message: "ここに積み上がっていく。",
      subMessage: "毎日2枚。それだけ。\nさあ、今日のGrooveを始めよう。",
      position: "center",
      buttonLabel: "はじめる！",
      onNext: () => { switchTab("today", "right"); finishOnboarding(); },
      step: 4, total: 4,
    };
    return null;
  })();

  const RED = "#E8000D";
  const BG = "#F5F4F0";
  const BLACK = "#111111";
  const GRAY1 = "#3C3C3E";
  const GRAY2 = "#636366";
  const GRAY3 = "#AEAEB2";
  const SEPARATOR = "#E5E4E0";
  const comicFont = { fontFamily: "'Bangers', 'Impact', cursive" };

  const typo = {
    title2:     { fontSize: "22px", fontWeight: 700, letterSpacing: "0.35px", lineHeight: "28px", color: BLACK },
    title3:     { fontSize: "20px", fontWeight: 600, letterSpacing: "0.38px", lineHeight: "25px", color: BLACK },
    headline:   { fontSize: "17px", fontWeight: 600, letterSpacing: "-0.41px", lineHeight: "22px", color: BLACK },
    body:       { fontSize: "17px", fontWeight: 400, letterSpacing: "-0.41px", lineHeight: "22px", color: GRAY1 },
    callout:    { fontSize: "16px", fontWeight: 400, letterSpacing: "-0.32px", lineHeight: "21px", color: GRAY1 },
    footnote:   { fontSize: "13px", fontWeight: 400, letterSpacing: "-0.08px", lineHeight: "18px", color: GRAY2 },
    caption1:   { fontSize: "12px", fontWeight: 400, letterSpacing: "0px",     lineHeight: "16px", color: GRAY3 },
    caption2:   { fontSize: "11px", fontWeight: 400, letterSpacing: "0.07px",  lineHeight: "13px", color: GRAY3 },
  };

  const tabs = [
    { id: "today",      label: "Today",      Icon: IconToday },
    { id: "collection", label: "Collection", Icon: IconCollection },
    { id: "profile",    label: "Profile",    Icon: IconProfile },
  ];

  // CollectionタブのX中心座標（底部ナビ2番目）
  const collectionTabX = typeof window !== 'undefined' ? window.innerWidth * (143 + 71) / 430 : 214;
  const collectionTabY = typeof window !== 'undefined' ? window.innerHeight - 30 : 900;

  return (
    <>
    <style>{`
      @keyframes slideOutLeft { from{transform:translateX(0);opacity:1} to{transform:translateX(-100%);opacity:0} }
      @keyframes slideInRight { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
      .slide-left-out { animation: slideOutLeft 0.38s cubic-bezier(0.4,0,0.2,1) forwards; }
      .slide-left-in  { animation: slideInRight 0.38s cubic-bezier(0.4,0,0.2,1) forwards; }
      @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      @keyframes slideUpFade { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    `}</style>

    {/* ====== ONBOARDING: WELCOME ====== */}
    {onbStep === "welcome" && (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9000,
        background: "#0a0a0a",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "40px 32px",
        fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif",
        animation: "fadeIn 0.6s ease forwards",
      }}>
        {/* ロゴ */}
        <div style={{ fontFamily: "'Bangers', cursive", fontSize: "64px", letterSpacing: "0.08em", color: "#E8000D", lineHeight: 1, marginBottom: "8px" }}>
          EARWORM
        </div>
        <div style={{ fontSize: "13px", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "56px" }}>
          Daily Music Discovery
        </div>

        {/* コンセプトカード群 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "320px", marginBottom: "56px" }}>
          {[
            { num: "10", label: "毎日10枚", sub: "Bandcampから届く新しい音楽", icon: "🎵" },
            { num: "02", label: "2枚だけ選ぶ", sub: "直感でPICK、すべて聴けばコレクションへ", icon: "✌️" },
            { num: "∞", label: "聴いて積む", sub: "コレクションが日々育っていく", icon: "📀" },
          ].map(({ num, label, sub, icon }, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: "16px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "14px", padding: "0 20px",
              border: "1px solid rgba(255,255,255,0.08)",
              height: "76px",
              animation: `slideUpFade 0.5s ${0.2 + i * 0.15}s ease both`,
            }}>
              <div style={{
                fontFamily: num === "∞" ? "Georgia, serif" : "'Bangers', cursive",
                fontSize: num === "∞" ? "34px" : "32px",
                lineHeight: 1,
                color: "#E8000D", width: "44px", textAlign: "center", flexShrink: 0,
              }}>{num}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "white", marginBottom: "3px" }}>{label}</div>
                <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>
              </div>
              <div style={{ fontSize: "22px", flexShrink: 0, marginLeft: "8px" }}>{icon}</div>
            </div>
          ))}
        </div>

        {/* STARTボタン */}
        <button
          onClick={() => setOnbStep(1)}
          style={{
            width: "100%", maxWidth: "320px",
            background: "#E8000D", border: "none", borderRadius: "16px",
            padding: "18px 24px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
            boxShadow: "0 8px 32px rgba(232,0,13,0.45)",
            animation: "slideUpFade 0.5s 0.7s ease both",
            whiteSpace: "nowrap",
          }}>
          <span style={{ fontFamily: "'Bangers', cursive", fontSize: "28px", letterSpacing: "0.1em", color: "white" }}>
            START PICKING
          </span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        <div style={{ marginTop: "20px", fontSize: "11px", color: "rgba(255,255,255,0.25)", letterSpacing: "0.1em", animation: "slideUpFade 0.5s 0.9s ease both" }}>
          Powered by Bandcamp Discover
        </div>
      </div>
    )}

    {/* ====== ONBOARDING: コーチマーク ====== */}
    {coachConfig && (
      <div style={{
        position: "fixed", inset: 0, zIndex: 8000,
        pointerEvents: "none",
      }}>
        {/* 半透明オーバーレイ（下半分 or 上半分） */}
        <div style={{
          position: "absolute", inset: 0,
          background: coachConfig.position === "top"
            ? "linear-gradient(to bottom, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.82) 65%)"
            : "linear-gradient(to top, rgba(0,0,0,0.0) 50%, rgba(0,0,0,0.82) 65%)",
        }} />

        {/* コーチカード */}
        <div style={{
          position: "absolute",
          ...(coachConfig.position === "top"
            ? { bottom: "100px", left: 0, right: 0 }
            : coachConfig.position === "bottom"
              ? { top: "80px", left: 0, right: 0 }
              : { top: "50%", left: 0, right: 0, transform: "translateY(-50%)" }),
          display: "flex", justifyContent: "center",
          pointerEvents: "auto",
          padding: "0 24px",
          animation: "slideUpFade 0.35s ease both",
        }}>
          <div style={{
            background: "rgba(15,15,15,0.97)",
            borderRadius: "20px", padding: "24px 24px 20px",
            width: "100%", maxWidth: "400px",
            border: "1px solid rgba(232,0,13,0.3)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.6)",
          }}>
            {/* ステップインジケーター */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
              {Array.from({ length: coachConfig.total }).map((_, i) => (
                <div key={i} style={{
                  height: "3px", flex: 1, borderRadius: "2px",
                  background: i < coachConfig.step ? "#E8000D" : "rgba(255,255,255,0.15)",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>

            <div style={{ fontFamily: "'Bangers', cursive", fontSize: "26px", color: "white", letterSpacing: "0.04em", lineHeight: 1.2, marginBottom: "8px" }}>
              {coachConfig.message}
            </div>
            {coachConfig.subMessage && (
              <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "20px", whiteSpace: "pre-line" }}>
                {coachConfig.subMessage}
              </div>
            )}

            {/* ボタン（step 1,2 は「実際に選んで」なのでスキップ可能リンクのみ） */}
            {(onbStep === 1 || onbStep === 2) ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)" }}>
                  ↑ アルバムをタップして選んでみよう
                </div>
                <button
                  onClick={() => {
                    if (onbStep === 1) setOnbStep(2);
                    else { switchTab("today-done", "left"); setOnbStep(3); }
                  }}
                  style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "12px", color: "rgba(255,255,255,0.3)", padding: "4px 8px", textDecoration: "underline" }}>
                  スキップ
                </button>
              </div>
            ) : (
              <button
                onClick={coachConfig.onNext}
                style={{
                  width: "100%", background: "#E8000D", border: "none",
                  borderRadius: "12px", padding: "14px",
                  fontFamily: "'Bangers', cursive", fontSize: "22px",
                  letterSpacing: "0.05em", color: "white", cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(232,0,13,0.4)",
                }}>
                {coachConfig.buttonLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    )}

    {/* パーティクル：1トラックごとに飛ぶ */}
    {particles.map(p => (
      <div key={p.id} style={{
        position: "fixed", zIndex: 9999,
        left: p.x, top: p.y,
        pointerEvents: "none",
        fontSize: "22px",
        animation: `flyToCollection 0.85s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards`,
        '--tx': `${collectionTabX - p.x}px`,
        '--ty': `${collectionTabY - p.y}px`,
      } as React.CSSProperties}>
        {p.emoji}
      </div>
    ))}

    {/* 全曲完了：お祝いオーバーレイ */}
    {showCelebration && (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9998,
        display: "flex", flexDirection: "column" as const,
        alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        {/* 背景フラッシュ */}
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(circle, rgba(232,0,13,0.18) 0%, transparent 70%)",
          animation: "celebBg 2.8s ease forwards",
        }} />
        {/* 中央テキスト */}
        <div style={{
          fontFamily: "'Bangers', cursive",
          fontSize: "52px", letterSpacing: "0.06em",
          color: "#E8000D",
          animation: "celebText 2.8s cubic-bezier(0.34,1.56,0.64,1) forwards",
          textShadow: "0 4px 24px rgba(232,0,13,0.4)",
          zIndex: 1,
        }}>
          ADDED TO<br/>COLLECTION!
        </div>
        {/* 飛び散るレコード群 */}
        {['🎵','🎶','🎸','🥁','🎷','🎺','💿','🎹','🐛'].map((em, i) => (
          <div key={i} style={{
            position: "absolute",
            fontSize: "28px",
            animation: `burst${i % 3} 2.5s ease forwards`,
            animationDelay: `${i * 0.08}s`,
            left: "50%", top: "50%",
          } as React.CSSProperties}>{em}</div>
        ))}
      </div>
    )}


    {/* ===== 共通プレイヤーモーダル（Today / Collection 兼用） ===== */}
    {playerAlbumId && (() => {
      // 対象アルバムをTodayまたはCollectionから検索
      const playerAlbum =
        state.todayAlbums.find(a => a.id === playerAlbumId) ??
        state.collection.find(a => a.id === playerAlbumId);
      if (!playerAlbum || !playerAlbum.bandcampId) return null;

      const isCollectionMode = playerMode === "collection";
      const listenedCount = state.listenedTracks[playerAlbum.id] ?? 0;
      const total = playerAlbum.tracks.length > 0 ? playerAlbum.tracks.length : 10;

      return (
        <div style={{ position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.72)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
          onClick={() => closePlayer()}>
          <div style={{ width: "100%", maxWidth: "448px", background: "white", borderRadius: "20px 20px 0 0", overflow: "hidden", display: "flex", flexDirection: "column" as const, maxHeight: "85vh", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            onClick={e => e.stopPropagation()}>

            {/* ヘッダー */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 10px", flexShrink: 0 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ ...typo.headline, color: BLACK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{playerAlbum.title}</div>
                <div style={{ ...typo.footnote, color: GRAY2 }}>{playerAlbum.artist}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0, marginLeft: "12px" }}>
                {isCollectionMode && (
                  <div style={{ background: RED, borderRadius: "4px", padding: "3px 8px" }}>
                    <span style={{ fontFamily: "'Bangers', cursive", fontSize: "11px", color: "white", letterSpacing: "0.04em" }}>COLLECTED</span>
                  </div>
                )}
                <button
                  onClick={() => closePlayer()}
                  style={{ background: "#F2F2F7", border: "none", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GRAY2} strokeWidth="2.5" strokeLinecap="round">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Bandcamp大プレイヤー */}
            <iframe
              key={playerAlbum.bandcampId}
              style={{ border: 0, width: "100%", height: "340px", flexShrink: 0 }}
              seamless
              src={`https://bandcamp.com/EmbeddedPlayer/album=${playerAlbum.bandcampId}/size=large/bgcol=ffffff/linkcol=e8000d/artwork=small/transparent=true/`}
            />

            {/* トラックリスト */}
            <div style={{ padding: "7px 16px 6px", background: "linear-gradient(135deg,#062020,#0a3028)", borderBottom: "0.5px solid #144030" }}>
              <span style={{ fontSize: "10px", color: "#408870", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
                {isCollectionMode ? "Tracklist" : "Unearth each track"}
              </span>
            </div>
            <div style={{ overflowY: "auto" as const, flex: 1, background: "linear-gradient(180deg,#071c1c 0%,#041414 100%)" }}>
              {playerAlbum.tracks.map((track, i) => {
                const isListened = i < listenedCount;
                const key = trackKey(playerAlbum.id, i);
                const isNext = !isCollectionMode && (i === (trackStartOverride[playerAlbum.id] ?? listenedCount));
                const isUnlocked = !isCollectionMode && !!unlockedTracks[key];
                const phraseIdx = (playerAlbum.id.charCodeAt(0) + i * 7) % HYPE_PHRASES.length;
                const phrase = HYPE_PHRASES[phraseIdx];

                return (
                  <div key={track.id}
                    onClick={() => {
                      if (!isCollectionMode && !isListened && i !== (state.listenedTracks[playerAlbum.id] ?? 0)) {
                        setTrackStartOverride(prev => ({ ...prev, [playerAlbum.id]: i }));
                        setUnlockedTracks(prev => {
                          const next = { ...prev };
                          delete next[trackKey(playerAlbum.id, state.listenedTracks[playerAlbum.id] ?? 0)];
                          return next;
                        });
                        startSingleTrackTimer(playerAlbum, i);
                      }
                    }}
                    style={{
                      display: "flex", alignItems: "center", padding: "8px 14px",
                      borderBottom: "0.5px solid #0e2828",
                      background: isListened
                        ? "linear-gradient(90deg,#0a2828,#081e1e)"
                        : isNext && isUnlocked
                          ? "linear-gradient(90deg,#142010,#0c1808)"
                          : "transparent",
                      borderLeft: !isCollectionMode && isNext && isUnlocked ? "2.5px solid #E8000D" : "2.5px solid transparent",
                      opacity: !isCollectionMode && !isListened && !isUnlocked && !isNext ? 0.35 : 1,
                      transition: "opacity 0.4s ease",
                    }}>
                    {/* バッジ */}
                    <div style={{
                      width: "20px", height: "20px", borderRadius: "4px", flexShrink: 0, marginRight: "10px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      background: isListened
                        ? "linear-gradient(135deg,#40c8a0,#20a078)"
                        : isCollectionMode
                          ? "#0e2424"
                          : isNext && isUnlocked ? "transparent" : "#0e2424",
                      border: !isCollectionMode && isNext && isUnlocked ? "1.5px solid #ff6040" : "none",
                    }}>
                      {isListened
                        ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        : !isCollectionMode && isNext && isUnlocked
                          ? <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ff6040" }} />
                          : null
                      }
                    </div>
                    {/* タイトル */}
                    <span style={{
                      flex: 1, fontSize: "13px",
                      color: isListened ? "#80c8b0" : !isCollectionMode && isNext && isUnlocked ? "white" : isCollectionMode ? "#80c8b0" : "#2a4840",
                      fontWeight: !isCollectionMode && isNext && isUnlocked ? 600 : 400,
                      paddingRight: "6px",
                    }}>
                      {track.title}
                    </span>
                    {/* 時間 */}
                    {track.duration && (
                      <span style={{ fontSize: "11px", color: "#3a5a50", flexShrink: 0, fontVariantNumeric: "tabular-nums" as const, marginRight: "6px" }}>{track.duration}</span>
                    )}
                    {/* DIG!ボタン（Todayモードのみ） */}
                    {!isCollectionMode && isNext && (
                      isUnlocked
                        ? (
                          <button
                            key={`${key}-unlocked`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const newCount = i + 1;
                              let isComplete = false;
                              setState(prev => {
                                if (!prev) return prev;
                                const newListened = { ...prev.listenedTracks, [playerAlbum.id]: newCount };
                                let newCollection = prev.collection;
                                if (newCount >= total && !prev.collection.find(a => a.id === playerAlbum.id)) {
                                  newCollection = [...prev.collection, playerAlbum];
                                  isComplete = true;
                                }
                                const ns = { ...prev, listenedTracks: newListened, collection: newCollection };
                                saveState(ns);
                                return ns;
                              });
                              setTrackStartOverride(prev => { const next = { ...prev }; delete next[playerAlbum.id]; return next; });
                              if (i + 1 < playerAlbum.tracks.length) startSingleTrackTimer(playerAlbum, i + 1);
                              fireParticle(e.currentTarget as HTMLElement);
                              if (isComplete) setTimeout(fireCelebration, 400);
                            }}
                            style={{
                              background: RED, border: "none", borderRadius: "20px", padding: "7px 14px",
                              cursor: "pointer", flexShrink: 0, whiteSpace: "nowrap" as const,
                              display: "flex", alignItems: "center", gap: "6px",
                              boxShadow: animatingKey === key ? "0 1px 4px rgba(232,0,13,0.3)" : "0 3px 10px rgba(232,0,13,0.45)",
                              transform: animatingKey === key ? "scale(0.88)" : "scale(1)",
                              transition: "transform 0.12s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.12s ease",
                            }}
                            onPointerDown={() => setAnimatingKey(key)}
                            onPointerUp={() => setTimeout(() => setAnimatingKey(null), 200)}
                            onPointerLeave={() => setAnimatingKey(null)}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5"/>
                            </svg>
                            <span style={{ fontFamily: "'Bangers', cursive", fontSize: "16px", letterSpacing: "0.06em", color: "white" }}>{phrase}</span>
                          </button>
                        ) : (
                          <div style={{ width: "36px", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px", flexShrink: 0 }}>
                            {[0,1,2].map(d => <div key={d} style={{ width: "3px", height: "3px", borderRadius: "50%", background: "#1a3830", opacity: 0.8 }} />)}
                          </div>
                        )
                    )}
                  </div>
                );
              })}
            </div>

            {/* フッター */}
            <div style={{ padding: "8px 16px 12px", borderTop: "0.5px solid #0e2828", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "space-between", background: "linear-gradient(180deg,#071c1c,#041414)" }}>
              <span style={{ fontSize: "11px", color: "#306050" }}>
                {isCollectionMode
                  ? `${playerAlbum.tracks.length} tracks`
                  : `${listenedCount} / ${total} tracks unearthed`}
              </span>
              <button onClick={() => closePlayer()} style={{ background: "transparent", border: "none", color: "#306050", cursor: "pointer", fontSize: "12px", padding: "4px 8px" }}>close</button>
            </div>
          </div>
        </div>
      );
    })()}

    {/* カレンダーモーダル */}
    {showCalendar && (
      <div style={{ position: "fixed" as const, inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
        onClick={() => { setShowCalendar(false); setCalendarDate(null); }}>
        <div style={{ width: "100%", maxWidth: "448px", background: "white", borderRadius: "20px 20px 0 0", maxHeight: "85vh", overflow: "hidden", display: "flex", flexDirection: "column" as const }}
          onClick={e => e.stopPropagation()}>
          {/* モーダルヘッダー */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 12px", borderBottom: "1px solid #E5E4E0", flexShrink: 0 }}>
            <span style={{ fontFamily: "'Bangers', cursive", fontSize: "22px", color: "#111", letterSpacing: "0.04em" }}>HISTORY</span>
            <button onClick={() => { setShowCalendar(false); setCalendarDate(null); }}
              style={{ background: "#F2F2F7", border: "none", borderRadius: "50%", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
          <div style={{ overflowY: "auto" as const, flex: 1 }}>
            {/* 日付リスト */}
            {!calendarDate ? (
              <div>
                {/* 今日 */}
                <div
                  onClick={() => setCalendarDate("today")}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #E5E4E0", cursor: "pointer", background: "#FEF2F2" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#E8000D" }}>Today</div>
                    <div style={{ fontSize: "11px", color: "#636366", marginTop: "2px" }}>{state.lastPickedDate} · {state.todayAlbums.length}/2 picked</div>
                  </div>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {state.suggestedAlbums.slice(0, 4).map(a => (
                      <div key={a.id} style={{ width: "28px", height: "28px", borderRadius: "4px", overflow: "hidden", background: "#1a1a2e" }}>
                        {a.imageUrl && <img src={a.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" as const, filter: state.todayAlbums.find(t => t.id === a.id) ? "none" : "grayscale(100%) brightness(0.6)" }} />}
                      </div>
                    ))}
                  </div>
                </div>
                {/* 過去の履歴 */}
                {(state.history ?? []).map(day => (
                  <div key={day.date}
                    onClick={() => setCalendarDate(day.date)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #E5E4E0", cursor: "pointer" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>{day.date}</div>
                      <div style={{ fontSize: "11px", color: "#636366", marginTop: "2px" }}>{day.pickedAlbums.length}/2 picked</div>
                    </div>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {day.allAlbums.slice(0, 4).map(a => (
                        <div key={a.id} style={{ width: "28px", height: "28px", borderRadius: "4px", overflow: "hidden", background: "#1a1a2e" }}>
                          {a.imageUrl && <img src={a.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" as const, filter: day.pickedAlbums.find(p => p.id === a.id) ? "none" : "grayscale(100%) brightness(0.6)" }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {(state.history ?? []).length === 0 && (
                  <div style={{ padding: "40px 20px", textAlign: "center" as const, color: "#AEAEB2", fontSize: "13px" }}>
                    No history yet — come back tomorrow!
                  </div>
                )}
              </div>
            ) : (
              /* 日付詳細：10枚グリッド */
              <div style={{ padding: "16px" }}>
                <button onClick={() => setCalendarDate(null)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "transparent", border: "none", cursor: "pointer", marginBottom: "14px", color: "#636366", fontSize: "13px", padding: 0 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#636366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                  Back
                </button>
                {(() => {
                  const isToday = calendarDate === "today";
                  const record = isToday
                    ? { date: state.lastPickedDate, allAlbums: state.suggestedAlbums, pickedAlbums: state.todayAlbums }
                    : (state.history ?? []).find(h => h.date === calendarDate);
                  if (!record) return <div style={{ color: "#AEAEB2", fontSize: "13px", textAlign: "center" as const, padding: "20px" }}>No data</div>;
                  return (
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: "#111", marginBottom: "12px" }}>
                        {isToday ? "Today" : record.date} — {record.pickedAlbums.length} picked
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                        {record.allAlbums.map((album, idx) => {
                          const isPicked = !!record.pickedAlbums.find(p => p.id === album.id);
                          return (
                            <a key={album.id}
                              href={album.bandcampUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`${album.title} — ${album.artist}`}
                              style={{
                                display: "block",
                                aspectRatio: "1/1", borderRadius: "6px", overflow: "hidden",
                                position: "relative" as const, background: "#1a1a2e",
                                textDecoration: "none",
                                outline: isPicked ? "2px solid #E8000D" : "none",
                                outlineOffset: "1px",
                              }}>
                              {album.imageUrl ? (
                                <img src={album.imageUrl} alt={album.title}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" as const,
                                    filter: isPicked ? "none" : "grayscale(100%) brightness(0.55)" }} />
                              ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", opacity: isPicked ? 1 : 0.35 }}>🎵</div>
                              )}
                              <div style={{
                                position: "absolute" as const, top: "3px", left: "4px",
                                fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.85)",
                                textShadow: "0 1px 3px rgba(0,0,0,0.8)", lineHeight: 1,
                              }}>
                                {String(idx + 1).padStart(2, "0")}
                              </div>
                              {isPicked && (
                                <div style={{ position: "absolute" as const, inset: 0, background: "rgba(232,0,13,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <div style={{ background: "rgba(232,0,13,0.9)", borderRadius: "4px", padding: "2px 5px" }}>
                                    <span style={{ fontFamily: "'Bangers', cursive", fontSize: "10px", color: "white" }}>PICKED!</span>
                                  </div>
                                </div>
                              )}
                            </a>
                          );
                        })}
                      </div>
                      {/* ピックしたアルバムの詳細 */}
                      {record.pickedAlbums.length > 0 && (
                        <div style={{ marginTop: "16px", borderTop: "1px solid #E5E4E0", paddingTop: "14px" }}>
                          <div style={{ fontSize: "11px", color: "#AEAEB2", letterSpacing: "0.08em", textTransform: "uppercase" as const, marginBottom: "10px" }}>Picked</div>
                          {record.pickedAlbums.map(album => (
                            <div key={album.id} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                              <div style={{ width: "44px", height: "44px", borderRadius: "6px", overflow: "hidden", background: "#1a1a2e", flexShrink: 0 }}>
                                {album.imageUrl && <img src={album.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" as const }} />}
                              </div>
                              <div>
                                <div style={{ fontSize: "13px", fontWeight: 600, color: "#111" }}>{album.title}</div>
                                <div style={{ fontSize: "11px", color: "#636366" }}>{album.artist}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    )}

    {/* CSSアニメーション定義 */}
    <style>{`
      @keyframes flyToCollection {
        0%   { opacity: 1; transform: translate(0, 0) scale(1); }
        60%  { opacity: 1; transform: translate(calc(var(--tx) * 0.7), calc(var(--ty) * 0.7)) scale(0.8); }
        100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.2); }
      }
      @keyframes celebBg {
        0%   { opacity: 0; }
        20%  { opacity: 1; }
        80%  { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes celebText {
        0%   { opacity: 0; transform: scale(0.4); }
        30%  { opacity: 1; transform: scale(1.1); }
        70%  { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.9); }
      }
      @keyframes burst0 {
        0%   { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        30%  { opacity: 1; }
        100% { opacity: 0; transform: translate(calc(-50% + var(--bx0, 80px)), calc(-50% + var(--by0, -120px))) scale(0.3) rotate(360deg); }
      }
      @keyframes burst1 {
        0%   { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        30%  { opacity: 1; }
        100% { opacity: 0; transform: translate(calc(-50% + var(--bx1, -100px)), calc(-50% + var(--by1, -80px))) scale(0.3) rotate(-270deg); }
      }
      @keyframes burst2 {
        0%   { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        30%  { opacity: 1; }
        100% { opacity: 0; transform: translate(calc(-50% + var(--bx2, 20px)), calc(-50% + var(--by2, 140px))) scale(0.3) rotate(180deg); }
      }
    `}</style>

    <div style={{ minHeight: "100vh", background: BG, fontFamily: "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif", display: "flex", flexDirection: "column" as const, maxWidth: "448px", margin: "0 auto" }}>

      {/* HEADER */}
      <header style={{ position: "sticky" as const, top: 0, zIndex: 50, background: BG, borderBottom: "3px solid " + BLACK, padding: "14px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Bangers', 'Impact', cursive", fontSize: "32px", letterSpacing: "0.08em", color: RED, lineHeight: "36px" }}>
            EARWORM
          </div>
          <div style={{ ...typo.caption2, letterSpacing: "0.15em", textTransform: "uppercase" as const, marginTop: "2px", color: GRAY2 }}>
            {state.lastPickedDate}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* カレンダーボタン */}
          <button
            onClick={() => setShowCalendar(true)}
            title="View history"
            style={{ background: "transparent", border: "2px solid " + BLACK, borderRadius: "50%", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
            </svg>
          </button>
          {tab === "today" && !done && (
            <button
              onClick={fetchDiscover}
              disabled={loading}
              title="Refresh — get new albums"
              style={{
                background: "transparent", border: "2px solid " + BLACK,
                borderRadius: "50%", width: "36px", height: "36px",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.35 : 1, flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={BLACK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
            </button>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: "6px", background: RED, borderRadius: "20px", padding: "6px 14px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14l-4-4 1.41-1.41L11 13.17l6.59-6.59L19 8l-8 8z"/>
            </svg>
            <span style={{ ...typo.footnote, color: "white", fontWeight: 600, letterSpacing: "0.02em" }}>
              {state.collection.length} Collected
            </span>
          </div>
        </div>
      </header>

      {/* オンボーディング中スキップバナー */}
      {onbStep !== null && onbStep !== "welcome" && (
        <div style={{
          background: "rgba(232,0,13,0.08)", borderBottom: "1px solid rgba(232,0,13,0.15)",
          padding: "8px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span style={{ fontSize: "12px", color: "#E8000D", fontWeight: 600, letterSpacing: "0.05em" }}>
            TUTORIAL — STEP {onbStep} / 4
          </span>
          <button
            onClick={finishOnboarding}
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "12px", color: "#AEAEB2", padding: "2px 0", textDecoration: "underline" }}>
            スキップ
          </button>
        </div>
      )}

      <main
        style={{ flex: 1, paddingBottom: "88px", overflow: "hidden" }}
        className={slideDir === "left" ? "slide-left-out" : slideDir === "right" ? "" : ""}
        onTouchStart={e => { touchStartXRef.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (touchStartXRef.current === null) return;
          const dx = e.changedTouches[0].clientX - touchStartXRef.current;
          touchStartXRef.current = null;
          if (dx < -60) {
            // 左スワイプ → Collection
            if (tab === "today" || tab === "today-done") switchTab("collection", "left");
            else if (tab === "collection") switchTab("profile", "left");
          } else if (dx > 60) {
            // 右スワイプ → 戻る
            if (tab === "profile") switchTab("collection", "right");
            else if (tab === "collection") switchTab("today", "right");
          }
        }}
      >

        {/* ローディング */}
        {tab === "today" && loading && (
          <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "80px 20px", gap: "20px" }}>
            <div style={{ fontFamily: "'Bangers', cursive", fontSize: "48px", color: RED, letterSpacing: "0.04em" }}>
              LOADING...
            </div>
            <div style={{ ...typo.footnote, color: GRAY2 }}>Discovering new music from Bandcamp</div>
          </div>
        )}

        {/* エラー */}
        {tab === "today" && error && !loading && (
          <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", padding: "60px 20px", gap: "16px", textAlign: "center" as const }}>
            <div style={{ fontSize: "40px" }}>😵</div>
            <div style={{ ...typo.title3 }}>Connection Error</div>
            <div style={{ ...typo.footnote, color: GRAY2, maxWidth: "260px" }}>{error}</div>
            <button onClick={fetchDiscover}
              style={{ background: RED, color: "white", border: "none", borderRadius: "12px", padding: "12px 28px", cursor: "pointer", fontFamily: "'Bangers', cursive", fontSize: "22px", letterSpacing: "0.05em" }}>
              TRY AGAIN
            </button>
          </div>
        )}

        {/* PICK SELECTION */}
        {tab === "today" && state.todayAlbums.length < 2 && !loading && !error && state.suggestedAlbums.length > 0 && (
          <div>
            <div style={{ padding: "24px 20px 20px" }}>
              <div style={{ ...typo.caption1, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: RED, marginBottom: "6px" }}>
                Bandcamp Discover · {state.lastPickedDate}
              </div>
              <div style={{ fontFamily: "'Bangers', cursive", fontSize: "52px", letterSpacing: "0.04em", color: BLACK, lineHeight: "1" }}>
                {state.todayAlbums.length === 0 ? "PICK YOUR 2!" : "ONE MORE!"}
              </div>
              {state.todayAlbums.length > 0 && (
                <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" as const }}>
                  {state.todayAlbums.map(a => (
                    <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "6px", background: RED, borderRadius: "6px", padding: "5px 12px" }}>
                      <span style={{ ...typo.footnote, color: "white", fontWeight: 700 }}>{a.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", padding: "0 16px 24px" }}>
              {state.suggestedAlbums.map((album, index) => {
                const picked = !!state.todayAlbums.find(a => a.id === album.id);
                return (
                  <AlbumCard key={album.id}
                    album={album} index={index} picked={picked} done={done}
                    onPick={pickAlbum}
                    RED={RED} GRAY1={GRAY1} GRAY2={GRAY2} GRAY3={GRAY3} BLACK={BLACK}
                    comicFont={comicFont} typo={typo}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* YOUR DAILY GROOVE */}
        {(tab === "today-done" || (tab === "today" && done)) && (
          <div>
            <div style={{ padding: "24px 20px 20px" }}>
              <div style={{ ...typo.caption1, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: RED, marginBottom: "6px" }}>
                {"Today's Picks"}
              </div>
              <div style={{ fontFamily: "'Bangers', cursive", fontSize: "44px", letterSpacing: "0.04em", color: BLACK, lineHeight: "1" }}>
                YOUR DAILY GROOVE
              </div>
            </div>

            {state.todayAlbums.map(album => {
              const listened = state.listenedTracks[album.id] ?? 0;
              const totalTracks = album.tracks.length > 0 ? album.tracks.length : 10;
              const completed = listened >= totalTracks;
              const pct = Math.min(listened / totalTracks, 1);

              return (
                <div key={album.id} style={{ marginBottom: "24px" }}>
                  <AlbumBanner album={album} completed={completed}
                    RED={RED} SEPARATOR={SEPARATOR} comicFont={comicFont} typo={typo} />

                  {/* Progress */}
                  <div style={{ background: BG, padding: "16px 20px 14px", borderBottom: "1px solid " + SEPARATOR }}>
                    <div style={{ height: "4px", background: SEPARATOR, borderRadius: "2px", marginBottom: "8px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: completed ? "#34C759" : RED, width: String(Math.round(pct * 100)) + "%", borderRadius: "2px", transition: "width 0.5s ease" }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ ...typo.footnote, color: completed ? "#34C759" : RED, fontWeight: 600 }}>
                        {completed ? "✓ Added to Collection" : "In Progress"}
                      </span>
                      <span style={{ ...typo.caption1, color: GRAY3 }}>
                        {listened} / {totalTracks} tracks
                      </span>
                    </div>
                  </div>


                  {/* Play / Open ボタン */}
                  <div style={{ background: BG, padding: "16px 20px" }}>
                    {album.bandcampId ? (
                      <button
                        onClick={() => {
                          const startIdx = state.listenedTracks[album.id] ?? 0;
                          setPlayerMode("today");
                          setPlayerAlbumId(album.id);
                          startTrackLockTimers(album, startIdx);
                        }}
                        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", background: BLACK, borderRadius: "12px", border: "none", cursor: "pointer" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="none">
                          <polygon points="5,3 19,12 5,21"/>
                        </svg>
                        <span style={{ ...typo.headline, color: "white" }}>Play on Bandcamp</span>
                      </button>
                    ) : (
                      <a href={album.bandcampUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "14px", background: BLACK, borderRadius: "12px", textDecoration: "none" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                        </svg>
                        <span style={{ ...typo.headline, color: "white" }}>Open on Bandcamp ↗</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}

            {/* 全10枚グリッド（ピック=カラー、それ以外=モノクロ） */}
            {state.suggestedAlbums.length > 0 && (
              <div style={{ padding: "20px 16px 24px" }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ ...typo.caption1, color: GRAY3, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
                    Today's 10
                  </div>
                  <div style={{ ...typo.caption2, color: RED, fontWeight: 600 }}>
                    {state.todayAlbums.length}/2 picked
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                  {state.suggestedAlbums.map((album, idx) => {
                    const isPicked = !!state.todayAlbums.find(a => a.id === album.id);
                    return (
                      <a
                        key={album.id}
                        href={album.bandcampUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${album.title} — ${album.artist}`}
                        style={{
                          display: "block",
                          aspectRatio: "1/1",
                          borderRadius: "6px",
                          overflow: "hidden",
                          position: "relative" as const,
                          background: "#1a1a2e",
                          textDecoration: "none",
                          outline: isPicked ? `2px solid ${RED}` : "none",
                          outlineOffset: "1px",
                          transition: "transform 0.15s ease, outline 0.15s ease",
                        }}
                      >
                        {album.imageUrl ? (
                          <img src={album.imageUrl} alt={album.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover" as const,
                              filter: isPicked ? "none" : "grayscale(100%) brightness(0.55)",
                              transition: "filter 0.3s ease" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                            opacity: isPicked ? 1 : 0.35 }}>🎵</div>
                        )}
                        {/* 番号バッジ（左上） */}
                        <div style={{
                          position: "absolute" as const, top: "3px", left: "4px",
                          fontSize: "9px", fontWeight: 700, color: "rgba(255,255,255,0.85)",
                          textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                          lineHeight: 1,
                          letterSpacing: "0.03em",
                        }}>
                          {String(idx + 1).padStart(2, "0")}
                        </div>
                        {/* ピック済みオーバーレイ */}
                        {isPicked && (
                          <div style={{
                            position: "absolute" as const, inset: 0,
                            background: "rgba(232,0,13,0.22)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <div style={{
                              background: RED,
                              borderRadius: "4px",
                              padding: "2px 5px",
                            }}>
                              <span style={{ fontFamily: "'Bangers', cursive", fontSize: "10px", color: "white", letterSpacing: "0.04em" }}>YES!</span>
                            </div>
                          </div>
                        )}
                      </a>
                    );
                  })}
                </div>
                {/* ピックしたアルバムのタイトル表示 */}
                {state.todayAlbums.length > 0 && (
                  <div style={{ marginTop: "12px", display: "flex", flexDirection: "column" as const, gap: "4px" }}>
                    {state.todayAlbums.map((a, i) => (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "14px", height: "14px", borderRadius: "3px", background: RED, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontFamily: "'Bangers', cursive", fontSize: "9px", color: "white" }}>{i + 1}</span>
                        </div>
                        <span style={{ ...typo.caption2, color: GRAY2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                          {a.title}
                          <span style={{ color: GRAY3, marginLeft: "4px" }}>— {a.artist}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* COLLECTION */}
        {tab === "collection" && (
          <div>
            <div style={{ padding: "24px 20px 20px" }}>
              <div style={{ ...typo.caption1, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: RED, marginBottom: "6px" }}>
                My Collection
              </div>
              <div style={{ fontFamily: "'Bangers', cursive", fontSize: "52px", letterSpacing: "0.04em", color: BLACK, lineHeight: "1" }}>
                {state.collection.length} ALBUMS
              </div>
            </div>

            {/* 今日のピック中アルバム */}
            {state.todayAlbums.length > 0 && (
              <div style={{ borderTop: "1px solid " + SEPARATOR, marginBottom: "8px" }}>
                <div style={{ padding: "12px 20px 8px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ ...typo.caption1, color: RED, letterSpacing: "0.1em", textTransform: "uppercase" as const, fontWeight: 600 }}>Today</span>
                  <span style={{ ...typo.caption2, color: GRAY3 }}>In Progress</span>
                </div>
                <div style={{ display: "flex", gap: "10px", padding: "0 20px 16px", overflowX: "auto" as const }}>
                  {state.todayAlbums.map(album => (
                    <div key={album.id} style={{ flexShrink: 0, width: "120px" }}>
                      <div
                        onClick={() => {
                          if (album.bandcampId) {
                            const startIdx = state.listenedTracks[album.id] ?? 0;
                            setPlayerMode("today");
                            setPlayerAlbumId(album.id);
                            startTrackLockTimers(album, startIdx);
                          }
                        }}
                        style={{ width: "120px", height: "120px", borderRadius: "10px", overflow: "hidden", position: "relative" as const, background: "#1a1a2e", cursor: album.bandcampId ? "pointer" : "default" }}>
                        {album.imageUrl && (
                          <img src={album.imageUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" as const }} />
                        )}
                        {/* TODAY'S PICK バッジ */}
                        <div style={{ position: "absolute" as const, inset: 0, background: "rgba(232,0,13,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ background: "rgba(232,0,13,0.9)", borderRadius: "6px", padding: "4px 8px" }}><span style={{ fontFamily: "'Bangers', cursive", fontSize: "13px", color: "white", letterSpacing: "0.04em" }}>TODAY'S PICK</span></div>
                        </div>
                        {/* 進捗バー */}
                        <div style={{ position: "absolute" as const, bottom: 0, left: 0, right: 0, height: "3px", background: "rgba(255,255,255,0.2)" }}>
                          <div style={{ height: "100%", background: RED, width: `${Math.round(Math.min((state.listenedTracks[album.id] ?? 0) / (album.tracks.length || 1), 1) * 100)}%` }} />
                        </div>
                      </div>
                      <div style={{ marginTop: "6px" }}>
                        <div style={{ ...typo.caption1, color: BLACK, fontWeight: 600, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>{album.title}</div>
                        <div style={{ ...typo.caption2, color: GRAY2, marginTop: "2px" }}>{state.listenedTracks[album.id] ?? 0}/{album.tracks.length} tracks</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {state.collection.length === 0 && state.todayAlbums.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", padding: "60px 20px", gap: "16px", textAlign: "center" as const }}>
                <div style={{ width: "72px", height: "72px", background: SEPARATOR, borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px" }}>🎵</div>
                <div style={{ ...typo.title2, marginTop: "4px" }}>No Albums Yet</div>
                <div style={{ ...typo.footnote, color: GRAY2, maxWidth: "240px", lineHeight: "1.5" }}>
                  Pick 2 albums and mark tracks listened to add them to your collection.
                </div>
              </div>
            ) : state.collection.length > 0 ? (
              <div style={{ borderTop: "1px solid " + SEPARATOR }}>
                {state.collection.map((album, index) => (
                  <div key={album.id} style={{ display: "flex", alignItems: "center", borderBottom: "1px solid " + SEPARATOR, padding: "12px 20px 12px 0" }}>
                    <div style={{ width: "44px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ ...typo.caption1, color: RED, fontWeight: 600 }}>{String(index + 1).padStart(2, "0")}</span>
                    </div>
                    <div style={{ width: "56px", height: "56px", background: "#1a1a2e", borderRadius: "8px", overflow: "hidden", flexShrink: 0 }}>
                      {album.imageUrl
                        ? <img src={album.imageUrl} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover" as const }} />
                        : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>🎵</div>}
                    </div>
                    <div style={{ flex: 1, padding: "0 14px", minWidth: 0 }}>
                      <div style={{ ...typo.caption2, color: RED, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: "3px" }}>
                        #{album.genre}
                      </div>
                      <div style={{ ...typo.headline, color: BLACK, whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {album.title}
                      </div>
                      <div style={{ ...typo.footnote, marginTop: "2px" }}>{album.artist}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                      {album.bandcampId && (
                        <button
                          onClick={() => {
                            setPlayerMode("collection");
                            setPlayerAlbumId(album.id);
                          }}
                          style={{ background: BLACK, border: "none", borderRadius: "8px", width: "34px", height: "34px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="white" stroke="none">
                            <polygon points="5,3 19,12 5,21"/>
                          </svg>
                        </button>
                      )}
                      <a href={album.bandcampUrl} target="_blank" rel="noopener noreferrer" style={{ flexShrink: 0, padding: "8px" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={GRAY3} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* PROFILE */}
        {tab === "profile" && (
          <div>
            <div style={{ padding: "24px 20px 20px" }}>
              <div style={{ ...typo.caption1, letterSpacing: "0.12em", textTransform: "uppercase" as const, color: RED, marginBottom: "6px" }}>
                Profile
              </div>
              <div style={{ fontFamily: "'Bangers', cursive", fontSize: "52px", letterSpacing: "0.04em", color: BLACK, lineHeight: "1" }}>
                YOUR STATS
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", padding: "0 20px 24px" }}>
              {[
                { value: state.collection.length, label: "Collected" },
                { value: Object.keys(state.listenedTracks).length, label: "Listened" },
                { value: 0, label: "Streak" },
              ].map(({ value, label }) => (
                <div key={label} style={{ background: "white", borderRadius: "16px", padding: "20px 12px 16px", textAlign: "center" as const, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                  <div style={{ fontFamily: "'Bangers', cursive", fontSize: "40px", color: RED, lineHeight: "1" }}>{value}</div>
                  <div style={{ ...typo.caption1, color: GRAY2, marginTop: "6px", letterSpacing: "0.05em" }}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ margin: "0 20px", borderRadius: "16px", background: "white", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ ...typo.footnote, color: GRAY2, lineHeight: "1.8" }}>
                Every day, 10 albums are discovered from <strong style={{ color: BLACK }}>Bandcamp</strong>.<br/>
                Pick 2. Listen to 8 tracks each.<br/>
                They are added to your collection.
              </div>
            </div>
          </div>
        )}

      </main>

      {/* BOTTOM NAV */}
      <nav style={{ position: "fixed" as const, bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: "448px", background: "rgba(245,244,240,0.92)", backdropFilter: "blur(20px)", borderTop: "1px solid " + SEPARATOR, display: "flex", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => {
            const currentBase = tab === "today-done" ? "today" : tab;
            const tabs_order = ["today", "collection", "profile"];
            const fromIdx = tabs_order.indexOf(currentBase);
            const toIdx = tabs_order.indexOf(id);
            const dir = toIdx > fromIdx ? "left" : "right";
            if (id !== tab && id !== "today-done") switchTab(id, dir);
          }}
            style={{ flex: 1, display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center", padding: "10px 0 12px", background: "transparent", border: "none", cursor: "pointer", color: (tab === id || (id === "today" && tab === "today-done")) ? RED : GRAY3, transition: "color 0.15s" }}>
            <Icon active={tab === id} />
            <span style={{ ...typo.caption2, marginTop: "4px", fontWeight: tab === id ? 600 : 400, letterSpacing: "0.03em" }}>
              {label}
            </span>
          </button>
        ))}
      </nav>
    </div>
    </>
  );
}
