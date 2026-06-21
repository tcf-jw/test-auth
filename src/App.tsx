import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import { Login } from "./components/Login";
import { DataView } from "./components/DataView";

// Nothing from SharePoint renders until an authenticated session exists.
export default function App() {
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
