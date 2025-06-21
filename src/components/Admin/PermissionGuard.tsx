import React, { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions, PERMISSIONS } from "@/hooks/usePermissions";
import { useTheme } from "@/contexts/ThemeContext";
import styles from "./PermissionGuard.module.scss";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission: keyof ReturnType<typeof usePermissions>;
  fallbackMessage?: string;
  redirectTo?: string;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  fallbackMessage = "You don't have permission to access this page.",
  redirectTo,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const permissions = usePermissions();
  const { theme } = useTheme();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className={`${styles.permissionGuard} ${styles[theme]}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Checking permissions...</p>
        </div>
      </div>
    );
  }

  // Prevent redirect loops
  useEffect(() => {
    return () => {
      hasRedirected.current = false;
    };
  }, [router.pathname]);

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    if (redirectTo && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace(redirectTo);
      return null;
    }
    return (
      <div className={`${styles.permissionGuard} ${styles[theme]}`}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>🔒</div>
          <h2 className={styles.errorTitle}>Authentication Required</h2>
          <p className={styles.errorMessage}>
            Please log in to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Check if user has required permission
  const hasPermission = permissions[requiredPermission];

  if (!hasPermission) {
    if (redirectTo && !hasRedirected.current) {
      hasRedirected.current = true;
      router.replace(redirectTo);
      return null;
    }

    return (
      <div className={`${styles.permissionGuard} ${styles[theme]}`}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h2 className={styles.errorTitle}>Access Denied</h2>
          <p className={styles.errorMessage}>{fallbackMessage}</p>
          <div className={styles.permissionInfo}>
            <p>
              Your current permission level:{" "}
              <strong>{getPermissionName(user.priority)}</strong>
            </p>
            <p>
              Required permission:{" "}
              <strong>{getRequiredPermissionName(requiredPermission)}</strong>
            </p>
          </div>
          <button className={styles.backButton} onClick={() => router.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // User has permission, render children
  return <>{children}</>;
};

// Helper function to get permission name
function getPermissionName(priority: string): string {
  switch (priority) {
    case "0":
      return "Blocked";
    case "1":
      return "Message Access";
    case "2":
      return "Content Manager";
    case "3":
      return "Super Admin";
    default:
      return "Unknown";
  }
}

// Helper function to get required permission name
function getRequiredPermissionName(
  permission: keyof ReturnType<typeof usePermissions>
): string {
  switch (permission) {
    case "canAccessDashboard":
      return "Dashboard Access";
    case "canAccessMessages":
      return "Message Access";
    case "canToggleMessageStatus":
      return "Message Status Toggle";
    case "canDeleteMessages":
      return "Message Deletion";
    case "canModifyContent":
      return "Content Management";
    case "canManageAdmins":
      return "Admin Management";
    case "canAccessSettings":
      return "Settings Access";
    default:
      return "Unknown Permission";
  }
}

export default PermissionGuard;
