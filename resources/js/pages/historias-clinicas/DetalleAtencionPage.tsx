import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Calendar, Clock, FileText, Activity, Stethoscope } from 'lucide-react';

interface Persona {
    nombre: string;
    apellido: string;
    numero_documento: string;
    tipo_documento: {
        nombre: string;
    };
}

interface Profesional {
    persona: {
        nombre: string;
        apellido: string;
    };
    especialidad: {
        nombre: string;
    };
}

interface Atencion {
    id: number;
    fecha: string;
    hora: string;
    hora_inicio_atencion: string | null;
    hora_fin_atencion: string | null;
    motivo_de_consulta: string | null;
    prestacion_de_enfermeria: string | null;
    observaciones: string | null;
    diagnostico_principal: string | null;
    detalle_consulta: string | null;
    persona: Persona;
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

interface DetalleAtencionPageProps {
    atencion: Atencion;
}

export default function DetalleAtencionPage({ atencion }: DetalleAtencionPageProps) {
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
        <AppLayout
            breadcrumbs={[
                { title: 'Historia Clínica', href: '#' },
                { title: 'Lista de Espera', href: '/historias-clinicas/lista-espera' },
                { title: 'Detalle de Atención', href: '#' },
            ]}
        >
            <Head title="Detalle de Atención" />

            <div className="container mx-auto py-10">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Detalle de Atención</h1>
                    <p className="text-muted-foreground">
                        Información completa de la atención médica realizada
                    </p>
                </div>

                {/* Información General */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Información General
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha de Atención</p>
                                <p className="text-lg font-semibold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {formatFecha(atencion.fecha)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Hora de Registro</p>
                                <p className="text-lg font-semibold flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {atencion.hora}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Servicio</p>
                                <p className="text-lg font-semibold">{atencion.servicio.nombre}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Tipo de Atención</p>
                                <p className="text-lg font-semibold">{atencion.tipo_atencion.nombre}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Estado</p>
                                <Badge className={getEstadoBadgeColor(atencion.estado_atencion.nombre)}>
                                    {atencion.estado_atencion.nombre}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Información del Paciente */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Datos del Paciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Nombre Completo</p>
                                <p className="text-lg font-semibold">
                                    {atencion.persona.nombre} {atencion.persona.apellido}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Documento</p>
                                <p className="text-lg font-semibold">
                                    
                                    {atencion.persona.numero_documento}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profesional que Atendió */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5" />
                            Profesional que Atendió
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-muted-foreground">Nombre del Profesional</p>
                                <p className="text-lg font-semibold">
                                    {atencion.profesional.persona.nombre}{' '}
                                    {atencion.profesional.persona.apellido}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Especialidad</p>
                                <p className="text-lg font-semibold">
                                    {atencion.profesional.especialidad.nombre}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Horarios de Atención */}
                {(atencion.hora_inicio_atencion || atencion.hora_fin_atencion) && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Horarios de Atención
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {atencion.hora_inicio_atencion && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Inicio de Atención</p>
                                        <p className="text-lg font-semibold">
                                            {atencion.hora_inicio_atencion}
                                        </p>
                                    </div>
                                )}
                                {atencion.hora_fin_atencion && (
                                    <div>
                                        <p className="text-sm text-muted-foreground">Fin de Atención</p>
                                        <p className="text-lg font-semibold">
                                            {atencion.hora_fin_atencion}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Detalles Clínicos */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Detalles Clínicos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {atencion.motivo_de_consulta && (
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Motivo de Consulta
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {atencion.motivo_de_consulta}
                                </p>
                            </div>
                        )}

                        {atencion.prestacion_de_enfermeria && (
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Prestación de Enfermería
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {atencion.prestacion_de_enfermeria}
                                </p>
                            </div>
                        )}

                        {atencion.diagnostico_principal && (
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Diagnóstico Principal
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {atencion.diagnostico_principal}
                                </p>
                            </div>
                        )}

                        {atencion.detalle_consulta && (
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Detalle de la Consulta
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {atencion.detalle_consulta}
                                </p>
                            </div>
                        )}

                        {atencion.observaciones && (
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Observaciones
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {atencion.observaciones}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Botones de Acción */}
                <div className="flex justify-end gap-4">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Volver
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}