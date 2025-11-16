<?php

namespace Database\Factories;

use App\Models\Persona;
use App\Models\PersonaDependenciaArea;
use App\Models\DependenciaArea;
use App\Models\Claustro;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonaDependenciaAreaFactory extends Factory
{
    protected $model = PersonaDependenciaArea::class;

    public function definition()
    {
        $pair = DependenciaArea::inRandomOrder()->first(); // ⚠ requiere seeder ejecutado

        return [
            'persona_id' => Persona::factory(),
            'claustro_id' => Claustro::inRandomOrder()->value('id') ?? 1,
            'dependencia_id' => $pair->dependencia_id,
            'area_id' => $pair->area_id,
            'fecha_ingreso' => fake()->date('Y-m-d'),
            'resolucion' => fake()->optional()->bothify('RES###'),
            'expediente' => fake()->optional()->bothify('EXP###'),
            'estado' => fake()->randomElement(['activo', 'inactivo']),
        ];
    }
}
