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
import { Pencil, Trash2, UserPlus, Eye, Mail } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/usuarios',
    },
];

type Role = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles: Role[];
    created_at: string;
};

type UserIndexPageProps = {
    users: User[];
};

export default function UserIndexPage({ users }: UserIndexPageProps) {
    const { can } = usePermissions();

    const handleDelete = (user: User) => {
        if (user.roles.some(role => role.name === 'super-admin')) {
            alert('No puedes eliminar al Super Admin');
            return;
        }

        if (confirm(`¿Estás seguro de eliminar al usuario "${user.name}"?`)) {
            router.delete(`/usuarios/${user.id}`, {
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

    const handleResendPassword = (user: User) => {
        if (confirm(`¿Deseas reenviar el email de restablecimiento de contraseña a "${user.email}"?`)) {
            router.post(`/usuarios/${user.id}/reenviar-password`, {}, {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message handled by flash
                },
                onError: (errors) => {
                    console.error('Error al reenviar email:', errors);
                },
            });
        }
    };

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName) {
            case 'super-admin':
                return 'bg-purple-100 text-purple-800';
            case 'administrativo':
                return 'bg-blue-100 text-blue-800';
            case 'profesional':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />

            <div className="container mx-auto py-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Gestión de Usuarios</h1>
                        <p className="text-gray-500 mt-1">
                            Administra los usuarios del sistema
                        </p>
                    </div>

                    {can('create usuarios') && (
                        <Link href="/usuarios/crear">
                            <Button>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Crear Usuario
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="bg-white rounded-lg shadow">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.name}</TableCell>

                                    <TableCell>{user.email}</TableCell>

                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.map((role) => (
                                                <Badge
                                                    key={role.id}
                                                    className={getRoleBadgeColor(role.name)}
                                                >
                                                    {role.name === 'super-admin' && 'Super Admin'}
                                                    {role.name === 'administrativo' && 'Administrativo'}
                                                    {role.name === 'profesional' && 'Profesional'}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>

                                    <TableCell>
                                        {user.email_verified_at ? (
                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                Verificado
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                                Pendiente
                                            </Badge>
                                        )}
                                    </TableCell>

                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {can('view usuarios') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => router.get(`/usuarios/${user.id}`)}
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            )}

                                            {can('edit usuarios') && !user.roles.some(r => r.name === 'super-admin') && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.get(`/usuarios/${user.id}/editar`)}
                                                        title="Editar"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleResendPassword(user)}
                                                        title="Reenviar email de contraseña"
                                                    >
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}

                                            {can('delete usuarios') && !user.roles.some(r => r.name === 'super-admin') && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(user)}
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
        </AppLayout>
    );
}