<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoAtencionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tipos_atenciones')->insert([
            ['nombre' => 'Consulta', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Emergencia', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Urgencia', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
