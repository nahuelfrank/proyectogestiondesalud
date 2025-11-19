<?php

namespace App\Http\Controllers;

use App\Models\Atencion;
use App\Models\Atributo;
use App\Models\Persona;
use App\Models\Profesional;
use App\Models\Servicio;
use App\Models\EstadoAtencion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class HistoriaClinicaController extends Controller
{
    /**
     * Muestra la lista de espera del profesional autenticado
     */
    public function listaEspera()
    {
        // Obtener el profesional del usuario autenticado
        $user = Auth::user();
        $profesional = $user->profesional;

        if (!$profesional) {
            return redirect()->route('dashboard')
                ->with('error', 'No tienes un perfil de profesional asociado.');
        }

        // Cargar las relaciones del profesional
        $profesional->load(['persona', 'especialidad']);

        // Obtener las atenciones en espera del profesional
        $atenciones = Atencion::with([
            'persona.tipo_documento',
            'tipo_atencion',
            'estado_atencion',
            'servicio'
        ])
            ->where('profesional_id', $profesional->id)
            ->whereHas('estado_atencion', function ($query) {
                $query->where('id', '1');
            })
            ->orderBy('fecha', 'asc')
            ->orderBy('hora', 'asc')
            ->get();

        return Inertia::render('historias-clinicas/ListaEsperaPage', [
            'atenciones' => $atenciones,
            'profesional' => $profesional,
        ]);
    }

    /**
     * Muestra la historia clínica del paciente
     */
    public function verHistoriaClinica($atencionId)
    {
        $atencion = Atencion::with([
            'persona.genero',
            'persona.tipo_documento',
        ])->findOrFail($atencionId);

        $paciente = $atencion->persona;

        // Calcular edad
        $fechaNacimiento = new \DateTime($paciente->fecha_de_nacimiento);
        $hoy = new \DateTime();
        $edad = $hoy->diff($fechaNacimiento)->y;

        // Obtener historial de atenciones del paciente
        $historialAtenciones = Atencion::with([
            'servicio',
            'tipo_atencion',
            'profesional.persona',
            'estado_atencion'
        ])
            ->where('persona_id', $paciente->id)
            ->where('id', '!=', $atencionId) // Excluir la atención actual
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc')
            ->get();

        return Inertia::render('historias-clinicas/HistoriaClinicaPage', [
            'atencionActual' => $atencion,
            'paciente' => [
                'id' => $paciente->id,
                'nombre_completo' => $paciente->nombre . ' ' . $paciente->apellido,
                'edad' => $edad,
                'genero' => $paciente->genero->nombre,
                'tipo_documento' => $paciente->tipo_documento->nombre,
                'numero_documento' => $paciente->numero_documento,
            ],
            'historialAtenciones' => $historialAtenciones,
        ]);
    }

    /**
     * Muestra el detalle de una atención específica
     */
    public function verDetalleAtencion($atencionId)
    {
        $atencion = Atencion::with([
            'persona',
            'servicio',
            'tipo_atencion',
            'profesional.persona',
            'profesional.especialidad',
            'estado_atencion'
        ])->findOrFail($atencionId);

        return Inertia::render('historias-clinicas/DetalleAtencionPage', [
            'atencion' => $atencion,
        ]);
    }

    /**
     * Muestra el formulario para registrar una nueva atención
     */
    public function registrarAtencion($atencionId)
    {
        $atencion = Atencion::with([
            'persona.genero',
            'persona.tipo_documento',
            'servicio',
            'profesional.persona',
            'profesional.especialidad'
        ])->findOrFail($atencionId);

        // Obtener todos los atributos disponibles
        $atributos = Atributo::orderBy('nombre')->get();

        // Obtener servicios disponibles para derivación (excluyendo el actual)
        $servicios = Servicio::where('estado', 'activo')
            ->where('id', '!=', $atencion->servicio_id)
            ->orderBy('nombre')
            ->get();

        return Inertia::render('historias-clinicas/RegistrarAtencionPage', [
            'atencion' => $atencion,
            'atributos' => $atributos,
            'servicios' => $servicios,
        ]);
    }

    /**
     * Obtiene los profesionales disponibles según el servicio
     */
    public function obtenerProfesionalesPorServicio(Request $request, $servicioId)
    {
        $user = Auth::user();
        $profesionalActual = $user->profesional;

        // Obtener el servicio con sus especialidades
        $servicio = Servicio::with('especialidades_servicios.especialidad')->findOrFail($servicioId);

        // Obtener IDs de especialidades relacionadas al servicio
        $especialidadesIds = $servicio->especialidades_servicios->pluck('especialidad_id');

        // Obtener profesionales con esas especialidades, excluyendo el actual
        $profesionales = Profesional::with([
            'persona',
            'especialidad',
            'disponibilidades_horarias.dia'
        ])
            ->whereIn('especialidad_id', $especialidadesIds)
            ->where('estado', 'activo')
            ->where('id', '!=', $profesionalActual->id)
            ->get()
            ->map(function ($profesional) {
                // Verificar si está disponible según día y hora actual
                $disponible = $this->verificarDisponibilidad($profesional);

                return [
                    'id' => $profesional->id,
                    'nombre_completo' => $profesional->persona->nombre . ' ' . $profesional->persona->apellido,
                    'especialidad' => $profesional->especialidad->nombre,
                    'disponible' => $disponible,
                    'horarios' => $profesional->disponibilidades_horarias->map(function ($horario) {
                        return [
                            'dia' => $horario->dia->nombre,
                            'hora_inicio' => $horario->hora_inicio_atencion,
                            'hora_fin' => $horario->hora_fin_atencion,
                        ];
                    }),
                ];
            });

        return response()->json($profesionales);
    }

    /**
     * Guarda la atención registrada
     */
    public function guardarAtencion(Request $request, $atencionId)
    {
        $validated = $request->validate([
            'motivo_consulta' => ['required', 'string'],
            'prestacion_enfermeria' => ['required', 'string'],
            'observaciones' => ['nullable', 'string'],
            'atributos' => ['nullable', 'array'],
            'atributos.*.atributo_id' => ['required', 'exists:atributos,id'],
            'atributos.*.valor' => ['required', 'string'],
            'derivar' => ['required', 'boolean'],
            'derivacion' => ['required_if:derivar,true', 'array'],
            'derivacion.servicio_id' => ['required_if:derivar,true', 'exists:servicios,id'],
            'derivacion.profesional_id' => ['required_if:derivar,true', 'exists:profesionales,id'],
        ]);

        DB::transaction(function () use ($validated, $atencionId) {
            $atencion = Atencion::findOrFail($atencionId);

            // Actualizar la atención actual
            $atencion->update([
                'motivo_de_consulta' => $validated['motivo_consulta'],
                'prestacion_de_enfermeria' => $validated['prestacion_enfermeria'],
                'observaciones' => $validated['observaciones'] ?? null,
                'hora_inicio_atencion' => now()->format('H:i'),
                'hora_fin_atencion' => now()->format('H:i'),
            ]);

            // Guardar atributos clínicos
            if (isset($validated['atributos']) && count($validated['atributos']) > 0) {
                foreach ($validated['atributos'] as $atributo) {
                    DB::table('atenciones_atributos')->insert([
                        'atencion_id' => $atencion->id,
                        'atributo_id' => $atributo['atributo_id'],
                        'valor' => $atributo['valor'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            if ($validated['derivar']) {
                // Cambiar estado de la atención actual a "Derivado"
                $estadoDerivado = EstadoAtencion::where('nombre', 'Derivado')->first();
                $atencion->update(['estado_atencion_id' => $estadoDerivado->id]);

                // Crear nueva atención derivada
                $estadoEnEspera = EstadoAtencion::where('nombre', 'En espera')->first();

                Atencion::create([
                    'fecha' => now()->format('Y-m-d'),
                    'hora' => now()->format('H:i'),
                    'servicio_id' => $validated['derivacion']['servicio_id'],
                    'profesional_id' => $validated['derivacion']['profesional_id'],
                    'persona_id' => $atencion->persona_id,
                    'tipo_atencion_id' => $atencion->tipo_atencion_id,
                    'estado_atencion_id' => $estadoEnEspera->id,
                ]);
            } else {
                // Cambiar estado a "Atendido"
                $estadoAtendido = EstadoAtencion::where('nombre', 'Atendido')->first();
                $atencion->update(['estado_atencion_id' => $estadoAtendido->id]);
            }
        });

        return redirect()->route('historias-clinicas.lista-espera')
            ->with('success', 'Atención registrada correctamente.');
    }

    /**
     * Verifica si un profesional está disponible según día y hora actual
     */
    private function verificarDisponibilidad(Profesional $profesional): bool
    {
        $diaActual = now()->dayOfWeek; // 0 (Domingo) - 6 (Sábado)
        $horaActual = now()->format('H:i');

        // Ajustar el día para que coincida con tu tabla de días
        // Asumiendo que en tu BD: 1=Lunes, 2=Martes, ..., 7=Domingo
        $diaId = $diaActual === 0 ? 7 : $diaActual;

        $disponibilidad = $profesional->disponibilidades_horarias
            ->where('dia_id', $diaId)
            ->first(function ($horario) use ($horaActual) {
                return $horaActual >= $horario->hora_inicio_atencion &&
                    $horaActual <= $horario->hora_fin_atencion;
            });

        return !is_null($disponibilidad);
    }
}
