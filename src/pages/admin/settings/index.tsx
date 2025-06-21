import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/Admin/ProtectedRoute";
import PermissionGuard from "@/components/Admin/PermissionGuard";
import AdminLayout from "@/components/Admin/AdminLayout";
import GlobalBackground from "@/components/GlobalBackground";
import styles from "./Settings.module.scss";

export default function SettingsPage() {
  const { theme } = useTheme();

  return (
    <>
      <GlobalBackground />
      <ProtectedRoute>
        <PermissionGuard
          requiredPermission="canAccessSettings"
          fallbackMessage="You need Super Admin privileges to access settings."
          redirectTo="/admin"
        >
          <AdminLayout title="Settings">
            <div className={`${styles.settingsPage} ${styles[theme]}`}>
              {/* Header */}
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Settings</h2>
              </div>
            </div>
          </AdminLayout>
        </PermissionGuard>
      </ProtectedRoute>
    </>
  );
}
