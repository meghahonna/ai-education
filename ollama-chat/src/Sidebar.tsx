import type { ReactNode } from 'react';
import { PanelLeft, PanelLeftClose, Plus, Settings, Trash2 } from 'lucide-react';
import type { Conversation } from './types';

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function Sidebar({
  isOpen,
  onToggle,
  onOpenSettings,
  conversations,
  activeId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  children,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onOpenSettings: () => void;
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col border-r transition-all duration-200 ${isOpen ? 'w-64' : 'w-12'}`}
      style={{
        background: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
      }}
    >
      {/* Header */}
      <div
        className="flex h-14 items-center gap-2 border-b px-3"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        {isOpen ? (
          <>
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <span className="text-sm font-bold text-primary">⛳</span>
            </div>
            <span className="flex-1 truncate text-sm font-semibold text-foreground">
              Green Fairways
            </span>
            <button
              onClick={onToggle}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="size-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            className="mx-auto flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Expand sidebar"
          >
            <PanelLeft className="size-4" />
          </button>
        )}
      </div>

      {/* New chat button */}
      {isOpen ? (
        <div className="px-2 py-2">
          <button
            onClick={onNewConversation}
            className="flex w-full items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="size-4" />
            New Chat
          </button>
        </div>
      ) : (
        <div className="flex justify-center py-2">
          <button
            onClick={onNewConversation}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="New Chat"
          >
            <Plus className="size-4" />
          </button>
        </div>
      )}

      {/* Conversation list */}
      {isOpen ? (
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {children}
          {conversations.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No conversations yet
            </p>
          ) : (
            conversations.map((convo) => (
              <div
                key={convo.id}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 cursor-pointer transition-colors ${
                  convo.id === activeId
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
                onClick={() => onSelectConversation(convo.id)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{convo.title}</p>
                  <p className="truncate text-[10px] opacity-60">
                    {formatTime(convo.updatedAt)} · {convo.model}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(convo.id);
                  }}
                  className="hidden size-6 shrink-0 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive group-hover:flex"
                  title="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Settings footer */}
      <div
        className="border-t p-2"
        style={{ borderColor: 'var(--sidebar-border)' }}
      >
        {isOpen ? (
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="size-4" />
            Settings
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="mx-auto flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Settings"
          >
            <Settings className="size-4" />
          </button>
        )}
      </div>
    </div>
  );
}
