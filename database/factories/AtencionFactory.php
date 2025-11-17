<?php

namespace Database\Factories;

use App\Models\Atencion;
use App\Models\Persona;
use App\Models\Profesional;
use App\Models\Servicio;
use App\Models\TipoAtencion;
use Illuminate\Database\Eloquent\Factories\Factory;

class AtencionFactory extends Factory
{
    protected $model = Atencion::class;

    public function definition()
    {
        return [
            'fecha' => fake()->dateTimeBetween('-1 year', 'now'),
            'hora' => fake()->time('H:i'),
            'servicio_id' => Servicio::inRandomOrder()->value('id') ?? 1,
            'estado_atencion_id' => fake()->randomElement([1, 2, 3]),
            'tipo_atencion_id' => TipoAtencion::inRandomOrder()->value('id') ?? 1,
            'persona_id' => Persona::factory(),
            'profesional_id' => Profesional::factory(),
            'diagnostico_principal' => fake()->sentence(),
            'motivo_de_consulta' => fake()->sentence(),
            'detalle_consulta' => fake()->paragraph(),
            'enfermedad_actual' => fake()->paragraph(),
            'indicaciones' => fake()->optional()->paragraph(),
            'examen_fisico' => fake()->optional()->paragraph(),
            'prestacion_de_enfermeria' => fake()->optional()->paragraph(),
            'realizacion_de_tratamiento' => fake()->optional()->paragraph(),
            'observaciones' => fake()->optional()->sentence(),
        ];
    }


    /** Estado para consultas */
    public function consulta()
    {
        return $this->state([
            'tipo_atencion_id' => 1,
        ]);
    }

    /** Estado para emergencias */
    public function emergencia()
    {
        return $this->state([
            'tipo_atencion_id' => 2,
        ]);
    }

    /** Estado para urgencias */
    public function urgencia()
    {
        return $this->state([
            'tipo_atencion_id' => 3,
        ]);
    }
}
