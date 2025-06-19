import React from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/Admin/ProtectedRoute";
import AdminLayout from "@/components/Admin/AdminLayout";
import GlobalBackground from "@/components/GlobalBackground";
import styles from "./Content.module.scss";

export default function ContentManagementPage() {
  const { theme } = useTheme();

  return (
    <>
      <GlobalBackground />
      <ProtectedRoute>
        <AdminLayout title="Content Management">
          <div className={`${styles.contentPage} ${styles[theme]}`}>
            {/* Header */}
            <div className={styles.pageHeader}>
              <h2 className={styles.pageTitle}>Content Management</h2>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    </>
  );
}
