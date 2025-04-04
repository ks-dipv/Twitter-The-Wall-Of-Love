import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="512364363194-q6ko3eube0h42fk4f6brbcapoms11mtl.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
);
