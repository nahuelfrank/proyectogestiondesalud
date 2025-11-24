import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Clock, User, FileText, Eye, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
    atenciones_espera: Atencion[];
    atenciones_finalizadas: Atencion[];
    profesional: Profesional;
}

export default function ListaEsperaPage({
    atenciones_espera,
    atenciones_finalizadas,
    profesional
}: ListaEsperaPageProps) {
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
                            <div className="text-2xl font-bold">{atenciones_espera.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Atendidos Hoy</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{atenciones_finalizadas.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total del Día</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {atenciones_espera.length + atenciones_finalizadas.length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs para Lista de Espera y Atenciones Finalizadas */}
                <Tabs defaultValue="espera" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="espera">
                            Lista de Espera ({atenciones_espera.length})
                        </TabsTrigger>
                        <TabsTrigger value="finalizadas">
                            Atenciones del Día ({atenciones_finalizadas.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Pestaña Lista de Espera */}
                    <TabsContent value="espera">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pacientes en Lista de Espera</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {atenciones_espera.length === 0 ? (
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
                                                {atenciones_espera.map((atencion) => (
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
                                                            <div className="flex justify-end gap-2">
                                                                <Link
                                                                    href={`/historias-clinicas/${atencion.id}/historia`}
                                                                >
                                                                    <Button variant="outline" size="sm">
                                                                        <FileText className="h-4 w-4 mr-2" />
                                                                        Ver Historia
                                                                    </Button>
                                                                </Link>
                                                                <Link
                                                                    href={`/historias-clinicas/${atencion.id}/registrar`}
                                                                >
                                                                    <Button size="sm">
                                                                        <User className="h-4 w-4 mr-2" />
                                                                        Iniciar Atención
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Pestaña Atenciones Finalizadas */}
                    <TabsContent value="finalizadas">
                        <Card>
                            <CardHeader>
                                <CardTitle>Atenciones Finalizadas del Día</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {atenciones_finalizadas.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            No hay atenciones finalizadas
                                        </h3>
                                        <p className="text-gray-500">
                                            Aún no se han finalizado atenciones en el día de hoy.
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
                                                {atenciones_finalizadas.map((atencion) => (
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
                                                            <div className="flex justify-end gap-2">
                                                                <Link
                                                                    href={`/historias-clinicas/detalle/${atencion.id}`}
                                                                >
                                                                    <Button variant="outline" size="sm">
                                                                        <Eye className="h-4 w-4 mr-2" />
                                                                        Ver
                                                                    </Button>
                                                                </Link>
                                                                <Link
                                                                    href={`/historias-clinicas/editar/${atencion.id}`}
                                                                >
                                                                    <Button variant="outline" size="sm">
                                                                        <Pencil className="h-4 w-4 mr-2" />
                                                                        Modificar
                                                                    </Button>
                                                                </Link>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}