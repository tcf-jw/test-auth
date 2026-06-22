# Project Data viewer

Single-page app that loads a data file (**parquet or Excel**) from SharePoint
via Microsoft Graph and renders it as a polished, sortable/filterable table.
Microsoft Entra (Azure AD) sign-in is required before any data is fetched.

- **Vite + React + TypeScript** (strict)
- **Auth:** `@azure/msal-browser` + `@azure/msal-react` — auth code + PKCE,
  public client, **no client secret**, single tenant, redirect flow
- **Data:** Microsoft Graph `/shares` → `@microsoft.graph.downloadUrl` →
  raw bytes, parsed in-browser. Format is auto-detected from magic bytes:
  - **parquet** → [`hyparquet`](https://github.com/hyparam/hyparquet)
    (+ `hyparquet-compressors` for gzip/brotli/zstd)
  - **xlsx** → [SheetJS](https://sheetjs.com) (`xlsx`, patched build from the
    SheetJS CDN); every worksheet/tab is parsed and selectable in the UI
- **Table:** TanStack Table + Tailwind CSS v4 — multi-sheet tab bar for Excel

Fetched data is kept **in memory only** — it is never written to the build output.

## Data flow

1. No session → MSAL redirects to Entra to sign in. Nothing from SharePoint
   renders until sign-in succeeds.
2. After login, a token is acquired **silently** for the delegated Graph scope
   `Files.Read.All`.
3. The sharing URL is encoded (`u!` + base64url, padding stripped) and resolved:
   `GET /v1.0/shares/{encoded}/driveItem`.
4. The response's `@microsoft.graph.downloadUrl` (pre-authenticated,
   CORS-friendly) is fetched as an `ArrayBuffer`.
5. The bytes are sniffed: `PAR1` → parquet (schema → headers), `PK` → xlsx
   (each sheet's first row → headers). Excel workbooks render one tab per sheet.

## Configuration

These are **not secrets** (public SPA client) but are environment-specific, so
they live outside the source.

| Var | Meaning |
| --- | --- |
| `VITE_CLIENT_ID` | Entra app registration — Application (client) ID |
| `VITE_TENANT_ID` | Directory (tenant) ID |
| `VITE_SHARE_URL` | **Required.** SharePoint sharing URL of the data file (no URL is committed to source) |
| `VITE_REDIRECT_URI` | _(optional)_ overrides `origin + /test-auth/` |

**Local dev:** copy `.env.example` → `.env`, fill in `VITE_CLIENT_ID`,
`VITE_TENANT_ID`, and `VITE_SHARE_URL`, then `npm install && npm run dev`. The
dev redirect URI is `http://localhost:5173/test-auth/` (register it too if you
want to test locally).

**CI / Pages:** the build workflow reads `VITE_CLIENT_ID`, `VITE_TENANT_ID`, and
`VITE_SHARE_URL` from **repository Variables** (Settings → Secrets and variables
→ Actions → Variables).

## Deploy (GitHub Pages)

- `base: '/test-auth/'` in `vite.config.ts` → site at
  `https://<user>.github.io/test-auth/`.
- A `404.html` (copy of `index.html`) is emitted at build time so hard refresh
  / the post-login redirect doesn't 404.
- `.github/workflows/deploy.yml` builds with the official Pages actions and
  deploys to the `github-pages` environment on push to `main`.

Enable once: repo **Settings → Pages → Build and deployment → Source =
GitHub Actions**.

## Scripts

```bash
npm run dev      # local dev server
npm run build    # type-check + production build to dist/ (+ 404.html)
npm run preview  # preview the production build
```
