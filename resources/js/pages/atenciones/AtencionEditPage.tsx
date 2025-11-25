import { Head, useForm, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import atenciones from '@/routes/atenciones';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useEffect, useState } from 'react';
import { AlertCircle, BriefcaseMedical, Calendar, Search, Stethoscope, Undo2, User } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

interface TipoDocumento {
    id: number;
    nombre: string;
}

interface Persona {
    id: number;
    nombre: string;
    apellido: string;
    numero_documento: string;
    tipo_documento: TipoDocumento;
    email: string;
}

interface Especialidad {
    id: number;
    nombre: string;
}

interface Servicio {
    id: number;
    nombre: string;
}

interface TipoAtencion {
    id: number;
    nombre: string;
}

interface Profesional {
    id: number;
    persona: Persona;
    especialidad: Especialidad;
}

interface Atencion {
    id: number;
    fecha: string;
    hora: string;
    servicio_id: number;
    tipo_atencion_id: number;
    persona_id: number;
    servicio: Servicio;
    tipo_atencion: TipoAtencion;
    persona: Persona;
    profesional: Profesional;
}

interface Props {
    atencion: Atencion;
    pacientes: Persona[];
    tiposDocumento?: TipoDocumento[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Atenciones Hechas', href: atenciones.index_atendidas.url() },
    { title: 'Modificar Atención', href: '#' },
];

export default function AtencionEditPage({ atencion, pacientes, tiposDocumento = [] }: Props) {

    console.log(atencion);

    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const [pacienteEncontrado, setPacienteEncontrado] = useState<Persona | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        tipo_documento_id: '',
        numero_documento: '',
        persona_id: '',
    });

    // Verificar si el paciente tiene datos incompletos
    const esPacienteTemporal = !atencion.persona.email;

    // Debounce
    const debouncedTipoDoc = useDebounce(data.tipo_documento_id, 500);
    const debouncedNumeroDoc = useDebounce(data.numero_documento, 500);

    useEffect(() => {
        if (!debouncedTipoDoc || !debouncedNumeroDoc) {
            setBusquedaRealizada(false);
            setPacienteEncontrado(null);
            return;
        }

        const paciente = pacientes.find(
            (p) =>
                p.tipo_documento.id.toString() === debouncedTipoDoc &&
                p.numero_documento === debouncedNumeroDoc
        );

        setBusquedaRealizada(true);

        if (paciente) {
            setPacienteEncontrado(paciente);
            setData("persona_id", paciente.id.toString());
        } else {
            setPacienteEncontrado(null);
            setData("persona_id", "");
        }
    }, [debouncedTipoDoc, debouncedNumeroDoc]);


    const handleAsociarPaciente = () => {
        if (!pacienteEncontrado) return;

        router.patch(
            atenciones.asociar_paciente(atencion.id).url,
            { persona_id: pacienteEncontrado.id },
            {
                onSuccess: () => {
                    router.visit(atenciones.index_atendidas().url);
                }
            }
        );

    };

    const handleIrARegistro = () => {
        // Redirigir a la página de registro de paciente con datos de búsqueda
        router.visit(`/pacientes/editar_paciente/${atencion.persona_id}`);
    };

    const formatearFecha = (fecha: string) => {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatearHora = (hora: string) => {
        if (!hora) return '';
        return hora.substring(0, 5); // HH:mm
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Modificar Atención" />
            <div className="container mx-auto py-10">

                <div className="ml-5 mb-6">
                    <h1 className="text-3xl font-semibold mb-3">Modificar Atención</h1>

                    <p className="text-md text-muted-foreground mb-3">
                        Gestión de atención de emergencia/urgencia
                    </p>
                    <Link href={atenciones.index_atendidas.url()} className="inline-block">
                        <Button className="flex items-center gap-2 mr-2">
                            <Undo2 className="h-4 w-4" />
                            Volver
                        </Button>
                    </Link>
                </div>

                {/* Alerta informativa */}
                {esPacienteTemporal && (
                    <Alert className="mb-6" variant="warning">
                        <AlertCircle />
                        <AlertDescription>
                            Esta atención fue registrada como Emergencia/Urgencia y el paciente quedó sin identificar.
                            Debe buscar un paciente existente o completar sus datos.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Información de la atención (solo lectura) */}
                <div className="space-y-4 mb-6">
                    {/* Fecha y Hora */}
                    <Alert>
                        <Calendar className="h-4 w-4" />
                        <AlertTitle>Fecha y Hora de Atención</AlertTitle>
                        <AlertDescription>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Fecha:</span>
                                    <span className="ml-2 font-semibold">
                                        {formatearFecha(atencion.fecha)}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Hora:</span>
                                    <span className="ml-2 font-semibold">
                                        {formatearHora(atencion.hora)}
                                    </span>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Servicio y Tipo de Atención */}
                    <Alert>
                        <BriefcaseMedical className="h-4 w-4" />
                        <AlertTitle>Información del Servicio</AlertTitle>
                        <AlertDescription>
                            <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Servicio:</span>
                                    <span className="ml-2 font-semibold">
                                        {atencion.servicio.nombre}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Tipo de Atención:</span>
                                    <span className="ml-2 font-semibold">
                                        {atencion.tipo_atencion.nombre}
                                    </span>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Profesional que realizó la atención */}
                    <Alert>
                        <Stethoscope className="h-4 w-4" />
                        <AlertTitle>Profesional</AlertTitle>
                        <AlertDescription>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Nombre:</span>
                                    <span className="ml-2 font-semibold">
                                        {atencion.profesional.persona.nombre} {atencion.profesional.persona.apellido}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Tipo de Documento:</span>
                                    <span className="ml-2 font-semibold">
                                        {atencion.profesional.persona.tipo_documento?.nombre}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Documento:</span>
                                    <span className="ml-2 font-semibold">
                                        {atencion.profesional.persona.numero_documento}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Especialidad:</span>
                                    <span className="ml-2 font-semibold">
                                        {atencion.profesional.especialidad.nombre}
                                    </span>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>

                    {/* Paciente Actual */}
                    <Alert>
                        <User className="h-4 w-4" />
                        <AlertTitle>Paciente Actual</AlertTitle>
                        <AlertDescription>
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Nombre:</span>
                                    <span className="ml-2 font-semibold">
                                        {atencion.persona.nombre} {atencion.persona.apellido}
                                    </span>
                                </div>
                                {atencion.persona.numero_documento && (
                                    <div>
                                        <span className="text-muted-foreground">Tipo de Documento:</span>
                                        <span className="ml-2 font-semibold">
                                            {atencion.persona.tipo_documento?.nombre}
                                        </span>
                                        <span className="ml-3 text-muted-foreground">Documento:</span>
                                        <span className="ml-2 font-semibold">
                                            {atencion.persona.numero_documento}
                                        </span>
                                    </div>
                                )}
                            </div>
                            {esPacienteTemporal && (
                                <Badge variant="secondary" className="mt-2">
                                    Paciente Temporal - Sin Identificar
                                </Badge>
                            )}
                        </AlertDescription>
                    </Alert>
                </div>

                {/* Formulario de búsqueda de paciente */}
                {esPacienteTemporal && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Buscar Paciente Existente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="tipo_documento_id">
                                            Tipo de Documento <span className="text-red-500">*</span>
                                        </Label>
                                        <Select
                                            value={data.tipo_documento_id}
                                            onValueChange={(value) => {
                                                setData('tipo_documento_id', value);
                                                setBusquedaRealizada(false);
                                                setPacienteEncontrado(null);
                                            }}
                                        >
                                            <SelectTrigger id="tipo_documento_id">
                                                <SelectValue placeholder="Seleccione tipo de documento" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tiposDocumento.map((tipo) => (
                                                    <SelectItem key={tipo.id} value={tipo.id.toString()}>
                                                        {tipo.nombre}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.tipo_documento_id && (
                                            <p className="text-sm text-red-500">{errors.tipo_documento_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="numero_documento">
                                            Número de Documento <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="numero_documento"
                                            type="text"
                                            value={data.numero_documento}
                                            onChange={(e) => {
                                                setData('numero_documento', e.target.value);
                                                setBusquedaRealizada(false);
                                                setPacienteEncontrado(null);
                                            }}
                                            placeholder="Ingrese número de documento"
                                        />
                                        {errors.numero_documento && (
                                            <p className="text-sm text-red-500">{errors.numero_documento}</p>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    disabled={!data.tipo_documento_id || !data.numero_documento || processing}
                                    className="w-full md:w-auto"
                                >
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar Paciente
                                </Button>
                            </div>

                            {/* Resultado de la búsqueda */}
                            {busquedaRealizada && (
                                <div className="mt-6">
                                    {pacienteEncontrado ? (
                                        <div className="space-y-4">
                                            <Alert variant="success" className="border-green-500 bg-green-50">
                                                <AlertDescription className="text-green-800">
                                                    ✓ Paciente encontrado en el sistema
                                                </AlertDescription>
                                            </Alert>

                                            <Card className="border-green-200">
                                                <CardHeader>
                                                    <CardTitle className="text-lg">Datos del Paciente</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                        <span className="font-medium">Nombre:</span>
                                                        <span>{pacienteEncontrado.nombre}</span>

                                                        <span className="font-medium">Apellido:</span>
                                                        <span>{pacienteEncontrado.apellido}</span>

                                                        <span className="font-medium">Documento:</span>
                                                        <span>
                                                            {pacienteEncontrado.tipo_documento.nombre}: {pacienteEncontrado.numero_documento}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Button
                                                onClick={handleAsociarPaciente}
                                                disabled={processing}
                                                className="w-full"
                                            >
                                                Asociar Este Paciente a la Atención
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Alert variant="info">
                                                <AlertCircle />
                                                <AlertDescription className="text-">
                                                    No se encontró ningún paciente con el documento ingresado.
                                                    Debe registrar un nuevo paciente.
                                                </AlertDescription>
                                            </Alert>

                                            <Button
                                                onClick={handleIrARegistro}
                                                variant="default"
                                                className="w-full"
                                            >
                                                Ir a Registrar Nuevo Paciente
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Si no es paciente temporal, mostrar mensaje */}
                {!esPacienteTemporal && (
                    <Alert>
                        <AlertDescription>
                            Esta atención ya tiene un paciente identificado correctamente.
                            No requiere modificación.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </AppLayout>
    );
}