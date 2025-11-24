import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Field,
    FieldError,
    FieldLabel,
} from "@/components/ui/field";
import React from 'react';
import { Undo2 } from 'lucide-react';
import usuarios from '@/routes/usuarios';

type Role = {
    id: number;
    name: string;
};

type User = {
    id: number;
    name: string;
    email: string;
    roles: Role[];
};

type UserEditPageProps = {
    user: User;
    roles: Role[];
    currentRole: string;
};

const formSchema = z.object({
    name: z.string().min(1, "El nombre del usuario es requerido"),
    email: z.string().email("Email inválido").min(1, "El email es requerido"),
    role: z.string().min(1, "Debes seleccionar un rol"),
});

export default function UserEditPage({ user, roles, currentRole }: UserEditPageProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Usuarios',
            href: '/usuarios',
        },
        {
            title: user.name,
            href: `/usuarios/${user.id}`,
        },
        {
            title: 'Editar',
            href: '#',
        },
    ];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
            role: currentRole,
        },
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);

        router.put(`/usuarios/${user.id}`, data, {
            onSuccess: () => {
                // Redirect handled by controller
            },
            onError: (errors) => {
                console.error('Error al actualizar usuario:', errors);

                // Mapear errores del backend al formulario
                Object.keys(errors).forEach((key) => {
                    form.setError(key as any, {
                        type: 'server',
                        message: errors[key] as string,
                    });
                });
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const getRoleLabel = (roleName: string) => {
        switch (roleName) {
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
            <Head title={`Editar Usuario - ${user.name}`} />

            <div className="container mx-auto py-10">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">
                        Editar Usuario
                    </h1>
                    <p className="text-muted-foreground mb-4">
                        Modifica la información del usuario.
                    </p>

                    <Link href={usuarios.index.url()} className="inline-block">
                        <Button className="flex items-center gap-2">
                            <Undo2 className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>


                <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl mx-auto py-2">
                    {/* Información del Usuario */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Información del Usuario</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Field data-invalid={!!form.formState.errors.name}>
                                <FieldLabel htmlFor="name">Nombre Completo <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    id="name"
                                    placeholder="Ej: Juan Pérez"
                                    {...form.register("name")}
                                />
                                {form.formState.errors.name && (
                                    <FieldError>{form.formState.errors.name.message}</FieldError>
                                )}
                            </Field>

                            <Field data-invalid={!!form.formState.errors.email}>
                                <FieldLabel htmlFor="email">Email <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="usuario@ejemplo.com"
                                    {...form.register("email")}
                                />
                                {form.formState.errors.email && (
                                    <FieldError>{form.formState.errors.email.message}</FieldError>
                                )}
                            </Field>

                            <Field data-invalid={!!form.formState.errors.role}>
                                <FieldLabel htmlFor="role">Rol <span className="text-red-500">*</span></FieldLabel>
                                <Controller
                                    name="role"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Select
                                            value={field.value}
                                            onValueChange={field.onChange}
                                        >
                                            <SelectTrigger id="role">
                                                <SelectValue placeholder="Selecciona un rol" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roles.map((role) => (
                                                    <SelectItem key={role.id} value={role.name}>
                                                        {getRoleLabel(role.name)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {form.formState.errors.role && (
                                    <FieldError>{form.formState.errors.role.message}</FieldError>
                                )}
                            </Field>
                        </CardContent>
                    </Card>

                    {/* Información sobre la Contraseña */}
                    <Card className='mt-4'>
                        <CardHeader>
                            <CardTitle>Contraseña</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600">
                                Para cambiar la contraseña del usuario, usa el botón "Reenviar Email"
                                en la lista de usuarios. Esto enviará un correo de restablecimiento de contraseña.
                            </p>
                        </CardContent>
                    </Card>

                    {/* Botones */}
                    <div className="flex justify-end gap-2 border-t pt-4 mt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.get('/usuarios')}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </Button>
                        <Button disabled={isSubmitting} type="submit">
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}