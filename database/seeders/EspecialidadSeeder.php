<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EspecialidadSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         // Seeder para la tabla especialidades
        DB::table('especialidades')->insert([
            ['nombre' => 'Enfermero'],
            ['nombre' => 'Médico'],
            ['nombre' => 'Nutricionista'],
            ['nombre' => 'Cardiólogo'],
            ['nombre' => 'Psicólogo']
        ]);
    }
}
