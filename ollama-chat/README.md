# Green Fairways Foundation — Donor Analytics (Local)

A fully local donor analytics chat application for Green Fairways Foundation. Powered by [Ollama](https://ollama.com) — no data ever leaves your machine.

## What it does

Upload a donor CSV or Excel file and get a board-ready analysis covering:

- **Donor Retention** — year-over-year cohort retention by segment
- **Upgrade Pathways** — behavioral patterns before donors move up segments
- **Lapsed Donor Recovery** — RFM scoring to prioritize reactivation outreach
- **Channel Effectiveness** — gift size and retention by acquisition channel
- **Recurring Giving Opportunities** — prospects for monthly giving conversion
- **Data Quality Flags** — duplicates, missing dates, outlier gifts

All file parsing happens in the browser. The CSV/Excel data is injected directly into the prompt and analyzed by the local LLM.

---

## Prerequisites

### 1. Install Ollama

Download from [ollama.com](https://ollama.com) and install for your OS.

### 2. Pull a model

```bash
ollama pull qwen3:8b
```

Any capable model works. Recommended options:

| Model | Size | Notes |
|-------|------|-------|
| `qwen3:8b` | ~5 GB | Good balance of speed and quality |
| `llama3.1:8b` | ~5 GB | Strong reasoning |
| `mistral:7b` | ~4 GB | Fast, lightweight |
| `llama3.1:70b` | ~40 GB | Best quality, needs high-end hardware |

### 3. Start Ollama

```bash
ollama serve
```

Ollama runs at `http://localhost:11434` by default.

### 4. Install Node.js and pnpm

- [Node.js](https://nodejs.org) v18 or later
- pnpm: `npm install -g pnpm`

---

## Getting Started

```bash
# From the repo root
cd ollama-chat

# Install dependencies
pnpm install --ignore-workspace

# Start the dev server
pnpm dev
```

Open [http://localhost:5174](http://localhost:5174) in your browser.

---

## Using the App

### Chat

Type any question in the composer and press **Enter** (or **Shift+Enter** for a new line).

### Uploading a donor file

1. Click the **paperclip icon** in the composer, or drag-and-drop a file onto it
2. Supported formats: `.csv`, `.xlsx`, `.xls`
3. The file is parsed locally — a preview badge shows row/column counts
4. Type your analysis request and send

**Example prompts after uploading:**
- *"Run the full board-ready donor analysis"*
- *"Show me retention by segment for the last 3 fiscal years"*
- *"Identify lapsed donors with the highest RFM score"*
- *"Which channels have the best long-term retention?"*

### Quick actions

The welcome screen provides four one-click shortcuts:

| Button | What it runs |
|--------|-------------|
| Full Donor Analysis | Complete board-ready report across all 6 areas |
| Lapsed Donor Recovery | RFM scoring and reactivation prioritization |
| Retention by Cohort | Year-over-year retention by segment |
| Recurring Giving Prospects | Best candidates for monthly giving conversion |

### Settings

Click **Settings** (gear icon, bottom of sidebar) to configure:

- **Ollama URL** — default `http://localhost:11434`; change if Ollama runs on another port or machine
- **Model** — click **Refresh** to auto-detect installed models, then select from the dropdown
- **System Prompt** — pre-loaded with the donor analytics prompt; customize as needed
- **Theme** — Light (donor green) or Dark

---

## Project Structure

```
ollama-chat/
├── src/
│   ├── App.tsx              # Root layout, dark/light theme, model auto-detection
│   ├── Sidebar.tsx          # Collapsible sidebar with conversation list
│   ├── ChatView.tsx         # Messages, file upload composer, welcome screen
│   ├── SettingsModal.tsx    # Settings dialog
│   ├── useOllama.ts         # Ollama API streaming, conversation management
│   ├── fileParser.ts        # Client-side CSV/Excel parsing (papaparse + xlsx)
│   ├── settings.ts          # Settings persistence + donor analytics system prompt
│   ├── types.ts             # TypeScript type definitions
│   ├── index.css            # Tailwind v4 + Green Fairways theme tokens
│   └── main.tsx             # Entry point
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## How file analysis works

```
User drops donor100.csv
        │
        ▼
  fileParser.ts
  (papaparse / xlsx)
        │
        ▼
  ParsedFile { contextText: markdown table }
        │
        ▼
  useOllama.ts — builds prompt:
  ┌──────────────────────────────────┐
  │ [System prompt — donor analyst]  │
  │ [Conversation history]           │
  │ FILE: donor100.csv               │
  │ ROWS: 100 / COLUMNS: 16          │
  │ DATA:                            │
  │ | DonorID | FirstGiftDate | ...  │
  │ | D-0001  | 2015-03-12   | ...  │
  │ ...                              │
  │ TASK: [user's question]          │
  └──────────────────────────────────┘
        │
        ▼
  POST /api/chat  →  Ollama (streaming)
        │
        ▼
  Streamed markdown response in chat
```

Files up to ~300 rows are sent in full. Larger files get a column statistics summary + 50-row sample.

---

## Production build

```bash
pnpm build
pnpm preview   # preview the production build locally
```

---

## Troubleshooting

**"model not found" error**
```bash
ollama pull qwen3:8b   # pull the model first
```

**Ollama not reachable**
```bash
ollama serve           # make sure Ollama is running
```

**Model uses wrong name**
Open Settings → click **Refresh** → select the correct model from the dropdown → Save.

**Settings not sticking after refresh**
Open DevTools → Application → Local Storage → delete `ollama_chat_settings` → reload. The app will auto-detect your installed model.

**Large CSV is slow**
Files over 300 rows are sampled (50 rows + column stats). For best results, pre-filter your export to the donors most relevant to your analysis.
