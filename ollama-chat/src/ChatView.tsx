import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowUp, BarChart3, Bot, Check, Copy, Heart,
  Paperclip, RefreshCw, Square, TrendingUp, User, X,
} from 'lucide-react';
import type { Conversation } from './types';
import { parseFile, formatFileSize, type ParsedFile } from './fileParser';

// ─── Copy button ─────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
      className="flex size-6 items-center justify-center rounded text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground"
      title="Copy"
    >
      {copied ? <Check className="size-3.5 text-green-600" /> : <Copy className="size-3.5" />}
    </button>
  );
}

// ─── File attachment badge (in message history) ───────────────────────────────

function AttachmentBadge({ name, rowCount, columnCount }: {
  name: string; rowCount: number; columnCount: number;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-accent/50 px-3 py-2 text-xs text-accent-foreground">
      <Paperclip className="size-3.5 shrink-0 text-primary" />
      <span className="truncate font-medium">{name}</span>
      <span className="shrink-0 text-muted-foreground">
        {rowCount.toLocaleString()} rows · {columnCount} cols
      </span>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ role, content, isStreaming, attachment }: {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  attachment?: { name: string; rowCount: number; columnCount: number };
}) {
  const isUser = role === 'user';
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm ${
          isUser ? 'text-[var(--user-bubble-fg)]' : 'bg-muted text-muted-foreground'
        }`}
        style={isUser ? { background: 'var(--user-bubble)' } : undefined}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      <div className={`group relative max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {isUser && attachment && (
          <AttachmentBadge
            name={attachment.name}
            rowCount={attachment.rowCount}
            columnCount={attachment.columnCount}
          />
        )}
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'rounded-tr-sm text-[var(--user-bubble-fg)]'
              : 'rounded-tl-sm border border-border text-foreground'
          }`}
          style={
            isUser
              ? { background: 'var(--user-bubble)' }
              : { background: 'var(--assistant-bubble)' }
          }
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || (isStreaming ? '▋' : '')}
              </ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && !isStreaming && content && (
          <div className="flex opacity-0 transition-opacity group-hover:opacity-100">
            <CopyButton text={content} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Welcome screen ───────────────────────────────────────────────────────────

const SUGGESTIONS = [
  {
    icon: BarChart3,
    title: 'Full Donor Analysis',
    prompt: 'Run the full board-ready donor analysis on the attached file',
  },
  {
    icon: RefreshCw,
    title: 'Lapsed Donor Recovery',
    prompt: 'Identify the top lapsed donors with the highest reactivation potential using RFM scoring',
  },
  {
    icon: TrendingUp,
    title: 'Retention by Cohort',
    prompt: 'Show donor retention rates by segment and fiscal year cohort',
  },
  {
    icon: Heart,
    title: 'Recurring Giving Prospects',
    prompt: 'Which donors are the best candidates to convert to recurring giving?',
  },
];

function WelcomeScreen({ onPrefill }: { onPrefill: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="text-center max-w-2xl">
        <h1 className="text-2xl font-bold text-foreground">
          Green Fairways Foundation — Donor Analytics
        </h1>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          Upload your donor CSV or Excel file and I'll generate a board-ready analysis covering
          retention, upgrade pathways, lapsed recovery (RFM), channel effectiveness,
          recurring giving opportunities, and data quality flags.
        </p>
      </div>
      <div className="grid w-full max-w-2xl grid-cols-2 gap-3">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => onPrefill(s.prompt)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-4 text-left text-sm text-foreground transition-all hover:border-primary/50 hover:bg-accent/60 hover:shadow-sm"
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <s.icon className="size-4 text-primary" />
            </span>
            <span className="font-medium">{s.title}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground/60">
        Click a suggestion to pre-fill the prompt, attach your CSV/Excel file, then send.
      </p>
    </div>
  );
}

// ─── File preview pill ────────────────────────────────────────────────────────

function FilePill({ file, parsed, loading, error, onRemove }: {
  file: File;
  parsed: ParsedFile | null;
  loading: boolean;
  error: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-accent/60 px-3 py-2 text-xs">
      <Paperclip className="size-3.5 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <span className="truncate font-medium text-foreground">{file.name}</span>
        <span className="ml-1.5 text-muted-foreground">
          {loading && 'Parsing…'}
          {error && <span className="text-destructive">{error}</span>}
          {parsed && `${parsed.rowCount.toLocaleString()} rows · ${parsed.columnCount} cols · ${formatFileSize(file.size)}`}
        </span>
      </div>
      <button
        onClick={onRemove}
        className="flex size-4 items-center justify-center rounded text-muted-foreground hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

// ─── Composer ─────────────────────────────────────────────────────────────────

function Composer({
  onSend,
  isStreaming,
  onStop,
  prefillText,
  onPrefillConsumed,
}: {
  onSend: (text: string, file?: ParsedFile) => void;
  isStreaming: boolean;
  onStop: () => void;
  prefillText: string;
  onPrefillConsumed: () => void;
}) {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Apply prefill from welcome screen suggestions
  useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      onPrefillConsumed();
      setTimeout(() => {
        textareaRef.current?.focus();
        // auto-resize
        const el = textareaRef.current;
        if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
      }, 50);
    }
  }, [prefillText, onPrefillConsumed]);

  const handleFile = async (f: File) => {
    setFile(f);
    setParsed(null);
    setParseError('');
    setParseLoading(true);
    try {
      const result = await parseFile(f);
      setParsed(result);
    } catch (err) {
      setParseError((err as Error).message);
    } finally {
      setParseLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setParsed(null);
    setParseError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = () => {
    if (!text.trim() || isStreaming || parseLoading) return;
    onSend(text, parsed ?? undefined);
    setText('');
    removeFile();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const canSend = text.trim() && !isStreaming && !parseLoading;

  // Hint shown when text is prefilled but no file attached yet
  const showFileHint = text.trim() && !file && !isStreaming;

  return (
    <div className="border-t border-border bg-background px-4 py-3">
      <div className="mx-auto max-w-3xl" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>

        {/* Attach-file hint */}
        {showFileHint && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-primary/20 bg-accent/40 px-3 py-2 text-xs text-muted-foreground">
            <Paperclip className="size-3.5 shrink-0 text-primary" />
            Attach your donor CSV or Excel file using the paperclip, then click send.
          </div>
        )}

        {/* File pill */}
        {file && (
          <div className="mb-2">
            <FilePill
              file={file}
              parsed={parsed}
              loading={parseLoading}
              error={parseError}
              onRemove={removeFile}
            />
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm focus-within:border-primary/60 focus-within:ring-1 focus-within:ring-primary/20">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex size-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
            title="Attach CSV or Excel file"
          >
            <Paperclip className="size-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Send a message or attach a donor CSV/Excel file…"
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
            style={{ maxHeight: '200px' }}
          />

          {isStreaming ? (
            <button
              onClick={onStop}
              className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition-colors hover:bg-destructive hover:text-white"
              title="Stop generating"
            >
              <Square className="size-4 fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              title="Send"
            >
              <ArrowUp className="size-4" />
            </button>
          )}
        </div>

        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/40">
          Files are processed locally — your data never leaves this machine.
        </p>
      </div>
    </div>
  );
}

// ─── ChatView ─────────────────────────────────────────────────────────────────

export function ChatView({
  conversation,
  isStreaming,
  onSend,
  onStop,
}: {
  conversation: Conversation | null;
  isStreaming: boolean;
  onSend: (text: string, file?: ParsedFile) => void;
  onStop: () => void;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [prefillText, setPrefillText] = useState('');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  const isEmpty = !conversation || conversation.messages.length === 0;

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex-1 overflow-y-auto">
        {isEmpty ? (
          <WelcomeScreen onPrefill={(text) => setPrefillText(text)} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
            {conversation.messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                isStreaming={msg.isStreaming}
                attachment={msg.attachment}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <Composer
        onSend={onSend}
        isStreaming={isStreaming}
        onStop={onStop}
        prefillText={prefillText}
        onPrefillConsumed={() => setPrefillText('')}
      />
    </div>
  );
}
