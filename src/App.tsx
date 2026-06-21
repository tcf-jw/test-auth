import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { Login } from "./components/Login";
import { DataView } from "./components/DataView";
import { DemoView } from "./components/DemoView";

// Nothing from SharePoint renders until an authenticated session exists.
export default function App() {
  // ?demo=1 -> unauthenticated UI preview with fake data (no Graph calls).
  const isDemo = new URLSearchParams(window.location.search).has("demo");
  if (isDemo) return <DemoView />;

  return (
    <>
      <AuthenticatedTemplate>
        <DataView />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <Login />
      </UnauthenticatedTemplate>
    </>
  );
}
