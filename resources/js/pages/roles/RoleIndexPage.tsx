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
import { Pencil, Trash2, Shield, Users } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

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

    const handleDelete = (role: Role) => {
        if (role.name === 'super-admin') {
            alert('No puedes eliminar el rol de Super Admin');
            return;
        }

        if (confirm(`¿Estás seguro de eliminar el rol "${role.name}"?`)) {
            router.delete(`/roles/${role.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message handled by flash
                },
                onError: (errors) => {
                    console.error('Error al eliminar:', errors);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y Permisos" />

            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Roles y Permisos</h1>
                        <p className="text-gray-500 mt-1">
                            Gestiona los roles y permisos del sistema
                        </p>
                    </div>

                    {can('create roles') && (
                        <Link href="/roles/create">
                            <Button>
                                <Shield className="h-4 w-4 mr-2" />
                                Crear Rol
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow">
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
                                            {can('edit roles') && role.name !== 'super-admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.get(`/roles/${role.id}/edit`)}
                                                    title="Editar"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {can('delete roles') && role.name !== 'super-admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(role)}
                                                    title="Eliminar"
                                                    disabled={role.users_count > 0}
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
        </AppLayout>
    );
}