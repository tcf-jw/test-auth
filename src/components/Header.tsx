import { useMsal } from "@azure/msal-react";

export function Header() {
  const { instance, accounts } = useMsal();
  const account = accounts[0];
  const name = account?.name ?? account?.username ?? "Signed in";
  const email = account?.username ?? "";

  return (
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

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-800">{name}</p>
            {email && <p className="text-xs text-slate-500">{email}</p>}
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
            {initials(name)}
          </div>
          <button
            onClick={() => void instance.logoutRedirect()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
