import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Calendar, Clock, FileText, Activity, Stethoscope, Heart, Scale, Apple } from 'lucide-react';

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
                return 'bg-yellow-100 text-yellow-800';
            case 'atendido':
                return 'bg-green-100 text-green-800';
            case 'derivado':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Función para obtener valor de un atributo
    const getAtributoValor = (nombreAtributo: string): string => {
        const atributo = atencion.atenciones_atributos?.find(
            (aa) => aa.atributo.nombre === nombreAtributo
        );
        return atributo?.valor || '-';
    };

    // Renderizar detalles clínicos según el rol
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
                                    <div>
                                        <p className="text-sm text-muted-foreground">Respiración</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Respiración')} <span className="text-sm font-normal text-muted-foreground">rpm</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Pulso</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Pulso')} <span className="text-sm font-normal text-muted-foreground">bpm</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Temperatura</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Temperatura')} <span className="text-sm font-normal text-muted-foreground">°C</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Presión Sistólica</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Presión Sistólica')} <span className="text-sm font-normal text-muted-foreground">mmHg</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Presión Diastólica</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Presión Diastólica')} <span className="text-sm font-normal text-muted-foreground">mmHg</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Saturación O2</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Saturación')} <span className="text-sm font-normal text-muted-foreground">%</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Glucemia</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Glucemia')} <span className="text-sm font-normal text-muted-foreground">mg/dL</span>
                                        </p>
                                    </div>
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
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                                        Motivo de Consulta
                                    </p>
                                    <p className="text-base bg-gray-50 p-4 rounded-md">
                                        {getAtributoValor('Motivo de Consulta')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                                        Prestación de Enfermería
                                    </p>
                                    <p className="text-base bg-gray-50 p-4 rounded-md">
                                        {getAtributoValor('Prestación de Enfermería')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                                        Observaciones
                                    </p>
                                    <p className="text-base bg-gray-50 p-4 rounded-md">
                                        {getAtributoValor('Observaciones')}
                                    </p>
                                </div>
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
                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Diagnóstico Principal
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {getAtributoValor('Diagnostico Principal')}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Enfermedad Actual
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {getAtributoValor('Enfermedad Actual')}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Examen Físico
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {getAtributoValor('Exámen Físico')}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Indicaciones
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {getAtributoValor('Indicaciones')}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Detalle de la Consulta
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {getAtributoValor('Detalle')}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-muted-foreground mb-2">
                                    Observaciones
                                </p>
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {getAtributoValor('Observaciones')}
                                </p>
                            </div>
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
                                    <div>
                                        <p className="text-sm text-muted-foreground">Peso</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Peso')} <span className="text-sm font-normal text-muted-foreground">kg</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Altura</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Altura')} <span className="text-sm font-normal text-muted-foreground">cm</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">IMC</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Índice de Masa Corporal')} <span className="text-sm font-normal text-muted-foreground">kg/m²</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Cintura</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Cintura')} <span className="text-sm font-normal text-muted-foreground">cm</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Brazo</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Brazo')} <span className="text-sm font-normal text-muted-foreground">cm</span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Ingesta Calórica</p>
                                        <p className="text-lg font-semibold">
                                            {getAtributoValor('Ingesta Calórica Estimada')} <span className="text-sm font-normal text-muted-foreground">kcal</span>
                                        </p>
                                    </div>
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
                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                                        Antecedentes Alimentarios
                                    </p>
                                    <p className="text-base bg-gray-50 p-4 rounded-md">
                                        {getAtributoValor('Antecedentes Alimentarios')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                                        Diagnóstico Nutricional
                                    </p>
                                    <p className="text-base bg-gray-50 p-4 rounded-md">
                                        {getAtributoValor('Diagnostico Nutricional')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                                        Plan de Dieta
                                    </p>
                                    <p className="text-base bg-gray-50 p-4 rounded-md">
                                        {getAtributoValor('Plan de Dieta')}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-muted-foreground mb-2">
                                        Recomendaciones
                                    </p>
                                    <p className="text-base bg-gray-50 p-4 rounded-md">
                                        {getAtributoValor('Recomendaciones')}
                                    </p>
                                </div>
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
                                <p className="text-base bg-gray-50 p-4 rounded-md">
                                    {getAtributoValor('Observaciones')}
                                </p>
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
                                    {atencion.persona.tipo_documento.nombre}{' '}
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

                {/* Detalles Clínicos según Rol */}
                {renderDetallesClinicosSegunRol()}

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