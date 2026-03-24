import { useEffect, useState } from 'react';
import { useAppSettings } from './settings';
import { useOllama, fetchOllamaModels } from './useOllama';
import { Sidebar } from './Sidebar';
import { ChatView } from './ChatView';
import { SettingsModal } from './SettingsModal';

export function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, updateSettings } = useAppSettings();

  // Apply dark class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  // Auto-detect model on startup if none configured or model not installed
  useEffect(() => {
    fetchOllamaModels(settings.ollamaUrl)
      .then((models) => {
        if (models.length === 0) return;
        const names = models.map((m) => m.name);
        if (!settings.model || !names.includes(settings.model)) {
          updateSettings({ ...settings, model: names[0] });
        }
      })
      .catch(() => { /* Ollama not running — user will see error on send */ });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    conversations,
    activeConversation,
    activeId,
    setActiveId,
    isStreaming,
    newConversation,
    deleteConversation,
    sendMessage,
    stopStreaming,
  } = useOllama(settings.ollamaUrl, settings.model, settings.systemPrompt);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
        onOpenSettings={() => setSettingsOpen(true)}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={setActiveId}
        onNewConversation={newConversation}
        onDeleteConversation={deleteConversation}
      />

      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-medium text-foreground truncate">
              {activeConversation?.title ?? 'New Chat'}
            </span>
            {settings.model && (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {settings.model}
              </span>
            )}
          </div>
          {isStreaming && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-primary" />
              </span>
              Generating…
            </span>
          )}
        </div>

        <div className="flex-1 min-h-0">
          <ChatView
            conversation={activeConversation}
            isStreaming={isStreaming}
            onSend={sendMessage}
            onStop={stopStreaming}
          />
        </div>
      </div>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSave={updateSettings}
      />
    </div>
  );
}
