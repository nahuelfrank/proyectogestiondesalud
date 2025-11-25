import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Clock, User, FileText, Eye, Pencil, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePermissions } from '@/hooks/use-permissions';
import { useEffect, useState } from 'react';

interface Persona {
    id: number;
    nombre: string;
    apellido: string;
    numero_documento: string;
    tipo_documento: {
        nombre: string;
    };
}

interface TipoAtencion {
    id: number;
    nombre: string;
}

interface EstadoAtencion {
    id: number;
    nombre: string;
}

interface Servicio {
    id: number;
    nombre: string;
}

interface Atencion {
    id: number;
    fecha: string;
    hora: string;
    persona: Persona;
    tipo_atencion: TipoAtencion;
    estado_atencion: EstadoAtencion;
    servicio: Servicio;
}

interface Profesional {
    id: number;
    persona: {
        nombre: string;
        apellido: string;
    };
    especialidad: {
        id: number;
        nombre: string;
    };
}

interface Especialidad {
    id: number;
    nombre: string;
    profesionales_count?: number;
}

interface ListaEsperaPageProps {
    atenciones_espera: Atencion[];
    atenciones_finalizadas: Atencion[];
    profesional: Profesional | null;
    especialidades?: Especialidad[];
    especialidad_seleccionada?: number | null;
    profesionales_de_especialidad?: Profesional[];
    profesional_seleccionado?: number | null;
}

export default function ListaEsperaPage({
    atenciones_espera,
    atenciones_finalizadas,
    profesional,
    especialidades,
    especialidad_seleccionada,
    profesionales_de_especialidad,
    profesional_seleccionado
}: ListaEsperaPageProps) {
    const { can } = usePermissions();
    const isSuperAdmin = can('ver-todas-listas-espera');

    useEffect(() => {
        const interval = setInterval(() => {
            router.reload({
                only: ["atenciones_espera", "atenciones_finalizadas"],
            });
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>(
        especialidad_seleccionada?.toString() || ''
    );
    const [selectedProfesional, setSelectedProfesional] = useState<string>(
        profesional_seleccionado?.toString() || ''
    );

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

    const handleEspecialidadChange = (value: string) => {
        setSelectedEspecialidad(value);
        setSelectedProfesional(''); // Reset profesional selection

        // Recargar con la especialidad seleccionada
        router.get('/historias-clinicas/lista-espera', {
            especialidad: value
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleProfesionalChange = (value: string) => {
        setSelectedProfesional(value);

        // Recargar con el profesional seleccionado
        router.get('/historias-clinicas/lista-espera', {
            especialidad: selectedEspecialidad,
            profesional: value
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleLimpiarFiltros = () => {
        setSelectedEspecialidad('');
        setSelectedProfesional('');
        router.get('/historias-clinicas/lista-espera');
    };

    // Calcular estadísticas
    const pacientesEnEspera = atenciones_espera.length;
    const atendidosHoy = atenciones_finalizadas.filter(
        (a) => a.estado_atencion.nombre === 'Atendido'
    ).length;
    const totalDelDia = atenciones_espera.length + atenciones_finalizadas.length;

    return (
        <AppLayout breadcrumbs={[
            { title: 'Historia Clínica', href: '#' },
            { title: 'Lista de Espera', href: '/historias-clinicas/lista-espera' }
        ]}>
            <Head title="Lista de Espera" />

            <div className="container mx-auto py-10">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">
                        {isSuperAdmin ? 'Lista de Espera - Todas las Especialidades' : `Lista de Espera - ${profesional?.especialidad.nombre}`}
                    </h1>
                    <p className="text-muted-foreground">
                        {isSuperAdmin
                            ? 'Vista administrativa de todas las listas de espera'
                            : `Profesional: ${profesional?.persona.nombre} ${profesional?.persona.apellido}`
                        }
                    </p>
                </div>

                {/* Filtros para Super Admin */}
                {isSuperAdmin && (
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filtrar Lista de Espera
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Selector de Especialidad */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Especialidad</label>
                                    <Select
                                        value={selectedEspecialidad}
                                        onValueChange={handleEspecialidadChange}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccionar especialidad" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {especialidades?.map((esp) => (
                                                <SelectItem key={esp.id} value={esp.id.toString()}>
                                                    {esp.nombre} {esp.profesionales_count ? `(${esp.profesionales_count})` : ''}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Selector de Profesional (solo si hay especialidad seleccionada) */}
                                {selectedEspecialidad && profesionales_de_especialidad && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Profesional</label>
                                        <Select
                                            value={selectedProfesional}
                                            onValueChange={handleProfesionalChange}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Todos los profesionales" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todos">Todos los profesionales</SelectItem>
                                                {profesionales_de_especialidad.map((prof) => (
                                                    <SelectItem key={prof.id} value={prof.id.toString()}>
                                                        {prof.persona.nombre} {prof.persona.apellido}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Botón Limpiar */}
                                {(selectedEspecialidad || selectedProfesional) && (
                                    <div className="flex items-end">
                                        <Button
                                            variant="outline"
                                            onClick={handleLimpiarFiltros}
                                            className="w-full"
                                        >
                                            Limpiar Filtros
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Info de filtros activos */}
                            {selectedEspecialidad && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                    <p className="text-sm text-blue-800">
                                        <strong>Mostrando:</strong>{' '}
                                        {selectedProfesional && selectedProfesional !== 'todos'
                                            ? `Lista de espera de ${profesionales_de_especialidad?.find(p => p.id.toString() === selectedProfesional)?.persona.nombre || ''}`
                                            : `Todas las listas de espera de ${especialidades?.find(e => e.id.toString() === selectedEspecialidad)?.nombre || ''}`
                                        }
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pacientes en Espera</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{pacientesEnEspera}</div>
                            <p className="text-xs text-muted-foreground">
                                En lista de espera actualmente
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Atendidos Hoy</CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{atendidosHoy}</div>
                            <p className="text-xs text-muted-foreground">
                                Pacientes atendidos en el día
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total del Día</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{totalDelDia}</div>
                            <p className="text-xs text-muted-foreground">
                                Atenciones del día (espera + finalizadas)
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs de Atenciones */}
                <Tabs defaultValue="espera" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="espera" className="relative">
                            Pacientes en Espera
                            {pacientesEnEspera > 0 && (
                                <Badge className="ml-2 bg-yellow-500">{pacientesEnEspera}</Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="finalizadas">
                            Atenciones del Día
                            {atenciones_finalizadas.length > 0 && (
                                <Badge className="ml-2" variant="secondary">
                                    {atenciones_finalizadas.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Pestaña: Pacientes en Espera */}
                    <TabsContent value="espera">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lista de Espera</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {atenciones_espera.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            No hay pacientes en espera
                                        </h3>
                                        <p className="text-gray-500">
                                            La lista de espera está vacía en este momento.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Paciente</TableHead>
                                                    <TableHead>Documento</TableHead>
                                                    <TableHead>Servicio</TableHead>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Hora</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {atenciones_espera.map((atencion) => (
                                                    <TableRow key={atencion.id}>
                                                        <TableCell className="font-medium">
                                                            {atencion.persona.nombre} {atencion.persona.apellido}
                                                        </TableCell>
                                                        <TableCell>
                                                            {atencion.persona.numero_documento}
                                                        </TableCell>
                                                        <TableCell>{atencion.servicio.nombre}</TableCell>
                                                        <TableCell>{formatFecha(atencion.fecha)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4" />
                                                                {atencion.hora}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getEstadoBadgeColor(atencion.estado_atencion.nombre)}>
                                                                {atencion.estado_atencion.nombre}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Link
                                                                href={`/historias-clinicas/${atencion.id}/historia`}
                                                            >
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Ver Historia
                                                                </Button>
                                                            </Link>
                                                            {!isSuperAdmin && (
                                                                <Link
                                                                    href={`/historias-clinicas/${atencion.id}/registrar`}
                                                                >
                                                                    <Button variant="default" size="sm">
                                                                        Iniciar Atención
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Pestaña: Atenciones del Día */}
                    <TabsContent value="finalizadas">
                        <Card>
                            <CardHeader>
                                <CardTitle>Atenciones Finalizadas del Día</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {atenciones_finalizadas.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            No hay atenciones finalizadas
                                        </h3>
                                        <p className="text-gray-500">
                                            No se han registrado atenciones finalizadas hoy.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Paciente</TableHead>
                                                    <TableHead>Documento</TableHead>
                                                    <TableHead>Servicio</TableHead>
                                                    <TableHead>Fecha</TableHead>
                                                    <TableHead>Hora</TableHead>
                                                    <TableHead>Estado</TableHead>
                                                    <TableHead className="text-right">Acciones</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {atenciones_finalizadas.map((atencion) => (
                                                    <TableRow key={atencion.id}>
                                                        <TableCell className="font-medium">
                                                            {atencion.persona.nombre} {atencion.persona.apellido}
                                                        </TableCell>
                                                        <TableCell>
                                                            {atencion.persona.numero_documento}
                                                        </TableCell>
                                                        <TableCell>{atencion.servicio.nombre}</TableCell>
                                                        <TableCell>{formatFecha(atencion.fecha)}</TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                <Clock className="h-4 w-4" />
                                                                {atencion.hora}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge className={getEstadoBadgeColor(atencion.estado_atencion.nombre)}>
                                                                {atencion.estado_atencion.nombre}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Link
                                                                href={`/historias-clinicas/detalle/${atencion.id}`}
                                                            >
                                                                <Button variant="ghost" size="sm">
                                                                    <Eye className="h-4 w-4 mr-2" />
                                                                    Ver
                                                                </Button>
                                                            </Link>
                                                            {!isSuperAdmin && (
                                                                <Link
                                                                    href={`/historias-clinicas/editar/${atencion.id}`}
                                                                >
                                                                    <Button variant="ghost" size="sm">
                                                                        <Pencil className="h-4 w-4 mr-2" />
                                                                        Modificar
                                                                    </Button>
                                                                </Link>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}