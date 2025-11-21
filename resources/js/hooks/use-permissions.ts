import { usePage } from "@inertiajs/react";

type AuthProps = {
    auth?: {
        permissions?: string[];
        roles?: string[];
    }
}

export function usePermissions() {
    const { props } = usePage<AuthProps>();
    const permissions = props.auth?.permissions || [];

    const can = (permission: string): boolean => permissions.includes(permission);

    // 👇 AGREGAR: Para verificar múltiples permisos
    const canAny = (permissionsArray: string[]): boolean =>
        permissionsArray.some(permission => permissions.includes(permission));

    const canAll = (permissionsArray: string[]): boolean =>
        permissionsArray.every(permission => permissions.includes(permission));

    return { can, canAny, canAll, permissions };
}

export function useAuthData() {
    const { props } = usePage<AuthProps>();

    const permissions = props.auth?.permissions || [];
    const roles = props.auth?.roles || [];

    const can = (permission: string) => permissions.includes(permission);

    return { permissions, roles, can };
}