import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { useSidebar } from "@/contexts/SidebarContext";
import {
  MdDashboard,
  MdEdit,
  MdPeople,
  MdSettings,
  MdClose,
  MdLogout,
  MdLightMode,
  MdDarkMode,
  MdMessage,
} from "react-icons/md";
import { IoCaretForward, IoCaretBack } from "react-icons/io5";
import styles from "./AdminSidebar.module.scss";

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string;
  permission?: keyof ReturnType<typeof usePermissions>;
}

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: MdDashboard,
    permission: "canAccessDashboard",
  },
  {
    id: "content",
    label: "Content",
    href: "/admin/content",
    icon: MdEdit,
    permission: "canModifyContent",
  },
  {
    id: "admin",
    label: "Admin",
    href: "/admin/admins",
    icon: MdPeople,
    permission: "canManageAdmins",
  },
  {
    id: "messages",
    label: "Messages",
    href: "/admin/messages",
    icon: MdMessage,
    permission: "canAccessMessages",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: MdSettings,
    permission: "canAccessSettings",
  },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isOpen,
  onClose,
  className = "",
}) => {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const permissions = usePermissions();
  const { isCollapsed, toggleCollapse } = useSidebar();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return router.pathname === "/admin";
    }
    return router.pathname.startsWith(href);
  };

  // Filter sidebar items based on permissions
  const allowedItems = sidebarItems.filter((item) => {
    if (!item.permission) return true;
    return permissions[item.permission];
  });

  return (
    <aside
      className={`${styles.sidebar} ${styles[theme]} ${
        isOpen ? styles.open : ""
      } ${isCollapsed ? styles.collapsed : ""} ${className}`}
      role="navigation"
      aria-label="Admin navigation"
    >
      {/* Sidebar Header */}
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <img src="/logo.svg" alt="Admire Logo" className={styles.logoIcon} />
          {!isCollapsed && (
            <div className={styles.logoText}>
              <div className={styles.logoMain}>admire</div>
              <div className={styles.logoSecondary}>admin panel</div>
            </div>
          )}
        </div>

        {/* Desktop collapse toggle - badge style spanning border */}
        <button
          className={styles.collapseToggle}
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <IoCaretForward /> : <IoCaretBack />}
        </button>

        {/* Close button for mobile */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          <MdClose />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.navigation}>
        <div className={styles.navContainer}>
          <ul className={styles.navList}>
            {allowedItems.map((item) => (
              <li key={item.id} className={styles.navItem}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${
                    isActiveRoute(item.href) ? styles.active : ""
                  }`}
                  onClick={onClose}
                >
                  <span className={styles.navIcon}>
                    <item.icon />
                  </span>
                  <span className={styles.navLabel}>{item.label}</span>
                  {item.badge && (
                    <span className={styles.navBadge}>{item.badge}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Footer Controls */}
      <div className={styles.sidebarFooter}>
        <div className={styles.footerControls}>
          {/* Logout Button */}
          <button
            className={styles.logoutButton}
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span className={styles.logoutIcon}>
              <MdLogout />
            </span>
            {!isCollapsed && <span className={styles.logoutText}>Logout</span>}
          </button>

          {/* Theme Toggle */}
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } theme`}
          >
            {theme === "light" ? <MdDarkMode /> : <MdLightMode />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
