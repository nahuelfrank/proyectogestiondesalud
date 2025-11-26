<?php

namespace App\Http\Controllers;

use App\Models\Atencion;
use App\Models\Profesional;
use App\Models\EstadoAtencion;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard', [
            'estadisticasDia' => $this->getEstadisticasDia(),
            'salaEspera' => $this->getSalaEspera(),
            'profesionalesActivos' => $this->getProfesionalesActivos(),
            'distribucionServicios' => $this->getDistribucionServiciosDia(),
            'tiposAtencion' => $this->getTiposAtencionDia(),
            'atencionPorHora' => $this->getAtencionPorHora(),
            'emergenciasUrgencias' => $this->getEmergenciasUrgencias(),
        ]);
    }

    private function getEstadisticasDia()
    {
        $hoy = Carbon::today();

        $total = Atencion::whereDate('fecha', $hoy)->count();

        $completadas = Atencion::whereDate('fecha', $hoy)
            ->whereHas('estado_atencion', function ($q) {
                $q->where('nombre', 'Atendido');
            })
            ->count();

        $pendientes = Atencion::whereDate('fecha', $hoy)
            ->whereHas('estado_atencion', function ($q) {
                $q->whereIn('nombre', ['En Espera', 'En Atención']);
            })
            ->count();

        return [
            'total' => $total,
            'completadas' => $completadas,
            'pendientes' => $pendientes,
        ];
    }

    private function getSalaEspera()
    {
        return Atencion::whereDate('fecha', Carbon::today())
            ->whereHas('estado_atencion', function ($q) {
                $q->where('nombre', 'En Espera');
            })
            ->count();
    }

    private function getProfesionalesActivos()
    {
        // Profesionales activos que tienen atenciones hoy
        $hoy = Carbon::today();

        $profesionalesConAtenciones = Profesional::where('estado', 'Activo')
            ->whereHas('atenciones', function ($q) use ($hoy) {
                $q->whereDate('fecha', $hoy);
            })
            ->pluck('id');

        // Día de la semana actual para disponibilidad
        // Carbon: 0=Domingo, 1=Lunes, ..., 6=Sábado
        $diaSemana = Carbon::now()->dayOfWeek;

        // Mapeo según estructura común en BD
        // Si tu tabla dias tiene: 1=Lunes, 2=Martes, ..., 7=Domingo
        // Necesitamos convertir de Carbon a tu sistema
        $diaId = $diaSemana === 0 ? 7 : $diaSemana; // Domingo pasa de 0 a 7

        $profesionalesConDisponibilidad = Profesional::where('estado', 'activo')
            ->whereHas('disponibilidades_horarias', function ($q) use ($diaId) {
                $q->where('dia_id', $diaId);
            })
            ->pluck('id');

        // Combinar ambos conjuntos (profesionales únicos)
        $profesionalesActivos = $profesionalesConAtenciones
            ->merge($profesionalesConDisponibilidad)
            ->unique();

        return $profesionalesActivos->count();
    }

    private function getDistribucionServiciosDia()
    {
        return Atencion::whereDate('atenciones.fecha', Carbon::today())
            ->join('servicios', 'atenciones.servicio_id', '=', 'servicios.id')
            ->select(
                'servicios.nombre as servicio',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('servicios.id', 'servicios.nombre')
            ->orderByDesc('total')
            ->get();
    }

    private function getTiposAtencionDia()
    {
        return Atencion::whereDate('atenciones.fecha', Carbon::today())
            ->join('tipos_atenciones', 'atenciones.tipo_atencion_id', '=', 'tipos_atenciones.id')
            ->select(
                'tipos_atenciones.nombre as tipo',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('tipos_atenciones.id', 'tipos_atenciones.nombre')
            ->get();
    }

    private function getAtencionPorHora()
    {
        return Atencion::whereDate('fecha', Carbon::today())
            ->whereNotNull('hora')
            ->select(
                // 1. Cambiamos el alias de 'hora' a 'hora_num' para evitar conflicto con el Model Casting
                DB::raw('CAST(EXTRACT(HOUR FROM hora) AS INTEGER) as hora_num'),
                DB::raw('COUNT(*) as total')
            )
            // Agrupar y ordenar debe coincidir con la lógica del select
            ->groupBy(DB::raw('CAST(EXTRACT(HOUR FROM hora) AS INTEGER)'))
            ->orderBy(DB::raw('CAST(EXTRACT(HOUR FROM hora) AS INTEGER)'))
            ->get()
            ->map(function ($item) {
                return [
                    // 2. Accedemos al nuevo alias
                    'hora' => (int) $item->hora_num,
                    'total' => (int) $item->total
                ];
            });
    }

    private function getEmergenciasUrgencias()
    {
        $emergencias = Atencion::whereDate('fecha', Carbon::today())
            ->whereHas('tipo_atencion', function ($q) {
                $q->where('nombre', 'Emergencia');
            })
            ->whereHas('estado_atencion', function ($q) {
                $q->whereIn('nombre', ['En Espera', 'En Atención']);
            })
            ->count();

        $urgencias = Atencion::whereDate('fecha', Carbon::today())
            ->whereHas('tipo_atencion', function ($q) {
                $q->where('nombre', 'Urgencia');
            })
            ->whereHas('estado_atencion', function ($q) {
                $q->whereIn('nombre', ['En Espera', 'En Atención']);
            })
            ->count();

        return [
            'emergencias' => $emergencias,
            'urgencias' => $urgencias,
        ];
    }
}