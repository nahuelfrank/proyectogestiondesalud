<?php

namespace Database\Factories;

use App\Models\DisponibilidadHoraria;
use App\Models\Profesional;
use App\Models\Dia;
use Illuminate\Database\Eloquent\Factories\Factory;

class DisponibilidadHorariaFactory extends Factory
{
    protected $model = DisponibilidadHoraria::class;

    public function definition(): array
    {
        $horaInicio = $this->faker->time('H:i');
        $horaFin = $this->faker->time('H:i');

        // Aseguramos que la hora fin sea mayor
        if ($horaFin <= $horaInicio) {
            $horaFin = date("H:i", strtotime($horaInicio . " +1 hour"));
        }

        return [
            'profesional_id' => Profesional::factory(),
            'dia_id' => Dia::inRandomOrder()->value('id') ?? 1,
            'hora_inicio_atencion' => $horaInicio,
            'hora_fin_atencion' => $horaFin,
        ];
    }
}
