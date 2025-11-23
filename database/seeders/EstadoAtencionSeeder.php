<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoAtencionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('estados_atenciones')->insert([
            ['nombre' => 'En Espera', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'En Atención', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Atendido', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Cancelado', 'created_at' => now(), 'updated_at' => now()],
            //['nombre' => 'Derivado', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
