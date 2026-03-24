#!/bin/bash
# Claudeのチャットからダウンロードしたファイルを自動で適用
cp ~/Downloads/page.tsx ~/Desktop/daily-groove/app/page.tsx 2>/dev/null && echo "✓ page.tsx" || echo "✗ page.tsx not found"
cp ~/Downloads/bandcamp-discover-route.ts ~/Desktop/daily-groove/app/api/bandcamp-discover/route.ts 2>/dev/null && echo "✓ route.ts" || true
cp ~/Downloads/store.ts ~/Desktop/daily-groove/lib/store.ts 2>/dev/null && echo "✓ store.ts" || true
echo "Done — hot reload in progress"
