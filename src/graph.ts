const GRAPH = "https://graph.microsoft.com/v1.0";

/**
 * Encode a SharePoint/OneDrive sharing URL into the `u!`-prefixed token the
 * Graph /shares endpoint expects: base64 the URL, swap `+`->`-` and `/`->`_`,
 * strip trailing `=` padding, prefix with `u!`.
 */
export function encodeShareUrl(url: string): string {
  const b64 = btoa(url);
  return "u!" + b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

interface DriveItem {
  "@microsoft.graph.downloadUrl"?: string;
  name?: string;
  size?: number;
}

/**
 * Resolve a sharing URL to its driveItem and return the pre-authenticated,
 * CORS-friendly `@microsoft.graph.downloadUrl`.
 */
export async function getDownloadUrl(
  token: string,
  shareUrl: string
): Promise<string> {
  const encoded = encodeShareUrl(shareUrl);
  const res = await fetch(`${GRAPH}/shares/${encoded}/driveItem`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `Graph /shares request failed: ${res.status} ${res.statusText}. ${body.slice(
        0,
        300
      )}`
    );
  }

  const item = (await res.json()) as DriveItem;
  const downloadUrl = item["@microsoft.graph.downloadUrl"];
  if (!downloadUrl) {
    throw new Error(
      "driveItem response had no @microsoft.graph.downloadUrl property."
    );
  }
  return downloadUrl;
}

/**
 * Fetch the pre-authenticated download URL as raw bytes. No auth header — the
 * URL is already signed, and adding one can break the CDN request.
 */
export async function fetchArrayBuffer(url: string): Promise<ArrayBuffer> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`File download failed: ${res.status} ${res.statusText}`);
  }
  return res.arrayBuffer();
}
