import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookPlus, BriefcaseMedicalIcon, ChartNoAxesCombined, ClipboardList, NotebookPen, Shield, UserRound, Users } from 'lucide-react';
import AppLogo from './app-logo';
import personas from '@/routes/personas';
import profesionales from '@/routes/profesionales';
import atenciones from '@/routes/atenciones';
import servicios from '@/routes/servicios';
import estadisticas from '@/routes/estadisticas';
import { useRoles } from "@/hooks/use-roles";
import { getHomeRoute } from '@/utils/role-utils';

const mainNavItems: NavItem[] = [
    {
        title: 'Servicios',
        href: servicios.index().url,
        icon: BookPlus,
        permission: 'ver servicios',
    },
    {
        title: 'Pacientes',
        href: personas.index().url,
        icon: UserRound,
        permission: 'ver pacientes',
    },
    {
        title: 'Profesionales',
        href: profesionales.index().url,
        icon: BriefcaseMedicalIcon,
        permission: 'ver profesionales',
    },
    {
        title: 'Atenciones',
        href: atenciones.index().url,
        icon: NotebookPen,
        permission: 'ver atenciones',
    },
    {
        title: 'Estadísticas',
        href: estadisticas.index().url,
        icon: ChartNoAxesCombined,
        permission: 'ver estadisticas',
    },
    {
        title: 'Usuarios',
        href: '/usuarios',
        icon: Users,
        permission: 'ver usuarios',
    },
    {
        title: 'Roles y Permisos',
        href: '/roles',
        icon: Shield,
        permission: 'ver roles',
    },
    // Agregar este objeto al array mainNavItems:
    {
        title: 'Lista de Espera',
        href: '/historias-clinicas/lista-espera',
        icon: ClipboardList,
        permission: 'ver-espera profesionales', // Ajustar según tus permisos
    }

];

const footerNavItems: NavItem[] = [
];

export function AppSidebar() {
    const { roles } = useRoles();
    const homeHref = getHomeRoute(roles);

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}