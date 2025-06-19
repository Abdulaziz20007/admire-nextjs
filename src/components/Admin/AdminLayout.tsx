import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/contexts/SidebarContext";
import AdminSidebar from "./AdminSidebar";
import styles from "./AdminLayout.module.scss";

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title = "Admin Dashboard",
}) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { isCollapsed } = useSidebar();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className={`${styles.adminLayout} ${styles[theme]}`}>
      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        className={styles.sidebar}
      />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div
        className={`${styles.mainContent} ${
          isCollapsed ? styles.mainContentCollapsed : ""
        }`}
      >
        {/* Content */}
        <main className={styles.content}>
          <div className={styles.contentWrapper}>{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
