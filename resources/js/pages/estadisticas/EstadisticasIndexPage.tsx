import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import estadisticas from '@/routes/estadisticas';
import { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Activity, Stethoscope, Calendar, TrendingUp, Download, FileText, FileSpreadsheet, ArrowUp, ArrowDown, Clock, TrendingUpIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Estadisticas',
        href: estadisticas.index.url(),
    },
];

const StatCard = ({
    title,
    value,
    icon: Icon,
    colorClass
}: {
    title: string;
    value: number;
    icon: any;
    colorClass: string
}) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-4 w-4 ${colorClass}`} />
        </CardHeader>
        <CardContent>
            <div className={`text-2xl font-bold ${colorClass}`}>{value.toLocaleString()}</div>
        </CardContent>
    </Card>
);

interface EstadisticasProps {
    filtros: {
        fecha_inicio: string;
        fecha_fin: string;
    };
    pacientesPorDia: Array<{ fecha: string; total: number }>;
    distribucionGenero: Array<{ genero: string; total: number }>;
    motivosConsultaFrecuentes: Array<{ motivo_de_consulta: string; total: number }>;
    consultasPorEspecialidad: Array<{ especialidad: string; total: number }>;
    promedioConsultasPorPaciente: number;
    distribucionTipoAtencion: Array<{ tipo: string; total: number }>;
    topProfesionales: Array<{ nombre_completo: string; especialidad: string; total_atenciones: number }>;
    evolucionMensual: Array<{ periodo: string; total: number }>;
    distribucionRangoEtario: Array<{ rango: string; total: number }>;
    estadisticasGenerales: {
        total_atenciones: number;
        total_pacientes: number;
        total_profesionales: number;
        atenciones_hoy: number;
        atenciones_este_mes: number;
    };
    comparativaMensual: {
        mes_actual: { periodo: string; total: number };
        mes_anterior: { periodo: string; total: number };
        diferencia: number;
        porcentaje: number;
        tendencia: string;
    };
    prediccionDemanda: {
        proximo_mes: number;
        confianza: string;
        tendencia: string;
    };
    mapaCalor: number[][];
    tiempoEsperaPorServicio: Array<{ servicio: string; total_atenciones: number; promedio_minutos: number }>;
}

export default function EstadisticasIndexPage({
    filtros,
    pacientesPorDia,
    distribucionGenero,
    motivosConsultaFrecuentes,
    consultasPorEspecialidad,
    promedioConsultasPorPaciente,
    distribucionTipoAtencion,
    topProfesionales,
    evolucionMensual,
    distribucionRangoEtario,
    estadisticasGenerales,
    comparativaMensual,
    prediccionDemanda,
    mapaCalor,
    tiempoEsperaPorServicio
}: EstadisticasProps) {

    const [fechaInicio, setFechaInicio] = useState(filtros.fecha_inicio);
    const [fechaFin, setFechaFin] = useState(filtros.fecha_fin);

    const aplicarFiltros = () => {
        router.get(estadisticas.index.url(), {
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
        }, {
            preserveState: true,
        });
    };

    const exportarPDF = () => {
        window.open(`/estadisticas/exportar-pdf?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`, '_blank');
    };

    const exportarExcel = () => {
        window.location.href = `/estadisticas/exportar-excel?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`;
    };

    const colors = {
        primary: 'rgba(59, 130, 246, 0.8)',
        secondary: 'rgba(16, 185, 129, 0.8)',
        tertiary: 'rgba(249, 115, 22, 0.8)',
        quaternary: 'rgba(168, 85, 247, 0.8)',
        danger: 'rgba(239, 68, 68, 0.8)',
        warning: 'rgba(245, 158, 11, 0.8)',
        info: 'rgba(6, 182, 212, 0.8)',
        success: 'rgba(34, 197, 94, 0.8)',
    };

    const chartColors = [
        colors.primary,
        colors.secondary,
        colors.tertiary,
        colors.quaternary,
        colors.danger,
        colors.warning,
        colors.info,
        colors.success,
    ];

    const pacientesPorDiaData = {
        labels: pacientesPorDia.map(item => {
            const fecha = new Date(item.fecha);
            return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        }),
        datasets: [{
            label: 'Pacientes Atendidos',
            data: pacientesPorDia.map(item => item.total),
            borderColor: colors.primary,
            backgroundColor: colors.primary.replace('0.8', '0.2'),
            fill: true,
            tension: 0.4,
        }]
    };

    const distribucionGeneroData = {
        labels: distribucionGenero.map(item => item.genero),
        datasets: [{
            label: 'Distribución por Género',
            data: distribucionGenero.map(item => item.total),
            backgroundColor: chartColors.slice(0, distribucionGenero.length),
        }]
    };

    const motivosConsultaData = {
        labels: motivosConsultaFrecuentes.map(item =>
            item.motivo_de_consulta.length > 30
                ? item.motivo_de_consulta.substring(0, 30) + '...'
                : item.motivo_de_consulta
        ),
        datasets: [{
            label: 'Cantidad de Consultas',
            data: motivosConsultaFrecuentes.map(item => item.total),
            backgroundColor: colors.secondary,
        }]
    };

    const consultasEspecialidadData = {
        labels: consultasPorEspecialidad.map(item => item.especialidad),
        datasets: [{
            label: 'Consultas Totales',
            data: consultasPorEspecialidad.map(item => item.total),
            backgroundColor: chartColors.slice(0, consultasPorEspecialidad.length),
        }]
    };

    const tipoAtencionData = {
        labels: distribucionTipoAtencion.map(item => item.tipo),
        datasets: [{
            label: 'Distribución',
            data: distribucionTipoAtencion.map(item => item.total),
            backgroundColor: chartColors.slice(0, distribucionTipoAtencion.length),
        }]
    };

    const evolucionMensualData = {
        labels: evolucionMensual.map(item => item.periodo),
        datasets: [{
            label: 'Atenciones',
            data: evolucionMensual.map(item => item.total),
            borderColor: colors.tertiary,
            backgroundColor: colors.tertiary.replace('0.8', '0.2'),
            fill: true,
            tension: 0.4,
        }]
    };

    const rangoEtarioData = {
        labels: distribucionRangoEtario.map(item => item.rango + ' años'),
        datasets: [{
            label: 'Pacientes',
            data: distribucionRangoEtario.map(item => item.total),
            backgroundColor: chartColors.slice(0, distribucionRangoEtario.length),
        }]
    };

    // Datos para mapa de calor
    const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const maxValue = Math.max(...mapaCalor.flat());

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
            }
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Estadísticas" />
            <div className="container mx-auto py-6 space-y-6">
                <div className="ml-5">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Estadísticas del Sistema</h1>
                        <p className="text-md text-muted-foreground mt-2">
                            Panel de análisis y métricas del sistema de atención médica
                        </p>
                    </div>
                </div>

                {/* Filtros y Exportación */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filtros y Exportación</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="flex-1 min-w-[200px]">
                                <Label htmlFor="fecha_inicio">Fecha Inicio</Label>
                                <Input
                                    id="fecha_inicio"
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <Label htmlFor="fecha_fin">Fecha Fin</Label>
                                <Input
                                    id="fecha_fin"
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                />
                            </div>
                            <Button onClick={aplicarFiltros}>
                                Aplicar Filtros
                            </Button>
                            <div className="flex gap-2">
                                <Button onClick={exportarPDF} variant="outline">
                                    <FileText className="mr-2 h-4 w-4" />
                                    PDF
                                </Button>
                                <Button onClick={exportarExcel} variant="outline">
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    Excel
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tarjetas de resumen */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Atenciones"
                        value={estadisticasGenerales.total_atenciones}
                        icon={Activity}
                        colorClass="text-blue-600"
                    />
                    <StatCard
                        title="Total Pacientes"
                        value={estadisticasGenerales.total_pacientes}
                        icon={Users}
                        colorClass="text-green-600"
                    />
                    <StatCard
                        title="Profesionales Activos"
                        value={estadisticasGenerales.total_profesionales}
                        icon={Stethoscope}
                        colorClass="text-purple-600"
                    />
                    <StatCard
                        title="Atenciones Hoy"
                        value={estadisticasGenerales.atenciones_hoy}
                        icon={Calendar}
                        colorClass="text-orange-600"
                    />
                    <StatCard
                        title="Este Mes"
                        value={estadisticasGenerales.atenciones_este_mes}
                        icon={TrendingUp}
                        colorClass="text-cyan-600"
                    />
                </div>

                {/* Comparativa y Predicción */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Comparativa Mensual</CardTitle>
                            <CardDescription>Mes actual vs anterior</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted-foreground">{comparativaMensual.mes_actual.periodo}</p>
                                    <p className="text-2xl font-bold">{comparativaMensual.mes_actual.total.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-muted-foreground">{comparativaMensual.mes_anterior.periodo}</p>
                                    <p className="text-2xl font-bold">{comparativaMensual.mes_anterior.total.toLocaleString()}</p>
                                </div>
                            </div>
                            <Alert className={comparativaMensual.tendencia === 'aumento' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                                <div className="flex items-center gap-2">
                                    {comparativaMensual.tendencia === 'aumento' ? (
                                        <ArrowUp className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <ArrowDown className="h-4 w-4 text-red-600" />
                                    )}
                                    <AlertDescription className={comparativaMensual.tendencia === 'aumento' ? 'text-green-700' : 'text-red-700'}>
                                        <span className="font-bold">{comparativaMensual.diferencia > 0 ? '+' : ''}{comparativaMensual.diferencia}</span> atenciones
                                        ({comparativaMensual.porcentaje > 0 ? '+' : ''}{comparativaMensual.porcentaje}%)
                                    </AlertDescription>
                                </div>
                            </Alert>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Predicción de Demanda</CardTitle>
                            <CardDescription>Proyección para el próximo mes</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col items-center justify-center py-4">
                                <TrendingUpIcon className="h-12 w-12 text-purple-600 mb-4" />
                                <p className="text-5xl font-bold text-purple-600">{prediccionDemanda.proximo_mes}</p>
                                <p className="text-sm text-muted-foreground mt-2">atenciones estimadas</p>
                            </div>
                            <div className="flex justify-between text-sm">
                                <div>
                                    <p className="text-muted-foreground">Confianza</p>
                                    <Badge variant={prediccionDemanda.confianza === 'alta' ? 'default' : 'secondary'}>
                                        {prediccionDemanda.confianza}
                                    </Badge>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Tendencia</p>
                                    <Badge variant="outline">
                                        {prediccionDemanda.tendencia}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Mapa de Calor */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mapa de Calor - Horarios de Mayor Demanda</CardTitle>
                        <CardDescription>Distribución de atenciones por día y hora</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr>
                                        <th className="p-2 text-sm font-medium border">Hora</th>
                                        {diasSemana.map((dia, index) => (
                                            <th key={index} className="p-2 text-sm font-medium border">{dia}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.from({ length: 24 }, (_, hora) => (
                                        <tr key={hora}>
                                            <td className="p-2 text-xs border font-medium">{hora}:00</td>
                                            {diasSemana.map((_, diaIndex) => {
                                                const valor = mapaCalor[diaIndex]?.[hora] || 0;
                                                const intensidad = maxValue > 0 ? (valor / maxValue) : 0;
                                                const bgColor = intensidad === 0
                                                    ? 'bg-gray-50'
                                                    : `rgba(59, 130, 246, ${intensidad})`;
                                                return (
                                                    <td
                                                        key={diaIndex}
                                                        className="p-2 text-xs border text-center"
                                                        style={{ backgroundColor: intensidad > 0 ? bgColor : undefined }}
                                                        title={`${valor} atenciones`}
                                                    >
                                                        {valor > 0 ? valor : '-'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Tiempo de Espera */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tiempo de Espera por Servicio</CardTitle>
                        <CardDescription>Promedio de tiempo en minutos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Servicio</TableHead>
                                    <TableHead className="text-right">Total Atenciones</TableHead>
                                    <TableHead className="text-right">Tiempo Promedio</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tiempoEsperaPorServicio.map((servicio, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">{servicio.servicio}</TableCell>
                                        <TableCell className="text-right">{servicio.total_atenciones}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className="gap-1">
                                                <Clock className="h-3 w-3" />
                                                {servicio.promedio_minutos} min
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Gráficos principales */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pacientes Atendidos por Día</CardTitle>
                            <CardDescription>Período seleccionado</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <Line data={pacientesPorDiaData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Distribución por Género</CardTitle>
                            <CardDescription>Total de pacientes atendidos</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 flex items-center justify-center">
                                <Pie data={distribucionGeneroData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Motivos de Consulta Más Frecuentes</CardTitle>
                            <CardDescription>Top 10 motivos registrados</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <Bar data={motivosConsultaData} options={barOptions} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Consultas por Especialidad</CardTitle>
                            <CardDescription>Distribución total de consultas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 flex items-center justify-center">
                                <Doughnut data={consultasEspecialidadData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tipo de Atención</CardTitle>
                            <CardDescription>Distribución por tipo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 flex items-center justify-center">
                                <Pie data={tipoAtencionData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Promedio de Consultas por Paciente</CardTitle>
                            <CardDescription>Indicador de recurrencia</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80 flex flex-col items-center justify-center">
                                <div className="text-7xl font-bold text-blue-600 mb-4">
                                    {promedioConsultasPorPaciente}
                                </div>
                                <p className="text-xl text-muted-foreground">consultas promedio</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Evolución de Atenciones</CardTitle>
                            <CardDescription>Últimos 12 meses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <Line data={evolucionMensualData} options={chartOptions} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Distribución por Rango Etario</CardTitle>
                            <CardDescription>Pacientes por grupo de edad</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <Bar data={rangoEtarioData} options={barOptions} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top profesionales */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top 10 Profesionales</CardTitle>
                        <CardDescription>Ranking por cantidad de atenciones realizadas</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Posición</TableHead>
                                    <TableHead>Profesional</TableHead>
                                    <TableHead>Especialidad</TableHead>
                                    <TableHead className="text-right">Total Atenciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProfesionales.map((prof, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="font-medium">
                                            <Badge variant={index < 3 ? "default" : "secondary"}>
                                                #{index + 1}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {prof.nombre_completo}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {prof.especialidad}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className="font-mono">
                                                {prof.total_atenciones}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}