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

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Usuarios',
        href: '/usuarios',
    },
    {
        title: 'Crear Usuario',
        href: '#',
    },
];

type Role = {
    id: number;
    name: string;
};

type UserCreatePageProps = {
    roles: Role[];
};

const formSchema = z.object({
    name: z.string().min(1, "El nombre del usuario es requerido"),
    email: z.string().email("Email inválido").min(1, "El email es requerido"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
    password_confirmation: z.string().min(8, "Confirma tu contraseña"),
    role: z.string().min(1, "Debes seleccionar un rol"),
}).refine((data) => data.password === data.password_confirmation, {
    message: "Las contraseñas no coinciden",
    path: ["password_confirmation"],
});

export default function UserCreatePage({ roles }: UserCreatePageProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            password_confirmation: "",
            role: "",
        },
    });

    const onSubmit = (data: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);

        router.post('/usuarios', data, {
            onSuccess: () => {
                // Redirect handled by controller
            },
            onError: (errors) => {
                console.error('Error al crear usuario:', errors);

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
            <Head title="Crear Usuario" />

            <div className="container mx-auto py-10">
                <div className="ml-5">
                    <h1 className="text-3xl font-semibold mb-2">Crear Nuevo Usuario</h1>
                    <p className="text-muted-foreground mb-4">Al crear el usuario, se enviará automáticamente un email para que establezca su contraseña.
                        Los campos con <span className="text-destructive">*</span> son obligatorios.
                    </p>
                    <Link
                        href={usuarios.index.url()}
                        className="inline-block"
                    >
                        <Button
                            className="flex items-center gap-2"
                        >
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
                            <Field >
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

                            <Field>
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

                            <Field>
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

                    {/* Contraseña Temporal */}
                    <Card className='mt-4'>
                        <CardHeader>
                            <CardTitle>Contraseña Temporal</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Esta contraseña será reemplazada cuando el usuario acceda al link de restablecimiento.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Field>
                                <FieldLabel htmlFor="password">Contraseña <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Mínimo 8 caracteres"
                                    {...form.register("password")}
                                />
                                {form.formState.errors.password && (
                                    <FieldError>{form.formState.errors.password.message}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="password_confirmation">Confirmar Contraseña <span className="text-red-500">*</span></FieldLabel>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    placeholder="Repite la contraseña"
                                    {...form.register("password_confirmation")}
                                />
                                {form.formState.errors.password_confirmation && (
                                    <FieldError>{form.formState.errors.password_confirmation.message}</FieldError>
                                )}
                            </Field>
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
                            {isSubmitting ? 'Creando...' : 'Crear Usuario y Enviar Email'}
                        </Button>
                    </div>

                </form>
            </div>
        </AppLayout>
    );
}