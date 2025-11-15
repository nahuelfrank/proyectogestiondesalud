import { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Search, Calendar, Clock, AlertCircle, CheckCircle, User, X, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import atenciones from '@/routes/atenciones';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Atenciones', href: atenciones.index.url() },
    { title: 'Registrar Atención', href: atenciones.crear_atencion.url() },
];

interface Persona {
    id: number;
    nombre: string;
    apellido: string;
    numero_documento: string;
    tipo_documento: { nombre: string };
}

interface Profesional {
    id: number;
    persona: Persona;
    especialidad_id: number;
    disponibilidades_horarias?: Array<{
        dia_id: number;
        hora_inicio_atencion: string;
        hora_fin_atencion: string;
    }>;
}

interface EspecialidadServicio {
    especialidad_id: number;
    servicio_id: number;
    especialidad: { id: number; nombre: string };
    servicio: { id: number; nombre: string };
}

interface TipoAtencion {
    id: number;
    nombre: string;
}

interface EstadoAtencion {
    id: number;
    nombre: string;
}

interface Props {
    especialidadesServicios: EspecialidadServicio[];
    tiposAtenciones: TipoAtencion[];
    estadosAtenciones: EstadoAtencion[];
    pacientes: Persona[];
    profesionales: Profesional[];
    pacienteReciente?: Persona;
    cargaRapida?: boolean;
}

export default function AtencionCreatePage({
    especialidadesServicios,
    tiposAtenciones,
    estadosAtenciones,
    pacientes,
    profesionales,
    pacienteReciente,
    cargaRapida = false
}: Props) {
    const [busquedaDoc, setBusquedaDoc] = useState('');
    const [resultadosBusqueda, setResultadosBusqueda] = useState<Persona[]>([]);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Persona | null>(null);
    const [serviciosDisponibles, setServiciosDisponibles] = useState<Array<{ id: number; nombre: string }>>([]);
    const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<Array<{ id: number; nombre: string }>>([]);
    const [profesionalesDisponibles, setProfesionalesDisponibles] = useState<Profesional[]>([]);
    const [mostrarDialogoReciente, setMostrarDialogoReciente] = useState(false);
    const [mostrarAlertaHorario, setMostrarAlertaHorario] = useState(false);
    const [notificacion, setNotificacion] = useState<{ tipo: string; mensaje: string } | null>(null);
    const [fechaHoraActual, setFechaHoraActual] = useState({ fecha: '', hora: '' });

    console.log('Paciente Reciente:', pacienteReciente);
    console.log('Profesionales Disponibles:', profesionales);
    console.log('Pacientes:', pacientes);
    console.log('Especialidades Servicios:', especialidadesServicios);


    const { data, setData, post, errors, processing } = useForm({
        persona_id: "",
        tipo_atencion_id: "",
        servicio_id: "",
        profesional_id: "",
        fecha: "",
        hora: "",
        estado_atencion_id: estadosAtenciones.find(e => e.nombre === 'Pendiente')?.id.toString() || '',
    });

    // Capturar fecha y hora automáticamente
    useEffect(() => {
        const actualizarFechaHora = () => {
            const ahora = new Date();
            const fecha = ahora.toISOString().split('T')[0];
            const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);
            setFechaHoraActual({ fecha, hora });
            setData(prev => ({ ...prev, fecha, hora }));
        };

        actualizarFechaHora();
        const intervalo = setInterval(actualizarFechaHora, 60000); // Actualizar cada minuto

        return () => clearInterval(intervalo);
    }, []);

    // Verificar paciente reciente al cargar
    useEffect(() => {
        if (pacienteReciente && !cargaRapida) {
            setMostrarDialogoReciente(true);
        } else if (pacienteReciente && cargaRapida) {
            setPacienteSeleccionado(pacienteReciente);
            setData('persona_id', pacienteReciente.id.toString());
            setData('tipo_atencion_id', tiposAtenciones.find(t => t.nombre === 'Emergencia' || t.nombre === 'Urgencia')?.id.toString() || '');
            setNotificacion({ tipo: 'info', mensaje: 'Paciente de carga rápida asignado automáticamente' });
        }
    }, [pacienteReciente, cargaRapida]);

    // Obtener servicios únicos
    useEffect(() => {
        const serviciosUnicos = Array.from(
            new Map(especialidadesServicios.map(es => [es.servicio.id, es.servicio])).values()
        );
        setServiciosDisponibles(serviciosUnicos);
    }, [especialidadesServicios]);

    const buscarPaciente = () => {
        if (busquedaDoc.length > 0) {
            const resultados = pacientes.filter(p =>
                p.numero_documento.includes(busquedaDoc)
            );
            setResultadosBusqueda(resultados);
        }
    };

    const seleccionarPaciente = (paciente: Persona) => {
        setPacienteSeleccionado(paciente);
        setData('persona_id', paciente.id.toString());
        setResultadosBusqueda([]);
        setBusquedaDoc('');

        if (cargaRapida) {
            setData('tipo_atencion_id', tiposAtenciones.find(t => t.nombre === 'Emergencia' || t.nombre === 'Urgencia')?.id.toString() || '');
        }
    };

    const asignarPacienteReciente = () => {
        if (pacienteReciente) {
            seleccionarPaciente(pacienteReciente);
        }
        setMostrarDialogoReciente(false);
    };

    const handleServicioChange = (servicioId: string) => {
        setData('servicio_id', servicioId);
        setData('profesional_id', '');

        // Filtrar especialidades compatibles con el servicio
        const especialidadesCompatibles = especialidadesServicios
            .filter(es => es.servicio_id === parseInt(servicioId))
            .map(es => es.especialidad);

        const especialidadesUnicas = Array.from(
            new Map(especialidadesCompatibles.map(e => [e.id, e])).values()
        );

        setEspecialidadesDisponibles(especialidadesUnicas);
    };

    const handleEspecialidadChange = (especialidadId: string) => {
        setData('profesional_id', '');

        // Validar compatibilidad entre especialidad y servicio
        const esCompatible = especialidadesServicios.some(
            es => es.especialidad_id === parseInt(especialidadId) &&
                es.servicio_id === parseInt(data.servicio_id)
        );

        if (!esCompatible) {
            setNotificacion({ tipo: 'error', mensaje: 'La especialidad seleccionada no es compatible con el servicio.' });
            return;
        }

        // Filtrar profesionales por especialidad
        const profesionalesFiltrados = profesionales.filter(
            p => p.especialidad_id === parseInt(especialidadId)
        );

        setProfesionalesDisponibles(profesionalesFiltrados);
    };

    const validarDisponibilidad = () => {
        if (!data.fecha || !data.hora || !data.profesional_id) return true;

        const fecha = new Date(data.fecha);
        const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();

        const profesional = profesionalesDisponibles.find(
            p => p.id === parseInt(data.profesional_id)
        );

        if (!profesional?.disponibilidades_horarias) return true;

        const disponibilidad = profesional.disponibilidades_horarias.some(d => {
            if (d.dia_id !== diaSemana) return false;

            const horaSeleccionada = data.hora;
            const horaInicio = d.hora_inicio_atencion.substring(0, 5);
            const horaFin = d.hora_fin_atencion.substring(0, 5);

            return horaSeleccionada >= horaInicio && horaSeleccionada < horaFin;
        });

        return disponibilidad;
    };

    // Validar horario cuando cambie el profesional
    useEffect(() => {
        if (data.profesional_id && data.fecha && data.hora) {
            const dentroDisponibilidad = validarDisponibilidad();
            if (!dentroDisponibilidad) {
                setMostrarAlertaHorario(true);
            }
        }
    }, [data.profesional_id]);

    const registrarAtencion = () => {
        if (!pacienteSeleccionado || !data.tipo_atencion_id || !data.servicio_id || !data.profesional_id || !data.fecha || !data.hora) {
            setNotificacion({ tipo: 'error', mensaje: 'Por favor complete todos los campos requeridos' });
            return;
        }

        const dentroDisponibilidad = validarDisponibilidad();

        if (!dentroDisponibilidad) {
            setMostrarAlertaHorario(true);
            return;
        }

        post(atenciones.store.url(), {
            onSuccess: () => {
                setNotificacion({ tipo: 'success', mensaje: 'Atención registrada exitosamente' });
            },
            onError: () => {
                setNotificacion({ tipo: 'error', mensaje: 'Error al registrar la atención' });
            }
        });
    };

    const confirmarRegistroFueraHorario = () => {
        setMostrarAlertaHorario(false);
        post(atenciones.store.url(), {
            onSuccess: () => {
                setNotificacion({ tipo: 'success', mensaje: 'Atención registrada exitosamente' });
            },
            onError: () => {
                setNotificacion({ tipo: 'error', mensaje: 'Error al registrar la atención' });
            }
        });
    };

    const tiposAtencionPermitidos = cargaRapida
        ? tiposAtenciones.filter(t => t.nombre === 'Emergencia' || t.nombre === 'Urgencia')
        : tiposAtenciones;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registrar Atención" />


            <div className="container mx-auto py-10">

                <div className="ml-5 mb-4">
                    <h1 className="text-3xl font-semibold mb-2">Registrar Nuevo Atención</h1>

                    <p className="text-muted-foreground mb-4">Complete el siguiente formulario para registrar una nueva atención
                        en el sistema. Los campos con <span className="text-red-500">*</span> son obligatorios</p>

                    <Link
                        href={atenciones.index.url()}
                        className="inline-block "
                    >
                        <Button
                            className="flex items-center gap-2 mr-2"
                        >
                            <Undo2 className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>

                </div>

                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    {/* Notificaciones */}
                    {notificacion && (
                        <Alert variant={notificacion.tipo === 'error' ? 'destructive' : 'default'}>
                            {notificacion.tipo === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            <AlertTitle>
                                {notificacion.tipo === 'success' ? 'Éxito' : notificacion.tipo === 'error' ? 'Error' : 'Información'}
                            </AlertTitle>
                            <AlertDescription>{notificacion.mensaje}</AlertDescription>
                        </Alert>
                    )}

                    {/* Diálogo paciente reciente */}
                    <AlertDialog open={mostrarDialogoReciente} onOpenChange={setMostrarDialogoReciente}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Paciente Registrado Recientemente</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {pacienteReciente && (
                                        <div className="mt-2 space-y-1">
                                            <p className="font-semibold text-foreground">
                                                {pacienteReciente.nombre} {pacienteReciente.apellido}
                                            </p>
                                            <p>{pacienteReciente.tipo_documento.nombre}: {pacienteReciente.numero_documento}</p>
                                            <p className="mt-3">¿Desea asignarle una atención a este paciente?</p>
                                        </div>
                                    )}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Buscar Otro Paciente</AlertDialogCancel>
                                <AlertDialogAction onClick={asignarPacienteReciente}>
                                    Asignar Atención
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Alerta fuera de horario */}
                    <AlertDialog open={mostrarAlertaHorario} onOpenChange={setMostrarAlertaHorario}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="flex items-center gap-2">
                                    <AlertCircle className="h-5 w-5 text-orange-500" />
                                    Fuera del Horario de Atención
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    La fecha y hora seleccionadas están fuera de la disponibilidad horaria del profesional.
                                    ¿Desea continuar de todos modos?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmarRegistroFueraHorario}>
                                    Continuar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    {/* Contenido Principal */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Registrar Atención (Turno)</CardTitle>
                            <CardDescription>Complete los datos para registrar una nueva atención</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Buscar Paciente */}
                            {!pacienteSeleccionado && !mostrarDialogoReciente && (
                                <div className="space-y-2">
                                    <Label htmlFor="busqueda">Buscar Paciente por Documento</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="busqueda"
                                                type="text"
                                                value={busquedaDoc}
                                                onChange={(e) => setBusquedaDoc(e.target.value)}
                                                placeholder="Ingrese número de documento"
                                                className="pl-9"
                                                onKeyDown={(e) => e.key === 'Enter' && buscarPaciente()}
                                            />
                                        </div>
                                        <Button onClick={buscarPaciente}>Buscar</Button>
                                    </div>

                                    {resultadosBusqueda.length > 0 && (
                                        <Card>
                                            <CardContent className="p-0">
                                                {resultadosBusqueda.map(paciente => (
                                                    <button
                                                        key={paciente.id}
                                                        onClick={() => seleccionarPaciente(paciente)}
                                                        className="w-full border-b p-4 text-left transition-colors hover:bg-muted last:border-b-0"
                                                    >
                                                        <div className="font-semibold">
                                                            {paciente.nombre} {paciente.apellido}
                                                        </div>
                                                        <div className="text-sm text-muted-foreground">
                                                            {paciente.tipo_documento.nombre}: {paciente.numero_documento}
                                                        </div>
                                                    </button>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    {errors.persona_id && (
                                        <p className="text-sm text-red-500">{errors.persona_id}</p>
                                    )}
                                </div>
                            )}

                            {/* Datos del Paciente Seleccionado */}
                            {pacienteSeleccionado && (
                                <Alert>
                                    <User className="h-4 w-4" />
                                    <AlertTitle className="flex items-center justify-between">
                                        Paciente Seleccionado
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setPacienteSeleccionado(null);
                                                setData('persona_id', '');
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </AlertTitle>
                                    <AlertDescription>
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="text-muted-foreground">Nombre:</span>
                                                <span className="ml-2 font-semibold">
                                                    {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground">Tipo de Documento:</span>
                                                <span className="ml-2 font-semibold">
                                                    {pacienteSeleccionado.tipo_documento.nombre}
                                                </span>
                                                <span className="ml-2 text-muted-foreground">Documento:</span>
                                                <span className="ml-2 font-semibold">
                                                    {pacienteSeleccionado.numero_documento}
                                                </span>
                                            </div>
                                        </div>
                                        {cargaRapida && (
                                            <Badge variant="secondary" className="mt-2">Carga Rápida</Badge>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Formulario de Atención */}
                            {pacienteSeleccionado && (
                                <div className="space-y-4">
                                    {/* Tipo de Atención */}
                                    <div className="space-y-2">
                                        <Label htmlFor="tipo-atencion">Tipo de Atención *</Label>
                                        <Select
                                            value={data.tipo_atencion_id}
                                            onValueChange={(value) => setData('tipo_atencion_id', value)}
                                            disabled={cargaRapida}
                                        >
                                            <SelectTrigger id="tipo-atencion">
                                                <SelectValue placeholder="Seleccione tipo de atención" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tiposAtencionPermitidos.map(tipo => (
                                                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                                        {tipo.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.tipo_atencion_id && (
                                            <p className="text-sm text-red-500">{errors.tipo_atencion_id}</p>
                                        )}
                                    </div>

                                    {/* Servicio */}
                                    <div className="space-y-2">
                                        <Label htmlFor="servicio">Servicio *</Label>
                                        <Select value={data.servicio_id} onValueChange={handleServicioChange}>
                                            <SelectTrigger id="servicio">
                                                <SelectValue placeholder="Seleccione servicio" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {serviciosDisponibles.map(serv => (
                                                    <SelectItem key={serv.id} value={serv.id.toString()}>
                                                        {serv.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.servicio_id && (
                                            <p className="text-sm text-red-500">{errors.servicio_id}</p>
                                        )}
                                    </div>

                                    {/* Especialidad */}
                                    {data.servicio_id && (
                                        <div className="space-y-2">
                                            <Label htmlFor="especialidad">Especialidad *</Label>
                                            <Select
                                                value={profesionalesDisponibles.find(p => p.id === parseInt(data.profesional_id))?.especialidad_id.toString() || ''}
                                                onValueChange={handleEspecialidadChange}
                                            >
                                                <SelectTrigger id="especialidad">
                                                    <SelectValue placeholder="Seleccione especialidad" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {especialidadesDisponibles.map(esp => (
                                                        <SelectItem key={esp.id} value={esp.id.toString()}>
                                                            {esp.nombre}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    {/* Profesional */}
                                    {profesionalesDisponibles.length > 0 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="profesional">Profesional *</Label>
                                            <Select
                                                value={data.profesional_id}
                                                onValueChange={(value) => setData('profesional_id', value)}
                                            >
                                                <SelectTrigger id="profesional">
                                                    <SelectValue placeholder="Seleccione profesional" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {profesionalesDisponibles.map(prof => (
                                                        <SelectItem key={prof.id} value={prof.id.toString()}>
                                                            {prof.persona.nombre} {prof.persona.apellido}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.profesional_id && (
                                                <p className="text-sm text-red-500">{errors.profesional_id}</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Fecha y Hora (Automáticas) */}
                                    {data.profesional_id && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="fecha" className="flex items-center gap-2">
                                                    <Calendar className="h-4 w-4" />
                                                    Fecha *
                                                </Label>
                                                <Input
                                                    id="fecha"
                                                    type="date"
                                                    value={fechaHoraActual.fecha}
                                                    readOnly
                                                    className="bg-muted"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hora" className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Hora *
                                                </Label>
                                                <Input
                                                    id="hora"
                                                    type="time"
                                                    value={fechaHoraActual.hora}
                                                    readOnly
                                                    className="bg-muted"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Botones de Acción */}
                                    <div className="flex justify-end gap-2 border-t pt-4">
                                        <Link href={atenciones.index.url()}>
                                            <Button variant="outline">
                                                Cancelar
                                            </Button>
                                        </Link>
                                        <Button onClick={registrarAtencion} disabled={processing}>
                                            {processing ? 'Registrando...' : 'Registrar Atención'}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </AppLayout>
    );
}