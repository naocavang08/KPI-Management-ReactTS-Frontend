import type { AuthPermission, AuthUser } from "../interfaces/auth.types";

const normalize = (value: string) => value.replace(/[_\s-]/g, "").toUpperCase();

export const hasRole = (user: AuthUser | null, roleName: string) => {
    return user?.roles?.some((role) => normalize(role.name) === normalize(roleName)) ?? false;
};

export const hasAuthority = (
    user: AuthUser | null,
    permissions: AuthPermission[],
    authority: string,
    fallbackRole = "ADMIN"
) => {
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

export const hasTaskAuthority = (user: AuthUser | null, permissions: AuthPermission[], action: string) => {
    return hasAuthority(user, permissions, `KPI/TASK:${action}`);
};
