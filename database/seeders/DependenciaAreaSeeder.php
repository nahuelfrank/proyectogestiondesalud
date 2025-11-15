<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DependenciaAreaSeeder extends Seeder
{
    public function run(): void
    {
        // Obtenemos los IDs según los nombres
        $dependencias = DB::table('dependencias')->pluck('id', 'nombre');
        $areas = DB::table('areas')->pluck('id', 'nombre');

        // Asociaciones por nombre
        $asociaciones = [
            'Rectorado' => [
                'Contabilidad',
                'Dirección General de Administración',
                'Dirección de Contrataciones y Compras',
            ],
            'Facultad de Ciencias Exactas' => [
                'Dirección de Alumnos',
                'Dirección de Tesoreria',
            ],
            'Facultad de Ciencias Naturales' => [
                'Dirección de Alumnos',
                'Patrimonio',
            ],
            'Facultad de Ciencias de la Salud' => [
                'Dirección de Alumnos',
                'Dirección de Patrimonio',
            ],
            'Facultad de Ciencias Económicas, Jurídicas y Sociales' => [
                'Contabilidad',
                'Dirección de Alumnos',
                'Dirección General de Administración',
            ],
            'Facultad de Humanidades' => [
                'Dirección de Alumnos',
                'Patrimonio',
                'Dirección de Patrimonio',
            ],
            'Facultad de Ingeniería' => [
                'Contabilidad',
                'Dirección de Alumnos',
                'Dirección de Tesoreria',
            ],
            'Externo' => [
                'Externo',
            ],
        ];

        // Insertamos las asociaciones
        foreach ($asociaciones as $dependenciaNombre => $areasNombres) {
            $dependenciaId = $dependencias[$dependenciaNombre] ?? null;
            if (!$dependenciaId) continue;

            foreach ($areasNombres as $areaNombre) {
                $areaId = $areas[$areaNombre] ?? null;
                if (!$areaId) continue;

                DB::table('dependencias_areas')->insert([
                    'dependencia_id' => $dependenciaId,
                    'area_id' => $areaId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
