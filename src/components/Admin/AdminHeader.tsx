import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { AdminUser } from '@/hooks/useAuth';
import styles from './AdminHeader.module.scss';

interface AdminHeaderProps {
  title: string;
  user: AdminUser | null;
  onMenuToggle: () => void;
  className?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  user,
  onMenuToggle,
  className = '',
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className={`${styles.header} ${styles[theme]} ${className}`}>
      <div className={styles.headerContent}>
        {/* Left side - Menu toggle and title */}
        <div className={styles.headerLeft}>
          <button
            className={styles.menuToggle}
            onClick={onMenuToggle}
            aria-label="Toggle sidebar menu"
          >
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
          </button>
          
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>{title}</h1>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbItem}>Admin</span>
              <span className={styles.breadcrumbSeparator}>›</span>
              <span className={styles.breadcrumbItem}>{title}</span>
            </div>
          </div>
        </div>

        {/* Right side - Theme toggle and user info */}
        <div className={styles.headerRight}>
          {/* Theme Toggle */}
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            <span 
              className={`${styles.themeIcon} ${styles.sun} ${
                theme === 'light' ? styles.active : styles.inactive
              }`}
            >
              ☀️
            </span>
            <span 
              className={`${styles.themeIcon} ${styles.moon} ${
                theme === 'dark' ? styles.active : styles.inactive
              }`}
            >
              🌙
            </span>
          </button>

          {/* User Info */}
          <div className={styles.userSection}>
            <div className={styles.userAvatar}>
              {user?.login?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.login || 'Admin'}</div>
              <div className={styles.userRole}>Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
