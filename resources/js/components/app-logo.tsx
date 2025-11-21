import { Hospital } from "lucide-react";
import { useAuthData } from "@/hooks/use-roles"

export default function AppLogo() {
    const { roles } = useAuthData();

    const roleLabel =
        roles.includes("super-admin")
            ? "Super Usuario"
            : roles.includes("administrativo")
            ? "Administrativo"
            : roles.includes("profesional")
            ? "Profesional"
            : "Usuario";

    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Hospital className="size-5 text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Sanidad
                </span>
                <span className="text-xs text-sidebar-secondary-foreground truncate leading-tight">
                    {roleLabel}
                </span>
            </div>
        </>
    );
}
