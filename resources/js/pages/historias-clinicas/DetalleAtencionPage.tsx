import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    User,
    Calendar,
    Clock,
    FileText,
    Activity,
    Stethoscope,
    Heart,
    Scale,
    Apple
} from 'lucide-react';

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

interface AtencionAtributo {
    atributo: {
        nombre: string;
    };
    valor: string;
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
    enfermedad_actual: string | null;
    examen_fisico: string | null;
    indicaciones: string | null;
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
    atenciones_atributos: AtencionAtributo[];
}

interface DetalleAtencionPageProps {
    atencion: Atencion;
    rol_profesional: string;
}

export default function DetalleAtencionPage({ atencion, rol_profesional }: DetalleAtencionPageProps) {
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
                return 'bg-yellow-200 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-200';
            case 'atendido':
                return 'bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200';
            case 'derivado':
                return 'bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };

    const getAtributoValor = (nombreAtributo: string): string => {
        const atributo = atencion.atenciones_atributos?.find(
            (aa) => aa.atributo.nombre === nombreAtributo
        );
        return atributo?.valor || '-';
    };

    const InfoBox = ({ children }: { children: React.ReactNode }) => (
        <p className="text-base bg-muted p-4 rounded-md">{children}</p>
    );

    const renderDetallesClinicosSegunRol = () => {
        switch (rol_profesional) {
            case 'enfermero':
                return (
                    <>
                        {/* Signos Vitales */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Heart className="h-5 w-5 text-red-500" />
                                    Signos Vitales
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        ['Respiración', 'rpm'],
                                        ['Pulso', 'bpm'],
                                        ['Temperatura', '°C'],
                                        ['Presión Sistólica', 'mmHg'],
                                        ['Presión Diastólica', 'mmHg'],
                                        ['Saturación', '%'],
                                        ['Glucemia', 'mg/dL'],
                                    ].map(([nombre, unidad]) => (
                                        <div key={nombre}>
                                            <p className="text-sm text-muted-foreground">{nombre}</p>
                                            <p className="text-lg font-semibold">
                                                {getAtributoValor(nombre)}{' '}
                                                <span className="text-sm font-normal text-muted-foreground">
                                                    {unidad}
                                                </span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Datos de la Consulta */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className="h-5 w-5" />
                                    Datos de la Consulta
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    ['Motivo de Consulta', 'Motivo de Consulta'],
                                    ['Prestación de Enfermería', 'Prestación de Enfermería'],
                                    ['Observaciones', 'Observaciones'],
                                ].map(([label, key]) => (
                                    <div key={label}>
                                        <p className="text-sm font-semibold text-muted-foreground mb-2">
                                            {label}
                                        </p>
                                        <InfoBox>{getAtributoValor(key)}</InfoBox>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </>
                );

            case 'medico':
                return (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Evaluación Médica
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                ['Diagnóstico Principal', 'Diagnostico Principal'],
                                ['Enfermedad Actual', 'Enfermedad Actual'],
                                ['Examen Físico', 'Exámen Físico'],
                                ['Indicaciones', 'Indicaciones'],
                                ['Detalle de la Consulta', 'Detalle'],
                                ['Observaciones', 'Observaciones'],
                            ].map(([label, key]) => (
                                <div key={label}>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                                        {label}
                                    </p>
                                    <InfoBox>{getAtributoValor(key)}</InfoBox>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                );

            case 'nutricionista':
                return (
                    <>
                        {/* Medidas Antropométricas */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Scale className="h-5 w-5 text-blue-500" />
                                    Medidas Antropométricas
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[
                                        ['Peso', 'kg'],
                                        ['Altura', 'cm'],
                                        ['Índice de Masa Corporal', 'kg/m²'],
                                        ['Cintura', 'cm'],
                                        ['Brazo', 'cm'],
                                        ['Ingesta Calórica Estimada', 'kcal'],
                                    ].map(([nombre, unidad]) => (
                                        <div key={nombre}>
                                            <p className="text-sm text-muted-foreground">{nombre}</p>
                                            <p className="text-lg font-semibold">
                                                {getAtributoValor(nombre)}{' '}
                                                <span className="text-sm font-normal text-muted-foreground">
                                                    {unidad}
                                                </span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Evaluación Nutricional */}
                        <Card className="mb-6">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Apple className="h-5 w-5 text-green-500" />
                                    Evaluación Nutricional
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {[
                                    ['Antecedentes Alimentarios', 'Antecedentes Alimentarios'],
                                    ['Diagnóstico Nutricional', 'Diagnostico Nutricional'],
                                    ['Plan de Dieta', 'Plan de Dieta'],
                                    ['Recomendaciones', 'Recomendaciones'],
                                ].map(([label, key]) => (
                                    <div key={label}>
                                        <p className="text-sm font-semibold text-muted-foreground mb-2">
                                            {label}
                                        </p>
                                        <InfoBox>{getAtributoValor(key)}</InfoBox>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </>
                );

            default:
                return (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Detalles Clínicos
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Observaciones
                                </p>
                                <InfoBox>{getAtributoValor('Observaciones')}</InfoBox>
                            </div>
                        </CardContent>
                    </Card>
                );
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
                        Información completa de la atención realizada
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
                                <p className="text-lg font-semibold">
                                    {atencion.servicio.nombre}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Tipo de Atención</p>
                                <p className="text-lg font-semibold">
                                    {atencion.tipo_atencion.nombre}
                                </p>
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
                                    {atencion.persona.tipo_documento.nombre}{' '}
                                    {atencion.persona.numero_documento}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profesional */}
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

                {/* Horarios */}
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

                {/* Sección dinámica por rol */}
                {renderDetallesClinicosSegunRol()}

                {/* Botón Volver */}
                <div className="flex justify-end">
                    <Button variant="outline" onClick={() => window.history.back()}>
                        Volver
                    </Button>
                </div>
            </div>
        </AppLayout>
    );
}
