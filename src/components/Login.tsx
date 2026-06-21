import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest, isConfigured } from "../authConfig";

/**
 * Sign-in landing. Auto-triggers an Entra redirect login on load when no
 * session exists; also offers a manual button as a fallback.
 */
export function Login() {
  const { instance, inProgress, accounts } = useMsal();

  useEffect(() => {
    if (
      isConfigured &&
      inProgress === InteractionStatus.None &&
      accounts.length === 0
    ) {
      void instance.loginRedirect(loginRequest);
    }
  }, [instance, inProgress, accounts.length]);

  const busy = inProgress !== InteractionStatus.None;

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-b from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-bold text-white">
          TC
        </div>
        <h1 className="text-xl font-semibold text-slate-900">TopCut Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in with your Microsoft work account to view project data.
        </p>

        {!isConfigured ? (
          <p className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            App not configured. Set <code className="font-mono">VITE_CLIENT_ID</code>{" "}
            and <code className="font-mono">VITE_TENANT_ID</code> and rebuild.
          </p>
        ) : (
          <button
            onClick={() => void instance.loginRedirect(loginRequest)}
            disabled={busy}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Redirecting…" : "Sign in with Microsoft"}
          </button>
        )}
      </div>
    </div>
  );
}
