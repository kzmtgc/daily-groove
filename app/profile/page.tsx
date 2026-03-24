"use client";

import { useState, useEffect } from "react";
import { Album, sampleAlbums } from "@/data/albums";
import { AppState, loadState } from "@/lib/store";

export default function ProfilePage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!state) return null;

  return (
    <div className="pb-20">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-black tracking-widest text-gray-900">EARWORM</p>
      </div>

      <div className="px-4 pt-6">
        <p className="text-xs font-semibold tracking-widest text-blue-600 mb-1">PROFILE</p>
        <p className="text-3xl font-black text-gray-900 mb-6">あなたの記録</p>

        <div className="flex border border-gray-100 rounded-lg overflow-hidden mb-8">
          <div className="flex-1 flex flex-col items-center py-5 border-r border-gray-100">
            <p className="text-3xl font-black text-gray-900">{state.collection.length}</p>
            <p className="text-xs font-semibold tracking-widest text-gray-400 mt-1">LISTENED</p>
          </div>
          <div className="flex-1 flex flex-col items-center py-5 border-r border-gray-100">
            <p className="text-3xl font-black text-gray-900">0</p>
            <p className="text-xs font-semibold tracking-widest text-gray-400 mt-1">STREAK</p>
          </div>
          <div className="flex-1 flex flex-col items-center py-5">
            <p className="text-3xl font-black text-gray-900">0</p>
            <p className="text-xs font-semibold tracking-widest text-gray-400 mt-1">DAYS</p>
          </div>
        </div>

        <div className="flex flex-col items-center py-10 gap-3">
          <span className="text-5xl">🎧</span>
          <p className="text-sm font-bold text-gray-900">Coming Soon</p>
          <p className="text-xs text-gray-400">プロフィール機能は近日公開予定です</p>
        </div>
      </div>

      {/* ボトムナビ */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex">
        <a href="/" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <span className="text-lg">🎵</span>
          <span className="text-xs font-semibold tracking-wide">Today</span>
        </a>
        <a href="/collection" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <span className="text-lg">📚</span>
          <span className="text-xs font-semibold tracking-wide">Collection</span>
        </a>
        <a href="/profile" className="flex-1 flex flex-col items-center py-3 text-blue-600">
          <span className="text-lg">👤</span>
          <span className="text-xs font-semibold tracking-wide">Profile</span>
        </a>
      </div>
    </div>
  );
}