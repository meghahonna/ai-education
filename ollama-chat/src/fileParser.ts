import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export interface ParsedFile {
  name: string;
  rowCount: number;
  columnCount: number;
  columns: string[];
  contextText: string; // what gets injected into the LLM message
}

const MAX_ROWS_FULL = 300; // include full data up to this many rows
const MAX_ROWS_SAMPLE = 50; // sample size for larger files

// ─── CSV ──────────────────────────────────────────────────────────────────────

function parseCSV(content: string, fileName: string): ParsedFile {
  const result = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,
  });

  const rows = result.data;
  const columns = result.meta.fields ?? [];
  return buildParsedFile(fileName, rows, columns);
}

// ─── Excel ────────────────────────────────────────────────────────────────────

function parseExcel(buffer: ArrayBuffer, fileName: string): ParsedFile {
  const wb = XLSX.read(buffer, { type: 'array' });
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  return buildParsedFile(fileName, rows, columns);
}

// ─── Shared builder ───────────────────────────────────────────────────────────

function buildParsedFile(
  fileName: string,
  rows: Record<string, string>[],
  columns: string[],
): ParsedFile {
  const rowCount = rows.length;
  const columnCount = columns.length;

  let contextText: string;

  if (rowCount <= MAX_ROWS_FULL) {
    contextText = buildMarkdownTable(columns, rows);
  } else {
    // For large files: stats summary + sample
    const sample = rows.slice(0, MAX_ROWS_SAMPLE);
    const stats = buildColumnStats(columns, rows);
    contextText = [
      `**File:** ${fileName} — ${rowCount.toLocaleString()} rows × ${columnCount} columns`,
      '',
      '**Column Statistics:**',
      stats,
      '',
      `**First ${MAX_ROWS_SAMPLE} rows (sample):**`,
      buildMarkdownTable(columns, sample),
    ].join('\n');
  }

  return { name: fileName, rowCount, columnCount, columns, contextText };
}

function buildMarkdownTable(columns: string[], rows: Record<string, string>[]): string {
  if (columns.length === 0) return '(empty)';
  const header = `| ${columns.join(' | ')} |`;
  const divider = `| ${columns.map(() => '---').join(' | ')} |`;
  const body = rows
    .map((r) => `| ${columns.map((c) => String(r[c] ?? '').replace(/\|/g, '\\|')).join(' | ')} |`)
    .join('\n');
  return [header, divider, body].join('\n');
}

function buildColumnStats(columns: string[], rows: Record<string, string>[]): string {
  return columns
    .map((col) => {
      const values = rows.map((r) => r[col]).filter(Boolean);
      const unique = new Set(values).size;
      const missing = rows.length - values.length;
      const nums = values.map(Number).filter((n) => !isNaN(n));
      if (nums.length > rows.length * 0.5) {
        const sum = nums.reduce((a, b) => a + b, 0);
        const avg = (sum / nums.length).toFixed(2);
        const min = Math.min(...nums).toFixed(2);
        const max = Math.max(...nums).toFixed(2);
        return `- **${col}**: numeric, avg=${avg}, min=${min}, max=${max}, missing=${missing}`;
      }
      return `- **${col}**: ${unique} unique values, missing=${missing}`;
    })
    .join('\n');
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function parseFile(file: File): Promise<ParsedFile> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'csv') {
    const text = await file.text();
    return parseCSV(text, file.name);
  }

  if (ext === 'xlsx' || ext === 'xls') {
    const buffer = await file.arrayBuffer();
    return parseExcel(buffer, file.name);
  }

  throw new Error(`Unsupported file type: .${ext}. Please upload a CSV or Excel file.`);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
