import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Eye, Pencil, Shield, Trash2, Users } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useAlert } from '@/components/alert-provider';
import { useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles y Permisos',
        href: '/roles',
    },
];

type Permission = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
    users_count: number;
    permissions: Permission[];
    created_at: string;
};

type RoleIndexPageProps = {
    roles: Role[];
};

export default function RoleIndexPage({ roles }: RoleIndexPageProps) {

    const { can } = usePermissions();

    const { confirm } = useAlert();

    const handleDelete = async (role: Role) => {

        const ok = await confirm({
            title: "Eliminar Rol",
            description: `¿Seguro que deseas eliminar el rol "${role.name}"? Esta acción no se puede deshacer.`,
            okText: "Eliminar",
            cancelText: "Cancelar",
            icon: "warning",
        });

        if (!ok) return;

        router.delete(`/roles/${role.id}`, {
            preserveScroll: true,
            onSuccess: () => { },
            onError: (errors) => {
                console.error("Error al eliminar:", errors);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y Permisos" />

            <div className="container mx-auto py-10">
                <div className="ml-5">
                    <h1 className="text-3xl font-semibold mb-3">Roles y Permisos</h1>
                    <p className="text-md text-muted-foreground mb-3">
                        Gestiona los roles y permisos del sistema
                    </p>

                    {can('crear roles') && (
                        <Link href="/roles/crear_rol" className="inline-block mb-4">
                            <Button className="flex items-center gap-2">
                                <Shield className="h-4 w-4" />
                                Crear Rol
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="m-2">
                    <div className="rounded-lg border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Usuarios</TableHead>
                                    <TableHead>Permisos</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {roles.map((role) => (
                                    <TableRow key={role.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{role.name}</span>
                                                {role.name === 'super-admin' && (
                                                    <Badge variant="destructive">Sistema</Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4 text-gray-400" />
                                                <span>{role.users_count} usuarios</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {role.permissions.slice(0, 3).map((permission) => (
                                                    <Badge key={permission.id} variant="outline">
                                                        {permission.name}
                                                    </Badge>
                                                ))}
                                                {role.permissions.length > 3 && (
                                                    <Badge variant="secondary">
                                                        +{role.permissions.length - 3} más
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">

                                                {/* Ver rol */}
                                                {can("ver roles") && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.get(`/roles/${role.id}`)}
                                                        title="Ver Rol"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                {/* Editar rol (excepto super-admin) */}
                                                {can("editar roles") && role.name !== "super-admin" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.get(`/roles/editar_role/${role.id}`)}
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                {/* Eliminar rol (excepto super-admin) */}
                                                {can("eliminar roles") && role.name !== "super-admin" && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(role)}
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}