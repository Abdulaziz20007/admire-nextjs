import "@/styles/globals.css";
import "@/fonts/fonts.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";

// import function to register Swiper custom elements
import { register } from "swiper/element/bundle";
// register Swiper custom elements
register();

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const data = {
      theme: "dark",
    };
    localStorage.setItem("theme", JSON.stringify(data));
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <SidebarProvider>
          <Component {...pageProps} />
        </SidebarProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
export default MyApp;
