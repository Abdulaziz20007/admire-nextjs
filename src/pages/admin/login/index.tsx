import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/hooks/useAuth";
import GlobalBackground from "@/components/GlobalBackground";
import styles from "./AdminLogin.module.scss";

export default function AdminLogin() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { login: authLogin, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath =
        sessionStorage.getItem("adminRedirectPath") || "/admin";
      sessionStorage.removeItem("adminRedirectPath");
      router.replace(redirectPath);
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await authLogin({ username, password });
      if (result.success) {
        const redirectPath =
          sessionStorage.getItem("adminRedirectPath") || "/admin";
        sessionStorage.removeItem("adminRedirectPath");
        router.push(redirectPath);
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GlobalBackground />
      <main className={`${styles.loginPage} ${styles[theme]}`}>
        <div className={styles.container}>
          {/* Header with logo and theme toggle */}
          <div className={styles.header}>
            <div className={styles.logo}>
              <img
                src="/logo.svg"
                alt="Admire Logo"
                className={styles.logoIcon}
              />
              <div className={styles.logoText}>
                <div className={styles.logoMain}>admire</div>
                <div className={styles.logoSecondary}>admin panel</div>
              </div>
            </div>

            <button
              className={styles.themeToggle}
              onClick={toggleTheme}
              aria-label={`Switch to ${
                theme === "light" ? "dark" : "light"
              } theme`}
            >
              <span
                className={`${styles.themeIcon} ${styles.sun} ${
                  theme === "light" ? styles.active : styles.inactive
                }`}
              >
                ☀️
              </span>
              <span
                className={`${styles.themeIcon} ${styles.moon} ${
                  theme === "dark" ? styles.active : styles.inactive
                }`}
              >
                🌙
              </span>
            </button>
          </div>

          {/* Login Card */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h1 className={styles.title}>Welcome Back</h1>
              <p className={styles.subtitle}>
                Sign in to access the admin panel
              </p>
            </div>

            <form className={styles.form} onSubmit={handleSubmit} noValidate>
              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                className={styles.button}
                type="submit"
                disabled={loading || !username || !password}
              >
                {loading ? (
                  <span className={styles.buttonContent}>
                    <span className={styles.spinner}></span>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>

              {error && (
                <div className={styles.errorContainer}>
                  <span className={styles.errorIcon}>⚠️</span>
                  <p className={styles.error}>{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
