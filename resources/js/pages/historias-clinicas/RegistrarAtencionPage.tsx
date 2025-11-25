import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, UserCheck, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Persona {
    nombre: string;
    apellido: string;
    genero: {
        nombre: string;
    };
    tipo_documento: {
        nombre: string;
    };
    numero_documento: string;
}

interface Atencion {
    id: number;
    fecha: string;
    hora: string;
    persona: Persona;
    servicio: {
        id: number;
        nombre: string;
    };
    profesional: {
        persona: {
            nombre: string;
            apellido: string;
        };
        especialidad: {
            nombre: string;
        };
    };
}

interface Servicio {
    id: number;
    nombre: string;
}

interface Profesional {
    id: number;
    nombre_completo: string;
    especialidad: string;
    disponible: boolean;
    horarios: {
        dia: string;
        hora_inicio: string;
        hora_fin: string;
    }[];
}

interface RegistrarAtencionPageProps {
    atencion: Atencion;
    servicios: Servicio[];
    rol_profesional: string; // 'enfermero', 'medico', 'nutricionista', 'cardiologo', 'psicologo'
}

export default function RegistrarAtencionPage({
    atencion,
    servicios,
    rol_profesional,
}: RegistrarAtencionPageProps) {
    const [profesionales, setProfesionales] = useState<Profesional[]>([]);
    const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<Profesional | null>(null);
    const [peso, setPeso] = useState('');
    const [altura, setAltura] = useState('');
    const [imc, setImc] = useState('');

    // Inicializar el formulario con todos los campos posibles
    const { data, setData, post, processing, errors } = useForm({
        // Campos comunes de enfermería
        respiracion: '',
        pulso: '',
        temperatura: '',
        presion_diastolica: '',
        presion_sistolica: '',
        saturacion: '',
        glucemia: '',
        motivo_consulta: '',
        prestacion_enfermeria: '',
        observaciones: '',

        // Campos médicos
        diagnostico_principal: '',
        enfermedad_actual: '',
        indicaciones: '',
        examen_fisico: '',
        detalle: '',

        // Campos nutricionista
        peso: '',
        altura: '',
        imc: '',
        cintura: '',
        brazo: '',
        antecedentes_alimentarios: '',
        ingesta_calorica_estimada: '',
        diagnostico_nutricional: '',
        plan_dieta: '',
        recomendaciones: '',

        // Derivación
        derivar: false,
        derivacion: {
            servicio_id: '',
            profesional_id: '',
        },
    });

    // Calcular IMC automáticamente
    useEffect(() => {
        if (peso && altura) {
            const pesoNum = parseFloat(peso);
            const alturaNum = parseFloat(altura);

            if (pesoNum > 0 && alturaNum > 0) {
                const imcCalculado = (pesoNum / (alturaNum * alturaNum)).toFixed(2);
                setImc(imcCalculado);
                setData('imc', imcCalculado);
            }
        }
    }, [peso, altura]);

    // Cargar profesionales cuando se selecciona un servicio
    const cargarProfesionales = async (servicioId: string) => {
        try {
            const response = await fetch(`/historias-clinicas/servicios/${servicioId}/profesionales`);
            const data = await response.json();
            setProfesionales(data);
        } catch (error) {
            console.error('Error al cargar profesionales:', error);
        }
    };

    useEffect(() => {
        if (data.derivacion.servicio_id) {
            cargarProfesionales(data.derivacion.servicio_id);
            setData('derivacion', { ...data.derivacion, profesional_id: '' });
        } else {
            setProfesionales([]);
            setProfesionalSeleccionado(null);
        }
    }, [data.derivacion.servicio_id]);

    useEffect(() => {
        if (data.derivacion.profesional_id) {
            const profesional = profesionales.find((p) => p.id === parseInt(data.derivacion.profesional_id));
            setProfesionalSeleccionado(profesional || null);
        } else {
            setProfesionalSeleccionado(null);
        }
    }, [data.derivacion.profesional_id, profesionales]);

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();

        // Validación adicional para derivación
        if (data.derivar) {
            if (!data.derivacion.servicio_id || !data.derivacion.profesional_id) {
                alert('Debe seleccionar un servicio y un profesional para derivar.');
                return;
            }

            // Verificar disponibilidad del profesional
            if (profesionalSeleccionado && !profesionalSeleccionado.disponible) {
                const confirmar = window.confirm(
                    'El profesional seleccionado no está disponible en este momento. ¿Desea continuar con la derivación de todas formas?'
                );
                if (!confirmar) return;
            }
        }

        post(`/historias-clinicas/${atencion.id}/guardar`, {
            onSuccess: () => {
                // Redireccionará automáticamente
            },
            onError: (errors) => {
                console.error('Errores de validación:', errors);
            }
        });
    };

    // Renderizar campos según el rol del profesional
    const renderCamposPorRol = () => {
        switch (rol_profesional) {
            case 'enfermero':
                return (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Signos Vitales</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="respiracion">
                                            Respiración (rpm) <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="respiracion"
                                            type="number"
                                            value={data.respiracion}
                                            onChange={(e) => setData('respiracion', e.target.value)}
                                            placeholder="Ej: 18"
                                        />
                                        {errors.respiracion && <FieldError>{errors.respiracion}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="pulso">
                                            Pulso (lpm) <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="pulso"
                                            type="number"
                                            value={data.pulso}
                                            onChange={(e) => setData('pulso', e.target.value)}
                                            placeholder="Ej: 75"
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
                                            step="0.1"
                                            value={data.temperatura}
                                            onChange={(e) => setData('temperatura', e.target.value)}
                                            placeholder="Ej: 36.5"
                                        />
                                        {errors.temperatura && <FieldError>{errors.temperatura}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="saturacion">
                                            Saturación O₂ (%) <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="saturacion"
                                            type="number"
                                            value={data.saturacion}
                                            onChange={(e) => setData('saturacion', e.target.value)}
                                            placeholder="Ej: 98"
                                        />
                                        {errors.saturacion && <FieldError>{errors.saturacion}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="presion_sistolica">
                                            Presión Sistólica (mmHg) <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="presion_sistolica"
                                            type="number"
                                            value={data.presion_sistolica}
                                            onChange={(e) => setData('presion_sistolica', e.target.value)}
                                            placeholder="Ej: 120"
                                        />
                                        {errors.presion_sistolica && <FieldError>{errors.presion_sistolica}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="presion_diastolica">
                                            Presión Diastólica (mmHg) <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="presion_diastolica"
                                            type="number"
                                            value={data.presion_diastolica}
                                            onChange={(e) => setData('presion_diastolica', e.target.value)}
                                            placeholder="Ej: 80"
                                        />
                                        {errors.presion_diastolica && <FieldError>{errors.presion_diastolica}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="glucemia">
                                            Glucemia (mg/dL) <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="glucemia"
                                            type="number"
                                            value={data.glucemia}
                                            onChange={(e) => setData('glucemia', e.target.value)}
                                            placeholder="Ej: 95"
                                        />
                                        {errors.glucemia && <FieldError>{errors.glucemia}</FieldError>}
                                    </Field>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Información de Consulta</CardTitle>
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
                                    {errors.motivo_consulta && <FieldError>{errors.motivo_consulta}</FieldError>}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="prestacion_enfermeria">
                                        Prestación de Enfermería <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Textarea
                                        id="prestacion_enfermeria"
                                        value={data.prestacion_enfermeria}
                                        onChange={(e) => setData('prestacion_enfermeria', e.target.value)}
                                        placeholder="Describa la prestación realizada"
                                        rows={4}
                                    />
                                    {errors.prestacion_enfermeria && <FieldError>{errors.prestacion_enfermeria}</FieldError>}
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
                                    {errors.observaciones && <FieldError>{errors.observaciones}</FieldError>}
                                </Field>
                            </CardContent>
                        </Card>

                        {/* Derivación */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>Derivación</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            ¿Desea derivar esta atención a otro profesional o servicio?
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="derivar"
                                            checked={data.derivar}
                                            onCheckedChange={(checked) => {
                                                setData('derivar', checked);
                                                if (!checked) {
                                                    setData('derivacion', { servicio_id: '', profesional_id: '' });
                                                    setProfesionales([]);
                                                    setProfesionalSeleccionado(null);
                                                }
                                            }}
                                        />
                                        <Label htmlFor="derivar">Derivar atención</Label>
                                    </div>
                                </div>
                            </CardHeader>

                            {data.derivar && (
                                <CardContent className="space-y-4">
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Al confirmar la derivación, se completará el registro actual y se creará
                                            automáticamente una nueva atención en estado "En espera" para el profesional
                                            seleccionado.
                                        </AlertDescription>
                                    </Alert>

                                    {servicios.length === 0 ? (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>
                                                No hay servicios disponibles para derivación. Todos los servicios están ocupados
                                                o no tienen profesionales activos en este momento.
                                            </AlertDescription>
                                        </Alert>
                                    ) : (
                                        <>
                                            <Field>
                                                <FieldLabel>
                                                    Servicio de Destino <span className="text-red-500">*</span>
                                                </FieldLabel>
                                                <Select
                                                    value={data.derivacion.servicio_id}
                                                    onValueChange={(value) =>
                                                        setData('derivacion', { ...data.derivacion, servicio_id: value, profesional_id: '' })
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleccione un servicio" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {servicios.map((servicio) => (
                                                            <SelectItem key={servicio.id} value={String(servicio.id)}>
                                                                {servicio.nombre}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors['derivacion.servicio_id'] && (
                                                    <FieldError>{errors['derivacion.servicio_id']}</FieldError>
                                                )}
                                            </Field>

                                            {data.derivacion.servicio_id && profesionales.length > 0 && (
                                                <Field>
                                                    <FieldLabel>
                                                        Profesional <span className="text-red-500">*</span>
                                                    </FieldLabel>
                                                    <Select
                                                        value={data.derivacion.profesional_id}
                                                        onValueChange={(value) =>
                                                            setData('derivacion', {
                                                                ...data.derivacion,
                                                                profesional_id: value,
                                                            })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Seleccione un profesional" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {profesionales.map((profesional) => (
                                                                <SelectItem key={profesional.id} value={String(profesional.id)}>
                                                                    <div className="flex items-center gap-2">
                                                                        {profesional.disponible ? (
                                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                                        ) : (
                                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                                        )}
                                                                        <span>
                                                                            {profesional.nombre_completo} - {profesional.especialidad}
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {errors['derivacion.profesional_id'] && (
                                                        <FieldError>{errors['derivacion.profesional_id']}</FieldError>
                                                    )}
                                                </Field>
                                            )}

                                            {data.derivacion.servicio_id && profesionales.length === 0 && (
                                                <Alert>
                                                    <AlertCircle className="h-4 w-4" />
                                                    <AlertDescription>
                                                        No hay profesionales disponibles para el servicio seleccionado.
                                                    </AlertDescription>
                                                </Alert>
                                            )}

                                            {/* Horarios del Profesional Seleccionado */}
                                            {profesionalSeleccionado && (
                                                <Card className="border-blue-200 bg-blue-50">
                                                    <CardHeader>
                                                        <CardTitle className="text-sm flex items-center gap-2">
                                                            <UserCheck className="h-4 w-4" />
                                                            Horarios de Atención - {profesionalSeleccionado.nombre_completo}
                                                        </CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        {profesionalSeleccionado.horarios.length > 0 ? (
                                                            <>
                                                                <div className="space-y-2">
                                                                    {profesionalSeleccionado.horarios.map((horario, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="flex items-center justify-between text-sm"
                                                                        >
                                                                            <span className="font-medium">{horario.dia}</span>
                                                                            <Badge variant="outline">
                                                                                {horario.hora_inicio} - {horario.hora_fin}
                                                                            </Badge>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="mt-4 flex items-center gap-2">
                                                                    {profesionalSeleccionado.disponible ? (
                                                                        <>
                                                                            <CheckCircle className="h-4 w-4 text-green-500" />
                                                                            <span className="text-sm text-green-700 font-medium">
                                                                                Disponible en este momento
                                                                            </span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <XCircle className="h-4 w-4 text-red-500" />
                                                                            <span className="text-sm text-red-700 font-medium">
                                                                                No disponible (fuera de horario de atención)
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-muted-foreground">
                                                                No hay horarios configurados para este profesional.
                                                            </p>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            )}
                        </Card>
                    </>
                );

            case 'medico':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Información Médica</CardTitle>
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
                                {errors.diagnostico_principal && <FieldError>{errors.diagnostico_principal}</FieldError>}
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
                                {errors.enfermedad_actual && <FieldError>{errors.enfermedad_actual}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="examen_fisico">
                                    Examen Físico <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Textarea
                                    id="examen_fisico"
                                    value={data.examen_fisico}
                                    onChange={(e) => setData('examen_fisico', e.target.value)}
                                    placeholder="Describa los hallazgos del examen físico"
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
                                    placeholder="Ingrese las indicaciones médicas"
                                    rows={4}
                                />
                                {errors.indicaciones && <FieldError>{errors.indicaciones}</FieldError>}
                            </Field>

                            <Field>
                                <FieldLabel htmlFor="detalle">Detalle</FieldLabel>
                                <Textarea
                                    id="detalle"
                                    value={data.detalle}
                                    onChange={(e) => setData('detalle', e.target.value)}
                                    placeholder="Detalles adicionales (opcional)"
                                    rows={3}
                                />
                                {errors.detalle && <FieldError>{errors.detalle}</FieldError>}
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
                                {errors.observaciones && <FieldError>{errors.observaciones}</FieldError>}
                            </Field>
                        </CardContent>
                    </Card>
                );

            case 'nutricionista':
                return (
                    <>
                        <Card>
                            <CardHeader>
                                <CardTitle>Medidas Antropométricas</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="peso">
                                            Peso (kg) <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="peso"
                                            type="number"
                                            step="0.1"
                                            value={data.peso}
                                            onChange={(e) => {
                                                setData('peso', e.target.value);
                                                setPeso(e.target.value);
                                            }}
                                            placeholder="Ej: 70.5"
                                        />
                                        {errors.peso && <FieldError>{errors.peso}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="altura">
                                            Altura (m) <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="altura"
                                            type="number"
                                            step="0.01"
                                            value={data.altura}
                                            onChange={(e) => {
                                                setData('altura', e.target.value);
                                                setAltura(e.target.value);
                                            }}
                                            placeholder="Ej: 1.75"
                                        />
                                        {errors.altura && <FieldError>{errors.altura}</FieldError>}
                                    </Field>

                                    <Field>
                                        <FieldLabel htmlFor="imc">IMC (calculado automáticamente)</FieldLabel>
                                        <Input
                                            id="imc"
                                            type="text"
                                            value={imc}
                                            readOnly
                                            placeholder="Se calculará automáticamente"
                                            className="bg-gray-50"
                                        />
                                        {imc && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {parseFloat(imc) < 18.5 && 'Bajo peso'}
                                                {parseFloat(imc) >= 18.5 && parseFloat(imc) < 25 && 'Peso normal'}
                                                {parseFloat(imc) >= 25 && parseFloat(imc) < 30 && 'Sobrepeso'}
                                                {parseFloat(imc) >= 30 && 'Obesidad'}
                                            </p>
                                        )}
                                    </Field>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Field>
                                        <FieldLabel htmlFor="cintura">
                                            Cintura (cm) <span className="text-red-500">*</span>
                                        </FieldLabel>
                                        <Input
                                            id="cintura"
                                            type="number"
                                            step="0.1"
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
                                            step="0.1"
                                            value={data.brazo}
                                            onChange={(e) => setData('brazo', e.target.value)}
                                            placeholder="Ej: 30"
                                        />
                                        {errors.brazo && <FieldError>{errors.brazo}</FieldError>}
                                    </Field>
                                </div>
                            </CardContent>
                        </Card>

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
                                        rows={3}
                                    />
                                    {errors.antecedentes_alimentarios && (
                                        <FieldError>{errors.antecedentes_alimentarios}</FieldError>
                                    )}
                                </Field>

                                <Field>
                                    <FieldLabel htmlFor="ingesta_calorica_estimada">
                                        Ingesta Calórica Estimada (kcal/día) <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Input
                                        id="ingesta_calorica_estimada"
                                        type="number"
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
                                        placeholder="Ingrese las recomendaciones nutricionales"
                                        rows={4}
                                    />
                                    {errors.recomendaciones && <FieldError>{errors.recomendaciones}</FieldError>}
                                </Field>
                            </CardContent>
                        </Card>
                    </>
                );

            case 'cardiologo':
            case 'psicologo':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de Atención</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Los campos específicos para {rol_profesional} están en desarrollo. Por favor,
                                    utilice el campo de observaciones para registrar la información de la consulta.
                                </AlertDescription>
                            </Alert>
                            <Field className="mt-4">
                                <FieldLabel htmlFor="observaciones">
                                    Observaciones <span className="text-red-500">*</span>
                                </FieldLabel>
                                <Textarea
                                    id="observaciones"
                                    value={data.observaciones}
                                    onChange={(e) => setData('observaciones', e.target.value)}
                                    placeholder="Registre la información de la consulta"
                                    rows={8}
                                />
                                {errors.observaciones && <FieldError>{errors.observaciones}</FieldError>}
                            </Field>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <Head title="Registrar Atención" />

            <div className="space-y-6 pb-8">
                {/* Información del Paciente */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Datos del Paciente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Nombre completo</p>
                                <p className="font-medium">
                                    {atencion.persona.nombre} {atencion.persona.apellido}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Documento</p>
                                <p className="font-medium">
                                    {atencion.persona.tipo_documento.nombre} {atencion.persona.numero_documento}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Género</p>
                                <p className="font-medium">{atencion.persona.genero.nombre}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Servicio</p>
                                <p className="font-medium">{atencion.servicio.nombre}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Profesional</p>
                                <p className="font-medium">
                                    {atencion.profesional.persona.nombre} {atencion.profesional.persona.apellido}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha y Hora</p>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{atencion.fecha}</span>
                                    <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                                    <span className="font-medium">{atencion.hora}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Campos según el rol */}
                    {renderCamposPorRol()}

                    {/* Botones */}
                    <div className="flex justify-end gap-4">
                        <Link href="/historias-clinicas/lista-espera">
                            <Button type="button" variant="outline" disabled={processing}>
                                Cancelar
                            </Button>
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing
                                ? 'Guardando...'
                                : data.derivar
                                    ? 'Guardar y Derivar'
                                    : 'Finalizar Atención'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}