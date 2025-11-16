<?php

namespace Database\Factories;

use App\Models\Persona;
use App\Models\Genero;
use Illuminate\Database\Eloquent\Factories\Factory;

class PersonaFactory extends Factory
{
    protected $model = Persona::class;

    public function definition()
    {
        return [
            'nombre' => fake()->firstName(),
            'apellido' => fake()->lastName(),
            'numero_documento' => fake()->unique()->numerify('########'),
            'fecha_de_nacimiento' => fake()->dateTimeBetween('-90 years', '-1 years'),
            'domicilio' => fake()->address(),
            'lugar_de_nacimiento' => fake()->city(),
            'telefono_fijo' => fake()->optional()->phoneNumber(),
            'telefono_celular' => fake()->phoneNumber(),
            'nacionalidad' => fake()->country(),
            'email' => fake()->unique()->safeEmail(),
            'genero_id' => Genero::inRandomOrder()->value('id') ?? 1,
            'estado_civil_id' => 1, // puedes randomizarlo si tienes seeder
            'tipo_documento_id' => 1, // idem arriba
        ];
    }

    /** Estado para menores */
    public function child()
    {
        return $this->state([
            'fecha_de_nacimiento' => now()->subYears(fake()->numberBetween(1, 17)),
        ]);
    }

    /** Estado para adultos */
    public function adult()
    {
        return $this->state([
            'fecha_de_nacimiento' => now()->subYears(fake()->numberBetween(18, 65)),
        ]);
    }

    /** Estado para adultos mayores */
    public function senior()
    {
        return $this->state([
            'fecha_de_nacimiento' => now()->subYears(fake()->numberBetween(66, 95)),
        ]);
    }

    public function configure()
    {
        return $this->afterCreating(function ($persona) {

            // Necesitamos dependencias_areas pre cargadas
            $pair = \DB::table('dependencias_areas')->inRandomOrder()->first();

            $persona->personas_dependencias_areas()->create([
                'claustro_id' => \DB::table('claustros')->inRandomOrder()->value('id') ?? 1,
                'dependencia_id' => $pair->dependencia_id,
                'area_id' => $pair->area_id,
                'fecha_ingreso' => now()->subDays(rand(1, 100)),
                'resolucion' => fake()->optional()->bothify('RES###'),
                'expediente' => fake()->optional()->bothify('EXP###'),
                'estado' => fake()->randomElement(['activo', 'inactivo']),
            ]);
        });
    }

}
