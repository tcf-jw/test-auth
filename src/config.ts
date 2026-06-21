// The SharePoint sharing URL for the parquet file. Overridable via env,
// defaults to the TopCutAnalytics share provided for this app.
export const SHARE_URL =
  import.meta.env.VITE_SHARE_URL ??
  "REMOVED-SHAREPOINT-URL";
