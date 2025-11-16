import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import estadisticas from '@/routes/estadisticas';
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
import { Users, Activity, Stethoscope, Calendar, TrendingUp } from 'lucide-react';

// Registrar componentes de Chart.js
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

interface EstadisticasProps {
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
}

// Componente para las tarjetas de estadísticas
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

export default function EstadisticasIndexPage({
    pacientesPorDia,
    distribucionGenero,
    motivosConsultaFrecuentes,
    consultasPorEspecialidad,
    promedioConsultasPorPaciente,
    distribucionTipoAtencion,
    topProfesionales,
    evolucionMensual,
    distribucionRangoEtario,
    estadisticasGenerales
}: EstadisticasProps) {

    // Colores para los gráficos
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

    // Datos para pacientes por día
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

    // Datos para distribución por género
    const distribucionGeneroData = {
        labels: distribucionGenero.map(item => item.genero),
        datasets: [{
            label: 'Distribución por Género',
            data: distribucionGenero.map(item => item.total),
            backgroundColor: chartColors.slice(0, distribucionGenero.length),
        }]
    };

    // Datos para motivos de consulta
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

    // Datos para consultas por especialidad
    const consultasEspecialidadData = {
        labels: consultasPorEspecialidad.map(item => item.especialidad),
        datasets: [{
            label: 'Consultas Totales',
            data: consultasPorEspecialidad.map(item => item.total),
            backgroundColor: chartColors.slice(0, consultasPorEspecialidad.length),
        }]
    };

    // Datos para tipo de atención
    const tipoAtencionData = {
        labels: distribucionTipoAtencion.map(item => item.tipo),
        datasets: [{
            label: 'Distribución',
            data: distribucionTipoAtencion.map(item => item.total),
            backgroundColor: chartColors.slice(0, distribucionTipoAtencion.length),
        }]
    };

    // Datos para evolución mensual
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

    // Datos para rango etario
    const rangoEtarioData = {
        labels: distribucionRangoEtario.map(item => item.rango + ' años'),
        datasets: [{
            label: 'Pacientes',
            data: distribucionRangoEtario.map(item => item.total),
            backgroundColor: chartColors.slice(0, distribucionRangoEtario.length),
        }]
    };

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

                {/* Gráficos principales */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pacientes Atendidos por Día</CardTitle>
                            <CardDescription>Últimos 30 días</CardDescription>
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