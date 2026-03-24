import { useEffect, useState } from 'react';
import { Check, Moon, RefreshCw, Sun, X } from 'lucide-react';
import type { AppSettings } from './settings';
import { fetchOllamaModels } from './useOllama';
import type { OllamaModel } from './types';

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (s: AppSettings) => void;
}) {
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [saved, setSaved] = useState(false);
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState('');

  // Sync draft when modal opens
  useEffect(() => {
    if (isOpen) {
      setDraft(settings);
      setSaved(false);
      setModelError('');
    }
  }, [isOpen, settings]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    onSave(draft);
    setSaved(true);
    setTimeout(onClose, 600);
  };

  const loadModels = async () => {
    setLoadingModels(true);
    setModelError('');
    try {
      const list = await fetchOllamaModels(draft.ollamaUrl);
      setModels(list);
    } catch (err) {
      setModelError((err as Error).message);
    } finally {
      setLoadingModels(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-background shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/40 px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 py-5">
          {/* Ollama URL */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Ollama URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={draft.ollamaUrl}
                onChange={(e) => update('ollamaUrl', e.target.value)}
                placeholder="http://localhost:11434"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={loadModels}
                disabled={loadingModels}
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                title="Fetch available models"
              >
                <RefreshCw className={`size-3.5 ${loadingModels ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
            {modelError && (
              <p className="mt-1 text-[11px] text-destructive">{modelError}</p>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Model
            </label>
            {models.length > 0 ? (
              <select
                value={draft.model}
                onChange={(e) => update('model', e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {models.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.details?.parameter_size ?? '?'})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={draft.model}
                onChange={(e) => update('model', e.target.value)}
                placeholder="llama3.2"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            )}
            <p className="mt-1 text-[11px] text-muted-foreground">
              Click Refresh to auto-detect installed models.
            </p>
          </div>

          {/* System Prompt */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              System Prompt
            </label>
            <textarea
              value={draft.systemPrompt}
              onChange={(e) => update('systemPrompt', e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Theme */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">
              Theme
            </label>
            <div className="flex gap-2">
              {(['light', 'dark'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => update('theme', t)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border py-2 text-sm font-medium transition-colors ${
                    draft.theme === t
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {t === 'light' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border/40 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {saved ? (
              <>
                <Check className="size-4" />
                Saved
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
