import { createRoot } from "react-dom/client";
import { ThemeProvider } from "@/components/ui/theme-provider";
import App from "./App";
import "./index.css";
import Providers from "./providers/providers";

createRoot(document.getElementById("root")!).render(
  <Providers>
    <ThemeProvider defaultTheme="light" storageKey="Conecta-theme">
      <App />
    </ThemeProvider>
  </Providers>
);
