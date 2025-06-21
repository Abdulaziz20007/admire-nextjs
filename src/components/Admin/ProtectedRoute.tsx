import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./ProtectedRoute.module.scss";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  showLoader?: boolean;
}

const LoadingSpinner: React.FC = () => {
  const { theme } = useTheme();

  return (
    <div className={`${styles.loadingContainer} ${styles[theme]}`}>
      <div className={styles.loadingContent}>
        <div className={styles.simpleSpinner}>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
          <div className={styles.spinnerDot}></div>
        </div>
        <p className={styles.loadingText}>Loading admin panel...</p>
      </div>
    </div>
  );
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/admin/login",
  showLoader = true,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the current path to redirect back after login
      const currentPath = router.asPath;
      if (currentPath !== redirectTo) {
        sessionStorage.setItem("adminRedirectPath", currentPath);
      }
      router.replace(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return showLoader ? <LoadingSpinner /> : null;
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
