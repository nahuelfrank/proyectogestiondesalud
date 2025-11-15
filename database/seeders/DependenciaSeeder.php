<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DependenciaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Seeder para la tabla dependencias
        DB::table('dependencias')->insert([
            ['nombre' => 'Rectorado'],
            ['nombre' => 'Facultad de Ciencias Exactas'],
            ['nombre' => 'Facultad de Ciencias Naturales'],
            ['nombre' => 'Facultad de Ciencias de la Salud'],
            ['nombre' => 'Facultad de Ciencias Económicas, Jurídicas y Sociales'],
            ['nombre' => 'Facultad de Humanidades'],
            ['nombre' => 'Facultad de Ingeniería'],
            ['nombre' => 'Externo']
        ]);
    }
}
