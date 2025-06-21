import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SidebarProvider } from "@/contexts/SidebarContext";
import UnderConstruction from "@/components/UnderConstruction";
import GlobalBackground from "@/components/GlobalBackground";
import { useRouter } from "next/router";

// Get STATUS from environment variable (defaults to 1 if not set)
const SITE_STATUS = process.env.STATUS || 0;

export default function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Check if site is under construction (STATUS=0)
  const isUnderConstruction = SITE_STATUS === "0";

  // Allow admin routes even when under construction
  const isAdminRoute = router.pathname.startsWith("/admin");

  // Show under construction page for all routes except admin when STATUS=0
  if (isUnderConstruction && !isAdminRoute) {
    return (
      <ThemeProvider>
        <SidebarProvider>
          <GlobalBackground />
          <UnderConstruction />
        </SidebarProvider>
      </ThemeProvider>
    );
  }

  // Normal site functionality when STATUS=1 or for admin routes
  return (
    <ThemeProvider>
      <SidebarProvider>
        <Component {...pageProps} />
      </SidebarProvider>
    </ThemeProvider>
  );
}
