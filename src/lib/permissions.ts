import type { AuthPermission, AuthUser } from "../interfaces/auth.types";

const normalize = (value: string) => value.replace(/[_\s-]/g, "").toUpperCase();

/**
 * Checks if a user has a specific role.
 */
export const hasRole = (user: AuthUser | null, roleName: string): boolean => {
    return user?.roles?.some((role) => normalize(role.name) === normalize(roleName)) ?? false;
};

/**
 * Checks if a user has a specific authority based on their permissions list.
 * Automatically falls back to granting permission if the user has the specified fallback role.
 */
export const hasAuthority = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    authority: string,
    fallbackRole = "ADMIN"
): boolean => {
    if (hasRole(user, fallbackRole)) return true;

    const [resource, action] = authority.split(":");
    const normalizedAuthority = normalize(authority);
    const normalizedResource = normalize(resource ?? "");
    const normalizedAction = normalize(action ?? "");
    const resourceParts = resource?.split("/") ?? [];
    const normalizedShortResource = normalize(resourceParts[resourceParts.length - 1] ?? "");

    return permissions.some((permission) => {
        const permissionResource = normalize(permission.resource);
        const permissionAction = normalize(permission.action);
        const permissionAuthority = normalize(`${permission.resource}:${permission.action}`);

        return (
            permissionAuthority === normalizedAuthority ||
            (permissionResource === normalizedResource && permissionAction === normalizedAction) ||
            (permissionResource === normalizedShortResource && permissionAction === normalizedAction)
        );
    });
};

/**
 * Checks if a user has task-specific authorities.
 */
export const hasTaskAuthority = (user: AuthUser | null, permissions: AuthPermission[], action: string): boolean => {
    return hasAuthority(user, permissions, `KPI/TASK:${action}`);
};

/**
 * Checks if a user has KPI-specific authorities.
 */
export const hasKpiAuthority = (user: AuthUser | null, permissions: AuthPermission[], authority: string): boolean => {
    return hasAuthority(user, permissions, authority);
};

// ==========================================
// 📋 Task Permissions & Data Isolation Helpers
// ==========================================

/**
 * Checks if a user can create a task.
 * Constraint: Task creator (Manager) and assignee must belong to the same team.
 */
export const canCreateTask = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    assignee: { teamId?: number | null } | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "CREATE") && !hasAuthority(user, permissions, "TASK:CREATE_TEAM")) {
        return false;
    }
    if (!user || !assignee) return false;
    return user.teamId !== null && user.teamId !== undefined && user.teamId === assignee.teamId;
};

/**
 * Checks if a user can view a task's details.
 * Constraints:
 * - Admin can view all tasks.
 * - Manager can view tasks they created, or tasks of users in their team / direct reports.
 * - Staff can only view tasks assigned to them.
 */
export const canViewTask = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { managerId: number; assigneeId: number } | null,
    assignee?: { teamId?: number | null; managerId?: number | null } | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "VIEW")) return false;
    if (!user || !task) return false;

    if (user.id === task.managerId || user.id === task.assigneeId) return true;

    if (assignee) {
        const sameTeam = user.teamId !== null && user.teamId !== undefined && user.teamId === assignee.teamId;
        const directReport = assignee.managerId !== null && assignee.managerId !== undefined && assignee.managerId === user.id;
        if (hasRole(user, "MANAGER") && (sameTeam || directReport)) {
            return true;
        }
    }
    return false;
};

/**
 * Checks if a user can update a task.
 * Constraint: Only the creator (Manager) or ADMIN can edit.
 */
export const canUpdateTask = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { managerId: number } | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "UPDATE")) return false;
    if (!user || !task) return false;
    return user.id === task.managerId;
};

/**
 * Checks if a user can delete a task.
 * Constraint: Only the creator (Manager) or ADMIN can delete.
 */
export const canDeleteTask = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { managerId: number } | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "DELETE")) return false;
    if (!user || !task) return false;
    return user.id === task.managerId;
};

/**
 * Checks if a user can approve a task completion.
 * Constraints:
 * - Only the task creator (Manager) or ADMIN.
 * - Task status must be "PENDING_REVIEW".
 */
export const canApproveTask = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { managerId: number; status: string } | null
): boolean => {
    if (!task || task.status !== "PENDING_REVIEW") return false;
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "APPROVE")) return false;
    if (!user) return false;
    return user.id === task.managerId;
};

/**
 * Checks if a user can reject a task completion.
 * Constraints:
 * - Only the task creator (Manager) or ADMIN.
 * - Task status must be "PENDING_REVIEW".
 */
export const canRejectTask = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { managerId: number; status: string } | null
): boolean => {
    if (!task || task.status !== "PENDING_REVIEW") return false;
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "REJECT")) return false;
    if (!user) return false;
    return user.id === task.managerId;
};

/**
 * Checks if a user can update a task's progress.
 * Constraint: Only the assignee can update.
 */
export const canUpdateTaskProgress = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { assigneeId: number } | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "UPDATE_PROGRESS")) return false;
    if (!user || !task) return false;
    return user.id === task.assigneeId;
};

/**
 * Checks if a user can submit a task for review.
 * Constraint: Only the assignee can submit.
 */
export const canSubmitTask = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { assigneeId: number } | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "SUBMIT")) return false;
    if (!user || !task) return false;
    return user.id === task.assigneeId;
};

/**
 * Checks if a user can view team tasks.
 * Constraints: Only ADMIN, the Team Leader, or members of the team.
 */
export const canViewTeamTasks = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    teamId: number,
    teamManagerId?: number | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasAuthority(user, permissions, "TASK:VIEW_TEAM")) return false;
    if (!user) return false;

    const isLeader = teamManagerId !== null && teamManagerId !== undefined && user.id === teamManagerId;
    const isMember = user.teamId !== null && user.teamId !== undefined && user.teamId === teamId;

    return isLeader || isMember;
};

/**
 * Checks if a user can bulk delete team tasks.
 * Constraints: Only ADMIN or the Team Leader.
 */
export const canBulkDeleteTeamTasks = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    teamId: number,
    teamManagerId?: number | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasAuthority(user, permissions, "TASK:DELETE_TEAM")) return false;
    if (!user) return false;

    const isLeader = teamManagerId !== null && teamManagerId !== undefined && user.id === teamManagerId;
    const isMember = user.teamId !== null && user.teamId !== undefined && user.teamId === teamId;

    return isLeader || (hasRole(user, "MANAGER") && isMember);
};

/**
 * Checks if a user can restore a soft-deleted task.
 * Constraints:
 * - Only ADMIN, Team Leader, Task Creator, or Task Assignee.
 * - Task must be currently marked as soft-deleted.
 */
export const canRestoreTask = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { managerId: number; assigneeId: number; isDeleted?: boolean } | null,
    teamManagerId?: number | null
): boolean => {
    if (!task || !task.isDeleted) return false;
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "UPDATE")) return false;
    if (!user) return false;

    const isCreator = user.id === task.managerId;
    const isAssignee = user.id === task.assigneeId;
    const isLeader = teamManagerId !== null && teamManagerId !== undefined && user.id === teamManagerId;

    return isCreator || isAssignee || isLeader;
};

/**
 * Checks if a user can permanently delete a soft-deleted task.
 * Constraints:
 * - Only ADMIN or the Team Leader.
 * - Task must be currently marked as soft-deleted.
 */
export const canPermanentDeleteTask = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { isDeleted?: boolean } | null,
    teamManagerId?: number | null
): boolean => {
    if (!task || !task.isDeleted) return false;
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "DELETE")) return false;
    if (!user) return false;

    return teamManagerId !== null && teamManagerId !== undefined && user.id === teamManagerId;
};

/**
 * Checks if a user can view trash tasks.
 * Constraints: Only ADMIN or Team Leaders for their managed team.
 */
export const canViewTrashTasks = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    teamId?: number,
    teamManagerId?: number | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "VIEW")) return false;
    if (!user) return false;

    if (hasRole(user, "MANAGER")) {
        if (teamId !== undefined && teamManagerId !== null && teamManagerId !== undefined) {
            return user.id === teamManagerId;
        }
        return true;
    }
    return false;
};

/**
 * Checks if a user can request a task deadline extension.
 * Constraint: Only the assignee can request.
 */
export const canRequestTaskExtension = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { assigneeId: number } | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "EXTEND")) return false;
    if (!user || !task) return false;
    return user.id === task.assigneeId;
};

/**
 * Checks if a user can approve/reject a task deadline extension request.
 * Constraint: Only the task creator (Manager) or ADMIN can process.
 */
export const canApproveTaskExtension = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    task: { managerId: number } | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasTaskAuthority(user, permissions, "APPROVE_EXTENSION")) return false;
    if (!user || !task) return false;
    return user.id === task.managerId;
};

// ==========================================
// 📊 KPI, Review, & Appeal Permissions
// ==========================================

/**
 * Checks if a user can view a specific user's KPI.
 * Constraints:
 * - Staff can only view their own KPI.
 * - Manager can view their own KPI, and team members' or direct reports' KPIs.
 * - Admin can view any user's KPI.
 */
export const canViewUserKpi = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    targetUserId: number,
    targetUserTeamId?: number | null,
    targetUserManagerId?: number | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!user) return false;

    if (user.id === targetUserId) {
        return hasAuthority(user, permissions, "KPI:VIEW_SELF");
    }

    if (hasAuthority(user, permissions, "KPI:VIEW_TEAM")) {
        const sameTeam = targetUserTeamId !== null && targetUserTeamId !== undefined && targetUserTeamId === user.teamId;
        const directReport = targetUserManagerId !== null && targetUserManagerId !== undefined && targetUserManagerId === user.id;
        return sameTeam || directReport;
    }

    return false;
};

/**
 * Checks if a user can view a team's aggregated KPI.
 * Constraints: Only ADMIN or the Team Leader.
 */
export const canViewTeamKpi = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    teamId: number,
    teamManagerId?: number | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasAuthority(user, permissions, "KPI:VIEW_TEAM")) return false;
    if (!user) return false;

    const isLeader = teamManagerId !== null && teamManagerId !== undefined && user.id === teamManagerId;
    const isMember = user.teamId !== null && user.teamId !== undefined && user.teamId === teamId;

    return isLeader || (hasRole(user, "MANAGER") && isMember);
};

/**
 * Checks if a user can update KPI weights.
 * Constraint: Admin only (via KPI/WEIGHT:UPDATE authority).
 */
export const canUpdateKpiWeights = (user: AuthUser | null, permissions: AuthPermission[]): boolean => {
    return hasAuthority(user, permissions, "KPI/WEIGHT:UPDATE");
};

/**
 * Checks if a user can export KPI reports.
 */
export const canExportKpiReport = (user: AuthUser | null, permissions: AuthPermission[]): boolean => {
    return hasAuthority(user, permissions, "KPI/REPORT:EXPORT");
};

/**
 * Checks if a user can create a monthly KPI review.
 */
export const canCreateKpiReview = (user: AuthUser | null, permissions: AuthPermission[]): boolean => {
    return hasAuthority(user, permissions, "KPI/REVIEW:CREATE");
};

/**
 * Checks if a user can update a KPI review.
 * Constraint: Cannot update if the review is locked.
 */
export const canUpdateKpiReview = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    review?: { isLocked?: boolean } | null
): boolean => {
    if (review?.isLocked) return false;
    return hasAuthority(user, permissions, "KPI/REVIEW:UPDATE");
};

/**
 * Checks if a user can delete a KPI review.
 */
export const canDeleteKpiReview = (user: AuthUser | null, permissions: AuthPermission[]): boolean => {
    return hasAuthority(user, permissions, "KPI/REVIEW:DELETE");
};

/**
 * Checks if a user can file a KPI appeal.
 */
export const canCreateKpiAppeal = (user: AuthUser | null, permissions: AuthPermission[]): boolean => {
    return hasAuthority(user, permissions, "KPI/APPEAL:CREATE");
};

/**
 * Checks if a user can resolve a KPI appeal.
 */
export const canResolveKpiAppeal = (user: AuthUser | null, permissions: AuthPermission[]): boolean => {
    return hasAuthority(user, permissions, "KPI/APPEAL:RESOLVE");
};

// ==========================================
// 🏢 User, Role, & Team Management Permissions
// ==========================================

/**
 * Checks if a user can manage teams (Create, View, Update, Delete).
 * Constraints:
 * - Admin has full control.
 * - Team Leader/Member has view/update access on their own team.
 */
export const canManageTeam = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    action: "CREATE" | "VIEW" | "UPDATE" | "DELETE",
    teamManagerId?: number | null,
    teamId?: number | null
): boolean => {
    if (hasRole(user, "ADMIN")) return true;
    if (!hasAuthority(user, permissions, `TEAM:${action}`)) return false;
    if (!user) return false;

    if (action === "UPDATE" || action === "VIEW") {
        const isLeader = teamManagerId !== null && teamManagerId !== undefined && user.id === teamManagerId;
        const isMember = teamId !== null && teamId !== undefined && user.teamId === teamId;
        return isLeader || isMember;
    }

    return false;
};

/**
 * Checks if a user can manage other users.
 * Constraints:
 * - Admin has full control, but cannot delete themselves.
 * - Regular users can view or update their own profile information.
 */
export const canManageUser = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    action: "CREATE" | "VIEW" | "UPDATE" | "DELETE",
    targetUserId?: number
): boolean => {
    if (hasRole(user, "ADMIN")) {
        if (action === "DELETE" && user && targetUserId === user.id) return false;
        return true;
    }

    if (!user) return false;

    if (targetUserId !== undefined && user.id === targetUserId) {
        return action === "VIEW" || action === "UPDATE";
    }

    return hasAuthority(user, permissions, `USER:${action}`);
};

/**
 * Checks if a user can manage roles (Create, View, Update, Delete, Assign).
 */
export const canManageRole = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    action: "CREATE" | "VIEW" | "UPDATE" | "DELETE" | "ASSIGN"
): boolean => {
    return hasAuthority(user, permissions, `ROLE:${action}`);
};
