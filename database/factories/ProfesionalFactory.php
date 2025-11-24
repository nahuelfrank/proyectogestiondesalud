<?php

namespace Database\Factories;

use App\Models\DisponibilidadHoraria;
use App\Models\Profesional;
use App\Models\Persona;
use App\Models\Especialidad;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProfesionalFactory extends Factory
{
    protected $model = Profesional::class;

    public function definition(): array
    {
        return [
            'persona_id' => Persona::doesntHave('profesionales')->inRandomOrder()->value('id')
                ?? Persona::factory(),
            'especialidad_id' => Especialidad::inRandomOrder()->value('id') ?? 1,
            'estado' => 'Activo',
            'matricula' => $this->faker->unique()->numerify('MAT-#####'),
        ];
    }

    public function withDisponibilidades(int $cantidad = 3)
    {
        return $this->has(DisponibilidadHoraria::factory()->count($cantidad), 'disponibilidades_horarias');
    }
}