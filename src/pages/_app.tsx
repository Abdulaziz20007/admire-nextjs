import "@/styles/globals.css";
import "@/fonts/fonts.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useEffect } from "react";
import useWebDataStore from "@/store/useWebDataStore";
import Loader from "@/components/Loader";

// import function to register Swiper custom elements
import { register } from "swiper/element/bundle";
// register Swiper custom elements
register();

function MyApp({ Component, pageProps }: AppProps) {
  const loading = useWebDataStore((state) => state.loading);
  const fetchWebData = useWebDataStore((state) => state.fetchWebData);

  useEffect(() => {
    fetchWebData();
  }, [fetchWebData]);

  if (loading) {
    return <Loader />;
  }

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
