<?php

namespace Database\Seeders;

use App\Models\Profesional;
use Illuminate\Database\Seeder;

class ProfesionalSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Profesional::factory()->count(10)->withDisponibilidades()->create();
    }

}
