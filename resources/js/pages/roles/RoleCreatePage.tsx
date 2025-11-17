import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Field,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import React from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Roles y Permisos',
        href: '/roles',
    },
    {
        title: 'Crear Rol',
        href: '#',
    },
];

type Permission = {
    id: number;
    name: string;
};

type PermissionsGrouped = {
    [key: string]: Permission[];
};

type RoleCreatePageProps = {
    permissions: PermissionsGrouped;
};

const formSchema = z.object({
    name: z.string().min(1, "El nombre del rol es requerido"),
    permissions: z.array(z.string()).min(1, "Debes seleccionar al menos un permiso"),
});

export default function RoleCreatePage({ permissions }: RoleCreatePageProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            permissions: [],
        },
    });

    const selectedPermissions = form.watch('permissions');

    const handlePermissionToggle = (permissionName: string, checked: boolean) => {
        const current = form.getValues('permissions');
        if (checked) {
            form.setValue('permissions', [...current, permissionName]);
        } else {
            form.setValue('permissions', current.filter(p => p !== permissionName));
        }
    };

    const handleSelectAllInGroup = (groupPermissions: Permission[]) => {
        const current = form.getValues('permissions');
        const groupNames = groupPermissions.map(p => p.name);
        const allSelected = groupNames.every(name => current.includes(name));

        if (allSelected) {
            // Deseleccionar todos del grupo
            form.setValue('permissions', current.filter(p => !groupNames.includes(p)));
        } else {
            // Seleccionar todos del grupo
            const newPermissions = [...new Set([...current, ...groupNames])];
            form.setValue('permissions', newPermissions);
        }
    };

    const isGroupFullySelected = (groupPermissions: Permission[]) => {
        const groupNames = groupPermissions.map(p => p.name);
        return groupNames.every(name => selectedPermissions.includes(name));
    };

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);

        router.post('/roles', data, {
            onSuccess: () => {
                // Redirect handled by controller
            },
            onError: (errors) => {
                console.error('Error al crear rol:', errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Crear Rol" />

            <div className="container max-w-4xl mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6">Crear Nuevo Rol</h1>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Nombre del Rol */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Rol</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Field data-invalid={!!form.formState.errors.name}>
                                <FieldLabel htmlFor="name">Nombre del Rol *</FieldLabel>
                                <Input
                                    id="name"
                                    placeholder="ej: administrador, recepcionista"
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <FieldError>{form.formState.errors.name.message}</FieldError>
                                )}
                            </Field>
                        </CardContent>
                    </Card>

                    {/* Permisos */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Permisos</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Selecciona los permisos que tendrá este rol
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {Object.entries(permissions).map(([group, groupPermissions]) => {
                                const isFullySelected = isGroupFullySelected(groupPermissions);

                                return (
                                    <div key={group} className="border rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-lg capitalize">{group}</h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSelectAllInGroup(groupPermissions)}
                                            >
                                                {isFullySelected ? 'Deseleccionar todos' : 'Seleccionar todos'}
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {groupPermissions.map((permission) => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`permission-${permission.id}`}
                                                        checked={selectedPermissions.includes(permission.name)}
                                                        onCheckedChange={(checked) =>
                                                            handlePermissionToggle(permission.name, checked as boolean)
                                                        }
                                                    />
                                                    <label
                                                        htmlFor={`permission-${permission.id}`}
                                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                                    >
                                                        {permission.name}
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {form.formState.errors.permissions && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.permissions.message}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Resumen */}
                    {selectedPermissions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Resumen</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    Has seleccionado <strong>{selectedPermissions.length}</strong> permisos para este rol.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Botones */}
                    <div className="flex gap-4">
                        <Button disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Creando...' : 'Crear Rol'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/roles')}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}