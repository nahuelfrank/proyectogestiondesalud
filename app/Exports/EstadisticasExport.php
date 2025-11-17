<?php

namespace App\Exports;

use App\Models\Atencion;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class EstadisticasExport implements WithMultipleSheets
{
    protected $fechaInicio;
    protected $fechaFin;

    public function __construct($fechaInicio, $fechaFin)
    {
        $this->fechaInicio = $fechaInicio;
        $this->fechaFin = $fechaFin;
    }

    public function sheets(): array
    {
        return [
            new ResumenSheet($this->fechaInicio, $this->fechaFin),
            new EspecialidadesSheet($this->fechaInicio, $this->fechaFin),
            new ProfesionalesSheet($this->fechaInicio, $this->fechaFin),
            new PacientesSheet($this->fechaInicio, $this->fechaFin),
        ];
    }
}

class ResumenSheet implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize, WithStyles
{
    protected $fechaInicio;
    protected $fechaFin;

    public function __construct($fechaInicio, $fechaFin)
    {
        $this->fechaInicio = $fechaInicio;
        $this->fechaFin = $fechaFin;
    }

    public function collection()
    {
        $totalAtenciones = Atencion::whereBetween('fecha', [$this->fechaInicio, $this->fechaFin])->count();
        $totalPacientes = Atencion::whereBetween('fecha', [$this->fechaInicio, $this->fechaFin])
            ->distinct('persona_id')->count('persona_id');
        
        return collect([
            ['Total de Atenciones', $totalAtenciones],
            ['Total de Pacientes', $totalPacientes],
            ['Promedio Consultas/Paciente', $totalPacientes > 0 ? round($totalAtenciones / $totalPacientes, 2) : 0],
            ['Período', $this->fechaInicio->format('d/m/Y') . ' - ' . $this->fechaFin->format('d/m/Y')],
        ]);
    }

    public function headings(): array
    {
        return ['Métrica', 'Valor'];
    }

    public function title(): string
    {
        return 'Resumen';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class EspecialidadesSheet implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize, WithStyles
{
    protected $fechaInicio;
    protected $fechaFin;

    public function __construct($fechaInicio, $fechaFin)
    {
        $this->fechaInicio = $fechaInicio;
        $this->fechaFin = $fechaFin;
    }

    public function collection()
    {
        return Atencion::whereBetween('atenciones.fecha', [$this->fechaInicio, $this->fechaFin])
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

    public function headings(): array
    {
        return ['Especialidad', 'Total Consultas'];
    }

    public function title(): string
    {
        return 'Por Especialidad';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class ProfesionalesSheet implements FromCollection, WithHeadings, WithMapping, WithTitle, ShouldAutoSize, WithStyles
{
    protected $fechaInicio;
    protected $fechaFin;

    public function __construct($fechaInicio, $fechaFin)
    {
        $this->fechaInicio = $fechaInicio;
        $this->fechaFin = $fechaFin;
    }

    public function collection()
    {
        return Atencion::whereBetween('atenciones.fecha', [$this->fechaInicio, $this->fechaFin])
            ->join('profesionales', 'atenciones.profesional_id', '=', 'profesionales.id')
            ->join('personas', 'profesionales.persona_id', '=', 'personas.id')
            ->join('especialidades', 'profesionales.especialidad_id', '=', 'especialidades.id')
            ->select(
                'personas.nombre',
                'personas.apellido',
                'especialidades.nombre as especialidad',
                DB::raw('COUNT(*) as total_atenciones')
            )
            ->groupBy('profesionales.id', 'personas.nombre', 'personas.apellido', 'especialidades.nombre')
            ->orderByDesc('total_atenciones')
            ->get();
    }

    public function map($profesional): array
    {
        return [
            $profesional->nombre . ' ' . $profesional->apellido,
            $profesional->especialidad,
            $profesional->total_atenciones,
        ];
    }

    public function headings(): array
    {
        return ['Profesional', 'Especialidad', 'Total Atenciones'];
    }

    public function title(): string
    {
        return 'Profesionales';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}

class PacientesSheet implements FromCollection, WithHeadings, WithTitle, ShouldAutoSize, WithStyles
{
    protected $fechaInicio;
    protected $fechaFin;

    public function __construct($fechaInicio, $fechaFin)
    {
        $this->fechaInicio = $fechaInicio;
        $this->fechaFin = $fechaFin;
    }

    public function collection()
    {
        return Atencion::whereBetween('atenciones.fecha', [$this->fechaInicio, $this->fechaFin])
            ->join('personas', 'atenciones.persona_id', '=', 'personas.id')
            ->join('generos', 'personas.genero_id', '=', 'generos.id')
            ->select(
                'generos.nombre as genero',
                DB::raw('COUNT(DISTINCT personas.id) as total')
            )
            ->groupBy('generos.id', 'generos.nombre')
            ->get();
    }

    public function headings(): array
    {
        return ['Género', 'Total Pacientes'];
    }

    public function title(): string
    {
        return 'Pacientes';
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}