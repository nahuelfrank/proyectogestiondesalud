import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import atenciones from '@/routes/atenciones';
import { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { AlertCircle, Search } from 'lucide-react';

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

interface Servicio {
    id: number;
    nombre: string;
}

interface TipoAtencion {
    id: number;
    nombre: string;
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
    const [busquedaRealizada, setBusquedaRealizada] = useState(false);
    const [pacienteEncontrado, setPacienteEncontrado] = useState<Persona | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        tipo_documento_id: '',
        numero_documento: '',
        persona_id: '',
    });

    // Verificar si el paciente tiene datos incompletos
    const esPacienteTemporal = !atencion.persona.email; 

    const handleBuscarPaciente = () => {
        if (!data.tipo_documento_id || !data.numero_documento) {
            return;
        }

        // Buscar paciente en la lista
        const paciente = pacientes.find(
            (p) => 
                p.tipo_documento.id.toString() === data.tipo_documento_id && 
                p.numero_documento === data.numero_documento
        );

        setBusquedaRealizada(true);
        
        if (paciente) {
            setPacienteEncontrado(paciente);
            setData('persona_id', paciente.id.toString());
        } else {
            setPacienteEncontrado(null);
            setData('persona_id', '');
        }
    };

    const handleAsociarPaciente = () => {
        if (!pacienteEncontrado) return;

        // Enviar al backend para asociar el paciente existente
        post(route('atenciones.asociar-paciente', atencion.id), {
            onSuccess: () => {
                // Redirigir o mostrar mensaje de éxito
            }
        });
    };

    const handleIrARegistro = () => {
        // Redirigir a la página de registro de paciente con datos de búsqueda
        router.visit(route('pacientes.create'), {
            data: {
                tipo_documento_id: data.tipo_documento_id,
                numero_documento: data.numero_documento,
                from_atencion: atencion.id,
            }
        });
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
            <div className="container mx-auto py-10 px-4 max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-semibold mb-2">Modificar Atención</h1>
                    <p className="text-muted-foreground">
                        Gestión de atención de emergencia/urgencia
                    </p>
                </div>

                {/* Alerta informativa */}
                {esPacienteTemporal && (
                    <Alert className="mb-6 border-amber-500 bg-amber-50">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                            Esta atención fue registrada como Emergencia/Urgencia y el paciente quedó sin identificar. 
                            Debe buscar un paciente existente o completar sus datos.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Información de la atención (solo lectura) */}
                <Card className="mb-6">
                    <CardHeader>
                        <CardTitle>Datos de la Atención</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Fecha</Label>
                            <div className="p-3 bg-muted rounded-md">
                                {formatearFecha(atencion.fecha)}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Hora</Label>
                            <div className="p-3 bg-muted rounded-md">
                                {formatearHora(atencion.hora)}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Servicio</Label>
                            <div className="p-3 bg-muted rounded-md">
                                {atencion.servicio.nombre}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-muted-foreground">Tipo de Atención</Label>
                            <div className="p-3 bg-muted rounded-md">
                                {atencion.tipo_atencion.nombre}
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-muted-foreground">Paciente Actual</Label>
                            <div className="p-3 bg-muted rounded-md">
                                {atencion.persona.nombre} {atencion.persona.apellido}
                                {atencion.persona.numero_documento && 
                                    ` - ${atencion.persona.tipo_documento?.nombre}: ${atencion.persona.numero_documento}`
                                }
                                {esPacienteTemporal && (
                                    <span className="ml-2 text-amber-600 font-medium">(Temporal)</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

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
                                    onClick={handleBuscarPaciente}
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
                                            <Alert className="border-green-500 bg-green-50">
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
                                            <Alert className="border-blue-500 bg-blue-50">
                                                <AlertCircle className="h-4 w-4 text-blue-600" />
                                                <AlertDescription className="text-blue-800">
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