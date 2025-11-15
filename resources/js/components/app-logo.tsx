import { Hospital } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <Hospital className="size-5 text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Sistema de Gestión de Salud Universitaria
                </span>
                <span className="text-xs text-sidebar-secondary-foreground truncate leading-tight">
                    Administración
                </span>
            </div>
        </>
    );
}
