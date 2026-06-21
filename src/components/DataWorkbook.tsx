import { useState } from "react";
import type { ParsedData } from "../data";
import { DataTable } from "./DataTable";

/** Renders a workbook: a tab bar per sheet (when >1) plus the active table. */
export function DataWorkbook({ data }: { data: ParsedData }) {
  const [active, setActive] = useState(0);
  const sheet = data.sheets[active] ?? data.sheets[0];

  if (!sheet) {
    return (
      <div className="mx-auto max-w-screen-2xl px-6 py-12 text-center text-slate-400">
        The file contains no sheets.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-6">
      {data.sheets.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
          {data.sheets.map((s, i) => (
            <button
              key={`${s.name}-${i}`}
              onClick={() => setActive(i)}
              className={`-mb-px flex items-center gap-2 rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition ${
                i === active
                  ? "border-indigo-600 text-indigo-700"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              <span className="max-w-[16rem] truncate">{s.name}</span>
              <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-xs text-slate-500">
                {s.rows.length.toLocaleString()}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* key remounts the table on sheet switch so sort/filter reset cleanly */}
      <DataTable key={active} columns={sheet.columns} rows={sheet.rows} />
    </div>
  );
}
