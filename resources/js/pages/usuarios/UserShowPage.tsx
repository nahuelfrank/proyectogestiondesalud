import { Head, Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { type BreadcrumbItem } from '@/types';
import { CheckCircle2, Undo2, XCircle } from 'lucide-react';
import usuarios from '@/routes/usuarios';

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
    updated_at: string;
};

type UserShowPageProps = {
    user: User;
};

function Info({ label, value }: { label: string; value: string | null }) {
    return (
        <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-base font-medium text-foreground">{value ?? '-'}</span>
        </div>
    );
}

export default function UserShowPage({ user }: UserShowPageProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Usuarios', href: '/usuarios' },
        { title: user.name, href: '#' }
    ];

    const getRoleLabel = (roleName: string) => {
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

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="container mx-auto py-10">
                <Head title={`Detalles de ${user.name}`} />

                <div className="m-2 space-y-8">
                    {/* Title */}
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight mb-2">
                            {user.name}
                        </h1>
                        <p className="text-muted-foreground mb-4">
                            Detalles de la cuenta de usuario.
                        </p>


                        <Link href={usuarios.index.url()} className="inline-block">
                            <Button className="flex items-center gap-2">
                                <Undo2 className="h-4 w-4" />
                                Volver
                            </Button>
                        </Link>
                    </div>

                    <Separator />

                    {/* Información del Usuario */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Información del Usuario</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                <Info label="Nombre Completo" value={user.name} />
                                <Info label="Email" value={user.email} />

                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">Estado del Email</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        {user.email_verified_at ? (
                                            <>
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                <span className="text-base font-medium text-green-700">Verificado</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-5 w-5 text-yellow-600" />
                                                <span className="text-base font-medium text-yellow-700">Pendiente de verificación</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-sm text-muted-foreground">Roles Asignados</span>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {user.roles.map((role) => (
                                            <Badge
                                                key={role.id}
                                                className={getRoleBadgeColor(role.name)}
                                            >
                                                {getRoleLabel(role.name)}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información de Fechas */}
                    <Card className="shadow-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Información de Registro</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                <Info label="Fecha de Creación" value={formatDate(user.created_at)} />
                                <Info label="Última Actualización" value={formatDate(user.updated_at)} />
                                {user.email_verified_at && (
                                    <Info label="Email Verificado el" value={formatDate(user.email_verified_at)} />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}