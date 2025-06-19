import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import {
  MdEdit,
  MdPeople,
  MdSettings,
  MdAccessTime,
  MdDashboard,
} from "react-icons/md";
import styles from "./AdminDashboard.module.scss";

interface DashboardStats {
  totalAdmins: number;
  contentSections: number;
  systemStatus: "online" | "maintenance" | "offline";
}

interface RecentActivity {
  id: string;
  type: "login" | "content_updated" | "admin_created" | "system";
  message: string;
  timestamp: string;
  user?: string;
}

export const AdminDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState<DashboardStats>({
    totalAdmins: 1,
    contentSections: 3,
    systemStatus: "online",
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Initialize dashboard data
    setRecentActivity([
      {
        id: "1",
        type: "login",
        message: `Admin ${user?.login} logged in`,
        timestamp: new Date().toISOString(),
        user: user?.login,
      },
      {
        id: "2",
        type: "system",
        message: "System backup completed successfully",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        type: "content_updated",
        message: "Header section content updated",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);
    setLoading(false);
  }, [user]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "login":
        return "🔐";
      case "content_updated":
        return <MdEdit />;
      case "admin_created":
        return <MdPeople />;
      case "system":
        return <MdSettings />;
      default:
        return <MdDashboard />;
    }
  };

  const getStatusColor = (status: DashboardStats["systemStatus"]) => {
    switch (status) {
      case "online":
        return "#10b981";
      case "maintenance":
        return "#f59e0b";
      case "offline":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  if (loading) {
    return (
      <div className={`${styles.dashboard} ${styles[theme]}`}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${styles[theme]}`}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}>
          Welcome back, {user?.login || "Admin"}! 👋
        </h2>
        <p className={styles.welcomeSubtitle}>
          Here's what's happening with your system today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MdPeople />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.totalAdmins}</div>
            <div className={styles.statLabel}>Total Admins</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MdEdit />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{stats.contentSections}</div>
            <div className={styles.statLabel}>Content Sections</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <span
              className={styles.statusIndicator}
              style={{ backgroundColor: getStatusColor(stats.systemStatus) }}
            ></span>
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {stats.systemStatus.charAt(0).toUpperCase() +
                stats.systemStatus.slice(1)}
            </div>
            <div className={styles.statLabel}>System Status</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <MdAccessTime />
          </div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{formatCurrentTime()}</div>
            <div className={styles.statLabel}>Current Time</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={styles.activitySection}>
        <h3 className={styles.sectionTitle}>Recent Activity</h3>
        <div className={styles.activityList}>
          {recentActivity.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityIcon}>
                {getActivityIcon(activity.type)}
              </div>
              <div className={styles.activityContent}>
                <div className={styles.activityMessage}>{activity.message}</div>
                <div className={styles.activityTime}>
                  {formatTimestamp(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <div className={styles.actionGrid}>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>
              <MdEdit />
            </span>
            <span className={styles.actionLabel}>Manage Content</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>
              <MdPeople />
            </span>
            <span className={styles.actionLabel}>Manage Admins</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>
              <MdSettings />
            </span>
            <span className={styles.actionLabel}>Settings</span>
          </button>
          <button className={styles.actionButton}>
            <span className={styles.actionIcon}>
              <MdDashboard />
            </span>
            <span className={styles.actionLabel}>View Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
