import { parquetMetadata, parquetSchema, parquetReadObjects } from "hyparquet";
import { compressors } from "hyparquet-compressors";
import * as XLSX from "xlsx";

export type Row = Record<string, unknown>;

export interface Sheet {
  name: string;
  columns: string[];
  rows: Row[];
}

export interface ParsedData {
  kind: "parquet" | "xlsx";
  sheets: Sheet[];
}

/** Sniff the file format from its magic bytes. Both start with 'P' (0x50). */
function detect(buffer: ArrayBuffer): "parquet" | "xlsx" | "unknown" {
  const b = new Uint8Array(buffer, 0, Math.min(4, buffer.byteLength));
  // Parquet: 'PAR1'
  if (b[0] === 0x50 && b[1] === 0x41 && b[2] === 0x52 && b[3] === 0x31) {
    return "parquet";
  }
  // XLSX (zip container): 'PK'
  if (b[0] === 0x50 && b[1] === 0x4b) return "xlsx";
  return "unknown";
}

/** Parse parquet/xlsx bytes into one-or-more sheets. */
export async function parseFile(buffer: ArrayBuffer): Promise<ParsedData> {
  const kind = detect(buffer);
  if (kind === "parquet") {
    return { kind, sheets: [await parseParquet(buffer)] };
  }
  if (kind === "xlsx") {
    return { kind, sheets: parseXlsx(buffer) };
  }
  throw new Error(
    "Unrecognized file format — expected a parquet (.parquet) or Excel (.xlsx) file."
  );
}

async function parseParquet(buffer: ArrayBuffer): Promise<Sheet> {
  const metadata = parquetMetadata(buffer);
  const schema = parquetSchema(metadata);
  const columns = schema.children.map((child) => child.element.name);
  const rows = (await parquetReadObjects({
    file: buffer,
    compressors,
  })) as Row[];
  return { name: "Data", columns, rows };
}

function parseXlsx(buffer: ArrayBuffer): Sheet[] {
  // cellDates -> real Date objects instead of Excel serial numbers.
  const wb = XLSX.read(buffer, { cellDates: true });

  return wb.SheetNames.map((name) => {
    const ws = wb.Sheets[name];
    if (!ws) return { name, columns: [], rows: [] };

    // header:1 -> array-of-arrays so we keep column order and can handle
    // blank/duplicate header cells deterministically.
    const aoa = XLSX.utils.sheet_to_json(ws, {
      header: 1,
      raw: true,
      defval: null,
      blankrows: false,
    }) as unknown[][];

    if (aoa.length === 0) return { name, columns: [], rows: [] };

    const columns = makeUniqueHeaders(aoa[0] ?? []);
    const rows = aoa.slice(1).map((cells) => {
      const row: Row = {};
      columns.forEach((col, i) => {
        row[col] = cells[i] ?? null;
      });
      return row;
    });

    return { name, columns, rows };
  });
}

/** Turn a header row into unique, non-empty column names. */
function makeUniqueHeaders(headerRow: unknown[]): string[] {
  const seen = new Map<string, number>();
  return headerRow.map((cell, i) => {
    const raw =
      cell === null || cell === undefined || String(cell).trim() === ""
        ? `Column ${i + 1}`
        : String(cell).trim();
    const count = seen.get(raw) ?? 0;
    seen.set(raw, count + 1);
    return count === 0 ? raw : `${raw} (${count + 1})`;
  });
}

/** Render any cell value as display text. */
export function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    try {
      return JSON.stringify(value, (_key, v) =>
        typeof v === "bigint" ? v.toString() : v
      );
    } catch {
      return String(value);
    }
  }
  return String(value);
}
