import { parquetMetadata, parquetSchema, parquetReadObjects } from "hyparquet";
import { compressors } from "hyparquet-compressors";

export type Row = Record<string, unknown>;

export interface ParsedParquet {
  columns: string[];
  rows: Row[];
}

/**
 * Parse parquet bytes into ordered column headers + row objects.
 * Column order/headers come from the parquet schema; rows are read as objects.
 * `compressors` adds gzip/brotli/zstd support on top of the built-in snappy.
 */
export async function parseParquet(buffer: ArrayBuffer): Promise<ParsedParquet> {
  const metadata = parquetMetadata(buffer);
  const schema = parquetSchema(metadata);
  const columns = schema.children.map((child) => child.element.name);

  const rows = (await parquetReadObjects({
    file: buffer,
    compressors,
  })) as Row[];

  return { columns, rows };
}

/** Render any parquet cell value as display text. */
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
