import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Undo2, Edit, Shield } from 'lucide-react';

type Permission = {
    id: number;
    name: string;
};

type PermissionsGrouped = {
    [key: string]: Permission[];
};

type Role = {
    id: number;
    name: string;
    permissions: Permission[];
};

type RoleShowPageProps = {
    role: Role;
    permissions: PermissionsGrouped;
    rolePermissions: string[];
};

export default function RoleShowPage({ role, permissions, rolePermissions }: RoleShowPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Roles y Permisos',
            href: '/roles',
        },
        {
            title: 'Detalles del Rol',
            href: '#',
        },
    ];

    const isPermissionInRole = (permissionName: string) => {
        return rolePermissions.includes(permissionName);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Rol: ${role.name}`} />

            <div className="container mx-auto py-10">
                <div className="ml-5 mb-4">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl font-semibold">Detalles del Rol: {role.name}</h1>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                        Información completa del rol y sus permisos asignados
                    </p>

                    <div className="flex gap-2">
                        <Link href="/roles" className="inline-block">
                            <Button variant="default" className="flex items-center gap-2">
                                <Undo2 className="h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Información del Rol */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Rol</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Nombre del Rol</p>
                                <p className="text-lg font-semibold capitalize">{role.name}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">ID del Rol</p>
                                <p className="text-lg">{role.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Total de Permisos</p>
                                <Badge variant="secondary" className="text-base px-3 py-1">
                                    {rolePermissions.length} {rolePermissions.length === 1 ? 'permiso' : 'permisos'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permisos Asignados */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Permisos Asignados</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Lista de todos los permisos que tiene este rol
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(permissions).map(([group, groupPermissions]) => {
                                const assignedInGroup = groupPermissions.filter(p => 
                                    isPermissionInRole(p.name)
                                );

                                if (assignedInGroup.length === 0) return null;

                                return (
                                    <div key={group} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-lg capitalize">{group}</h3>
                                            <Badge variant="outline">
                                                {assignedInGroup.length} de {groupPermissions.length}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {assignedInGroup.map((permission) => (
                                                <div 
                                                    key={permission.id}
                                                    className="flex items-center space-x-2 p-2 bg-secondary/50 rounded-md"
                                                >
                                                    <div className="h-2 w-2 bg-green-500 rounded-full" />
                                                    <span className="text-sm font-medium">
                                                        {permission.name}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {rolePermissions.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    <Shield className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>Este rol no tiene permisos asignados</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Todos los Permisos (Referencia) */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Todos los Permisos Disponibles</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Vista completa de permisos disponibles. Los resaltados están asignados a este rol.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(permissions).map(([group, groupPermissions]) => (
                                <div key={group} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-lg capitalize">{group}</h3>
                                        <Badge variant="outline">
                                            {groupPermissions.filter(p => isPermissionInRole(p.name)).length} / {groupPermissions.length}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {groupPermissions.map((permission) => {
                                            const hasPermission = isPermissionInRole(permission.name);
                                            
                                            return (
                                                <div 
                                                    key={permission.id}
                                                    className={`flex items-center space-x-2 p-2 rounded-md ${
                                                        hasPermission 
                                                            ? 'bg-green-500/10 border border-green-500/20' 
                                                            : 'bg-muted/30'
                                                    }`}
                                                >
                                                    <div className={`h-2 w-2 rounded-full ${
                                                        hasPermission ? 'bg-green-500' : 'bg-gray-400'
                                                    }`} />
                                                    <span className={`text-sm ${
                                                        hasPermission ? 'font-medium' : 'text-muted-foreground'
                                                    }`}>
                                                        {permission.name}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}