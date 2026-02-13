# RedactPro リファクタリング計画

## 現状

`src/app/RedactPro.tsx` に1500行のモノリスがある。  
`// @ts-nocheck` で型チェックをバイパス中。

## Phase 1: 型安全化 (PR #2〜3)

### 1-1. 型定義の作成
```
src/types/index.ts          # Detection, AppSettings, ParseResult etc.
```

### 1-2. constants を分離
```
src/lib/constants/
  categories.ts             # CATEGORIES, DEFAULT_MASK, MASK_PRESETS
  providers.ts              # AI_PROVIDERS, AI_MODELS
  dictionaries.ts           # SURNAMES, GIVEN_NAMES (390行→別ファイル)
  placeholders.ts           # PH, PH_RE
```
**影響**: モノリスが ~400行減

## Phase 2: ロジック分離 (PR #4〜7)

### 2-1. テーマ
```
src/lib/theme.ts            # C, T, CSS custom properties, dark/light vars
```

### 2-2. AI呼び出し
```
src/lib/ai/
  call.ts                   # callAI() - unified provider routing
  detect.ts                 # detectWithAI() - PII detection via AI
  reformat.ts               # aiReformat() - text cleanup
  ocr.ts                    # ocrSparsePages(), aiCleanupText()
```

### 2-3. 検出エンジン
```
src/lib/detection/
  regex.ts                  # REGEX_PATTERNS, detectRegex()
  names.ts                  # isLikelyName(), detectJapaneseNames()
  merge.ts                  # detectAll(), mergeDetections()
  redact.ts                 # applyRedaction()
```

### 2-4. ファイルパーサー
```
src/lib/parsers/
  encoding.ts               # detectEncoding(), decodeText(), readBuf()
  pdf.ts                    # parsePDF(), loadPdfJs()
  docx.ts                   # parseDOCX() (mammoth)
  xlsx.ts                   # parseXLSX()
  csv.ts                    # parseCSV()
  text.ts                   # parseTXT(), parseMD()
  html.ts                   # parseHTML(), extractTextFromHTML()
  rtf.ts                    # parseRTF()
  json.ts                   # parseJSON()
  odt.ts                    # parseODT()
  index.ts                  # parseFile() - router
```

### 2-5. URLスクレイピング
```
src/lib/scraper/
  proxies.ts                # CORS_PROXIES, fetchURL()
  scrape.ts                 # scrapeURL()
```

## Phase 3: コンポーネント分離 (PR #8〜12)

```
src/components/
  ui/
    Badge.tsx
    Button.tsx
    Toggle.tsx
    Pill.tsx
  SettingsModal.tsx
  PreviewModal.tsx
  DiffView.tsx
  UploadScreen.tsx
  EditorScreen.tsx
  AIPanel.tsx
```

## Phase 4: Hook化 (PR #13〜14)

```
src/hooks/
  useStorage.ts             # localStorage/window.storage 互換
  useTheme.ts               # isDark toggle + CSS var injection
  useDetection.ts           # 検出ロジック統合
```

## Phase 5: テスト (PR #15〜)

```
src/__tests__/
  detection/
    regex.test.ts
    names.test.ts
  parsers/
    pdf.test.ts
    csv.test.ts
  lib/
    ai.test.ts
```

## 分割の順序原則

1. **型から始める** — 型を先に定義することで、分割時のインターフェースが明確になる
2. **辞書/定数を先に** — 依存がなく、最も安全に分離できる（行数削減効果も大）
3. **純粋関数→副作用** — パーサーや検出はテストしやすい純粋関数
4. **コンポーネントは最後** — props型が確定してから分割する
5. **各PRで `// @ts-nocheck` の範囲を狭める** — 最終的に完全撤去

## マイルストーン

| Phase | PR数 | 推定行数変化 | ts-nocheck |
|-------|------|-------------|------------|
| 1     | 2-3  | +200 (型) / -400 (定数) | 残る |
| 2     | 4    | -600 (ロジック) | 徐々に除去 |
| 3     | 5    | -400 (コンポーネント) | 完全除去 |
| 4     | 2    | ±0 (リファクタ) | — |
| 5     | 3+   | +300 (テスト) | — |
