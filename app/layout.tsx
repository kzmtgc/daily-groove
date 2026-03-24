import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EARWORM",
  description: "毎日2枚のアルバムと出会う音楽アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Boogaloo&family=Bangers&family=Fredoka+One&display=swap" rel="stylesheet" />
      </head>
      {/* bg-black と max-w-md を削除。
          モバイル版(page.tsx)は自前で maxWidth:448px + margin:0 auto を持っているため表示は変わらない。
          デスクトップ版(desktop/page.tsx)はフル幅が必要なため body の幅制限を除去した。 */}
      <body style={{ margin: 0, background: "#F5F4F0" }}>
        {children}
      </body>
    </html>
  );
}
