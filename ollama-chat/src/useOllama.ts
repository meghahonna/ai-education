import { useCallback, useRef, useState } from 'react';
import type { Conversation, FileAttachment, Message, OllamaMessage, OllamaModel, OllamaStreamChunk } from './types';
import type { ParsedFile } from './fileParser';

// ─── Conversation persistence ────────────────────────────────────────────────

const CONVERSATIONS_KEY = 'ollama_chat_conversations';

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (raw) return JSON.parse(raw) as Conversation[];
  } catch { /* ignore */ }
  return [];
}

function saveConversations(convos: Conversation[]) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convos));
  } catch { /* ignore */ }
}

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function deriveTitle(firstUserMessage: string): string {
  return firstUserMessage.trim().slice(0, 60) || 'New Chat';
}

// ─── Ollama API helpers ───────────────────────────────────────────────────────

export async function fetchOllamaModels(baseUrl: string): Promise<OllamaModel[]> {
  const res = await fetch(`${baseUrl}/api/tags`);
  if (!res.ok) throw new Error(`Ollama responded with ${res.status}`);
  const data = await res.json() as { models: OllamaModel[] };
  return data.models ?? [];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOllama(ollamaUrl: string, defaultModel: string, systemPrompt: string) {
  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(
    () => loadConversations()[0]?.id ?? null
  );
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null;

  const updateConversations = useCallback((updated: Conversation[]) => {
    saveConversations(updated);
    setConversations(updated);
  }, []);

  const newConversation = useCallback(() => {
    const id = generateId();
    const convo: Conversation = {
      id,
      title: 'New Chat',
      messages: [],
      model: defaultModel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    updateConversations([convo, ...conversations]);
    setActiveId(id);
    return id;
  }, [conversations, defaultModel, updateConversations]);

  const deleteConversation = useCallback((id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    updateConversations(updated);
    if (activeId === id) {
      setActiveId(updated[0]?.id ?? null);
    }
  }, [conversations, activeId, updateConversations]);

  // ── send message (with optional file attachment) ─────────────────────────
  const sendMessage = useCallback(async (text: string, parsedFile?: ParsedFile) => {
    if (!text.trim() || isStreaming) return;

    let convoId = activeId;
    let currentConvos = conversations;

    if (!convoId) {
      const id = generateId();
      const newConvo: Conversation = {
        id,
        title: deriveTitle(text),
        messages: [],
        model: defaultModel,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      currentConvos = [newConvo, ...conversations];
      updateConversations(currentConvos);
      setActiveId(id);
      convoId = id;
    }

    const convo = currentConvos.find((c) => c.id === convoId)!;

    // Build the actual content sent to the LLM (includes file data if present)
    const llmContent = parsedFile
      ? `I have provided the donor data below. Please analyze it directly.

FILE: ${parsedFile.name}
ROWS: ${parsedFile.rowCount}
COLUMNS (${parsedFile.columnCount}): ${parsedFile.columns.join(', ')}

DATA:
${parsedFile.contextText}

---
TASK: ${text.trim()}`
      : text.trim();

    // Attachment metadata for UI display only
    const attachment: FileAttachment | undefined = parsedFile
      ? { name: parsedFile.name, rowCount: parsedFile.rowCount, columnCount: parsedFile.columnCount, columns: parsedFile.columns }
      : undefined;

    const userMsg: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(), // show only the user's text in the UI
      timestamp: Date.now(),
      attachment,
    };

    const assistantMsg: Message = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    const updatedMessages = [...convo.messages, userMsg, assistantMsg];
    const updatedConvo: Conversation = {
      ...convo,
      model: defaultModel,
      messages: updatedMessages,
      title: convo.messages.length === 0 ? deriveTitle(text) : convo.title,
      updatedAt: Date.now(),
    };

    const newConvos = currentConvos.map((c) => (c.id === convoId ? updatedConvo : c));
    updateConversations(newConvos);
    setIsStreaming(true);

    // Build Ollama messages — use llmContent (with file data) for the last user turn
    const ollamaMessages: OllamaMessage[] = [
      ...(systemPrompt ? [{ role: 'system' as const, content: systemPrompt }] : []),
      ...convo.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        // For prior user messages that had attachments, the display content is fine
        // (the file data was only needed for that turn's LLM call)
        content: m.content,
      })),
      { role: 'user' as const, content: llmContent },
    ];

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    let accumulated = '';

    try {
      const res = await fetch(`${ollamaUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: defaultModel,
          messages: ollamaMessages,
          stream: true,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Ollama error ${res.status}: ${errText}`);
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n').filter(Boolean)) {
          try {
            const parsed = JSON.parse(line) as OllamaStreamChunk;
            if (parsed.message?.content) accumulated += parsed.message.content;
            if (parsed.done) break;
          } catch { /* skip malformed lines */ }
        }
        setConversations((prev) => {
          const updated = prev.map((c) => {
            if (c.id !== convoId) return c;
            return {
              ...c,
              updatedAt: Date.now(),
              messages: c.messages.map((m) =>
                m.id === assistantMsg.id ? { ...m, content: accumulated } : m
              ),
            };
          });
          saveConversations(updated);
          return updated;
        });
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        accumulated = `**Error:** ${(err as Error).message}\n\nMake sure Ollama is running at \`${ollamaUrl}\` and the model \`${defaultModel}\` is pulled (\`ollama pull ${defaultModel}\`).`;
      }
    } finally {
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id !== convoId) return c;
          return {
            ...c,
            updatedAt: Date.now(),
            messages: c.messages.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: accumulated || '(no response)', isStreaming: false }
                : m
            ),
          };
        });
        saveConversations(updated);
        return updated;
      });
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [activeId, conversations, defaultModel, isStreaming, ollamaUrl, systemPrompt, updateConversations]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return {
    conversations,
    activeConversation,
    activeId,
    setActiveId,
    isStreaming,
    newConversation,
    deleteConversation,
    sendMessage,
    stopStreaming,
  };
}
