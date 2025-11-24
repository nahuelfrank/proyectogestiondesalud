
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Undo2, Calendar, Clock, User, FileText, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import atenciones from '@/routes/atenciones';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Atenciones', href: atenciones.index.url() },
    { title: 'Detalle', href: '#' },
];

interface TipoDocumento {
    id: number;
    nombre: string;
}

interface Persona {
    id: number;
    nombre: string;
    apellido: string;
    tipo_documento: TipoDocumento;
    numero_documento: string;
}

interface Servicio {
    id: number;
    nombre: string;
}

interface TipoAtencion {
    id: number;
    nombre: string;
}

interface EstadoAtencion {
    id: number;
    nombre: string;
}

interface Profesional {
    id: number;
    persona: Persona;
}

interface Atencion {
    id: number;
    fecha: string;
    hora: string;
    diagnostico_principal?: string;
    motivo_de_consulta?: string;
    detalle_consulta?: string;
    enfermedad_actual?: string;
    indicaciones?: string;
    examen_fisico?: string;
    prestacion_de_enfermeria?: string;
    realizacion_de_tratamiento?: string;
    observaciones?: string;
    servicio_id: number;
    estado_atencion_id: number;
    tipo_atencion_id: number;
    profesional_id: number;
    persona_id: number;
    servicio: Servicio;
    tipo_atencion: TipoAtencion;
    estado_atencion: EstadoAtencion;
    profesional: Profesional;
    persona: Persona;
}

interface Props {
    atencion: Atencion;
}

export default function AtencionShowPage({ atencion }: Props) {

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modificar Atención" />
            <div className="container mx-auto py-10">
                <div className="ml-5 mb-4">
                    <h1 className="text-3xl font-semibold mb-2">Detalle de la Atención</h1>
                    <p className="text-md text-muted-foreground mb-4">
                        Visualiza los detalles relacionados con esta atención del paciente.
                    </p>

                    <Link href={atenciones.index.url()} className="inline-block">
                        <Button className="flex items-center gap-2 mr-2">
                            <Undo2 className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                {/* Información del Paciente */}
                <Card className='mb-3'>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Información del Paciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Nombre Completo</Label>
                                <p className="text-lg font-semibold">
                                    {atencion.persona.nombre} {atencion.persona.apellido}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Tipo de Documento</Label>
                                <p className="text-lg font-semibold">{atencion.persona.tipo_documento.nombre}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Número de Documento</Label>
                                <p className="text-lg font-semibold">{atencion.persona.numero_documento}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Detalles de la Atención */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Detalles de la Atención
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div>
                                <Label className="text-muted-foreground">Tipo de Atención</Label>
                                <p className="text-base font-semibold">{atencion.tipo_atencion.nombre}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Servicio</Label>
                                <p className="text-base font-semibold">{atencion.servicio.nombre}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-2">
                                    <Stethoscope className="h-4 w-4" />
                                    Profesional
                                </Label>
                                <p className="text-base font-semibold">
                                    {atencion.profesional.persona.nombre} {atencion.profesional.persona.apellido}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Fecha
                                </Label>
                                <p className="text-base font-semibold">
                                    {new Date(atencion.fecha).toLocaleDateString('es-AR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    Hora
                                </Label>
                                <p className="text-base font-semibold">{atencion.hora.substring(0, 5)}</p>
                            </div>
                        </div>

                        {/* Información Clínica Adicional */}
                        {(atencion.diagnostico_principal || atencion.motivo_de_consulta) && (
                            <>
                                <Separator className="my-4" />
                                <div className="space-y-4">
                                    {atencion.diagnostico_principal && (
                                        <div>
                                            <Label className="text-muted-foreground">Diagnóstico Principal</Label>
                                            <p className="text-sm mt-1">{atencion.diagnostico_principal}</p>
                                        </div>
                                    )}
                                    {atencion.motivo_de_consulta && (
                                        <div>
                                            <Label className="text-muted-foreground">Motivo de Consulta</Label>
                                            <p className="text-sm mt-1">{atencion.motivo_de_consulta}</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

            </div>
        </AppLayout>
    );
}