import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Clock, User, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';

interface Persona {
    id: number;
    nombre: string;
    apellido: string;
    numero_documento: string;
    tipo_documento: {
        nombre: string;
    };
}

interface TipoAtencion {
    id: number;
    nombre: string;
}

interface EstadoAtencion {
    id: number;
    nombre: string;
}

interface Servicio {
    id: number;
    nombre: string;
}

interface Atencion {
    id: number;
    fecha: string;
    hora: string;
    persona: Persona;
    tipo_atencion: TipoAtencion;
    estado_atencion: EstadoAtencion;
    servicio: Servicio;
}

interface Profesional {
    id: number;
    persona: {
        nombre: string;
        apellido: string;
    };
    especialidad: {
        nombre: string;
    };
}

interface ListaEsperaPageProps {
    atenciones: Atencion[];
    profesional: Profesional;
}

export default function ListaEsperaPage({ atenciones, profesional }: ListaEsperaPageProps) {

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ["atenciones"],
            });
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getEstadoBadgeColor = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'en espera':
                return 'bg-yellow-100 text-yellow-800';
            case 'atendido':
                return 'bg-green-100 text-green-800';
            case 'derivado':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Historia Clínica', href: '#' },
            { title: 'Lista de Espera', href: '/historias-clinicas/lista-espera' }
        ]}>
            <Head title="Lista de Espera" />

            <div className="container mx-auto py-10">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Lista de Espera - {profesional.especialidad.nombre}</h1>
                    <p className="text-muted-foreground">
                        Profesional: {profesional.persona.nombre} {profesional.persona.apellido}
                    </p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pacientes en Espera</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{atenciones.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Primer Turno</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {atenciones.length > 0 ? atenciones[0].hora : '-'}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Último Turno</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {atenciones.length > 0 ? atenciones[atenciones.length - 1].hora : '-'}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabla de atenciones */}
                <Card>
                    <CardHeader>
                        <CardTitle>Pacientes en Lista de Espera</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {atenciones.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    No hay pacientes en espera
                                </h3>
                                <p className="text-gray-500">
                                    No tienes pacientes pendientes de atención en este momento.
                                </p>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha</TableHead>
                                            <TableHead>Hora</TableHead>
                                            <TableHead>Tipo de Atención</TableHead>
                                            <TableHead>Paciente</TableHead>
                                            <TableHead>Documento</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {atenciones.map((atencion) => (
                                            <TableRow key={atencion.id}>
                                                <TableCell>{formatFecha(atencion.fecha)}</TableCell>
                                                <TableCell className="font-medium">{atencion.hora}</TableCell>
                                                <TableCell>{atencion.tipo_atencion.nombre}</TableCell>
                                                <TableCell>
                                                    {atencion.persona.nombre} {atencion.persona.apellido}
                                                </TableCell>
                                                <TableCell>
                                                    {atencion.persona.numero_documento}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={getEstadoBadgeColor(
                                                            atencion.estado_atencion.nombre
                                                        )}
                                                    >
                                                        {atencion.estado_atencion.nombre}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={`/historias-clinicas/${atencion.id}/ver`}
                                                    >
                                                        <Button size="sm">
                                                            <FileText className="h-4 w-4 mr-2" />
                                                            Iniciar Atención
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}