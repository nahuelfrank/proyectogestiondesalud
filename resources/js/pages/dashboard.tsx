import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Activity,
    CheckCircle2,
    Clock,
    Users,
    Stethoscope,
    AlertCircle,
    AlertTriangle,
    TrendingUp
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { BreadcrumbItem } from '@/types';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Panel Principal',
        href: "#",
    },
];


interface DashboardProps {
    estadisticasDia: {
        total: number;
        completadas: number;
        pendientes: number;
    };
    salaEspera: number;
    profesionalesActivos: number;
    distribucionServicios: Array<{ servicio: string; total: number }>;
    tiposAtencion: Array<{ tipo: string; total: number }>;
    atencionPorHora: Array<{ hora: number; total: number }>;
    emergenciasUrgencias: {
        emergencias: number;
        urgencias: number;
    };
}

const StatCard = ({
    title,
    value,
    icon: Icon,
    colorClass,
    description,
}: {
    title: string;
    value: number;
    icon: any;
    colorClass: string;
    description?: string;
}) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className={`h-5 w-5 ${colorClass}`} />
        </CardHeader>
        <CardContent>
            <div className={`text-3xl font-bold ${colorClass}`}>
                {value.toLocaleString()}
            </div>
            {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
        </CardContent>
    </Card>
);

export default function DashboardPage({
    estadisticasDia,
    salaEspera,
    profesionalesActivos,
    distribucionServicios,
    tiposAtencion,
    atencionPorHora,
    emergenciasUrgencias,
}: DashboardProps) {

    const colors = {
        primary: 'rgba(59, 130, 246, 0.8)',
        secondary: 'rgba(16, 185, 129, 0.8)',
        tertiary: 'rgba(249, 115, 22, 0.8)',
        quaternary: 'rgba(168, 85, 247, 0.8)',
        danger: 'rgba(239, 68, 68, 0.8)',
        warning: 'rgba(245, 158, 11, 0.8)',
    };

    const chartColors = [
        colors.primary,
        colors.secondary,
        colors.tertiary,
        colors.quaternary,
        colors.danger,
        colors.warning,
    ];

    // Gráfico de distribución por servicios
    const serviciosData = {
        labels: distribucionServicios.map(item => item.servicio),
        datasets: [{
            label: 'Atenciones',
            data: distribucionServicios.map(item => item.total),
            backgroundColor: chartColors.slice(0, distribucionServicios.length),
        }]
    };

    // Gráfico de atención por hora
    const horasCompletas = Array.from({ length: 24 }, (_, i) => i);
    const atencionPorHoraData = {
        labels: horasCompletas.map(h => `${h}:00`),
        datasets: [{
            label: 'Atenciones',
            data: horasCompletas.map(h => {
                const found = atencionPorHora.find(item => item.hora === h);
                return found ? found.total : 0;
            }),
            backgroundColor: colors.primary,
            borderColor: colors.primary,
            borderWidth: 1,
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    const barOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                }
            }
        }
    };

    const hasEmergencias = emergenciasUrgencias.emergencias > 0;
    const hasUrgencias = emergenciasUrgencias.urgencias > 0;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Panel Principal" />
            <div className="container mx-auto py-6 space-y-6">
                <div className="ml-5">
                    <h1 className="text-3xl font-bold tracking-tight">Panel Principal</h1>
                    <p className="text-muted-foreground mt-2">
                        Vista general del sistema - {new Date().toLocaleDateString('es-AR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                {/* Alertas de Emergencias/Urgencias */}
                {(hasEmergencias || hasUrgencias) && (
                    <div className="space-y-3">
                        {/* Emergencias - Usando el color danger (Rojo: rgba(239, 68, 68, 0.8)) */}
                        {hasEmergencias && (
                            <Alert
                                // Usamos el color RGBA para el fondo. No se puede poner directamente en className en Tailwind
                                // Se debe definir como CSS o como variable. Aquí lo pondremos inline para este ejemplo.
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.8)', borderColor: 'rgb(239, 68, 68)' }}
                                className="border"
                            >
                                {/* Icono y texto en color sólido Rojo (Red 600) para un contraste fuerte */}
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <AlertTitle className="font-bold text-red-900">
                                    Emergencias Activas
                                </AlertTitle>
                                <AlertDescription className="text-red-800/90">
                                    Hay <span className="font-bold">{emergenciasUrgencias.emergencias}</span>{" "}
                                    emergencia(s) pendientes de atención inmediata.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Urgencias - Usando el color tertiary (Naranja: rgba(249, 115, 22, 0.8)) */}
                        {hasUrgencias && (
                            <Alert
                                // Usamos el color RGBA para el fondo.
                                style={{ backgroundColor: 'rgba(249, 115, 22, 0.8)', borderColor: 'rgb(249, 115, 22)' }}
                                className="border"
                            >
                                {/* Icono y texto en color sólido Naranja (Orange 600) para un contraste fuerte */}
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                <AlertTitle className="font-bold text-orange-900">
                                    Urgencias Activas
                                </AlertTitle>
                                <AlertDescription className="text-orange-800/90">
                                    Hay <span className="font-bold">{emergenciasUrgencias.urgencias}</span>{" "}
                                    urgencia(s) en espera de atención.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                {/* Cards de Estado del Día */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Atenciones del Día"
                        value={estadisticasDia.total}
                        icon={Activity}
                        colorClass="text-blue-600"
                        description="Total registradas"
                    />
                    <StatCard
                        title="Atenciones Completadas"
                        value={estadisticasDia.completadas}
                        icon={CheckCircle2}
                        colorClass="text-green-600"
                        description="Finalizadas"
                    />
                    <StatCard
                        title="Atenciones Pendientes"
                        value={estadisticasDia.pendientes}
                        icon={Clock}
                        colorClass="text-orange-600"
                        description="En espera o en curso"
                    />
                    <StatCard
                        title="Sala de Espera"
                        value={salaEspera}
                        icon={Users}
                        colorClass="text-purple-600"
                        description="Pacientes esperando"
                    />
                    <StatCard
                        title="Profesionales Activos"
                        value={profesionalesActivos}
                        icon={Stethoscope}
                        colorClass="text-cyan-600"
                        description="En turno hoy"
                    />
                </div>

                {/* Gráficos */}
                <div className="grid gap-4 md:grid-cols-2">
                    {/* Distribución por Servicios */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                                Distribución por Servicios
                            </CardTitle>
                            <CardDescription>Atenciones del día por área</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {distribucionServicios.length > 0 ? (
                                <div className="h-64">
                                    <Doughnut data={serviciosData} options={chartOptions} />
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-muted-foreground">
                                    No hay datos disponibles para hoy
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Tipos de Atención */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-green-600" />
                                Tipos de Atención del Día
                            </CardTitle>
                            <CardDescription>Distribución por tipo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {tiposAtencion.length > 0 ? (
                                <div className="space-y-4">
                                    {tiposAtencion.map((tipo, index) => (
                                        <div key={index} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded"
                                                    style={{ backgroundColor: chartColors[index] }}
                                                />
                                                <span className="font-medium">{tipo.tipo}</span>
                                            </div>
                                            <Badge variant="outline" className="font-mono">
                                                {tipo.total}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-muted-foreground">
                                    No hay datos disponibles para hoy
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Gráfico de Atención por Hora */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-purple-600" />
                            Atención por Hora del Día
                        </CardTitle>
                        <CardDescription>Distribución horaria de atenciones</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {atencionPorHora.length > 0 ? (
                            <div className="h-80">
                                <Bar data={atencionPorHoraData} options={barOptions} />
                            </div>
                        ) : (
                            <div className="h-80 flex items-center justify-center text-muted-foreground">
                                No hay datos disponibles para hoy
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}