<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AtributoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('atributos')->insert([
            ['nombre' => 'Respiración', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Pulso', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Temperatura', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Presión Diastólica', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Presión Sistólica', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Saturación', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Motivo de Consulta', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Prestación de Enfermería', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Observaciones', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Diagnostico Principal', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Enfermedad Actual', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Indicaciones', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Exámen Físico', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Detalle', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Altura', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Peso', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Índice de Masa Corporal', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Cintura', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Glucemia', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Brazo', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Antecedentes Alimentarios', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Ingesta Calórica Estimada', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Diagnostico Nutricional', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Plan de Dieta', 'created_at' => now(), 'updated_at' => now()],
            ['nombre' => 'Recomendaciones', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
