import { useAuth } from "./useAuth";

/**
 * Permission levels:
 * 0 = Blocked (no access)
 * 1 = Messages Only (can access messages, toggle is_checked)
 * 2 = Content Manager (inherits 1 + can modify content + delete messages)
 * 3 = Super Admin (inherits 1,2 + can manage admins)
 */

export const PERMISSIONS = {
  BLOCKED: "0",
  MESSAGE_ACCESS: "1",
  CONTENT_ACCESS: "2",
  FULL_ACCESS: "3",
} as const;

export interface UserPermissions {
  canAccessMessages: boolean;
  canToggleMessageStatus: boolean;
  canDeleteMessages: boolean;
  canModifyContent: boolean;
  canManageAdmins: boolean;
  canAccessSettings: boolean;
  canAccessDashboard: boolean;
}

export const usePermissions = (): UserPermissions => {
  const { user } = useAuth();

  // Default permissions for unauthenticated users
  const defaultPermissions = {
    canAccessMessages: false,
    canToggleMessageStatus: false,
    canDeleteMessages: false,
    canModifyContent: false,
    canManageAdmins: false,
    canAccessSettings: false,
    canAccessDashboard: false,
  };

  if (!user || !user.priority) {
    return defaultPermissions;
  }

  const priority = parseInt(user.priority);

  return {
    canAccessDashboard: priority >= 1, // All authenticated users can see dashboard
    canAccessMessages: priority >= 1,
    canToggleMessageStatus: priority >= 1,
    canDeleteMessages: priority >= 2,
    canModifyContent: priority >= 2,
    canManageAdmins: priority >= 3,
    canAccessSettings: priority >= 3,
  };
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (
  userPriority: string | undefined,
  requiredPriority: string
): boolean => {
  if (!userPriority) return false;
  const user = parseInt(userPriority);
  const required = parseInt(requiredPriority);
  return user >= required;
};

/**
 * Get permission level name
 */
export const getPermissionName = (priority: string): string => {
  switch (priority) {
    case "0":
      return "Blocked";
    case "1":
      return "Message Access";
    case "2":
      return "Content Manager";
    case "3":
      return "Super Admin";
    default:
      return "Unknown";
  }
};

/**
 * Get permission level color for UI
 */
export const getPermissionColor = (priority: string): string => {
  switch (priority) {
    case "0":
      return "#ef4444"; // Red
    case "1":
      return "#f59e0b"; // Yellow
    case "2":
      return "#3b82f6"; // Blue
    case "3":
      return "#10b981"; // Green
    default:
      return "#6b7280"; // Gray
  }
};
