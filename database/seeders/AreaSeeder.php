<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AreaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seeder para la tabla areas
        DB::table('areas')->insert([
            ['nombre' => 'Contabilidad', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Dirección de Alumnos', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Patrimonio', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Dirección General de Administración', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Dirección de Contrataciones y Compras', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Dirección de Patrimonio', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Dirección de Tesoreria', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Externo', 'created_at' => now(), 'updated_at' => now()],

        ]);
    }
}
