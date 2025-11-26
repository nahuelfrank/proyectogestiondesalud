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
import { Pencil, Trash2, UserPlus, Eye, Mail, User } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';
import { useAlert } from '@/components/alert-provider';
import { useEffect } from 'react';

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

    const { confirm } = useAlert();

    const handleDelete = async (user: User) => {
        // Caso: Intento eliminar al super admin → solo alerta
        if (user.roles.some(role => role.name === "super-admin")) {
            await confirm({
                title: "Acción no permitida",
                description: "No puedes eliminar al Super Admin.",
                okText: "Entendido",
                cancelText: null, // Esto oculta el botón Cancelar
                icon: "warning",
            });
            return;
        }

        // Confirmación normal con Sí/No
        const confirmed = await confirm({
            title: "Confirmar eliminación",
            description: `¿Estás seguro de eliminar al usuario "${user.name}"?`,
            okText: "Eliminar",
            cancelText: "Cancelar",
            icon: "warning",
        });

        if (!confirmed) return;

        router.delete(`/usuarios/${user.id}`, {
            preserveScroll: true,
            onSuccess: () => { },
            onError: (errors) => {
                console.error("Error al eliminar:", errors);
            },
        });
    };

    const handleResendPassword = async (user: User) => {

        // Mostrar el modal personalizado
        const accepted = await confirm({
            title: "Reenviar email",
            description: `¿Deseas reenviar el email de restablecimiento de contraseña a "${user.email}"?`,
            okText: "Sí, reenviar",
            cancelText: "Cancelar",
            icon: "warning",
        });

        // Si el usuario cancela, no sigue
        if (!accepted) return;

        router.post(`/usuarios/${user.id}/reenviar-password`, {}, {
            preserveScroll: true,

            onSuccess: () => {
                // Aquí ya manejas el flash, como dijiste
                console.log("Correo reenviado con éxito");
            },

            onError: (errors) => {
                console.error("Error al reenviar el email:", errors);
            },
        });
    };

    const getRoleDisplayName = (roleName: string) => {
        switch (roleName) {
            case 'super-admin':
                return 'Super Admin';
            case 'administrativo':
                return 'Administrativo';
            case 'profesional':
                return 'Profesional';
            default:
                return roleName;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />

            <div className="container mx-auto py-10">
                <div className="ml-5">
                    <h1 className="text-3xl font-semibold mb-3">Gestión de Usuarios</h1>
                    <p className="text-md text-muted-foreground mb-3">
                        Administra los usuarios del sistema
                    </p>

                    {can('crear usuarios') && (
                        <Link href="/usuarios/crear_usuario" className="inline-block mb-4">
                            <Button className="flex items-center gap-2">
                                <UserPlus className="h-4 w-4" />
                                Crear Usuario
                            </Button>
                        </Link>
                    )}
                </div>

                <div className="m-2">
                    <div className="rounded-lg border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Usuario</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell>{user.email}</TableCell>

                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.id} variant="outline">
                                                        {getRoleDisplayName(role.name)}
                                                    </Badge>
                                                ))}
                                                {user.roles.some(r => r.name === 'super-admin') && (
                                                    <Badge variant="destructive">Sistema</Badge>
                                                )}
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            {user.email_verified_at ? (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                                    Verificado
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                                    Pendiente
                                                </Badge>
                                            )}
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {can('ver usuarios') && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => router.get(`/usuarios/${user.id}`)}
                                                        title="Ver detalles"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                )}

                                                {can('editar usuarios') && !user.roles.some(r => r.name === 'super-admin') && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => router.get(`/usuarios/editar/${user.id}/`)}
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

                                                {can('eliminar usuarios') && !user.roles.some(r => r.name === 'super-admin') && (
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
            </div>
        </AppLayout>
    );
}