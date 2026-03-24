// ─── Ollama API Types ────────────────────────────────────────────────

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details: {
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaStreamChunk {
  model: string;
  created_at: string;
  message: { role: 'assistant'; content: string };
  done: boolean;
  done_reason?: string;
}

// ─── App Types ────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export interface FileAttachment {
  name: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  attachment?: FileAttachment; // metadata shown in UI (actual data is in content)
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}
