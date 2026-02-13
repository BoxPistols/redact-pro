# RedactPro

AI-powered PII masking tool for Japanese resumes and documents.

日本語履歴書・職務経歴書の個人情報を自動検出しマスキングするツール。

## Features

- 🎯 **16ファイル形式対応** — PDF, Word, Excel, ODS, CSV, Markdown, HTML, RTF, JSON, ODT, TXT
- 🤖 **マルチAIプロバイダ** — Claude / OpenAI / Gemini
- 🔍 **ハイブリッド検出** — 正規表現 + 辞書 + AI + ヒューリスティクス
- 🌐 **URLスクレイピング** — Wantedly, LinkedIn, LAPRAS等からの取り込み
- 📋 **HTML/テキスト貼付** — CORS回避のフォールバック
- 🌙 **ダーク/ライトテーマ** — CSS Custom Properties
- 📱 **モバイル対応** — レスポンシブデザイン
- 📤 **4形式エクスポート** — TXT, Markdown, JSON, CSV

## Quick Start

```bash
# Clone
git clone https://github.com/<your-org>/redact-pro.git
cd redact-pro

# Install
pnpm install

# Environment
cp .env.example .env.local

# Dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
redact-pro/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (metadata, lang)
│   │   ├── page.tsx            # Entry point
│   │   ├── RedactPro.tsx       # Main app (monolith, migrating)
│   │   └── api/
│   │       └── scrape/
│   │           └── route.ts    # Server-side URL proxy (no CORS)
│   └── types/                  # (planned) TypeScript definitions
├── docs/
│   └── REFACTOR_PLAN.md        # Module decomposition roadmap
├── public/
├── .env.example
├── next.config.ts
├── package.json
└── tsconfig.json
```

## Architecture

### Current: Monolith Phase

`RedactPro.tsx` is a single ~1500 line client component containing all UI and logic.  
This is intentional — the code was developed iteratively as a Claude Artifact and is being migrated to a proper Next.js project.

See [docs/REFACTOR_PLAN.md](docs/REFACTOR_PLAN.md) for the decomposition roadmap.

### URL Scraping

The key benefit of Next.js: **server-side scraping proxy**.

```
Browser → /api/scrape?url=https://wantedly.com/... → Server fetches → Returns HTML
```

No CORS issues. No unreliable third-party proxies. The client automatically detects the local API route.

### Fallback Chain (client-side)

When `/api/scrape` is unavailable (e.g. static export):

1. Direct fetch (CORS-enabled sites only)
2. allOrigins proxy
3. everyOrigin proxy  
4. CodeTabs proxy
5. Corsfix proxy
6. Error → "テキスト/HTML貼付" tab guidance

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SCRAPE_ENABLED` | `true` | Enable/disable scraping API |
| `SCRAPE_RATE_LIMIT` | `30` | Max requests per minute per IP |
| `SCRAPE_ALLOWED_DOMAINS` | (all) | Comma-separated domain allowlist |

## Deploy

### Vercel (recommended)

```bash
pnpm i -g vercel
vercel
```

### Docker

```dockerfile
FROM node:20-slim AS base
RUN corepack enable pnpm

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
```

## License

MIT
