<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ServicioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('servicios')->insert([
            ['nombre' => 'Enfermería', 'estado' => 'Activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Nutricionista', 'estado' => 'Activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Medicina', 'estado' => 'Activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Cardiología', 'estado' => 'Activo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Psicología', 'estado' => 'Activo', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
