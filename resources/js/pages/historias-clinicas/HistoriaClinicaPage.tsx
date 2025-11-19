import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { User, Calendar, FileText, Plus, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Paciente {
    id: number;
    nombre_completo: string;
    edad: number;
    genero: string;
    tipo_documento: string;
    numero_documento: string;
}

interface AtencionActual {
    id: number;
    fecha: string;
    hora: string;
}

interface Profesional {
    persona: {
        nombre: string;
        apellido: string;
    };
}

interface HistorialAtencion {
    id: number;
    fecha: string;
    hora: string;
    servicio: {
        nombre: string;
    };
    tipo_atencion: {
        nombre: string;
    };
    profesional: Profesional;
    estado_atencion: {
        nombre: string;
    };
}

interface HistoriaClinicaPageProps {
    atencionActual: AtencionActual;
    paciente: Paciente;
    historialAtenciones: HistorialAtencion[];
}

export default function HistoriaClinicaPage({
    atencionActual,
    paciente,
    historialAtenciones,
}: HistoriaClinicaPageProps) {
    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatFechaHora = (fecha: string, hora: string) => {
        return `${formatFecha(fecha)} - ${hora}`;
    };

    return (
        <AppLayout breadcrumbs={[
            { title: 'Historia Clínica', href: '#' },
            { title: 'Lista de Espera', href: '/historias-clinicas/lista-espera' },
            { title: 'Paciente', href: '#' }
        ]}>
            <Head title={`Historia Clínica - ${paciente.nombre_completo}`} />

            <div className="container mx-auto py-10">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Historia Clínica</h1>
                    <p className="text-muted-foreground">
                        Información médica y antecedentes del paciente
                    </p>
                </div>

                {/* Información del Paciente */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Información del Paciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Nombre Completo</p>
                                <p className="text-lg font-semibold">{paciente.nombre_completo}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Edad</p>
                                <p className="text-lg font-semibold">{paciente.edad} años</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Género</p>
                                <p className="text-lg font-semibold">{paciente.genero}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tipo de Documento</p>
                                <p className="text-lg font-semibold">{paciente.tipo_documento}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Número de Documento</p>
                                <p className="text-lg font-semibold">{paciente.numero_documento}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Historial de Atenciones */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Historial de Atenciones
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Registro de todas las atenciones médicas previas
                            </p>
                        </div>
                        <Link href={`/historias-clinicas/${atencionActual.id}/registrar`}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Registrar Atención
                            </Button>
                        </Link>
                    </CardHeader>
                    <CardContent>
                        {historialAtenciones.length === 0 ? (
                            <div className="text-center py-12">
                                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Sin historial de atenciones
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Este paciente no tiene atenciones médicas registradas previamente.
                                </p>
                                <Link href={`/historias-clinicas/${atencionActual.id}/registrar`}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Registrar Primera Atención
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fecha y Hora</TableHead>
                                            <TableHead>Tipo de Servicio</TableHead>
                                            <TableHead>Tipo de Atención</TableHead>
                                            <TableHead>Profesional</TableHead>
                                            <TableHead>Estado</TableHead>
                                            <TableHead className="text-right">Detalles</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {historialAtenciones.map((atencion) => (
                                            <TableRow key={atencion.id}>
                                                <TableCell className="font-medium">
                                                    {formatFechaHora(atencion.fecha, atencion.hora)}
                                                </TableCell>
                                                <TableCell>{atencion.servicio.nombre}</TableCell>
                                                <TableCell>{atencion.tipo_atencion.nombre}</TableCell>
                                                <TableCell>
                                                    {atencion.profesional.persona.nombre}{' '}
                                                    {atencion.profesional.persona.apellido}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {atencion.estado_atencion.nombre}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={`/historias-clinicas/atenciones/${atencion.id}/detalle`}
                                                    >
                                                        <Button variant="ghost" size="sm">
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Ver
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

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 mt-6">
                    <Link href="/historias-clinicas/lista-espera">
                        <Button variant="outline">Volver a Lista de Espera</Button>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}