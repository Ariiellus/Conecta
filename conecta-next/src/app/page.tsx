"use client";

import { ThemeProvider } from "@/components/ui/theme-provider";
import Landing from "./Landing/page";

export default function Page() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="Conecta-theme">
      <div className="min-h-screen">
        <Landing />
      </div>
    </ThemeProvider>
  );
}
