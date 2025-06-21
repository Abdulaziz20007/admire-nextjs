import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// Types for request retry functionality
interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  config: AxiosRequestConfig;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: PendingRequest[] = [];
  private refreshAttempts = 0;
  private maxRefreshAttempts = 3;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: "/api",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };

        // Only handle 401 errors for authenticated requests
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          // Check if this is a token-related error (not login failure)
          const isTokenError =
            error.response.data &&
            typeof error.response.data === "object" &&
            "error" in error.response.data &&
            (error.response.data.error === "Token expired" ||
              error.response.data.error === "Invalid token" ||
              error.response.data.error === "No token provided");

          if (isTokenError) {
            // Check if we've exceeded max refresh attempts
            if (this.refreshAttempts >= this.maxRefreshAttempts) {
              console.warn(
                "Max refresh attempts exceeded, redirecting to login"
              );
              this.handleAuthFailure();
              return Promise.reject(error);
            }

            if (this.isRefreshing) {
              // If already refreshing, queue this request
              return new Promise((resolve, reject) => {
                this.failedQueue.push({
                  resolve,
                  reject,
                  config: originalRequest,
                });
              });
            }

            originalRequest._retry = true;
            this.isRefreshing = true;
            this.refreshAttempts++;

            try {
              const newToken = await this.refreshToken();

              if (newToken) {
                // Reset refresh attempts on successful refresh
                this.refreshAttempts = 0;

                // Update the original request with new token
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                }

                // Process all queued requests
                this.processQueue(null, newToken);

                // Retry the original request
                return this.axiosInstance(originalRequest);
              } else {
                // Refresh failed, redirect to login
                this.processQueue(new Error("Token refresh failed"), null);
                this.handleAuthFailure();
                return Promise.reject(error);
              }
            } catch (refreshError) {
              this.processQueue(refreshError, null);
              this.handleAuthFailure();
              return Promise.reject(error);
            } finally {
              this.isRefreshing = false;
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error);
      } else if (token) {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        resolve(this.axiosInstance(config));
      }
    });

    this.failedQueue = [];
  }

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("admin-token");
  }

  private setAccessToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("admin-token", token);
    }
  }

  private removeTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin-token");
    }
  }

  private async refreshToken(): Promise<string | null> {
    try {
      // Create a separate axios instance for refresh requests to avoid interceptor loops
      const refreshAxios = axios.create({
        baseURL: "/api",
        timeout: 10000,
        withCredentials: true,
      });

      const response = await refreshAxios.get("/admin/refresh");

      if (response.data.success && response.data.data.accessToken) {
        const newToken = response.data.data.accessToken;
        this.setAccessToken(newToken);
        return newToken;
      }

      return null;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return null;
    }
  }

  private handleAuthFailure(): void {
    this.removeTokens();
    // Reset refresh attempts when auth fails
    this.refreshAttempts = 0;

    // Only redirect if we're in the browser and in admin area
    if (typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (currentPath.startsWith("/admin") && currentPath !== "/admin/login") {
        // Store current path for redirect after login
        sessionStorage.setItem("adminRedirectPath", currentPath);
        window.location.href = "/admin/login";
      }
    }
  }

  // Public API methods
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<ApiResponse<T>> =
        await this.axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  private handleError(error: any): ApiResponse {
    if (axios.isAxiosError(error)) {
      if (error.response?.data) {
        return {
          success: false,
          error:
            error.response.data.error ||
            error.response.data.message ||
            "Request failed",
        };
      }

      if (error.code === "ECONNABORTED") {
        return {
          success: false,
          error: "Request timeout",
        };
      }

      return {
        success: false,
        error: error.message || "Network error",
      };
    }

    return {
      success: false,
      error: "Unknown error occurred",
    };
  }

  // Method to manually set token (for login)
  setToken(token: string): void {
    this.setAccessToken(token);
  }

  // Method to clear tokens (for logout)
  clearTokens(): void {
    this.removeTokens();
    // Reset refresh attempts when tokens are cleared
    this.refreshAttempts = 0;
  }

  // Method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
