import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Search, Calendar as CalendarIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import atenciones from '@/routes/atenciones';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Atenciones',
        href: atenciones.index.url(),
    },
    { 
        title: 'Registrar Atención',
        href: atenciones.crear_atencion.url(),
    },
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
    const [busquedaDocumento, setBusquedaDocumento] = useState('');
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState<Persona | null>(null);
    const [serviciosDisponibles, setServiciosDisponibles] = useState<Array<{ id: number; nombre: string }>>([]);
    const [especialidadesDisponibles, setEspecialidadesDisponibles] = useState<Array<{ id: number; nombre: string }>>([]);
    const [profesionalesDisponibles, setProfesionalesDisponibles] = useState<Profesional[]>([]);
    const [mostrarAlertaPacienteReciente, setMostrarAlertaPacienteReciente] = useState(false);
    const [mostrarAlertaDisponibilidad, setMostrarAlertaDisponibilidad] = useState(false);
    const [horasDisponibles, setHorasDisponibles] = useState<string[]>([]);

    const { data, setData, post, errors, processing } = useForm({
        paciente_id: '',
        tipo_atencion_id: '',
        servicio_id: '',
        especialidad_id: '',
        profesional_id: '',
        fecha: '',
        hora: '',
        estado_atencion_id: estadosAtenciones.find(e => e.nombre === 'Pendiente')?.id.toString() || '',
    });

    // Verificar si hay un paciente reciente al cargar
    useEffect(() => {
        if (pacienteReciente && !cargaRapida) {
            setMostrarAlertaPacienteReciente(true);
        } else if (pacienteReciente && cargaRapida) {
            setPacienteSeleccionado(pacienteReciente);
            setData('paciente_id', pacienteReciente.id.toString());
        }
    }, [pacienteReciente, cargaRapida]);

    const buscarPaciente = () => {
        const paciente = pacientes.find(p => p.numero_documento === busquedaDocumento);
        if (paciente) {
            setPacienteSeleccionado(paciente);
            setData('paciente_id', paciente.id.toString());
        }
    };

    const asignarPacienteReciente = () => {
        if (pacienteReciente) {
            setPacienteSeleccionado(pacienteReciente);
            setData('paciente_id', pacienteReciente.id.toString());
        }
        setMostrarAlertaPacienteReciente(false);
    };

    const handleServicioChange = (servicioId: string) => {
        setData('servicio_id', servicioId);
        setData('especialidad_id', '');
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
        setData('especialidad_id', especialidadId);
        setData('profesional_id', '');
        
        // Validar compatibilidad entre especialidad y servicio
        const esCompatible = especialidadesServicios.some(
            es => es.especialidad_id === parseInt(especialidadId) && 
                  es.servicio_id === parseInt(data.servicio_id)
        );
        
        if (!esCompatible) {
            alert('La especialidad seleccionada no es compatible con el servicio.');
            return;
        }
        
        // Filtrar profesionales por especialidad
        const profesionalesFiltrados = profesionales.filter(
            p => p.especialidad_id === parseInt(especialidadId)
        );
        
        setProfesionalesDisponibles(profesionalesFiltrados);
    };

    const handleProfesionalChange = (profesionalId: string) => {
        setData('profesional_id', profesionalId);
        
        // Limpiar fecha y hora
        setData('fecha', '');
        setData('hora', '');
        setHorasDisponibles([]);
    };

    const handleFechaChange = (date: Date | undefined) => {
        if (!date) return;
        
        const fechaFormateada = format(date, 'yyyy-MM-dd');
        setData('fecha', fechaFormateada);
        
        // Obtener día de la semana (1-7, donde 1=Lunes)
        const diaSemana = date.getDay() === 0 ? 7 : date.getDay();
        
        // Buscar disponibilidad del profesional para ese día
        const profesional = profesionalesDisponibles.find(
            p => p.id === parseInt(data.profesional_id)
        );
        
        if (profesional?.disponibilidades_horarias) {
            const disponibilidadDia = profesional.disponibilidades_horarias.filter(
                d => d.dia_id === diaSemana
            );
            
            if (disponibilidadDia.length > 0) {
                const horas: string[] = [];
                disponibilidadDia.forEach(d => {
                    const inicio = new Date(`2000-01-01T${d.hora_inicio_atencion}`);
                    const fin = new Date(`2000-01-01T${d.hora_fin_atencion}`);
                    
                    let actual = inicio;
                    while (actual < fin) {
                        horas.push(format(actual, 'HH:mm'));
                        actual = new Date(actual.getTime() + 30 * 60000); // +30 minutos
                    }
                });
                setHorasDisponibles(horas);
            } else {
                setHorasDisponibles([]);
            }
        }
    };

    const validarDisponibilidad = () => {
        if (!data.fecha || !data.hora || !data.profesional_id) return true;
        
        const fecha = new Date(data.fecha);
        const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();
        
        const profesional = profesionalesDisponibles.find(
            p => p.id === parseInt(data.profesional_id)
        );
        
        if (!profesional?.disponibilidades_horarias) return false;
        
        const disponibilidad = profesional.disponibilidades_horarias.some(d => {
            if (d.dia_id !== diaSemana) return false;
            
            const horaSeleccionada = data.hora;
            const horaInicio = d.hora_inicio_atencion.substring(0, 5);
            const horaFin = d.hora_fin_atencion.substring(0, 5);
            
            return horaSeleccionada >= horaInicio && horaSeleccionada < horaFin;
        });
        
        return disponibilidad;
    };

    const handleSubmit = () => {
        const dentroDisponibilidad = validarDisponibilidad();
        
        if (!dentroDisponibilidad) {
            setMostrarAlertaDisponibilidad(true);
            return;
        }
        
        post(atenciones.store.url());
    };

    const confirmarRegistroFueraHorario = () => {
        setMostrarAlertaDisponibilidad(false);
        post(atenciones.store.url());
    };

    // Obtener servicios únicos
    useEffect(() => {
        const serviciosUnicos = Array.from(
            new Map(
                especialidadesServicios.map(es => [es.servicio.id, es.servicio])
            ).values()
        );
        setServiciosDisponibles(serviciosUnicos);
    }, []);

    const tiposAtencionPermitidos = cargaRapida 
        ? tiposAtenciones.filter(t => t.nombre === 'Emergencia' || t.nombre === 'Urgencia')
        : tiposAtenciones;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Registrar Atención" />
            <div className="container mx-auto py-10">
                <div className="ml-5">
                    <h1 className="text-3xl font-semibold mb-6">Registrar una Nueva Atención</h1>
                    
                    <Link href={atenciones.index.url()} className="inline-block mb-6">
                        <Button variant="outline" className="flex items-center gap-2">
                            Volver
                        </Button>
                    </Link>

                    <div className="space-y-6 max-w-4xl">
                        {/* Sección de Búsqueda de Paciente */}
                        <Card>
                            <CardHeader>
                                <CardTitle>1. Seleccionar Paciente</CardTitle>
                                <CardDescription>
                                    Busque al paciente por número de documento
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {!cargaRapida && !pacienteSeleccionado && (
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label htmlFor="busqueda">Número de Documento</Label>
                                            <Input
                                                id="busqueda"
                                                value={busquedaDocumento}
                                                onChange={(e) => setBusquedaDocumento(e.target.value)}
                                                placeholder="Ingrese el documento del paciente"
                                            />
                                        </div>
                                        <Button 
                                            type="button" 
                                            onClick={buscarPaciente}
                                            className="mt-8"
                                        >
                                            <Search className="h-4 w-4 mr-2" />
                                            Buscar
                                        </Button>
                                    </div>
                                )}

                                {pacienteSeleccionado && (
                                    <Alert>
                                        <CheckCircle2 className="h-4 w-4" />
                                        <AlertDescription>
                                            <strong>Paciente Seleccionado:</strong><br />
                                            {pacienteSeleccionado.nombre} {pacienteSeleccionado.apellido}<br />
                                            {pacienteSeleccionado.tipo_documento.nombre}: {pacienteSeleccionado.numero_documento}
                                        </AlertDescription>
                                    </Alert>
                                )}
                                
                                {errors.paciente_id && (
                                    <p className="text-sm text-red-500">{errors.paciente_id}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tipo de Atención */}
                        <Card>
                            <CardHeader>
                                <CardTitle>2. Tipo de Atención</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="tipo_atencion">Tipo de Atención *</Label>
                                <Select
                                    value={data.tipo_atencion_id}
                                    onValueChange={(value) => setData('tipo_atencion_id', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione el tipo de atención" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {tiposAtencionPermitidos.map((tipo) => (
                                            <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                                {tipo.nombre}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.tipo_atencion_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.tipo_atencion_id}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Servicio y Especialidad */}
                        <Card>
                            <CardHeader>
                                <CardTitle>3. Servicio y Especialidad</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="servicio">Servicio *</Label>
                                    <Select
                                        value={data.servicio_id}
                                        onValueChange={handleServicioChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione el servicio" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {serviciosDisponibles.map((servicio) => (
                                                <SelectItem key={servicio.id} value={servicio.id.toString()}>
                                                    {servicio.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.servicio_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.servicio_id}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="especialidad">Especialidad *</Label>
                                    <Select
                                        value={data.especialidad_id}
                                        onValueChange={handleEspecialidadChange}
                                        disabled={!data.servicio_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione la especialidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {especialidadesDisponibles.map((esp) => (
                                                <SelectItem key={esp.id} value={esp.id.toString()}>
                                                    {esp.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.especialidad_id && (
                                        <p className="text-sm text-red-500 mt-1">{errors.especialidad_id}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Profesional */}
                        <Card>
                            <CardHeader>
                                <CardTitle>4. Profesional</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="profesional">Profesional *</Label>
                                <Select
                                    value={data.profesional_id}
                                    onValueChange={handleProfesionalChange}
                                    disabled={!data.especialidad_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione el profesional" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {profesionalesDisponibles.map((prof) => (
                                            <SelectItem key={prof.id} value={prof.id.toString()}>
                                                {prof.persona.nombre} {prof.persona.apellido}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.profesional_id && (
                                    <p className="text-sm text-red-500 mt-1">{errors.profesional_id}</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Fecha y Hora */}
                        <Card>
                            <CardHeader>
                                <CardTitle>5. Fecha y Hora</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label>Fecha *</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                                disabled={!data.profesional_id}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {data.fecha ? format(new Date(data.fecha), 'PPP', { locale: es }) : 'Seleccione una fecha'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={data.fecha ? new Date(data.fecha) : undefined}
                                                onSelect={handleFechaChange}
                                                locale={es}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    {errors.fecha && (
                                        <p className="text-sm text-red-500 mt-1">{errors.fecha}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="hora">Hora *</Label>
                                    <Select
                                        value={data.hora}
                                        onValueChange={(value) => setData('hora', value)}
                                        disabled={!data.fecha}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione la hora" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {horasDisponibles.length > 0 ? (
                                                horasDisponibles.map((hora) => (
                                                    <SelectItem key={hora} value={hora}>
                                                        {hora}
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="manual" disabled>
                                                    No hay horarios disponibles (puede ingresar manualmente)
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    {horasDisponibles.length === 0 && data.fecha && (
                                        <Input
                                            type="time"
                                            value={data.hora}
                                            onChange={(e) => setData('hora', e.target.value)}
                                            className="mt-2"
                                        />
                                    )}
                                    {errors.hora && (
                                        <p className="text-sm text-red-500 mt-1">{errors.hora}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex gap-4">
                            <Button onClick={handleSubmit} disabled={processing}>
                                {processing ? 'Guardando...' : 'Registrar Atención'}
                            </Button>
                            <Link href={atenciones.index.url()}>
                                <Button type="button" variant="outline">
                                    Cancelar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Alert Dialog para Paciente Reciente */}
            <AlertDialog open={mostrarAlertaPacienteReciente} onOpenChange={setMostrarAlertaPacienteReciente}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Paciente Registrado Recientemente</AlertDialogTitle>
                        <AlertDialogDescription>
                            Se ha detectado que el paciente {pacienteReciente?.nombre} {pacienteReciente?.apellido} fue registrado recientemente.
                            ¿Desea asignarle una atención a este paciente?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>No, buscar otro paciente</AlertDialogCancel>
                        <AlertDialogAction onClick={asignarPacienteReciente}>
                            Sí, asignar atención
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Alert Dialog para Disponibilidad Horaria */}
            <AlertDialog open={mostrarAlertaDisponibilidad} onOpenChange={setMostrarAlertaDisponibilidad}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                            Fuera de Disponibilidad Horaria
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            La fecha y hora seleccionadas están fuera del horario de atención del profesional.
                            ¿Desea continuar con el registro de la atención de todas formas?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmarRegistroFueraHorario}>
                            Sí, continuar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}