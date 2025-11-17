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
import { BookPlus, BriefcaseMedicalIcon, ChartNoAxesCombined, NotebookPen, Shield, UserRound } from 'lucide-react';
import AppLogo from './app-logo';
import personas from '@/routes/personas';
import profesionales from '@/routes/profesionales';
import atenciones from '@/routes/atenciones';
import servicios from '@/routes/servicios';
import estadisticas from '@/routes/estadisticas';

const mainNavItems: NavItem[] = [
    {
        title: 'Servicios',
        href: servicios.index().url,
        icon: BookPlus,
        permission: 'view servicios',
    },
    {
        title: 'Pacientes',
        href: personas.index().url,
        icon: UserRound,
        permission: 'view pacientes',
    },
    {
        title: 'Profesionales',
        href: profesionales.index().url,
        icon: BriefcaseMedicalIcon,
        permission: 'view profesionales',
    },
    {
        title: 'Atenciones',
        href: atenciones.index().url,
        icon: NotebookPen,
        permission: 'view atenciones',
    },
    {
        title: 'Roles y Permisos',
        href: '/roles',
        icon: Shield,
        permission: 'view roles',
    },
    {
        title: 'Estadísticas',
        href: estadisticas.index().url,
        icon: ChartNoAxesCombined,
    }

];

const footerNavItems: NavItem[] = [
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={personas.index.url()} prefetch>
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
