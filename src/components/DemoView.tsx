import { DEMO_DATA } from "../demoData";
import { DataWorkbook } from "./DataWorkbook";

/**
 * Unauthenticated preview of the table UI with fake sample data.
 * Reached via ?demo=1. Never touches Microsoft Graph.
 */
export function DemoView() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
              TC
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-slate-900">
                TopCut Analytics
              </h1>
              <p className="text-xs text-slate-500">Project data</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            DEMO · sample data · no sign-in
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-screen-2xl px-6 pt-4">
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Preview only — this is fabricated data to show the interface. The live
          app requires Microsoft sign-in and loads real SharePoint data.
        </p>
      </div>

      <DataWorkbook data={DEMO_DATA} />
    </div>
  );
}
