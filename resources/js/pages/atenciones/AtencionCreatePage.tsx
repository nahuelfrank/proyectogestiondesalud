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
import atenciones from '@/routes/atenciones';
import { useDebounce } from "@/hooks/use-debounce";
import { useAlert } from '@/components/alert-provider';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Atenciones', href: atenciones.index.url() },
    { title: 'Registrar Atención', href: atenciones.crear_atencion.url() },
];

interface TipoDocumento { id: number; nombre: string; }
interface Persona {
    id: number;
    nombre: string;
    apellido: string;
    numero_documento: string;
    tipo_documento: TipoDocumento;
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
interface TipoAtencion { id: number; nombre: string; }
interface EstadoAtencion { id: number; nombre: string; }
interface PacienteCargaRapida {
    nombre: string;
    apellido: string;
    tipo_documento_id: number;
    numero_documento: string;
}

interface Props {
    especialidadesServicios: EspecialidadServicio[];
    tiposAtenciones: TipoAtencion[];
    estadosAtenciones: EstadoAtencion[];
    pacientes: Persona[];
    profesionales: Profesional[];
    pacienteReciente?: Persona;
    pacienteCargaRapida?: PacienteCargaRapida;
}

const variants = {
    success: 'success',
    error: 'destructive',
    warning: 'warning',
    info: 'info'
} as const;

const icons = {
    success: <CheckCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    info: <AlertCircle className="h-4 w-4" />,
};

const titles = {
    success: 'Éxito',
    error: 'Error',
    warning: 'Advertencia',
    info: 'Información'
};

export default function AtencionCreatePage({
    especialidadesServicios,
    tiposAtenciones,
    pacientes,
    profesionales,
    pacienteReciente,
    pacienteCargaRapida
}: Props) {
    const { confirm } = useAlert();

    const [busquedaDoc, setBusquedaDoc] = useState('');
    const debouncedBusquedaDoc = useDebounce(busquedaDoc, 500);
    const [resultadosBusqueda, setResultadosBusqueda] = useState<Persona[]>([]);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Persona | null>(null);
    const [esCargaRapida, setEsCargaRapida] = useState(false);
    const [serviciosDisponibles, setServiciosDisponibles] = useState<Array<{ id: number; nombre: string }>>([]);
    const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<Array<{ id: number; nombre: string }>>([]);
    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState<string>('');
    const [profesionalesDisponibles, setProfesionalesDisponibles] = useState<Profesional[]>([]);
    const [notificacion, setNotificacion] = useState<{ tipo: keyof typeof variants; mensaje: string } | null>(null);
    const [fechaHoraActual, setFechaHoraActual] = useState({ fecha: '', hora: '' });
    const [permitirFueraHorario, setPermitirFueraHorario] = useState(false);

    const { data, setData, post, errors, processing } = useForm({
        fecha: "",
        hora: "",
        servicio_id: "",
        estado_atencion_id: "1",
        tipo_atencion_id: "",
        persona_id: "",
        profesional_id: "",
        diagnostico_principal: "A definir",
        motivo_de_consulta: "A definir",
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
        const intervalo = setInterval(actualizarFechaHora, 60000);
        return () => clearInterval(intervalo);
    }, []);

    // Procesar paciente de carga rápida o paciente reciente al cargar
    useEffect(() => {
        if (pacienteCargaRapida) {
            const pacienteEncontrado = pacientes.find(p =>
                p.numero_documento === pacienteCargaRapida.numero_documento &&
                p.tipo_documento.id === Number(pacienteCargaRapida.tipo_documento_id)
            );

            if (pacienteEncontrado) {
                setPacienteSeleccionado(pacienteEncontrado);
                setEsCargaRapida(true);
                setData('persona_id', pacienteEncontrado.id.toString());

                const tipoEmergenciaUrgencia = tiposAtenciones.find(t =>
                    t.nombre.toLowerCase().includes('emergencia') ||
                    t.nombre.toLowerCase().includes('urgencia')
                );

                if (tipoEmergenciaUrgencia) {
                    setData('tipo_atencion_id', tipoEmergenciaUrgencia.id.toString());
                }

                setNotificacion({
                    tipo: 'info',
                    mensaje: 'Paciente de carga rápida asignado automáticamente. Complete los datos de atención.'
                });
            } else {
                setNotificacion({
                    tipo: 'error',
                    mensaje: 'No se encontró el paciente de carga rápida en el sistema.'
                });
            }
        } else if (pacienteReciente) {
            // Mostrar confirm usando AlertProvider
            (async () => {
                const ok = await confirm({
                    title: "Paciente Registrado Recientemente",
                    description: `${pacienteReciente.nombre} ${pacienteReciente.apellido} (${pacienteReciente.tipo_documento.nombre}: ${pacienteReciente.numero_documento})\n\n¿Desea asignarle una atención a este paciente?`,
                    okText: "Asignar Atención",
                    cancelText: "Buscar Otro Paciente",
                    icon: "info",
                });

                if (ok) {
                    seleccionarPaciente(pacienteReciente);
                }
            })();
        }
    }, [pacienteCargaRapida, pacienteReciente]);

    // Obtener servicios únicos
    useEffect(() => {
        const serviciosUnicos = Array.from(
            new Map(especialidadesServicios.map(es => [es.servicio.id, es.servicio])).values()
        );
        setServiciosDisponibles(serviciosUnicos);
    }, [especialidadesServicios]);

    // Buscar paciente por documento (debounced)
    useEffect(() => {
        if (debouncedBusquedaDoc.trim() === "") {
            setResultadosBusqueda([]);
            return;
        }

        const resultados = pacientes.filter(p =>
            p.numero_documento.includes(debouncedBusquedaDoc)
        );

        setResultadosBusqueda(resultados);
    }, [debouncedBusquedaDoc]);

    const seleccionarPaciente = (paciente: Persona) => {
        setPacienteSeleccionado(paciente);
        setData('persona_id', paciente.id.toString());
        setResultadosBusqueda([]);
        setBusquedaDoc('');
        setEsCargaRapida(false);
        setNotificacion(null);
    };

    const asignarPacienteReciente = () => {
        if (pacienteReciente) {
            seleccionarPaciente(pacienteReciente);
        }
    };

    const handleServicioChange = (servicioId: string) => {
        setData('servicio_id', servicioId);
        setData('profesional_id', '');
        setEspecialidadSeleccionada('');
        setPermitirFueraHorario(false); // reset flag cuando cambia servicio

        const especialidadesCompatibles = especialidadesServicios
            .filter(es => es.servicio_id === parseInt(servicioId))
            .map(es => es.especialidad);

        const especialidadesUnicas = Array.from(
            new Map(especialidadesCompatibles.map(e => [e.id, e])).values()
        );

        setEspecialidadesDisponibles(especialidadesUnicas);

        // ---- Si solo hay 1 especialidad disponible ----
        if (especialidadesUnicas.length === 1) {
            const especialidadUnica = especialidadesUnicas[0];
            setEspecialidadSeleccionada(especialidadUnica.id.toString());

            const profesionalesFiltrados = profesionales.filter(
                p => p.especialidad_id === especialidadUnica.id
            );

            setProfesionalesDisponibles(profesionalesFiltrados);

            // === NOTIFICACIÓN SI NO HAY PROFESIONALES ===
            if (profesionalesFiltrados.length === 0) {
                setNotificacion({
                    tipo: "error",
                    mensaje: "No se encontraron profesionales disponibles para este servicio."
                });
            } else {
                setNotificacion(null); // Limpia la notificación si ahora sí hay profesionales
            }

        } else {
            // Varias especialidades → limpiar profesionales
            setProfesionalesDisponibles([]);
            setNotificacion(null);
        }
    };

    const validarDisponibilidad = () => {
        if (!data.fecha || !data.hora || !data.profesional_id) return true;

        const [y, m, d] = data.fecha.split("-").map(Number);
        const fechaJS = new Date(y, m - 1, d);

        let diaSemana = fechaJS.getDay();
        diaSemana = diaSemana === 0 ? 7 : diaSemana;

        const profesional = profesionales.find(
            p => p.id === parseInt(data.profesional_id)
        );

        console.log("dispo horarias:", profesional?.disponibilidades_horarias);

        if (!profesional?.disponibilidades_horarias) return true;

        return profesional.disponibilidades_horarias.some(d => {
            if (d.dia_id !== diaSemana) return false;

            const horaSeleccionada = data.hora;
            const horaInicio = d.hora_inicio_atencion.substring(0, 5);
            const horaFin = d.hora_fin_atencion.substring(0, 5);

            return horaSeleccionada >= horaInicio && horaSeleccionada < horaFin;
        });
    };


    // Valida que un profesional no pueda atenderse a si mismo
    useEffect(() => {
        if (!pacienteSeleccionado || !data.profesional_id) return;

        const profesional = profesionales.find(
            p => p.id === parseInt(data.profesional_id)
        );

        if (profesional?.persona?.id === pacienteSeleccionado.id) {
            setNotificacion({
                tipo: "error",
                mensaje: "El profesional no puede atenderse a sí mismo."
            });
            setData("profesional_id", "");
        }
    }, [data.profesional_id]);


    // Cuando se selecciona profesional — verificar disponibilidad y pedir confirmación inmediata si está fuera
    useEffect(() => {
        const checkAndPrompt = async () => {

            if (!data.profesional_id || !data.fecha || !data.hora) return;

            const profesional = profesionales.find(
                p => p.id === parseInt(data.profesional_id)
            );

            if (profesional?.persona?.id === pacienteSeleccionado.id) return;

            const dentro = validarDisponibilidad();

            if (!dentro) {
                const ok = await confirm({
                    title: "Fuera del Horario de Atención",
                    description:
                        "La fecha y hora seleccionadas están fuera de la disponibilidad horaria del profesional. ¿Desea continuar de todos modos?",
                    okText: "Continuar",
                    cancelText: "Cancelar",
                    icon: "warning",
                });

                if (!ok) {
                    setData("profesional_id", "");
                    setPermitirFueraHorario(false);
                    return;
                }

                // Solo marca que se permite fuera de horario
                setPermitirFueraHorario(true);
            } else {
                setPermitirFueraHorario(false);
            }
        };

        checkAndPrompt();
    }, [data.profesional_id]);

    const tiposAtencionPermitidos = esCargaRapida
        ? tiposAtenciones.filter(t =>
            t.nombre.toLowerCase().includes('emergencia') ||
            t.nombre.toLowerCase().includes('urgencia')
        )
        : tiposAtenciones;

    const registrarAtencion = async () => {
        if (!pacienteSeleccionado || !data.tipo_atencion_id || !data.servicio_id ||
            !data.profesional_id || !data.fecha || !data.hora) {

            setNotificacion({
                tipo: 'error',
                mensaje: 'Por favor complete todos los campos requeridos.'
            });
            return;
        }

        const dentroDisponibilidad = validarDisponibilidad();

        // Si está fuera de horario y aún NO lo permitimos, pedir confirmación aquí
        if (!dentroDisponibilidad && !permitirFueraHorario) {
            const ok = await confirm({
                title: "Fuera del Horario de Atención",
                description:
                    "La fecha y hora seleccionadas están fuera de la disponibilidad horaria del profesional. ¿Desea continuar de todos modos?",
                okText: "Continuar",
                cancelText: "Cancelar",
                icon: "warning",
            });

            if (!ok) return;
            setPermitirFueraHorario(true);
        }

        post(atenciones.guardar_atencion.url(), {
            onSuccess: () => {
                setNotificacion({
                    tipo: 'success',
                    mensaje: 'Atención registrada exitosamente'
                });
                setTimeout(() => {
                    window.location.href = atenciones.index.url();
                }, 1500);
            },
            onError: () => {
                setNotificacion({
                    tipo: 'error',
                    mensaje: 'Error al registrar la atención'
                });
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registrar Atención" />

            <div className="container mx-auto py-10">
                <div className="ml-5 mb-4">
                    <h1 className="text-3xl font-semibold mb-2">Registrar Nueva Atención</h1>

                    <p className="text-muted-foreground mb-4">
                        Complete el siguiente formulario para registrar una nueva atención
                        en el sistema. Los campos con <span className="text-red-500">*</span> son obligatorios.
                    </p>

                    <Link href={atenciones.index.url()} className="inline-block">
                        <Button className="flex items-center gap-2">
                            <Undo2 className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                    {/* Notificaciones */}
                    {notificacion && (
                        <Alert variant={variants[notificacion.tipo]} className="mb-4 pr-8">
                            {icons[notificacion.tipo]}
                            <AlertTitle>{titles[notificacion.tipo]}</AlertTitle>
                            <AlertDescription>{notificacion.mensaje}</AlertDescription>
                        </Alert>
                    )}

                    {/* Contenido Principal */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Registrar Atención</CardTitle>
                            <CardDescription>Complete los datos para registrar una nueva atención</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Buscar Paciente */}
                            {!pacienteSeleccionado && (
                                <div className="space-y-2">
                                    <Label htmlFor="busqueda">Buscar Paciente por Documento</Label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="busqueda"
                                                type="text"
                                                value={busquedaDoc}
                                                onChange={(e) => setBusquedaDoc(e.target.value.trim())}
                                                placeholder="Ingrese número de documento"
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    {busquedaDoc.trim() !== "" ? (
                                        resultadosBusqueda.length > 0 ? (
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
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No se encontraron pacientes con ese número de documento
                                            </p>
                                        )
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            Ingrese un número de documento para buscar un paciente
                                        </p>
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
                                                setEsCargaRapida(false);
                                                setNotificacion(null);
                                                setData('persona_id', '');
                                                setData('tipo_atencion_id', '');
                                                setPermitirFueraHorario(false);
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
                                                <span className="ml-3 text-muted-foreground">Documento:</span>
                                                <span className="ml-2 font-semibold">
                                                    {pacienteSeleccionado.numero_documento}
                                                </span>
                                            </div>
                                        </div>
                                        {esCargaRapida && (
                                            <Badge variant="secondary" className="mt-2">
                                                Carga Rápida - Emergencia/Urgencia
                                            </Badge>
                                        )}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Formulario de Atención */}
                            {pacienteSeleccionado && (
                                <div className="space-y-4">
                                    {/* Tipo de Atención */}
                                    <div className="space-y-2">
                                        <Label htmlFor="tipo-atencion">
                                            Tipo de Atención <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.tipo_atencion_id}
                                            onValueChange={(value) => setData('tipo_atencion_id', value)}
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
                                        {esCargaRapida && (
                                            <p className="text-xs text-muted-foreground">
                                                El tipo de atención está preseleccionado para pacientes de carga rápida
                                            </p>
                                        )}
                                        {errors.tipo_atencion_id && (
                                            <p className="text-sm text-red-500">{errors.tipo_atencion_id}</p>
                                        )}
                                    </div>

                                    {/* Servicio */}
                                    <div className="space-y-2">
                                        <Label htmlFor="servicio">Servicio <span className="text-red-500">*</span></Label>
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

                                    {/* Profesional */}
                                    {profesionalesDisponibles.length > 0 && (
                                        <div className="space-y-2">
                                            <Label htmlFor="profesional">Profesional <span className="text-red-500">*</span></Label>
                                            <Select
                                                value={data.profesional_id}
                                                onValueChange={(value) => {
                                                    setData('profesional_id', value);
                                                    setPermitirFueraHorario(false); // reset flag al cambiar profesional
                                                }}
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
                                                    Fecha <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="fecha"
                                                    type="date"
                                                    value={fechaHoraActual.fecha}
                                                    readOnly
                                                    className="bg-muted"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Capturada automáticamente
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hora" className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4" />
                                                    Hora <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="hora"
                                                    type="time"
                                                    value={fechaHoraActual.hora}
                                                    readOnly
                                                    className="bg-muted"
                                                />
                                                <p className="text-xs text-muted-foreground">
                                                    Capturada automáticamente
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Botones de Acción */}
                                    <div className="flex justify-end gap-2 border-t pt-4">
                                        <Button onClick={registrarAtencion} disabled={processing}>
                                            {processing ? 'Registrando...' : 'Registrar Atención'}
                                        </Button>
                                        <Link href={atenciones.index.url()}>
                                            <Button variant="outline">
                                                Cancelar
                                            </Button>
                                        </Link>
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
