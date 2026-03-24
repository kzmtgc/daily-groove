// lib/store.ts

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

// 1日分の履歴
export type DayRecord = {
  date: string;         // "2026-03-23"
  allAlbums: Album[];   // その日の10枚
  pickedAlbums: Album[]; // ピックした2枚
};

export type AppState = {
  suggestedAlbums: Album[];
  todayAlbums: Album[];
  listenedTracks: Record<string, number>;
  collection: Album[];
  lastPickedDate: string;
  history: DayRecord[]; // 過去の全履歴
  onboardingDone: boolean; // 初回オンボーディング完了フラグ
};

const STORAGE_KEY = "earworm";

const defaultState: AppState = {
  suggestedAlbums: [],
  todayAlbums: [],
  listenedTracks: {},
  collection: [],
  lastPickedDate: "",
  history: [],
  onboardingDone: false,
};

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}

export function loadState(): AppState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

export function saveState(state: AppState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}
