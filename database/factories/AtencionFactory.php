<?php

namespace Database\Factories;

use App\Models\Atencion;
use App\Models\Persona;
use App\Models\Profesional;
use App\Models\Servicio;
use App\Models\TipoAtencion;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

class AtencionFactory extends Factory
{
    protected $model = Atencion::class;

    public function definition()
    {
        // Generar fecha y hora de registro (llegada del paciente)
        $fechaHoraRegistro = fake()->dateTimeBetween('-1 year', 'now');
        $fecha = $fechaHoraRegistro->format('Y-m-d');

        // Hora de registro entre 7 AM y 8 PM para evitar problemas de medianoche
        $horaRegistro = fake()->time('H:i:s', '20:00');
        $fechaHoraRegistroCompleta = Carbon::parse($fecha . ' ' . $horaRegistro);

        // Tiempo de espera: entre 5 y 60 minutos
        $tiempoEspera = fake()->numberBetween(5, 60);
        $horaInicioAtencion = Carbon::parse($fechaHoraRegistroCompleta)
            ->addMinutes($tiempoEspera);

        // Duración de la atención: entre 15 y 45 minutos
        $duracionAtencion = fake()->numberBetween(15, 45);
        $horaFinAtencion = Carbon::parse($horaInicioAtencion)
            ->addMinutes($duracionAtencion);

        // Si cruza la medianoche, ajustar para que termine el mismo día
        // Esto simplifica el cálculo y es más realista (centros cierran de noche)
        if ($horaFinAtencion->format('Y-m-d') !== $fecha) {
            // Ajustar para que termine máximo a las 23:30
            $horaRegistro = '18:00:00';
            $fechaHoraRegistroCompleta = Carbon::parse($fecha . ' ' . $horaRegistro);
            $tiempoEspera = fake()->numberBetween(5, 30);
            $duracionAtencion = fake()->numberBetween(15, 30);

            $horaInicioAtencion = Carbon::parse($fechaHoraRegistroCompleta)->addMinutes($tiempoEspera);
            $horaFinAtencion = Carbon::parse($horaInicioAtencion)->addMinutes($duracionAtencion);
        }

        return [
            'fecha' => $fecha,
            'hora' => $horaRegistro,
            'hora_inicio_atencion' => $horaInicioAtencion->format('H:i:s'),
            'hora_fin_atencion' => $horaFinAtencion->format('H:i:s'),
            'servicio_id' => Servicio::inRandomOrder()->value('id') ?? 1,
            'estado_atencion_id' => 3, // Por defecto "Atendido" (completado)
            'tipo_atencion_id' => TipoAtencion::inRandomOrder()->value('id') ?? 1,
            'persona_id' => Persona::inRandomOrder()->value('id'),
            'profesional_id' => Profesional::inRandomOrder()->value('id'),
            'diagnostico_principal' => fake()->sentence(),
            'motivo_de_consulta' => fake()->randomElement([
                'Control de rutina',
                'Dolor abdominal',
                'Fiebre y malestar general',
                'Control de presión arterial',
                'Dolor de cabeza',
                'Tos y resfriado',
                'Consulta por resultados de laboratorio',
                'Dolor muscular',
                'Mareos',
                'Control de diabetes',
                'Dolor de garganta',
                'Alergias',
                'Vacunación',
                'Certificado médico',
                'Seguimiento de tratamiento'
            ]),
            'detalle_consulta' => fake()->paragraph(),
            'enfermedad_actual' => fake()->paragraph(),
            'indicaciones' => fake()->optional()->paragraph(),
            'examen_fisico' => fake()->optional()->paragraph(),
            'prestacion_de_enfermeria' => fake()->optional()->paragraph(),
            'realizacion_de_tratamiento' => fake()->optional()->paragraph(),
            'observaciones' => fake()->optional()->sentence(),
        ];
    }

    /** Estado para atenciones completadas (con todos los tiempos) */
    public function completada()
    {
        return $this->state(function (array $attributes) {
            return [
                'estado_atencion_id' => 3, // "Atendido"
            ];
        });
    }

    /** Estado para atenciones en espera (sin hora de inicio) */
    public function enEspera()
    {
        return $this->state(function (array $attributes) {
            return [
                'estado_atencion_id' => 1, // "En Espera"
                'hora_inicio_atencion' => null,
                'hora_fin_atencion' => null,
            ];
        });
    }

    /** Estado para atenciones en curso (con inicio pero sin fin) */
    public function enAtencion()
    {
        return $this->state(function (array $attributes) {
            $fechaHoraRegistro = Carbon::parse($attributes['fecha'] . ' ' . $attributes['hora']);
            $tiempoEspera = fake()->numberBetween(5, 30);

            return [
                'estado_atencion_id' => 2, // "En Atención"
                'hora_inicio_atencion' => $fechaHoraRegistro->addMinutes($tiempoEspera)->format('H:i:s'),
                'hora_fin_atencion' => null,
            ];
        });
    }

    /** Estado para consultas */
    public function consulta()
    {
        return $this->state([
            'tipo_atencion_id' => 1,
        ]);
    }

    /** Estado para emergencias (menor tiempo de espera) */
    public function emergencia()
    {
        return $this->state(function (array $attributes) {
            $fechaHoraRegistro = Carbon::parse($attributes['fecha'] . ' ' . $attributes['hora']);

            // Emergencias tienen menor tiempo de espera: 1-10 minutos
            $tiempoEspera = fake()->numberBetween(1, 10);
            $horaInicioAtencion = $fechaHoraRegistro->copy()->addMinutes($tiempoEspera)->format('H:i:s');

            // Duración más larga: 30-60 minutos
            $duracionAtencion = fake()->numberBetween(30, 60);
            $horaFinAtencion = $fechaHoraRegistro->copy()
                ->addMinutes($tiempoEspera + $duracionAtencion)
                ->format('H:i:s');

            return [
                'tipo_atencion_id' => 2,
                'hora_inicio_atencion' => $horaInicioAtencion,
                'hora_fin_atencion' => $horaFinAtencion,
                'estado_atencion_id' => 3, // Completada
            ];
        });
    }

    /** Estado para urgencias (tiempo de espera medio) */
    public function urgencia()
    {
        return $this->state(function (array $attributes) {
            $fechaHoraRegistro = Carbon::parse($attributes['fecha'] . ' ' . $attributes['hora']);

            // Urgencias: 5-20 minutos de espera
            $tiempoEspera = fake()->numberBetween(5, 20);
            $horaInicioAtencion = $fechaHoraRegistro->copy()->addMinutes($tiempoEspera)->format('H:i:s');

            // Duración: 20-40 minutos
            $duracionAtencion = fake()->numberBetween(20, 40);
            $horaFinAtencion = $fechaHoraRegistro->copy()
                ->addMinutes($tiempoEspera + $duracionAtencion)
                ->format('H:i:s');

            return [
                'tipo_atencion_id' => 3,
                'hora_inicio_atencion' => $horaInicioAtencion,
                'hora_fin_atencion' => $horaFinAtencion,
                'estado_atencion_id' => 3, // Completada
            ];
        });
    }

    /** Atenciones canceladas */
    public function cancelada()
    {
        return $this->state([
            'estado_atencion_id' => 4, // "Cancelado"
            'hora_inicio_atencion' => null,
            'hora_fin_atencion' => null,
        ]);
    }

    /** Atenciones de hoy */
    public function hoy()
    {
        return $this->state(function (array $attributes) {
            $horaRegistro = fake()->time('H:i:s', 'now');
            $fechaHoraRegistro = Carbon::parse(now()->format('Y-m-d') . ' ' . $horaRegistro);

            $tiempoEspera = fake()->numberBetween(5, 60);
            $horaInicioAtencion = $fechaHoraRegistro->copy()->addMinutes($tiempoEspera)->format('H:i:s');

            $duracionAtencion = fake()->numberBetween(15, 45);
            $horaFinAtencion = $fechaHoraRegistro->copy()
                ->addMinutes($tiempoEspera + $duracionAtencion)
                ->format('H:i:s');

            return [
                'fecha' => now()->format('Y-m-d'),
                'hora' => $horaRegistro,
                'hora_inicio_atencion' => $horaInicioAtencion,
                'hora_fin_atencion' => $horaFinAtencion,
            ];
        });
    }

    /** Atenciones de esta semana */
    public function estaSemana()
    {
        return $this->state(function (array $attributes) {
            $fechaHoraRegistro = fake()->dateTimeBetween('-6 days', 'now');
            $fecha = $fechaHoraRegistro->format('Y-m-d');
            $horaRegistro = $fechaHoraRegistro->format('H:i:s');

            $tiempoEspera = fake()->numberBetween(5, 60);
            $horaInicioAtencion = Carbon::parse($fechaHoraRegistro)
                ->addMinutes($tiempoEspera)
                ->format('H:i:s');

            $duracionAtencion = fake()->numberBetween(15, 45);
            $horaFinAtencion = Carbon::parse($fechaHoraRegistro)
                ->addMinutes($tiempoEspera + $duracionAtencion)
                ->format('H:i:s');

            return [
                'fecha' => $fecha,
                'hora' => $horaRegistro,
                'hora_inicio_atencion' => $horaInicioAtencion,
                'hora_fin_atencion' => $horaFinAtencion,
            ];
        });
    }

    /** Atenciones de este mes */
    public function esteMes()
    {
        return $this->state(function (array $attributes) {
            $fechaHoraRegistro = fake()->dateTimeBetween('-30 days', 'now');
            $fecha = $fechaHoraRegistro->format('Y-m-d');
            $horaRegistro = $fechaHoraRegistro->format('H:i:s');

            $tiempoEspera = fake()->numberBetween(5, 60);
            $horaInicioAtencion = Carbon::parse($fechaHoraRegistro)
                ->addMinutes($tiempoEspera)
                ->format('H:i:s');

            $duracionAtencion = fake()->numberBetween(15, 45);
            $horaFinAtencion = Carbon::parse($fechaHoraRegistro)
                ->addMinutes($tiempoEspera + $duracionAtencion)
                ->format('H:i:s');

            return [
                'fecha' => $fecha,
                'hora' => $horaRegistro,
                'hora_inicio_atencion' => $horaInicioAtencion,
                'hora_fin_atencion' => $horaFinAtencion,
            ];
        });
    }
}