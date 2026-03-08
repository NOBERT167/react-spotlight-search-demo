import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import SpotlightWrapper from "./providers/SpotlightWrapper.tsx";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <SpotlightWrapper>
        <App />
        <Analytics />
      </SpotlightWrapper>
    </ThemeProvider>
  </StrictMode>,
);
