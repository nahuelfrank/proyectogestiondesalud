<?php

namespace App\Http\Controllers;

use App\Models\Persona;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Atencion;
use App\Models\Profesional;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\EstadisticasExport;

class EstadisticasController extends Controller
{
    public function index(Request $request)
    {
        // Obtener filtros de fecha
        $fechaInicio = $request->input('fecha_inicio', Carbon::now()->subDays(30)->format('Y-m-d'));
        $fechaFin = $request->input('fecha_fin', Carbon::now()->format('Y-m-d'));

        $fechaInicioCarbon = Carbon::parse($fechaInicio);
        $fechaFinCarbon = Carbon::parse($fechaFin);

        return Inertia::render('estadisticas/EstadisticasIndexPage', [
            'filtros' => [
                'fecha_inicio' => $fechaInicio,
                'fecha_fin' => $fechaFin,
            ],
            'pacientesPorDia' => $this->getPacientesPorDia($fechaInicioCarbon, $fechaFinCarbon),
            'distribucionGenero' => $this->getDistribucionGenero($fechaInicioCarbon, $fechaFinCarbon),
            'motivosConsultaFrecuentes' => $this->getMotivosConsultaFrecuentes($fechaInicioCarbon, $fechaFinCarbon),
            'consultasPorEspecialidad' => $this->getConsultasPorEspecialidad($fechaInicioCarbon, $fechaFinCarbon),
            'promedioConsultasPorPaciente' => $this->getPromedioConsultasPorPaciente($fechaInicioCarbon, $fechaFinCarbon),
            'distribucionTipoAtencion' => $this->getDistribucionTipoAtencion($fechaInicioCarbon, $fechaFinCarbon),
            'topProfesionales' => $this->getTopProfesionales($fechaInicioCarbon, $fechaFinCarbon),
            'evolucionMensual' => $this->getEvolucionMensual(),
            'distribucionRangoEtario' => $this->getDistribucionRangoEtario($fechaInicioCarbon, $fechaFinCarbon),
            'estadisticasGenerales' => $this->getEstadisticasGenerales($fechaInicioCarbon, $fechaFinCarbon),
            'comparativaMensual' => $this->getComparativaMensual(),
            'prediccionDemanda' => $this->getPrediccionDemanda(),
            'mapaCalor' => $this->getMapaCalor($fechaInicioCarbon, $fechaFinCarbon),
            'tiempoEsperaPorServicio' => $this->getTiempoEsperaPorServicio($fechaInicioCarbon, $fechaFinCarbon),
        ]);
    }

    private function getPacientesPorDia($fechaInicio, $fechaFin)
    {
        return Atencion::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->select(
                DB::raw('DATE(fecha) as fecha'),
                DB::raw('COUNT(DISTINCT persona_id) as total')
            )
            ->groupBy('fecha')
            ->orderBy('fecha')
            ->get()
            ->map(function ($item) {
                return [
                    'fecha' => Carbon::parse($item->fecha)->format('Y-m-d'),
                    'total' => $item->total
                ];
            });
    }

    private function getDistribucionGenero($fechaInicio, $fechaFin)
    {
        return Atencion::whereBetween('atenciones.fecha', [$fechaInicio, $fechaFin])
            ->join('personas', 'atenciones.persona_id', '=', 'personas.id')
            ->join('generos', 'personas.genero_id', '=', 'generos.id')
            ->select(
                'generos.nombre as genero',
                DB::raw('COUNT(DISTINCT personas.id) as total')
            )
            ->groupBy('generos.id', 'generos.nombre')
            ->get();
    }

    private function getMotivosConsultaFrecuentes($fechaInicio, $fechaFin)
    {
        return Atencion::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('motivo_de_consulta')
            ->where('motivo_de_consulta', '!=', '')
            ->select(
                'motivo_de_consulta',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('motivo_de_consulta')
            ->orderByDesc('total')
            ->limit(10)
            ->get();
    }

    private function getConsultasPorEspecialidad($fechaInicio, $fechaFin)
    {
        return Atencion::whereBetween('atenciones.fecha', [$fechaInicio, $fechaFin])
            ->join('profesionales', 'atenciones.profesional_id', '=', 'profesionales.id')
            ->join('especialidades', 'profesionales.especialidad_id', '=', 'especialidades.id')
            ->select(
                'especialidades.nombre as especialidad',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('especialidades.id', 'especialidades.nombre')
            ->orderByDesc('total')
            ->get();
    }

    private function getPromedioConsultasPorPaciente($fechaInicio, $fechaFin)
    {
        $totalAtenciones = Atencion::whereBetween('fecha', [$fechaInicio, $fechaFin])->count();
        $totalPacientes = Atencion::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->distinct('persona_id')
            ->count('persona_id');

        return $totalPacientes > 0 ? round($totalAtenciones / $totalPacientes, 2) : 0;
    }

    private function getDistribucionTipoAtencion($fechaInicio, $fechaFin)
    {
        return Atencion::whereBetween('atenciones.fecha', [$fechaInicio, $fechaFin])
            ->join('tipos_atenciones', 'atenciones.tipo_atencion_id', '=', 'tipos_atenciones.id')
            ->select(
                'tipos_atenciones.nombre as tipo',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('tipos_atenciones.id', 'tipos_atenciones.nombre')
            ->get();
    }

    private function getTopProfesionales($fechaInicio, $fechaFin)
    {
        return Atencion::whereBetween('atenciones.fecha', [$fechaInicio, $fechaFin])
            ->join('profesionales', 'atenciones.profesional_id', '=', 'profesionales.id')
            ->join('personas', 'profesionales.persona_id', '=', 'personas.id')
            ->join('especialidades', 'profesionales.especialidad_id', '=', 'especialidades.id')
            ->select(
                DB::raw("CONCAT(personas.nombre, ' ', personas.apellido) as nombre_completo"),
                'especialidades.nombre as especialidad',
                DB::raw('COUNT(*) as total_atenciones')
            )
            ->groupBy('profesionales.id', 'personas.nombre', 'personas.apellido', 'especialidades.nombre')
            ->orderByDesc('total_atenciones')
            ->limit(10)
            ->get();
    }

    private function getEvolucionMensual()
    {
        return Atencion::select(
            DB::raw('EXTRACT(YEAR FROM fecha) as anio'),
            DB::raw('EXTRACT(MONTH FROM fecha) as mes'),
            DB::raw('COUNT(*) as total')
        )
            ->where('fecha', '>=', Carbon::now()->subMonths(12))
            ->groupBy('anio', 'mes')
            ->orderBy('anio')
            ->orderBy('mes')
            ->get()
            ->map(function ($item) {
                return [
                    'periodo' => Carbon::create($item->anio, $item->mes)->format('M Y'),
                    'total' => $item->total,
                    'mes' => (int) $item->mes,
                    'anio' => (int) $item->anio
                ];
            });
    }

    private function getDistribucionRangoEtario()
    {
        $sub = Persona::whereHas('atenciones')
            ->selectRaw("CASE 
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_de_nacimiento)) < 18 THEN '0-17'
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_de_nacimiento)) BETWEEN 18 AND 30 THEN '18-30'
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_de_nacimiento)) BETWEEN 31 AND 45 THEN '31-45'
            WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, fecha_de_nacimiento)) BETWEEN 46 AND 60 THEN '46-60'
            ELSE '61+'
        END as rango")
            ->selectRaw('COUNT(*) as total')
            ->groupBy('rango');

        return DB::query()
            ->fromSub($sub, 't')
            ->orderByRaw("CASE rango 
            WHEN '0-17' THEN 1
            WHEN '18-30' THEN 2
            WHEN '31-45' THEN 3
            WHEN '46-60' THEN 4
            WHEN '61+' THEN 5
        END")
            ->get();
    }

    private function getEstadisticasGenerales($fechaInicio, $fechaFin)
    {
        $totalAtenciones = Atencion::whereBetween('fecha', [$fechaInicio, $fechaFin])->count();
        $totalPacientes = Atencion::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->distinct('persona_id')
            ->count('persona_id');
        $totalProfesionales = Profesional::where('estado', 'activo')->count();

        $atencionesHoy = Atencion::whereDate('fecha', Carbon::today())->count();
        $atencionesEsteMes = Atencion::whereMonth('fecha', Carbon::now()->month)
            ->whereYear('fecha', Carbon::now()->year)
            ->count();

        return [
            'total_atenciones' => $totalAtenciones,
            'total_pacientes' => $totalPacientes,
            'total_profesionales' => $totalProfesionales,
            'atenciones_hoy' => $atencionesHoy,
            'atenciones_este_mes' => $atencionesEsteMes,
        ];
    }

    private function getComparativaMensual()
    {
        $mesActual = Carbon::now();
        $mesAnterior = Carbon::now()->subMonth();

        $atencionesMesActual = Atencion::whereMonth('fecha', $mesActual->month)
            ->whereYear('fecha', $mesActual->year)
            ->count();

        $atencionesMesAnterior = Atencion::whereMonth('fecha', $mesAnterior->month)
            ->whereYear('fecha', $mesAnterior->year)
            ->count();

        $diferencia = $atencionesMesActual - $atencionesMesAnterior;
        $porcentaje = $atencionesMesAnterior > 0
            ? round(($diferencia / $atencionesMesAnterior) * 100, 2)
            : 0;

        return [
            'mes_actual' => [
                'periodo' => $mesActual->format('F Y'),
                'total' => $atencionesMesActual
            ],
            'mes_anterior' => [
                'periodo' => $mesAnterior->format('F Y'),
                'total' => $atencionesMesAnterior
            ],
            'diferencia' => $diferencia,
            'porcentaje' => $porcentaje,
            'tendencia' => $diferencia >= 0 ? 'aumento' : 'disminucion'
        ];
    }

    private function getPrediccionDemanda()
    {
        // Obtener datos de los últimos 6 meses
        $datos = Atencion::select(
            DB::raw('EXTRACT(YEAR FROM fecha) as anio'),
            DB::raw('EXTRACT(MONTH FROM fecha) as mes'),
            DB::raw('COUNT(*) as total')
        )
            ->where('fecha', '>=', Carbon::now()->subMonths(6))
            ->groupBy('anio', 'mes')
            ->orderBy('anio')
            ->orderBy('mes')
            ->get();

        if ($datos->count() < 3) {
            return [
                'proximo_mes' => 0,
                'confianza' => 'baja',
                'tendencia' => 'insuficiente_datos'
            ];
        }

        // Regresión lineal simple
        $n = $datos->count();
        $sumX = 0;
        $sumY = 0;
        $sumXY = 0;
        $sumX2 = 0;

        foreach ($datos as $index => $dato) {
            $x = $index + 1;
            $y = $dato->total;
            $sumX += $x;
            $sumY += $y;
            $sumXY += $x * $y;
            $sumX2 += $x * $x;
        }

        $pendiente = ($n * $sumXY - $sumX * $sumY) / ($n * $sumX2 - $sumX * $sumX);
        $interseccion = ($sumY - $pendiente * $sumX) / $n;

        $prediccion = round($pendiente * ($n + 1) + $interseccion);
        $promedio = $sumY / $n;
        $confianza = abs($pendiente) > ($promedio * 0.1) ? 'alta' : 'media';

        return [
            'proximo_mes' => max(0, $prediccion),
            'confianza' => $confianza,
            'tendencia' => $pendiente > 0 ? 'creciente' : 'decreciente',
            'historico' => $datos->map(fn($d) => $d->total)->toArray()
        ];
    }
    private function getMapaCalor($fechaInicio, $fechaFin)
    {
        $datos = Atencion::whereBetween('fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('hora')
            ->select(
                DB::raw('EXTRACT(DOW FROM fecha)::integer as dia_semana'),
                DB::raw('EXTRACT(HOUR FROM hora)::integer as hora_dia'),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy(DB::raw('EXTRACT(DOW FROM fecha)'), DB::raw('EXTRACT(HOUR FROM hora)'))
            ->orderBy(DB::raw('EXTRACT(DOW FROM fecha)'))
            ->orderBy(DB::raw('EXTRACT(HOUR FROM hora)'))
            ->get();

        // 🔍 DEBUGGING: Ver qué datos estamos obteniendo
        Log::info('Datos del mapa de calor:', $datos->toArray());

        // Crear matriz 7x24 (días x horas)
        $mapa = [];
        for ($dia = 0; $dia < 7; $dia++) {
            for ($hora = 0; $hora < 24; $hora++) {
                $mapa[$dia][$hora] = 0;
            }
        }

        // Llenar con datos reales
        foreach ($datos as $dato) {
            $dia = (int) $dato->dia_semana;
            $hora = (int) $dato->hora_dia;
            if ($dia >= 0 && $dia < 7 && $hora >= 0 && $hora < 24) {
                $mapa[$dia][$hora] = (int) $dato->total;
            }
        }

        return $mapa;
    }

    private function getTiempoEsperaPorServicio($fechaInicio, $fechaFin)
    {
        return Atencion::whereBetween('atenciones.fecha', [$fechaInicio, $fechaFin])
            ->whereNotNull('atenciones.hora')
            ->whereNotNull('atenciones.hora_inicio_atencion')
            ->join('servicios', 'atenciones.servicio_id', '=', 'servicios.id')
            ->select(
                'servicios.nombre as servicio',
                DB::raw('COUNT(*) as total_atenciones'),
                DB::raw("
                    ROUND(AVG(
                        CASE 
                            WHEN hora_inicio_atencion >= hora THEN 
                                EXTRACT(EPOCH FROM (hora_inicio_atencion - hora)) / 60
                            ELSE 
                                EXTRACT(EPOCH FROM (hora_inicio_atencion + INTERVAL '1 day' - hora)) / 60
                        END
                    )::numeric, 2) as promedio_minutos
                "),
                DB::raw("
                    MIN(
                        CASE 
                            WHEN hora_inicio_atencion >= hora THEN 
                                EXTRACT(EPOCH FROM (hora_inicio_atencion - hora)) / 60
                            ELSE 
                                EXTRACT(EPOCH FROM (hora_inicio_atencion + INTERVAL '1 day' - hora)) / 60
                        END
                    )::integer as minimo_minutos
                "),
                DB::raw("
                    MAX(
                        CASE 
                            WHEN hora_inicio_atencion >= hora THEN 
                                EXTRACT(EPOCH FROM (hora_inicio_atencion - hora)) / 60
                            ELSE 
                                EXTRACT(EPOCH FROM (hora_inicio_atencion + INTERVAL '1 day' - hora)) / 60
                        END
                    )::integer as maximo_minutos
                ")
            )
            ->groupBy('servicios.id', 'servicios.nombre')
            ->having(DB::raw('COUNT(*)'), '>', 0)
            ->orderBy('promedio_minutos', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'servicio' => $item->servicio,
                    'total_atenciones' => $item->total_atenciones,
                    'promedio_minutos' => round($item->promedio_minutos, 1),
                    'minimo_minutos' => max(0, $item->minimo_minutos), // Asegurar que no sea negativo
                    'maximo_minutos' => $item->maximo_minutos,
                ];
            });
    }

    public function exportarPDF(Request $request)
    {
        $fechaInicio = Carbon::parse($request->input('fecha_inicio', Carbon::now()->subDays(30)));
        $fechaFin = Carbon::parse($request->input('fecha_fin', Carbon::now()));

        $datos = [
            'fecha_reporte' => Carbon::now()->format('d/m/Y H:i'),
            'periodo' => $fechaInicio->format('d/m/Y') . ' - ' . $fechaFin->format('d/m/Y'),
            'estadisticas' => $this->getEstadisticasGenerales($fechaInicio, $fechaFin),
            'consultasPorEspecialidad' => $this->getConsultasPorEspecialidad($fechaInicio, $fechaFin),
            'topProfesionales' => $this->getTopProfesionales($fechaInicio, $fechaFin),
            'comparativa' => $this->getComparativaMensual(),
        ];

        $pdf = PDF::loadView('estadisticas.reporte-pdf', $datos);
        return $pdf->stream('estadisticas-' . Carbon::now()->format('Y-m-d') . '.pdf');
    }

    public function exportarExcel(Request $request)
    {
        $fechaInicio = Carbon::parse($request->input('fecha_inicio', Carbon::now()->subDays(30)));
        $fechaFin = Carbon::parse($request->input('fecha_fin', Carbon::now()));

        return Excel::download(
            new EstadisticasExport($fechaInicio, $fechaFin),
            'estadisticas-' . Carbon::now()->format('Y-m-d') . '.xlsx'
        );
    }
}
