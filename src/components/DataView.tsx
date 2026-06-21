import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { InteractionRequiredAuthError } from "@azure/msal-browser";
import { graphRequest } from "../authConfig";
import { SHARE_URL } from "../config";
import { getDownloadUrl, fetchArrayBuffer } from "../graph";
import { parseFile, type ParsedData } from "../data";
import { Header } from "./Header";
import { DataWorkbook } from "./DataWorkbook";

type Status = "loading" | "ready" | "error";

export function DataView() {
  const { instance, accounts } = useMsal();
  const [status, setStatus] = useState<Status>("loading");
  const [data, setData] = useState<ParsedData | null>(null);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus("loading");
      setError("");
      try {
        const account = accounts[0];
        if (!account) throw new Error("No signed-in account.");

        // Silent token for delegated Graph access.
        const tokenResp = await instance.acquireTokenSilent({
          ...graphRequest,
          account,
        });

        const downloadUrl = await getDownloadUrl(tokenResp.accessToken, SHARE_URL);
        const buffer = await fetchArrayBuffer(downloadUrl);
        const parsed = await parseFile(buffer);

        if (!cancelled) {
          setData(parsed);
          setStatus("ready");
        }
      } catch (err) {
        // Silent token failed (consent/expiry) -> fall back to interactive.
        if (err instanceof InteractionRequiredAuthError) {
          await instance.acquireTokenRedirect(graphRequest);
          return;
        }
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [instance, accounts, reloadKey]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {status === "loading" && (
        <CenteredState>
          <Spinner />
          <p className="mt-4 text-sm text-slate-500">Loading project data…</p>
        </CenteredState>
      )}

      {status === "error" && (
        <CenteredState>
          <div className="w-full max-w-md rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm font-semibold text-red-800">
              Couldn’t load the data
            </p>
            <p className="mt-1 break-words text-sm text-red-700">{error}</p>
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-4 rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </CenteredState>
      )}

      {status === "ready" && data && <DataWorkbook data={data} />}
    </div>
  );
}

function CenteredState({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid place-items-center px-6" style={{ minHeight: "70vh" }}>
      <div className="flex flex-col items-center text-center">{children}</div>
    </div>
  );
}

function Spinner() {
  return (
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
  );
}
