import {
  type Configuration,
  type RedirectRequest,
  LogLevel,
} from "@azure/msal-browser";

const clientId = import.meta.env.VITE_CLIENT_ID;
const tenantId = import.meta.env.VITE_TENANT_ID;

/** True only when both the app (client) id and tenant id are present. */
export const isConfigured = Boolean(clientId && tenantId);

if (!isConfigured) {
  console.error(
    "[auth] Missing VITE_CLIENT_ID / VITE_TENANT_ID. Set them in .env (dev) " +
      "or as repo variables consumed by the Pages workflow (CI)."
  );
}

// Exact redirect URI:
//   prod  -> https://<user>.github.io/test-auth/
//   dev   -> http://localhost:5173/test-auth/
// (origin has no trailing slash; BASE_URL is "/test-auth/")
const redirectUri =
  import.meta.env.VITE_REDIRECT_URI ??
  window.location.origin + import.meta.env.BASE_URL;

export const msalConfig: Configuration = {
  auth: {
    clientId: clientId ?? "",
    // Single tenant.
    authority: `https://login.microsoftonline.com/${tenantId ?? "common"}`,
    redirectUri,
    postLogoutRedirectUri: redirectUri,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      logLevel: LogLevel.Warning,
      loggerCallback: (level, message) => {
        if (level === LogLevel.Error) console.error(message);
      },
    },
  },
};

/** Scopes requested at interactive sign-in. */
export const loginRequest: RedirectRequest = {
  scopes: ["User.Read"],
};

/** Delegated Microsoft Graph scope used to read the SharePoint file. */
export const graphRequest = {
  scopes: ["Files.Read.All"],
};
