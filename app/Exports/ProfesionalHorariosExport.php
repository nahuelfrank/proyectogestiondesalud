<?php

namespace App\Exports;

use App\Models\Profesional;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;

class ProfesionalHorariosExport implements FromArray, WithTitle, ShouldAutoSize, WithStyles, WithEvents
{
    protected $profesional;
    protected $horariosAgrupados;
    protected $data = [];

    public function __construct(Profesional $profesional)
    {
        $this->profesional = $profesional;

        // Cargar relaciones necesarias + ordenar horarios por día y hora
        $this->profesional->load([
            'persona',
            'especialidad',
            'disponibilidades_horarias' => function ($query) {
                $query->orderBy('dia_id')->orderBy('hora_inicio_atencion');
            },
            'disponibilidades_horarias.dia'
        ]);

        // Agrupar horarios por día
        $this->horariosAgrupados = $this->profesional->disponibilidades_horarias
            ->groupBy(fn($h) => $h->dia->nombre);

        $this->buildData();
    }

    protected function buildData()
    {
        // Determinar título según especialidad
        $titulos = [
            1 => 'Enfermería',
            2 => 'Médico',
            3 => 'Nutricionista',
            4 => 'Cardiología',
        ];
        $titulo = $titulos[$this->profesional->especialidad->id] ?? 'Psicología';

        // Información del encabezado
        $this->data[] = ['Horarios - ' . $titulo, ''];
        $this->data[] = ['', ''];
        $this->data[] = ['Profesional:', $this->profesional->persona->apellido . ', ' . $this->profesional->persona->nombre];
        $this->data[] = ['Especialidad:', $this->profesional->especialidad->nombre ?? 'Sin especialidad'];
        $this->data[] = ['Matrícula:', $this->profesional->matricula ?? 'No registrada'];
        $this->data[] = ['', ''];

        if ($this->horariosAgrupados->isEmpty()) {
            $this->data[] = ['No hay horarios de atención configurados.', ''];
        } else {
            foreach ($this->horariosAgrupados as $dia => $horarios) {
                // Título del día
                $this->data[] = [$dia, ''];

                // Encabezados de la tabla
                $this->data[] = ['Inicio de Atención', 'Fin de Atención'];

                // Horarios del día
                foreach ($horarios as $horario) {
                    $this->data[] = [
                        $horario->hora_inicio_atencion->format('H:i'),
                        $horario->hora_fin_atencion->format('H:i'),
                    ];
                }

                // Espacio entre días
                $this->data[] = ['', ''];
            }
        }
    }

    public function array(): array
    {
        return $this->data;
    }

    public function title(): string
    {
        return 'Horarios';
    }

    public function styles(Worksheet $sheet)
    {
        $styles = [];

        // Estilo del título principal
        $styles[1] = [
            'font' => [
                'bold' => true,
                'size' => 16,
            ],
        ];

        // Estilos para las etiquetas de información
        $styles[3] = ['font' => ['bold' => true]];
        $styles[4] = ['font' => ['bold' => true]];
        $styles[5] = ['font' => ['bold' => true]];

        return $styles;
    }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function (AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();

                // Encontrar las filas que son títulos de días y encabezados de tabla
                $rowIndex = 1;
                foreach ($this->data as $row) {
                    if (!empty($row[0]) && empty($row[1])) {
                        // Es un título de día (excepto las primeras filas de info)
                        if ($rowIndex > 6) {
                            $sheet->getStyle('A' . $rowIndex)->applyFromArray([
                                'font' => ['bold' => true, 'size' => 12],
                                'fill' => [
                                    'fillType' => Fill::FILL_SOLID,
                                    'startColor' => ['rgb' => 'f0f0f0'],
                                ],
                                'borders' => [
                                    'left' => [
                                        'borderStyle' => Border::BORDER_THICK,
                                        'color' => ['rgb' => '444444'],
                                    ],
                                ],
                            ]);
                        }
                    } elseif ($row[0] === 'Inicio de Atención' && $row[1] === 'Fin de Atención') {
                        // Es un encabezado de tabla
                        $sheet->getStyle('A' . $rowIndex . ':B' . $rowIndex)->applyFromArray([
                            'font' => ['bold' => true],
                            'fill' => [
                                'fillType' => Fill::FILL_SOLID,
                                'startColor' => ['rgb' => 'eeeeee'],
                            ],
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => Border::BORDER_THIN,
                                    'color' => ['rgb' => 'aaaaaa'],
                                ],
                            ],
                        ]);
                    } elseif ($rowIndex > 7 && !empty($row[0]) && !empty($row[1]) && $row[0] !== 'Inicio de Atención') {
                        // Es una fila de datos de horario
                        $sheet->getStyle('A' . $rowIndex . ':B' . $rowIndex)->applyFromArray([
                            'borders' => [
                                'allBorders' => [
                                    'borderStyle' => Border::BORDER_THIN,
                                    'color' => ['rgb' => 'aaaaaa'],
                                ],
                            ],
                        ]);
                    }
                    $rowIndex++;
                }

                // Ajustar el ancho de las columnas
                $sheet->getColumnDimension('A')->setWidth(25);
                $sheet->getColumnDimension('B')->setWidth(25);
            },
        ];
    }
}
