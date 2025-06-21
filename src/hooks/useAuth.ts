import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import apiClient from "@/lib/api-client";

export interface AdminUser {
  _id: string;
  username: string;
  name: string;
  surname: string;
  priority: string;
  avatar?: string;
}

export interface AuthState {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Global state to track if auth has been checked in this session
let authChecked = false;
let globalAuthState: AuthState | null = null;

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>(() => {
    // Initialize with global state if available
    if (globalAuthState) {
      return globalAuthState;
    }
    return {
      user: null,
      isLoading: true,
      isAuthenticated: false,
    };
  });
  const router = useRouter();

  // Check authentication status using JWT token (only for initial load)
  const checkAuth = useCallback(async () => {
    // Only run on client side
    if (typeof window === "undefined") {
      return false;
    }

    // If auth has already been checked in this session, use cached state
    if (authChecked && globalAuthState) {
      setAuthState(globalAuthState);
      return globalAuthState.isAuthenticated;
    }

    try {
      // Check if token exists in localStorage
      const token = localStorage.getItem("admin-token");
      if (!token) {
        const newState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        };
        setAuthState(newState);
        globalAuthState = newState;
        authChecked = true;
        return false;
      }

      // Verify token with backend using API client (only on first check)
      const response = await apiClient.get("/admin/verify");

      if (response.success && response.data?.admin) {
        const newState = {
          user: response.data.admin,
          isLoading: false,
          isAuthenticated: true,
        };
        setAuthState(newState);
        globalAuthState = newState;
        authChecked = true;
        return true;
      } else {
        // Token is invalid, clear it
        apiClient.clearTokens();
        const newState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        };
        setAuthState(newState);
        globalAuthState = newState;
        authChecked = true;
        return false;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      apiClient.clearTokens();
      const newState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
      setAuthState(newState);
      globalAuthState = newState;
      authChecked = true;
      return false;
    }
  }, []);

  // Login function using API client
  const login = useCallback(
    async (loginData: { username: string; password: string }) => {
      try {
        const response = await apiClient.post("/admin/auth", loginData);

        if (response.success && response.data?.accessToken) {
          // Store JWT token using API client
          apiClient.setToken(response.data.accessToken);

          // Update auth state
          const newState = {
            user: response.data.admin,
            isLoading: false,
            isAuthenticated: true,
          };
          setAuthState(newState);
          globalAuthState = newState;

          // Mark auth as checked since we just logged in
          authChecked = true;

          return { success: true, error: null };
        } else {
          return { success: false, error: response.error || "Login failed" };
        }
      } catch (error) {
        console.error("Login failed:", error);
        return { success: false, error: "Network error" };
      }
    },
    []
  );

  // Logout function using API client
  const logout = useCallback(async () => {
    try {
      // Call logout API using API client
      await apiClient.get("/admin/logout");
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // Always clear local state
      apiClient.clearTokens();
      const newState = {
        user: null,
        isLoading: false,
        isAuthenticated: false,
      };
      setAuthState(newState);
      globalAuthState = newState;
      // Reset auth check flag so next login will verify properly
      authChecked = false;
      // Redirect to login page
      router.push("/admin/login");
    }
  }, [router]);

  // Refresh user data (for when user data might have changed)
  const refreshUser = useCallback(async () => {
    if (!authState.isAuthenticated) return false;

    try {
      const response = await apiClient.get("/admin/verify");

      if (response.success && response.data?.admin) {
        const newState = {
          ...authState,
          user: response.data.admin,
        };
        setAuthState(newState);
        globalAuthState = newState;
        return true;
      } else {
        // Token is invalid, clear it
        apiClient.clearTokens();
        const newState = {
          user: null,
          isLoading: false,
          isAuthenticated: false,
        };
        setAuthState(newState);
        globalAuthState = newState;
        authChecked = false; // Reset so next auth check will verify properly
        return false;
      }
    } catch (error) {
      console.error("User refresh failed:", error);
      return false;
    }
  }, [authState.isAuthenticated]);

  // Check auth on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  return {
    ...authState,
    login,
    logout,
    checkAuth,
    refreshUser,
  };
};
