import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setAuthTokenGetter } from "@workspace/api-client-react/src/custom-fetch";

// Setup API client auth token getter
setAuthTokenGetter(() => {
  return localStorage.getItem("ai_token");
});

createRoot(document.getElementById("root")!).render(<App />);
