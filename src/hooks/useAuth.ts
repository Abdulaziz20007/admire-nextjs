import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";

export interface AdminUser {
  id: number;
  login: string;
}

export interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Simple client-side authentication
const ADMIN_CREDENTIALS = {
  login: "admin",
  password: "admin",
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  // Check authentication status from localStorage
  const checkAuth = useCallback(() => {
    // Only run on client side
    if (typeof window === "undefined") {
      return false;
    }

    try {
      const storedUser = localStorage.getItem("admin-user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        });
        return true;
      } else {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return false;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      return false;
    }
  }, []);

  // Login function with client-side validation
  const login = useCallback(
    (loginData: { login: string; password: string }) => {
      try {
        // Simple client-side authentication
        if (
          loginData.login === ADMIN_CREDENTIALS.login &&
          loginData.password === ADMIN_CREDENTIALS.password
        ) {
          const user = { id: 1, login: loginData.login };

          // Store user in localStorage
          localStorage.setItem("admin-user", JSON.stringify(user));

          // Update auth state
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          });

          return { success: true, error: null };
        } else {
          return { success: false, error: "Invalid credentials" };
        }
      } catch (error) {
        console.error("Login failed:", error);
        return { success: false, error: "Login error" };
      }
    },
    []
  );

  // Logout function
  const logout = useCallback(() => {
    try {
      // Clear localStorage
      localStorage.removeItem("admin-user");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always clear auth state
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      // Redirect to login page
      router.push("/admin/login");
    }
  }, [router]);

  // Check auth on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      checkAuth();
    }
  }, [checkAuth]);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
};
