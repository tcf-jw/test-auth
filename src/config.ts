// SharePoint sharing URL of the data file (parquet or xlsx). Supplied via env
// only — repo variable VITE_SHARE_URL in CI, .env locally. No URL is committed
// to source. Empty string means "not configured".
export const SHARE_URL = import.meta.env.VITE_SHARE_URL ?? "";
