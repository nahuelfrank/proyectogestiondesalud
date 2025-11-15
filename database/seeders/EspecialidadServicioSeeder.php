<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EspecialidadServicioSeeder extends Seeder
{
    public function run(): void
    {
        // Obtenemos los IDs según los nombres
        $especialidades = DB::table('especialidades')->pluck('id', 'nombre');
        $servicios = DB::table('servicios')->pluck('id', 'nombre');

        // Asociaciones por nombre
        $asociaciones = [
            'Enfermero' => 'Enfermería',
            'Médico' => 'Medicina',
            'Nutricionista' => 'Nutricionista',
            'Cardiólogo' => 'Cardiología',
            'Psicólogo' => 'Psicología',
        ];

        // Insertamos las asociaciones
        foreach ($asociaciones as $especialidadNombre => $servicioNombre) {
            $especialidadId = $especialidades[$especialidadNombre] ?? null;
            $servicioId = $servicios[$servicioNombre] ?? null;

            if (!$especialidadId || !$servicioId) {
                continue; // saltamos si no existen los registros
            }

            DB::table('especialidades_servicios')->insert([
                'especialidad_id' => $especialidadId,
                'servicio_id' => $servicioId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
