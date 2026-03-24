"use client";
import { useEffect, useRef, useState } from "react";

export default function LandingPage() {
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const refs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible(p => ({ ...p, [e.target.id]: true }));
      }),
      { threshold: 0.1 }
    );
    refs.current.forEach(el => { if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const setRef = (id: string) => (el: HTMLElement | null) => {
    if (el) { el.id = id; refs.current.push(el); }
  };

  const v = (id: string) => visible[id] ?? false;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Noto+Sans+JP:wght@900&family=Noto+Sans+JP:wght@400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body {
          background: #f0ede6;
          color: #111;
          font-family: 'Noto Sans JP', sans-serif;
          overflow-x: hidden;
        }

        ::selection { background: #E8000D; color: white; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.on { opacity: 1; transform: translateY(0); }
        .reveal.d1 { transition-delay: 0.1s; }
        .reveal.d2 { transition-delay: 0.22s; }
        .reveal.d3 { transition-delay: 0.36s; }

        .cta {
          display: inline-flex;
          align-items: center;
          gap: 14px;
          background: #E8000D;
          color: white;
          text-decoration: none;
          border: none;
          padding: 20px 48px;
          font-family: 'Bangers', cursive;
          font-size: 30px;
          letter-spacing: 0.1em;
          cursor: pointer;
          transition: background 0.15s;
        }
        .cta:hover { background: #c0000b; }

        .step:hover .step-num { color: #E8000D; }
      `}</style>

      {/* ══════════ HERO ══════════ */}
      <section style={{
        minHeight: "100vh",
        background: "#111",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "clamp(40px, 8vw, 100px)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* EARWORMロゴ（左上） */}
        <div style={{
          position: "absolute", top: "clamp(28px, 4vw, 48px)", left: "clamp(28px, 4vw, 48px)",
          fontFamily: "'Bangers', cursive",
          fontSize: "clamp(20px, 3vw, 28px)",
          letterSpacing: "0.15em",
          color: "#E8000D",
          animation: "fadeUp 0.6s ease both",
        }}>EARWORM</div>

        {/* メインコピー */}
        <div style={{ display: "flex", alignItems: "center", gap: "clamp(40px, 6vw, 100px)", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 400px", minWidth: 280 }}>
          <h1 style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(52px, 9vw, 130px)",
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            color: "#f0ede6",
            animation: "fadeUp 0.7s 0.1s ease both",
          }}>
            レコード屋に<br/>
            通うような<br/>
            <span style={{ color: "#E8000D" }}>気持ちで。</span>
          </h1>

          <p style={{
            marginTop: "clamp(24px, 4vw, 48px)",
            fontWeight: 400,
            fontSize: "clamp(16px, 2vw, 22px)",
            color: "rgba(240,237,230,0.5)",
            lineHeight: 1.8,
            animation: "fadeUp 0.7s 0.25s ease both",
          }}>
            きちんと聴けば、レコードが積み上がっていく。
          </p>

          <div style={{
            marginTop: "clamp(32px, 5vw, 60px)",
            animation: "fadeUp 0.7s 0.4s ease both",
          }}>
            <a href="/desktop" className="cta">
              GO TO RECORD SHOP
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
          </div>
        </div>

        {/* アプリ画面モックアップ */}
        <div style={{
          flex: "1 1 380px", minWidth: 280,
          animation: "fadeUp 0.9s 0.3s ease both",
          position: "relative",
        }}>
          {/* ブラウザ風フレーム */}
          <div style={{
            background: "#1a1a1a",
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}>
            {/* ブラウザバー */}
            <div style={{
              background: "#2a2a2a", padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#E8000D", opacity: 0.8 }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#555" }} />
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#555" }} />
              <div style={{
                flex: 1, background: "#1a1a1a", borderRadius: 4,
                padding: "3px 10px", marginLeft: 8,
                fontSize: 10, color: "rgba(255,255,255,0.3)",
                fontFamily: "'Noto Sans JP', sans-serif",
              }}>daily-groove.vercel.app</div>
            </div>
            {/* スクリーンショット */}
            <div style={{
              width: "100%",
              aspectRatio: "16/10",
              background: "#f0ede6",
              overflow: "hidden",
              position: "relative",
            }}>
              {/* アプリUIをSVGで模倣 */}
              <div style={{
                width: "100%", height: "100%",
                background: "#f0ede6",
                display: "flex", flexDirection: "column",
              }}>
                {/* ヘッダー */}
                <div style={{
                  background: "rgba(245,244,240,0.95)",
                  borderBottom: "3px solid #111",
                  padding: "8px 20px",
                  display: "flex", alignItems: "center", gap: 24,
                  flexShrink: 0,
                }}>
                  <span style={{ fontFamily: "'Bangers', cursive", fontSize: 18, color: "#E8000D", letterSpacing: "0.08em" }}>EARWORM</span>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["Today","Collection","History","Profile"].map((t, i) => (
                      <div key={t} style={{
                        padding: "3px 10px", borderRadius: 5, fontSize: 9,
                        background: i === 0 ? "#E8000D" : "transparent",
                        color: i === 0 ? "white" : "#888",
                        fontFamily: "'Noto Sans JP', sans-serif",
                        fontWeight: 400,
                      }}>{t}</div>
                    ))}
                  </div>
                </div>
                {/* コンテンツ：アルバムグリッド */}
                <div style={{ flex: 1, padding: "16px 20px", overflow: "hidden" }}>
                  <div style={{ fontSize: 10, color: "#E8000D", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 4, fontFamily: "'Noto Sans JP', sans-serif" }}>BANDCAMP DISCOVER</div>
                  <div style={{ fontFamily: "'Bangers', cursive", fontSize: 22, color: "#111", marginBottom: 14, letterSpacing: "0.03em" }}>PICK YOUR 2!</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                    {[
                      { bg: "linear-gradient(135deg, #e040fb, #7b1fa2)", label: "#ELECTRONIC" },
                      { bg: "linear-gradient(135deg, #424242, #757575)", label: "#ROCK" },
                      { bg: "linear-gradient(135deg, #1565c0, #42a5f5)", label: "#AMBIENT" },
                      { bg: "linear-gradient(135deg, #e65100, #ff8f00)", label: "#LATIN" },
                      { bg: "linear-gradient(135deg, #1b5e20, #66bb6a)", label: "#FOLK" },
                      { bg: "linear-gradient(135deg, #880e4f, #e91e63)", label: "#INDIE" },
                    ].map((card, ci) => (
                      <div key={ci} style={{
                        aspectRatio: "1/1",
                        borderRadius: 6,
                        background: card.bg,
                        display: "flex", flexDirection: "column",
                        justifyContent: "flex-end",
                        padding: "6px 7px",
                        position: "relative",
                        overflow: "hidden",
                      }}>
                        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.7)", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400 }}>{card.label}</div>
                        <div style={{ width: "70%", height: 4, background: "rgba(255,255,255,0.3)", borderRadius: 2, marginTop: 2 }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* グロー */}
          <div style={{
            position: "absolute", inset: "-20px",
            background: "radial-gradient(ellipse at center, rgba(232,0,13,0.12) 0%, transparent 70%)",
            zIndex: -1, pointerEvents: "none",
          }} />
        </div>
        </div>
      </section>

      {/* ══════════ TICKER ══════════ */}
      <div style={{
        background: "#E8000D",
        padding: "12px 0",
        overflow: "hidden",
      }}>
        <div style={{ display: "flex", animation: "ticker 18s linear infinite", whiteSpace: "nowrap" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} style={{
              fontFamily: "'Bangers', cursive",
              fontSize: 18, letterSpacing: "0.12em",
              color: "white", padding: "0 36px",
              opacity: i % 2 === 0 ? 1 : 0.55,
            }}>
              EARWORM ✦ DAILY MUSIC DISCOVERY ✦ POWERED BY BANDCAMP ✦
            </span>
          ))}
        </div>
      </div>


      {/* ══════════ SCREENSHOTS ══════════ */}
      <section style={{
        background: "#111",
        padding: "clamp(60px, 8vw, 100px) 0",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(28px, 6vw, 100px)", marginBottom: "clamp(32px, 4vw, 48px)" }}>
          <div
            ref={setRef("ss-label")}
            className={`reveal${v("ss-label") ? " on" : ""}`}
          >
            <div style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: "#E8000D", marginBottom: 12, fontWeight: 900, fontFamily: "'Noto Sans JP', sans-serif" }}>The App</div>
            <h2 style={{ fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 900, fontSize: "clamp(28px, 4vw, 48px)", color: "#f0ede6", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
              毎日が、<span style={{ color: "#E8000D" }}>レコード店。</span>
            </h2>
          </div>
        </div>

        {/* 横スクロール風の画面ショット群 */}
        <div style={{ display: "flex", gap: 16, paddingLeft: "clamp(28px, 6vw, 100px)", overflowX: "auto", paddingBottom: 8 }}>
          {/* スクリーン1: ピック選択 */}
          <div
            ref={setRef("ss-1")}
            className={`reveal d1${v("ss-1") ? " on" : ""}`}
            style={{ flexShrink: 0, width: "clamp(280px, 45vw, 560px)" }}
          >
            <div style={{ background: "#1a1a1a", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ background: "#2a2a2a", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8000D" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#444" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#444" }} />
                <div style={{ flex: 1, background: "#111", borderRadius: 3, padding: "2px 8px", marginLeft: 6, fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "'Noto Sans JP', sans-serif" }}>PICK YOUR 2</div>
              </div>
              <div style={{ background: "#f0ede6", padding: "16px" }}>
                <div style={{ fontFamily: "'Bangers', cursive", fontSize: 20, color: "#111", marginBottom: 12, letterSpacing: "0.03em" }}>PICK YOUR 2!</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {[
                    { bg: "linear-gradient(135deg,#e040fb,#7b1fa2)", title: "Natural Signs", artist: "Fractal Structure", genre: "ELECTRONIC" },
                    { bg: "linear-gradient(135deg,#424242,#9e9e9e)", title: "When Two Worlds", artist: "Secondhand Strangers", genre: "ROCK" },
                    { bg: "linear-gradient(135deg,#1565c0,#64b5f6)", title: "Pixel Dungeon", artist: "famntasymonster", genre: "EXPERIMENTAL" },
                    { bg: "linear-gradient(135deg,#bf360c,#ff8f00)", title: "Krypta Fire Vol.1", artist: "Various Artists", genre: "ELECTRONIC" },
                    { bg: "linear-gradient(135deg,#f9a825,#ff6f00)", title: "HIP HOP HOEDOWN", artist: "BIG TEXX FREEDOM", genre: "LATIN" },
                    { bg: "linear-gradient(135deg,#4a148c,#ce93d8)", title: "tooth", artist: "tooth", genre: "EXPERIMENTAL" },
                  ].map((card, i) => (
                    <div key={i} style={{
                      background: "white",
                      borderRadius: 10,
                      overflow: "hidden",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    }}>
                      <div style={{ aspectRatio: "1/1", background: card.bg, position: "relative" }}>
                        <div style={{ position: "absolute", top: 5, left: 7, fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>0{i+1}</div>
                      </div>
                      <div style={{ padding: "5px 7px 6px" }}>
                        <div style={{ fontSize: 7, color: "#E8000D", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 2, fontFamily: "'Noto Sans JP', sans-serif" }}>#{card.genre}</div>
                        <div style={{ fontSize: 8, fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Noto Sans JP', sans-serif" }}>{card.title}</div>
                        <div style={{ fontSize: 7, color: "#888", marginTop: 1, fontFamily: "'Noto Sans JP', sans-serif" }}>{card.artist}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: "rgba(240,237,230,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400 }}>毎日10枚から2枚を選ぶ</div>
          </div>

          {/* スクリーン2: YOUR DAILY GROOVE */}
          <div
            ref={setRef("ss-2")}
            className={`reveal d2${v("ss-2") ? " on" : ""}`}
            style={{ flexShrink: 0, width: "clamp(280px, 45vw, 560px)" }}
          >
            <div style={{ background: "#1a1a1a", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ background: "#2a2a2a", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8000D" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#444" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#444" }} />
                <div style={{ flex: 1, background: "#111", borderRadius: 3, padding: "2px 8px", marginLeft: 6, fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "'Noto Sans JP', sans-serif" }}>YOUR DAILY GROOVE</div>
              </div>
              <div style={{ background: "#f0ede6", padding: "16px" }}>
                <div style={{ fontFamily: "'Bangers', cursive", fontSize: 20, color: "#111", marginBottom: 14, letterSpacing: "0.03em" }}>YOUR DAILY GROOVE</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {[
                    { bg: "linear-gradient(135deg,#e040fb,#7b1fa2)", title: "Natural Signs", artist: "Fractal Structure", progress: 45 },
                    { bg: "linear-gradient(135deg,#424242,#9e9e9e)", title: "When Two Worlds", artist: "Secondhand Strangers", progress: 20 },
                  ].map((card, i) => (
                    <div key={i} style={{ background: "white", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                      <div style={{ aspectRatio: "16/9", background: card.bg, position: "relative" }}>
                        <div style={{
                          position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 10px 8px",
                          background: "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
                        }}>
                          <div style={{ fontFamily: "'Bangers', cursive", fontSize: 11, color: "white", letterSpacing: "0.03em" }}>{card.title.toUpperCase()}</div>
                          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.7)", marginTop: 2, fontFamily: "'Noto Sans JP', sans-serif" }}>{card.artist}</div>
                        </div>
                      </div>
                      <div style={{ padding: "8px 10px" }}>
                        <div style={{ height: 3, background: "#eee", borderRadius: 2, marginBottom: 5, overflow: "hidden" }}>
                          <div style={{ height: "100%", background: "#E8000D", width: `${card.progress}%` }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 7, fontFamily: "'Noto Sans JP', sans-serif" }}>
                          <span style={{ color: "#E8000D", fontWeight: 700 }}>In Progress</span>
                          <span style={{ color: "#aaa" }}>3 / 8 tracks</span>
                        </div>
                        <div style={{ marginTop: 6, background: "#111", borderRadius: 6, padding: "5px", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <svg width="8" height="8" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                          <span style={{ fontSize: 7, color: "white", fontFamily: "'Noto Sans JP', sans-serif" }}>Play on Bandcamp</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: "rgba(240,237,230,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400 }}>今日のGrooveを聴く</div>
          </div>

          {/* スクリーン3: Collection */}
          <div
            ref={setRef("ss-3")}
            className={`reveal d3${v("ss-3") ? " on" : ""}`}
            style={{ flexShrink: 0, width: "clamp(280px, 45vw, 560px)", paddingRight: "clamp(28px, 6vw, 100px)" }}
          >
            <div style={{ background: "#1a1a1a", borderRadius: 10, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ background: "#2a2a2a", padding: "8px 14px", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#E8000D" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#444" }} />
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#444" }} />
                <div style={{ flex: 1, background: "#111", borderRadius: 3, padding: "2px 8px", marginLeft: 6, fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "'Noto Sans JP', sans-serif" }}>COLLECTION</div>
              </div>
              <div style={{ background: "#f0ede6", padding: "16px" }}>
                <div style={{ fontFamily: "'Bangers', cursive", fontSize: 20, color: "#111", marginBottom: 14, letterSpacing: "0.03em" }}>24 ALBUMS</div>
                {[
                  { num: "01", bg: "linear-gradient(135deg,#e040fb,#7b1fa2)", title: "Natural Signs", artist: "Fractal Structure", genre: "ELECTRONIC" },
                  { num: "02", bg: "linear-gradient(135deg,#424242,#9e9e9e)", title: "When Two Worlds Collide", artist: "Secondhand Strangers", genre: "ROCK" },
                  { num: "03", bg: "linear-gradient(135deg,#1565c0,#64b5f6)", title: "Pixel Dungeon sound design", artist: "famntasymonster", genre: "EXPERIMENTAL" },
                  { num: "04", bg: "linear-gradient(135deg,#bf360c,#ff8f00)", title: "Krypta Discocathedrale", artist: "Various Artists", genre: "ELECTRONIC" },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, borderBottom: "1px solid rgba(0,0,0,0.06)", padding: "7px 0" }}>
                    <span style={{ fontSize: 9, color: "#E8000D", fontWeight: 700, width: 20, flexShrink: 0, fontFamily: "'Noto Sans JP', sans-serif" }}>{item.num}</span>
                    <div style={{ width: 32, height: 32, borderRadius: 5, background: item.bg, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 9, color: "#E8000D", fontWeight: 700, letterSpacing: "0.08em", fontFamily: "'Noto Sans JP', sans-serif" }}>#{item.genre}</div>
                      <div style={{ fontSize: 9, fontWeight: 700, color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontFamily: "'Noto Sans JP', sans-serif" }}>{item.title}</div>
                      <div style={{ fontSize: 8, color: "#888", fontFamily: "'Noto Sans JP', sans-serif" }}>{item.artist}</div>
                    </div>
                    <div style={{ background: "#111", borderRadius: 4, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 11, color: "rgba(240,237,230,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 400 }}>積み上がるコレクション</div>
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS ══════════ */}
      <section style={{ background: "#f0ede6", padding: "clamp(60px, 10vw, 120px) clamp(28px, 6vw, 100px)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* セクションラベル */}
          <div
            ref={setRef("label-how")}
            className={`reveal${v("label-how") ? " on" : ""}`}
            style={{
              fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase",
              color: "#E8000D", marginBottom: 32, fontWeight: 900,
            }}
          >How it works</div>

          {/* 3ステップ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { num: "01", title: "10枚届く。", body: "毎朝、Bandcampから10枚のアルバムが届く。アルゴリズムじゃない。ランダムな出会い。", delay: "" },
              { num: "02", title: "2枚だけ選ぶ。", body: "直感で2枚だけ選ぶ。ジャケ買いの感覚。それが今日のGroove。", delay: "d1" },
              { num: "03", title: "きちんと聴く。", body: "トラックを1曲ずつ掘り起こす。全部聴いたらコレクションに加わる。", delay: "d2" },
            ].map(({ num, title, body, delay }, i) => (
              <div
                key={i}
                ref={setRef(`step-${i}`)}
                className={`step reveal ${delay}${v(`step-${i}`) ? " on" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "clamp(20px, 4vw, 60px)",
                  padding: "clamp(28px, 4vw, 48px) 0",
                  borderTop: "1px solid rgba(17,17,17,0.12)",
                  cursor: "default",
                }}
              >
                <div
                  className="step-num"
                  style={{
                    fontFamily: "'Bangers', cursive",
                    fontSize: "clamp(20px, 3vw, 28px)",
                    letterSpacing: "0.1em",
                    color: "rgba(17,17,17,0.2)",
                    flexShrink: 0,
                    width: "3em",
                    transition: "color 0.2s",
                  }}
                >{num}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: "'Noto Sans JP', sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(28px, 4.5vw, 60px)",
                    lineHeight: 1.1,
                    letterSpacing: "-0.01em",
                    color: "#111",
                    marginBottom: 10,
                  }}>{title}</div>
                  <div style={{
                    fontSize: "clamp(13px, 1.5vw, 16px)",
                    color: "rgba(17,17,17,0.5)",
                    lineHeight: 1.8,
                    maxWidth: 480,
                    fontWeight: 400,
                  }}>{body}</div>
                </div>
              </div>
            ))}
            {/* 下線 */}
            <div style={{ borderTop: "1px solid rgba(17,17,17,0.12)" }} />
          </div>
        </div>
      </section>

      {/* ══════════ QUOTE ══════════ */}
      <section style={{
        background: "#111",
        padding: "clamp(60px, 10vw, 120px) clamp(28px, 6vw, 100px)",
      }}>
        <div
          ref={setRef("quote")}
          className={`reveal${v("quote") ? " on" : ""}`}
          style={{ maxWidth: 900, margin: "0 auto" }}
        >
          <p style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(32px, 5.5vw, 72px)",
            lineHeight: 1.3,
            letterSpacing: "-0.01em",
            color: "#f0ede6",
          }}>
            毎日届く10枚は、<br/>
            昨日と同じものじゃない。<br/>
            <span style={{ color: "#E8000D" }}>だから毎日通いたくなる。</span>
          </p>
        </div>
      </section>

      {/* ══════════ STATS ══════════ */}
      <section style={{
        background: "#f0ede6",
        padding: "clamp(60px, 10vw, 100px) clamp(28px, 6vw, 100px)",
        borderTop: "1px solid rgba(17,17,17,0.1)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 0,
        }}>
          {[
            { value: "10", unit: "枚", label: "毎日届くアルバム", delay: "" },
            { value: "2", unit: "枚", label: "今日のPick", delay: "d1" },
            { value: "∞", unit: "", label: "積み上がるコレクション", delay: "d2" },
          ].map(({ value, unit, label, delay }, i) => (
            <div
              key={i}
              ref={setRef(`stat-${i}`)}
              className={`reveal ${delay}${v(`stat-${i}`) ? " on" : ""}`}
              style={{
                padding: "clamp(32px, 5vw, 60px) clamp(20px, 3vw, 40px)",
                borderRight: i < 2 ? "1px solid rgba(17,17,17,0.1)" : "none",
                textAlign: "center",
              }}
            >
              <div style={{
                fontFamily: "'Bangers', cursive",
                fontSize: "clamp(56px, 10vw, 100px)",
                lineHeight: 1,
                color: "#E8000D",
                letterSpacing: "0.02em",
                marginBottom: 8,
              }}>
                {value}
                {unit && <span style={{ fontSize: "0.45em", color: "#E8000D", opacity: 0.7 }}>{unit}</span>}
              </div>
              <div style={{
                fontSize: "clamp(11px, 1.2vw, 13px)",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(17,17,17,0.4)",
                fontWeight: 400,
              }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section style={{
        background: "#E8000D",
        padding: "clamp(80px, 12vw, 160px) clamp(28px, 6vw, 100px)",
      }}>
        <div
          ref={setRef("final")}
          className={`reveal${v("final") ? " on" : ""}`}
          style={{ maxWidth: 1100, margin: "0 auto" }}
        >
          <h2 style={{
            fontFamily: "'Noto Sans JP', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(40px, 7vw, 96px)",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            color: "white",
            marginBottom: "clamp(32px, 5vw, 60px)",
          }}>
            今日の<br/>
            レコード、<br/>
            掘りにいこう。
          </h2>
          <a href="/desktop" className="cta" style={{ background: "#111", fontSize: 28 }}>
            GO TO RECORD SHOP
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{
        background: "#111",
        borderTop: "1px solid rgba(240,237,230,0.08)",
        padding: "28px clamp(28px, 6vw, 100px)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 12,
      }}>
        <div style={{
          fontFamily: "'Bangers', cursive",
          fontSize: 22, letterSpacing: "0.12em", color: "#E8000D",
        }}>EARWORM</div>
        <div style={{
          fontSize: 10, color: "rgba(240,237,230,0.2)",
          letterSpacing: "0.15em", textTransform: "uppercase",
          fontWeight: 400,
        }}>
          Daily Music Discovery · Powered by Bandcamp
        </div>
      </footer>
    </>
  );
}
