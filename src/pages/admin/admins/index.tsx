import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/Admin/ProtectedRoute";
import PermissionGuard from "@/components/Admin/PermissionGuard";
import AdminLayout from "@/components/Admin/AdminLayout";
import GlobalBackground from "@/components/GlobalBackground";
import styles from "./Admins.module.scss";

export default function AdminsManagementPage() {
  const { theme } = useTheme();

  return (
    <>
      <GlobalBackground />
      <ProtectedRoute>
        <PermissionGuard
          requiredPermission="canManageAdmins"
          fallbackMessage="You need Super Admin privileges to manage administrators."
          redirectTo="/admin"
        >
          <AdminLayout title="Admins Management">
            <div className={`${styles.adminsPage} ${styles[theme]}`}>
              {/* Header */}
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Admins Management</h2>
              </div>
            </div>
          </AdminLayout>
        </PermissionGuard>
      </ProtectedRoute>
    </>
  );
}
