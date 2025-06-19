import React, { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/Admin/ProtectedRoute";
import AdminLayout from "@/components/Admin/AdminLayout";
import GlobalBackground from "@/components/GlobalBackground";
import { MdAdd, MdEdit, MdDelete, MdPerson } from "react-icons/md";
import styles from "./Admins.module.scss";

interface Admin {
  id: number;
  login: string;
  role: string;
  createdAt: string;
  lastLogin?: string;
}

export default function AdminsManagementPage() {
  const { theme } = useTheme();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAdminLogin, setNewAdminLogin] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const fetchAdmins = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockAdmins: Admin[] = [
        {
          id: 1,
          login: "admin",
          role: "Super Admin",
          createdAt: "2024-01-01",
          lastLogin: "2024-06-18",
        },
      ];
      setAdmins(mockAdmins);
    } catch (err) {
      setError("Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const addAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminLogin.trim() || !newAdminPassword.trim()) return;

    setIsAdding(true);
    try {
      // Mock implementation - replace with actual API call
      const newAdmin: Admin = {
        id: Date.now(),
        login: newAdminLogin,
        role: "Admin",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setAdmins([...admins, newAdmin]);
      setNewAdminLogin("");
      setNewAdminPassword("");
    } catch (err) {
      setError("Failed to add admin");
    } finally {
      setIsAdding(false);
    }
  };

  const deleteAdmin = async (id: number) => {
    if (!confirm("Are you sure you want to delete this admin?")) return;
    
    try {
      setAdmins(admins.filter((admin) => admin.id !== id));
    } catch (err) {
      setError("Failed to delete admin");
    }
  };

  return (
    <>
      <GlobalBackground />
      <ProtectedRoute>
        <AdminLayout title="Admins Management">
          <div className={`${styles.adminsPage} ${styles[theme]}`}>
            {/* Header */}
            <div className={styles.pageHeader}>
              <h2 className={styles.pageTitle}>Admins Management</h2>
              <p className={styles.pageDescription}>
                Manage administrator accounts and permissions.
              </p>
            </div>

            {/* Add Admin Form */}
            <div className={styles.addSection}>
              <h3 className={styles.sectionTitle}>Add New Admin</h3>
              <form onSubmit={addAdmin} className={styles.addForm}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    placeholder="Enter admin login"
                    value={newAdminLogin}
                    onChange={(e) => setNewAdminLogin(e.target.value)}
                    className={styles.input}
                    disabled={isAdding}
                  />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className={styles.input}
                    disabled={isAdding}
                  />
                  <button
                    type="submit"
                    disabled={isAdding || !newAdminLogin.trim() || !newAdminPassword.trim()}
                    className={styles.addButton}
                  >
                    <MdAdd />
                    {isAdding ? "Adding..." : "Add Admin"}
                  </button>
                </div>
              </form>
            </div>

            {/* Admins List */}
            <div className={styles.adminsSection}>
              <h3 className={styles.sectionTitle}>
                All Admins ({admins.length})
              </h3>

              {loading ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner}></div>
                  <p>Loading admins...</p>
                </div>
              ) : error ? (
                <div className={styles.errorState}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <p>{error}</p>
                  <button onClick={fetchAdmins} className={styles.retryButton}>
                    Retry
                  </button>
                </div>
              ) : admins.length === 0 ? (
                <div className={styles.emptyState}>
                  <MdPerson className={styles.emptyIcon} />
                  <h4>No admins found</h4>
                  <p>Add your first admin using the form above.</p>
                </div>
              ) : (
                <div className={styles.adminsList}>
                  {admins.map((admin) => (
                    <div key={admin.id} className={styles.adminCard}>
                      <div className={styles.adminInfo}>
                        <div className={styles.adminIcon}>
                          <MdPerson />
                        </div>
                        <div className={styles.adminDetails}>
                          <h4 className={styles.adminLogin}>{admin.login}</h4>
                          <p className={styles.adminRole}>{admin.role}</p>
                          <div className={styles.adminMeta}>
                            <span>Created: {admin.createdAt}</span>
                            {admin.lastLogin && (
                              <span>Last login: {admin.lastLogin}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={styles.adminActions}>
                        <button
                          className={styles.editButton}
                          aria-label="Edit admin"
                        >
                          <MdEdit />
                        </button>
                        <button
                          className={styles.deleteButton}
                          onClick={() => deleteAdmin(admin.id)}
                          aria-label="Delete admin"
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    </>
  );
}
