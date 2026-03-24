"use client";

import { useEffect, useState } from "react";
import { AppState, loadState } from "@/lib/store";

export default function CollectionPage() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  if (!state) return null;

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <p className="text-xs font-black tracking-widest text-gray-900">EARWORM</p>
        <a href="/" className="text-xs font-semibold text-blue-600 tracking-wide">← TODAY</a>
      </div>

      <div className="px-4 pt-6">
        <p className="text-xs font-semibold tracking-widest text-blue-600 mb-1">MY COLLECTION</p>
        <p className="text-3xl font-black text-gray-900 mb-6">
          {state.collection.length}枚
        </p>

        {state.collection.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <span className="text-5xl">🎵</span>
            <p className="text-base font-bold text-gray-900">まだコレクションがありません</p>
            <p className="text-sm text-gray-400 text-center">
              アルバムを聴き切ると<br />ここに追加されます
            </p>
          </div>
        ) : (
          <div className="border-t border-gray-100">
            {state.collection.map((album, index) => (
              <div key={album.id}>
                <div className="flex items-center gap-3 py-3">
                  <span className="w-6 text-center font-mono text-xs text-gray-300">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: album.color }}>
                    <span className="text-2xl">{album.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold tracking-wider text-blue-600">
                      #{album.genre.toUpperCase()}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{album.title}</p>
                    <p className="text-xs text-gray-500">{album.artist}</p>
                  </div>
                  <span className="text-green-500 text-lg">✓</span>
                </div>
                {index < state.collection.length - 1 && (
                  <div className="ml-9 border-b border-gray-50" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ボトムナビ */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-100 flex">
        <a href="/" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <span className="text-lg">🎵</span>
          <span className="text-xs font-semibold tracking-wide">Today</span>
        </a>
        <a href="/collection" className="flex-1 flex flex-col items-center py-3 text-blue-600">
          <span className="text-lg">📚</span>
          <span className="text-xs font-semibold tracking-wide">Collection</span>
        </a>
        <a href="/profile" className="flex-1 flex flex-col items-center py-3 text-gray-400">
          <span className="text-lg">👤</span>
          <span className="text-xs font-semibold tracking-wide">Profile</span>
        </a>
      </div>
    </div>
  );
}