import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/Admin/ProtectedRoute";
import PermissionGuard from "@/components/Admin/PermissionGuard";
import AdminLayout from "@/components/Admin/AdminLayout";
import GlobalBackground from "@/components/GlobalBackground";
import styles from "./Messages.module.scss";

export default function MessagesPage() {
  const { theme } = useTheme();

  return (
    <>
      <GlobalBackground />
      <ProtectedRoute>
        <PermissionGuard
          requiredPermission="canAccessMessages"
          fallbackMessage="You need Message Access privileges or higher to view messages."
          redirectTo="/admin"
        >
          <AdminLayout title="Messages">
            <div className={`${styles.messagesPage} ${styles[theme]}`}>
              {/* Header */}
              <div className={styles.pageHeader}>
                <h2 className={styles.pageTitle}>Messages</h2>
              </div>
              {/* Placeholder content */}
              <p className={styles.placeholderText}>
                No messages to display yet.
              </p>
            </div>
          </AdminLayout>
        </PermissionGuard>
      </ProtectedRoute>
    </>
  );
}
