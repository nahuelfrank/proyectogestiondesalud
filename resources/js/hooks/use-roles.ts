import { usePage } from "@inertiajs/react";

type AuthProps = {
    auth?: {
        permissions?: string[];
        roles?: string[];
    }
}

export function useRoles() {
    const { props } = usePage<{ auth: { roles: string[] } }>();
    const roles = props.auth?.roles || [];

    const hasRole = (role: string) => roles.includes(role);

    return { roles, hasRole };
}

export function useAuthData() {
    const { props } = usePage<AuthProps>();

    const permissions = props.auth?.permissions || [];
    const roles = props.auth?.roles || [];

    const can = (permission: string) => permissions.includes(permission);

    return { permissions, roles, can };
}
