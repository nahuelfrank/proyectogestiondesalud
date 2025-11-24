import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Calendar, Clock, User, Save, Undo2 } from 'lucide-react';
import { FormEventHandler, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

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

interface Servicio {
    id: number;
    nombre: string;
}

interface Atencion {
    id: number;
    fecha: string;
    hora: string;
    motivo_de_consulta: string | null;
    prestacion_de_enfermeria: string | null;
    observaciones: string | null;
    diagnostico_principal: string | null;
    detalle_consulta: string | null;
    enfermedad_actual: string | null;
    indicaciones: string | null;
    examen_fisico: string | null;
    persona: Persona;
    profesional: Profesional;
    servicio: Servicio;
    atenciones_atributos: {
        atributo: {
            nombre: string;
        };
        valor: string;
    }[];
}

interface EditarAtencionFinalizadaPageProps {
    atencion: Atencion;
    rol_profesional: string;
}

export default function EditarAtencionFinalizadaPage({
    atencion,
    rol_profesional,
}: EditarAtencionFinalizadaPageProps) {
    const [notificacion, setNotificacion] = useState<{ tipo: string; mensaje: string } | null>(null);

    // Extraer valores de atributos existentes
    const getAtributoValor = (nombreAtributo: string): string => {
        const atributo = atencion.atenciones_atributos?.find(
            (aa) => aa.atributo.nombre === nombreAtributo
        );
        return atributo?.valor || '';
    };

    // Inicializar formulario según el rol
    const getInitialData = () => {
        switch (rol_profesional) {
            case 'enfermero':
                return {
                    respiracion: getAtributoValor('Respiración'),
                    pulso: getAtributoValor('Pulso'),
                    temperatura: getAtributoValor('Temperatura'),
                    presion_diastolica: getAtributoValor('Presión Diastólica'),
                    presion_sistolica: getAtributoValor('Presión Sistólica'),
                    saturacion: getAtributoValor('Saturación'),
                    glucemia: getAtributoValor('Glucemia'),
                    motivo_consulta: getAtributoValor('Motivo de Consulta') || '',
                    prestacion_enfermeria: getAtributoValor('Prestación de Enfermería') || '',
                    observaciones: getAtributoValor('Observaciones') || '',
                };

            case 'medico':
                return {
                    diagnostico_principal: getAtributoValor('Diagnostico Principal') || '',
                    enfermedad_actual: getAtributoValor('Enfermedad Actual') || '',
                    indicaciones: getAtributoValor('Observaciones') || '',
                    examen_fisico: getAtributoValor('Exámen Físico') || '',
                    detalle: getAtributoValor('Detalle') || '',
                    observaciones: getAtributoValor('Observaciones') || '',
                };

            case 'nutricionista':
                return {
                    peso: getAtributoValor('Peso'),
                    altura: getAtributoValor('Altura'),
                    imc: getAtributoValor('Índice de Masa Corporal'),
                    cintura: getAtributoValor('Cintura'),
                    brazo: getAtributoValor('Brazo'),
                    antecedentes_alimentarios: getAtributoValor('Antecedentes Alimentarios'),
                    ingesta_calorica_estimada: getAtributoValor('Ingesta Calórica Estimada'),
                    diagnostico_nutricional: getAtributoValor('Diagnostico Nutricional'),
                    plan_dieta: getAtributoValor('Plan de Dieta'),
                    recomendaciones: getAtributoValor('Recomendaciones'),
                };

            default:
                return {
                    observaciones: atencion.observaciones || '',
                };
        }
    };

    const { data, setData, put, processing, errors } = useForm(getInitialData());

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        put(`/historias-clinicas/actualizar/${atencion.id}`, {
            onSuccess: () => {
                setNotificacion({
                    tipo: 'success',
                    mensaje: 'Atención actualizada correctamente',
                });
                setTimeout(() => {
                    window.location.href = '/historias-clinicas/lista-espera';
                }, 1500);
            },
            onError: () => {
                setNotificacion({
                    tipo: 'error',
                    mensaje: 'Error al actualizar la atención',
                });
            },
        });
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const renderCamposSegunRol = () => {
        switch (rol_profesional) {
            case 'enfermero':
                return (
                    <>
                        {/* Signos Vitales */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Signos Vitales</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="respiracion">
                                        Respiración (rpm) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="respiracion"
                                        type="number"
                                        step="0.01"
                                        value={data.respiracion}
                                        onChange={(e) => setData('respiracion', e.target.value)}
                                        placeholder="Ej: 18"
                                    />
                                    {errors.respiracion && <FieldError>{errors.respiracion}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="pulso">
                                        Pulso (bpm) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="pulso"
                                        type="number"
                                        step="0.01"
                                        value={data.pulso}
                                        onChange={(e) => setData('pulso', e.target.value)}
                                        placeholder="Ej: 72"
                                    />
                                    {errors.pulso && <FieldError>{errors.pulso}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="temperatura">
                                        Temperatura (°C) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="temperatura"
                                        type="number"
                                        step="0.01"
                                        value={data.temperatura}
                                        onChange={(e) => setData('temperatura', e.target.value)}
                                        placeholder="Ej: 36.5"
                                    />
                                    {errors.temperatura && <FieldError>{errors.temperatura}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="presion_sistolica">
                                        Presión Sistólica (mmHg) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="presion_sistolica"
                                        type="number"
                                        step="0.01"
                                        value={data.presion_sistolica}
                                        onChange={(e) => setData('presion_sistolica', e.target.value)}
                                        placeholder="Ej: 120"
                                    />
                                    {errors.presion_sistolica && (
                                        <FieldError>{errors.presion_sistolica}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="presion_diastolica">
                                        Presión Diastólica (mmHg) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="presion_diastolica"
                                        type="number"
                                        step="0.01"
                                        value={data.presion_diastolica}
                                        onChange={(e) => setData('presion_diastolica', e.target.value)}
                                        placeholder="Ej: 80"
                                    />
                                    {errors.presion_diastolica && (
                                        <FieldError>{errors.presion_diastolica}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="saturacion">
                                        Saturación O2 (%) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="saturacion"
                                        type="number"
                                        step="0.01"
                                        value={data.saturacion}
                                        onChange={(e) => setData('saturacion', e.target.value)}
                                        placeholder="Ej: 98"
                                    />
                                    {errors.saturacion && <FieldError>{errors.saturacion}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="glucemia">
                                        Glucemia (mg/dL) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="glucemia"
                                        type="number"
                                        step="0.01"
                                        value={data.glucemia}
                                        onChange={(e) => setData('glucemia', e.target.value)}
                                        placeholder="Ej: 95"
                                    />
                                    {errors.glucemia && <FieldError>{errors.glucemia}</FieldError>}
                                </Field>
                            </CardContent>
                        </Card>

                        {/* Datos de la Consulta */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Datos de la Consulta</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Field>
                                    <FieldLabel htmlFor="motivo_consulta">
                                        Motivo de Consulta <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="motivo_consulta"
                                        value={data.motivo_consulta}
                                        onChange={(e) => setData('motivo_consulta', e.target.value)}
                                        placeholder="Describa el motivo de la consulta"
                                        rows={4}
                                    />
                                    {errors.motivo_consulta && (
                                        <FieldError>{errors.motivo_consulta}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="prestacion_enfermeria">
                                        Prestación de Enfermería <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="prestacion_enfermeria"
                                        value={data.prestacion_enfermeria}
                                        onChange={(e) => setData('prestacion_enfermeria', e.target.value)}
                                        placeholder="Describa las prestaciones realizadas"
                                        rows={4}
                                    />
                                    {errors.prestacion_enfermeria && (
                                        <FieldError>{errors.prestacion_enfermeria}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="observaciones">Observaciones</FieldLabel>
                                    <Textarea
                                        id="observaciones"
                                        value={data.observaciones}
                                        onChange={(e) => setData('observaciones', e.target.value)}
                                        placeholder="Observaciones adicionales (opcional)"
                                        rows={3}
                                    />
                                </Field>
                            </CardContent>
                        </Card>
                    </>
                );

            case 'medico':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Evaluación Médica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Field>
                                <FieldLabel htmlFor="diagnostico_principal">
                                    Diagnóstico Principal <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Textarea
                                    id="diagnostico_principal"
                                    value={data.diagnostico_principal}
                                    onChange={(e) => setData('diagnostico_principal', e.target.value)}
                                    placeholder="Ingrese el diagnóstico principal"
                                    rows={3}
                                />
                                {errors.diagnostico_principal && (
                                    <FieldError>{errors.diagnostico_principal}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="enfermedad_actual">
                                    Enfermedad Actual <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Textarea
                                    id="enfermedad_actual"
                                    value={data.enfermedad_actual}
                                    onChange={(e) => setData('enfermedad_actual', e.target.value)}
                                    placeholder="Describa la enfermedad actual del paciente"
                                    rows={4}
                                />
                                {errors.enfermedad_actual && (
                                    <FieldError>{errors.enfermedad_actual}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="examen_fisico">
                                    Examen Físico <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Textarea
                                    id="examen_fisico"
                                    value={data.examen_fisico}
                                    onChange={(e) => setData('examen_fisico', e.target.value)}
                                    placeholder="Resultado del examen físico"
                                    rows={4}
                                />
                                {errors.examen_fisico && <FieldError>{errors.examen_fisico}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="indicaciones">
                                    Indicaciones <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Textarea
                                    id="indicaciones"
                                    value={data.indicaciones}
                                    onChange={(e) => setData('indicaciones', e.target.value)}
                                    placeholder="Indicaciones médicas y tratamiento"
                                    rows={4}
                                />
                                {errors.indicaciones && <FieldError>{errors.indicaciones}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="detalle">Detalle de Consulta</FieldLabel>
                                <Textarea
                                    id="detalle"
                                    value={data.detalle}
                                    onChange={(e) => setData('detalle', e.target.value)}
                                    placeholder="Detalles adicionales de la consulta"
                                    rows={3}
                                />
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="observaciones">Observaciones</FieldLabel>
                                <Textarea
                                    id="observaciones"
                                    value={data.observaciones}
                                    onChange={(e) => setData('observaciones', e.target.value)}
                                    placeholder="Observaciones adicionales"
                                    rows={3}
                                />
                            </Field>
                        </CardContent>
                    </Card>
                );

            case 'nutricionista':
                return (
                    <>
                        {/* Medidas Antropométricas */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Medidas Antropométricas</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="peso">
                                        Peso (kg) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="peso"
                                        type="number"
                                        step="0.01"
                                        value={data.peso}
                                        onChange={(e) => setData('peso', e.target.value)}
                                        placeholder="Ej: 70.5"
                                    />
                                    {errors.peso && <FieldError>{errors.peso}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="altura">
                                        Altura (cm) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="altura"
                                        type="number"
                                        step="0.01"
                                        value={data.altura}
                                        onChange={(e) => setData('altura', e.target.value)}
                                        placeholder="Ej: 170"
                                    />
                                    {errors.altura && <FieldError>{errors.altura}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="imc">
                                        IMC (kg/m²) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="imc"
                                        type="number"
                                        step="0.01"
                                        value={data.imc}
                                        onChange={(e) => setData('imc', e.target.value)}
                                        placeholder="Ej: 24.5"
                                    />
                                    {errors.imc && <FieldError>{errors.imc}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="cintura">
                                        Cintura (cm) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="cintura"
                                        type="number"
                                        step="0.01"
                                        value={data.cintura}
                                        onChange={(e) => setData('cintura', e.target.value)}
                                        placeholder="Ej: 85"
                                    />
                                    {errors.cintura && <FieldError>{errors.cintura}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="brazo">
                                        Brazo (cm) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="brazo"
                                        type="number"
                                        step="0.01"
                                        value={data.brazo}
                                        onChange={(e) => setData('brazo', e.target.value)}
                                        placeholder="Ej: 30"
                                    />
                                    {errors.brazo && <FieldError>{errors.brazo}</FieldError>}
                                </Field>
                            </CardContent>
                        </Card>

                        {/* Evaluación Nutricional */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Evaluación Nutricional</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Field>
                                    <FieldLabel htmlFor="antecedentes_alimentarios">
                                        Antecedentes Alimentarios <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="antecedentes_alimentarios"
                                        value={data.antecedentes_alimentarios}
                                        onChange={(e) => setData('antecedentes_alimentarios', e.target.value)}
                                        placeholder="Describa los antecedentes alimentarios del paciente"
                                        rows={4}
                                    />
                                    {errors.antecedentes_alimentarios && (
                                        <FieldError>{errors.antecedentes_alimentarios}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="ingesta_calorica_estimada">
                                        Ingesta Calórica Estimada (kcal) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="ingesta_calorica_estimada"
                                        type="number"
                                        step="0.01"
                                        value={data.ingesta_calorica_estimada}
                                        onChange={(e) => setData('ingesta_calorica_estimada', e.target.value)}
                                        placeholder="Ej: 2000"
                                    />
                                    {errors.ingesta_calorica_estimada && (
                                        <FieldError>{errors.ingesta_calorica_estimada}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="diagnostico_nutricional">
                                        Diagnóstico Nutricional <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="diagnostico_nutricional"
                                        value={data.diagnostico_nutricional}
                                        onChange={(e) => setData('diagnostico_nutricional', e.target.value)}
                                        placeholder="Ingrese el diagnóstico nutricional"
                                        rows={3}
                                    />
                                    {errors.diagnostico_nutricional && (
                                        <FieldError>{errors.diagnostico_nutricional}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="plan_dieta">
                                        Plan de Dieta <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="plan_dieta"
                                        value={data.plan_dieta}
                                        onChange={(e) => setData('plan_dieta', e.target.value)}
                                        placeholder="Describa el plan de dieta recomendado"
                                        rows={4}
                                    />
                                    {errors.plan_dieta && <FieldError>{errors.plan_dieta}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="recomendaciones">
                                        Recomendaciones <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="recomendaciones"
                                        value={data.recomendaciones}
                                        onChange={(e) => setData('recomendaciones', e.target.value)}
                                        placeholder="Recomendaciones nutricionales adicionales"
                                        rows={4}
                                    />
                                    {errors.recomendaciones && (
                                        <FieldError>{errors.recomendaciones}</FieldError>
                                    )}
                                </Field>
                            </CardContent>
                        </Card>
                    </>
                );

            default:
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Observaciones</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Field>
                                <FieldLabel htmlFor="observaciones">
                                    Observaciones <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Textarea
                                    id="observaciones"
                                    value={data.observaciones}
                                    onChange={(e) => setData('observaciones', e.target.value)}
                                    placeholder="Ingrese las observaciones de la atención"
                                    rows={6}
                                />
                                {errors.observaciones && <FieldError>{errors.observaciones}</FieldError>}
                            </Field>
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
                { title: 'Editar Atención', href: '#' },
            ]}
        >
            <Head title="Editar Atención Finalizada" />

            <div className="container mx-auto py-10">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Editar Atención Finalizada</h1>
                    <p className="text-muted-foreground">
                        Modifique los datos de la atención registrada
                    </p>
                    <Link href="/historias-clinicas/lista-espera" className="inline-block mt-4">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Undo2 className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                {/* Notificaciones */}
                {notificacion && (
                    <Alert
                        variant={notificacion.tipo === 'error' ? 'destructive' : 'default'}
                        className="mb-6"
                    >
                        {notificacion.tipo === 'success' ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertTitle>
                            {notificacion.tipo === 'success' ? 'Éxito' : 'Error'}
                        </AlertTitle>
                        <AlertDescription>{notificacion.mensaje}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Información del Paciente */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Información del Paciente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Paciente</p>
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
                                <div>
                                    <p className="text-sm text-muted-foreground">Servicio</p>
                                    <p className="text-lg font-semibold">{atencion.servicio.nombre}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Información de la Atención */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Datos de la Atención
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Fecha</p>
                                    <p className="text-lg font-semibold flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        {formatFecha(atencion.fecha)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Hora</p>
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
                                    <p className="text-sm text-muted-foreground">Profesional</p>
                                    <p className="text-lg font-semibold">
                                        {atencion.profesional.persona.nombre}{' '}
                                        {atencion.profesional.persona.apellido}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Campos según el rol */}
                    {renderCamposSegunRol()}

                    {/* Botones */}
                    <div className="flex justify-end gap-4">
                        <Link href="/historias-clinicas/lista-espera">
                            <Button type="button" variant="outline" disabled={processing}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            <Save className="h-4 w-4 mr-2" />
                            {processing ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}