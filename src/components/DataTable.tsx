import { useMemo, useState } from "react";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { type Row, formatCell } from "../data";

export function DataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Row[];
}) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columnDefs = useMemo<ColumnDef<Row>[]>(
    () =>
      columns.map((name) => ({
        id: name,
        // accessorFn (not accessorKey) so column names with dots aren't
        // treated as nested paths.
        accessorFn: (row) => row[name],
        header: name,
        cell: (info) => formatCell(info.getValue()),
        enableResizing: true,
        size: 180,
      })),
    [columns]
  );

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Substring match across every column's rendered text.
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = String(filterValue).toLowerCase();
      if (!q) return true;
      return columns.some((c) =>
        formatCell(row.original[c]).toLowerCase().includes(q)
      );
    },
    columnResizeMode: "onChange",
    enableColumnResizing: true,
  });

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Project Data</h2>
          <p className="text-sm text-slate-500">
            {filteredCount.toLocaleString()} of {rows.length.toLocaleString()}{" "}
            rows · {columns.length} columns
          </p>
        </div>

        <div className="relative">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 1 0 3.4 9.85l3.62 3.62a.75.75 0 1 0 1.06-1.06l-3.62-3.62A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
              clipRule="evenodd"
            />
          </svg>
          <input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Filter all columns…"
            className="w-64 rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div
        className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-sm"
        style={{ maxHeight: "calc(100vh - 220px)" }}
      >
        <table
          className="border-collapse text-sm"
          style={{ width: table.getTotalSize() }}
        >
          <thead className="sticky top-0 z-10 bg-slate-100">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="relative border-b border-slate-200 px-3 py-2.5 text-left font-semibold text-slate-700"
                    >
                      <button
                        className="flex w-full items-center gap-1.5 hover:text-slate-900"
                        onClick={header.column.getToggleSortingHandler()}
                        title="Sort"
                      >
                        <span className="truncate">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </span>
                        <SortIcon dir={sorted} />
                      </button>
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className={`absolute right-0 top-0 h-full w-1.5 cursor-col-resize touch-none select-none ${
                            header.column.getIsResizing()
                              ? "bg-indigo-500"
                              : "bg-transparent hover:bg-slate-300"
                          }`}
                        />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, i) => (
              <tr
                key={row.id}
                className={i % 2 ? "bg-slate-50/70" : "bg-white"}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    style={{ width: cell.column.getSize() }}
                    className="truncate border-b border-slate-100 px-3 py-2 text-slate-700"
                    title={formatCell(cell.getValue())}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {filteredCount === 0 && (
              <tr>
                <td
                  colSpan={columns.length || 1}
                  className="px-3 py-12 text-center text-slate-400"
                >
                  No rows match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortIcon({ dir }: { dir: false | "asc" | "desc" }) {
  return (
    <span className="text-slate-400">
      {dir === "asc" ? "▲" : dir === "desc" ? "▼" : "↕"}
    </span>
  );
}
