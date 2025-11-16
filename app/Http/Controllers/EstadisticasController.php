<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Atencion;
use App\Models\Persona;
use App\Models\Profesional;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EstadisticasController extends Controller
{
    public function index()
    {
        // Rango de fechas por defecto (últimos 30 días)
        $fechaInicio = Carbon::now()->subDays(30);
        $fechaFin = Carbon::now();

        return Inertia::render('estadisticas/EstadisticasIndexPage', [
            'pacientesPorDia' => $this->getPacientesPorDia($fechaInicio, $fechaFin),
            'distribucionGenero' => $this->getDistribucionGenero(),
            'motivosConsultaFrecuentes' => $this->getMotivosConsultaFrecuentes(),
            'consultasPorEspecialidad' => $this->getConsultasPorEspecialidad(),
            'promedioConsultasPorPaciente' => $this->getPromedioConsultasPorPaciente(),
            'distribucionTipoAtencion' => $this->getDistribucionTipoAtencion(),
            'topProfesionales' => $this->getTopProfesionales(),
            'evolucionMensual' => $this->getEvolucionMensual(),
            'distribucionRangoEtario' => $this->getDistribucionRangoEtario(),
            'estadisticasGenerales' => $this->getEstadisticasGenerales(),
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

    private function getDistribucionGenero()
    {
        return Persona::join('generos', 'personas.genero_id', '=', 'generos.id')
            ->whereHas('atenciones')
            ->select(
                'generos.nombre as genero',
                DB::raw('COUNT(DISTINCT personas.id) as total')
            )
            ->groupBy('generos.id', 'generos.nombre')
            ->get();
    }

    private function getMotivosConsultaFrecuentes()
    {
        return Atencion::whereNotNull('motivo_de_consulta')
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

    private function getConsultasPorEspecialidad()
    {
        return Atencion::join('profesionales', 'atenciones.profesional_id', '=', 'profesionales.id')
            ->join('especialidades', 'profesionales.especialidad_id', '=', 'especialidades.id')
            ->select(
                'especialidades.nombre as especialidad',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('especialidades.id', 'especialidades.nombre')
            ->orderByDesc('total')
            ->get();
    }

    private function getPromedioConsultasPorPaciente()
    {
        $totalAtenciones = Atencion::count();
        $totalPacientes = Atencion::distinct('persona_id')->count('persona_id');

        return $totalPacientes > 0 ? round($totalAtenciones / $totalPacientes, 2) : 0;
    }

    private function getDistribucionTipoAtencion()
    {
        return Atencion::join('tipos_atenciones', 'atenciones.tipo_atencion_id', '=', 'tipos_atenciones.id')
            ->select(
                'tipos_atenciones.nombre as tipo',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('tipos_atenciones.id', 'tipos_atenciones.nombre')
            ->get();
    }

    private function getTopProfesionales()
    {
        return Atencion::join('profesionales', 'atenciones.profesional_id', '=', 'profesionales.id')
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
                    'total' => $item->total
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


    private function getEstadisticasGenerales()
    {
        $totalAtenciones = Atencion::count();
        $totalPacientes = Persona::whereHas('atenciones')->count();
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
}