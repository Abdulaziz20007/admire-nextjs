import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/Admin/ProtectedRoute";
import AdminLayout from "@/components/Admin/AdminLayout";
import GlobalBackground from "@/components/GlobalBackground";
import { 
  MdSave, 
  MdSettings, 
  MdSecurity, 
  MdNotifications, 
  MdLanguage,
  MdPalette,
  MdStorage
} from "react-icons/md";
import styles from "./Settings.module.scss";

interface SettingsData {
  general: {
    siteName: string;
    siteDescription: string;
    adminEmail: string;
    timezone: string;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireStrongPasswords: boolean;
    enableTwoFactor: boolean;
  };
  notifications: {
    emailNotifications: boolean;
    loginAlerts: boolean;
    systemUpdates: boolean;
  };
  appearance: {
    defaultTheme: 'light' | 'dark' | 'system';
    compactMode: boolean;
  };
}

export default function SettingsPage() {
  const { theme } = useTheme();
  const [settings, setSettings] = useState<SettingsData>({
    general: {
      siteName: "Admire Admin",
      siteDescription: "Excellence in Education Administration",
      adminEmail: "admin@admire.edu",
      timezone: "UTC",
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireStrongPasswords: true,
      enableTwoFactor: false,
    },
    notifications: {
      emailNotifications: true,
      loginAlerts: true,
      systemUpdates: false,
    },
    appearance: {
      defaultTheme: 'system',
      compactMode: false,
    },
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleInputChange = (section: keyof SettingsData, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Mock implementation - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalBackground />
      <ProtectedRoute>
        <AdminLayout title="Settings">
          <div className={`${styles.settingsPage} ${styles[theme]}`}>
            {/* Header */}
            <div className={styles.pageHeader}>
              <h2 className={styles.pageTitle}>Settings</h2>
              <p className={styles.pageDescription}>
                Configure system settings and preferences.
              </p>
              <button
                className={`${styles.saveButton} ${saved ? styles.saved : ''}`}
                onClick={saveSettings}
                disabled={loading}
              >
                <MdSave />
                {loading ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
            </div>

            <div className={styles.settingsGrid}>
              {/* General Settings */}
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <MdSettings className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>General Settings</h3>
                </div>
                <div className={styles.settingsGroup}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Site Name</label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Site Description</label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                      className={styles.textarea}
                      rows={3}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Admin Email</label>
                    <input
                      type="email"
                      value={settings.general.adminEmail}
                      onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Timezone</label>
                    <select
                      value={settings.general.timezone}
                      onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                      className={styles.select}
                    >
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Chicago">Central Time</option>
                      <option value="America/Denver">Mountain Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <MdSecurity className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>Security</h3>
                </div>
                <div className={styles.settingsGroup}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      className={styles.input}
                      min="5"
                      max="480"
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Max Login Attempts</label>
                    <input
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) => handleInputChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                      className={styles.input}
                      min="3"
                      max="10"
                    />
                  </div>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={settings.security.requireStrongPasswords}
                        onChange={(e) => handleInputChange('security', 'requireStrongPasswords', e.target.checked)}
                        className={styles.checkbox}
                      />
                      Require Strong Passwords
                    </label>
                  </div>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={settings.security.enableTwoFactor}
                        onChange={(e) => handleInputChange('security', 'enableTwoFactor', e.target.checked)}
                        className={styles.checkbox}
                      />
                      Enable Two-Factor Authentication
                    </label>
                  </div>
                </div>
              </div>

              {/* Notifications */}
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <MdNotifications className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>Notifications</h3>
                </div>
                <div className={styles.settingsGroup}>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.emailNotifications}
                        onChange={(e) => handleInputChange('notifications', 'emailNotifications', e.target.checked)}
                        className={styles.checkbox}
                      />
                      Email Notifications
                    </label>
                  </div>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.loginAlerts}
                        onChange={(e) => handleInputChange('notifications', 'loginAlerts', e.target.checked)}
                        className={styles.checkbox}
                      />
                      Login Alerts
                    </label>
                  </div>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={settings.notifications.systemUpdates}
                        onChange={(e) => handleInputChange('notifications', 'systemUpdates', e.target.checked)}
                        className={styles.checkbox}
                      />
                      System Update Notifications
                    </label>
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <MdPalette className={styles.sectionIcon} />
                  <h3 className={styles.sectionTitle}>Appearance</h3>
                </div>
                <div className={styles.settingsGroup}>
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Default Theme</label>
                    <select
                      value={settings.appearance.defaultTheme}
                      onChange={(e) => handleInputChange('appearance', 'defaultTheme', e.target.value)}
                      className={styles.select}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System Preference</option>
                    </select>
                  </div>
                  <div className={styles.checkboxGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={settings.appearance.compactMode}
                        onChange={(e) => handleInputChange('appearance', 'compactMode', e.target.checked)}
                        className={styles.checkbox}
                      />
                      Compact Mode
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    </>
  );
}
