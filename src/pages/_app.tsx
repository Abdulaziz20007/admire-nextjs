import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Component {...pageProps} />
      </SidebarProvider>
    </ThemeProvider>
  );
}
