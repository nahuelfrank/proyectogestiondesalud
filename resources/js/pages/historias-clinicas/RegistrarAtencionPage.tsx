import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, User, Plus, Trash2, UserCheck, CheckCircle, XCircle } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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

interface Atributo {
    id: number;
    nombre: string;
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
    atributos: Atributo[];
    servicios: Servicio[];
}

interface AtributoClinico {
    atributo_id: string;
    valor: string;
}

export default function RegistrarAtencionPage({
    atencion,
    atributos,
    servicios,
}: RegistrarAtencionPageProps) {
    const [atributosClinicosGrid, setAtributosClinicosGrid] = useState<AtributoClinico[]>([]);
    const [profesionales, setProfesionales] = useState<Profesional[]>([]);
    const [profesionalSeleccionado, setProfesionalSeleccionado] = useState<Profesional | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        motivo_consulta: '',
        prestacion_enfermeria: '',
        observaciones: '',
        atributos: [] as { atributo_id: number; valor: string }[],
        derivar: false,
        derivacion: {
            servicio_id: '',
            profesional_id: '',
        },
    });

    const agregarAtributo = () => {
        setAtributosClinicosGrid([...atributosClinicosGrid, { atributo_id: '', valor: '' }]);
    };

    const eliminarAtributo = (index: number) => {
        const nuevosAtributos = atributosClinicosGrid.filter((_, i) => i !== index);
        setAtributosClinicosGrid(nuevosAtributos);
    };

    const actualizarAtributo = (index: number, campo: 'atributo_id' | 'valor', valor: string) => {
        const nuevosAtributos = [...atributosClinicosGrid];
        nuevosAtributos[index][campo] = valor;
        setAtributosClinicosGrid(nuevosAtributos);
    };

    const validarAtributosUnicos = (): boolean => {
        const atributosIds = atributosClinicosGrid.map((a) => a.atributo_id).filter((id) => id !== '');
        const idsUnicos = new Set(atributosIds);
        return atributosIds.length === idsUnicos.size;
    };

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

        if (!validarAtributosUnicos()) {
            alert('No puedes agregar el mismo atributo más de una vez.');
            return;
        }

        // Convertir atributos de la grilla a formato esperado
        const atributosFormateados = atributosClinicosGrid
            .filter((a) => a.atributo_id !== '' && a.valor !== '')
            .map((a) => ({
                atributo_id: parseInt(a.atributo_id),
                valor: a.valor,
            }));

        setData('atributos', atributosFormateados);

        post(`/historias-clinicas/${atencion.id}/guardar`, {
            onSuccess: () => {
                // Redireccionará automáticamente
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

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Historia Clínica', href: '#' },
                { title: 'Lista de Espera', href: '/historias-clinicas/lista-espera' },
                { title: 'Registrar Atención', href: '#' },
            ]}
        >
            <Head title="Registrar Atención" />

            <div className="container mx-auto py-10">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Registrar Atención</h1>
                    <p className="text-muted-foreground">Complete los datos de la atención médica</p>
                </div>

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
                                    <p className="text-sm text-muted-foreground">Género</p>
                                    <p className="text-lg font-semibold">{atencion.persona.genero.nombre}</p>
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

                    {/* Atributos Clínicos */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Atributos Clínicos</CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Agregue los signos vitales y mediciones necesarias
                                </p>
                            </div>
                            <Button type="button" variant="outline" onClick={agregarAtributo}>
                                <Plus className="h-4 w-4 mr-2" />
                                Agregar Atributo
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {atributosClinicosGrid.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    No hay atributos agregados. Haz clic en "Agregar Atributo" para comenzar.
                                </p>
                            ) : (
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Atributo</TableHead>
                                                <TableHead>Valor</TableHead>
                                                <TableHead className="text-right">Acciones</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {atributosClinicosGrid.map((atributo, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>
                                                        <Select
                                                            value={atributo.atributo_id}
                                                            onValueChange={(value) =>
                                                                actualizarAtributo(index, 'atributo_id', value)
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Seleccionar atributo" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {atributos.map((attr) => (
                                                                    <SelectItem key={attr.id} value={String(attr.id)}>
                                                                        {attr.nombre}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            value={atributo.valor}
                                                            onChange={(e) =>
                                                                actualizarAtributo(index, 'valor', e.target.value)
                                                            }
                                                            placeholder="Ingrese el valor"
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => eliminarAtributo(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
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
                                        onCheckedChange={(checked) => setData('derivar', checked)}
                                    />
                                    <Label htmlFor="derivar">Derivar atención</Label>
                                </div>
                            </div>
                        </CardHeader>

                        {data.derivar && (
                            <CardContent className="space-y-4">
                                <Field>
                                    <FieldLabel>
                                        Servicio de Destino <span className="text-red-500">*</span>
                                    </FieldLabel>
                                    <Select
                                        value={data.derivacion.servicio_id}
                                        onValueChange={(value) =>
                                            setData('derivacion', { ...data.derivacion, servicio_id: value })
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

                                {data.derivacion.servicio_id && (
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
                                                            {profesional.nombre_completo} - {profesional.especialidad}
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
                                                        <span className="text-sm text-green-700">
                                                            Disponible en este momento
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="h-4 w-4 text-red-500" />
                                                        <span className="text-sm text-red-700">
                                                            No disponible fuera de horario
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </CardContent>
                        )}
                    </Card>

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