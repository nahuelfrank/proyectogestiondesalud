<?php

namespace App\Http\Controllers;

use App\Models\Atencion;
use App\Models\Atributo;
use App\Models\Especialidad;
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
    /**
     * Muestra la lista de espera del profesional autenticado
     * O de todos los profesionales si es super-admin con filtros
     */
    public function listaEspera(Request $request)
    {
        $user = Auth::user();

        // Verificar si es super-admin
        $isSuperAdmin = $user->can('ver-todas-listas-espera');

        if ($isSuperAdmin) {
            return $this->listaEsperaSuperAdmin($request);
        }

        // Lógica normal para profesionales
        return $this->listaEsperaProfesional();
    }

    /**
     * Lista de espera para super-admin con filtros
     * VERSIÓN SIMPLIFICADA - Compatible con PostgreSQL
     */
    private function listaEsperaSuperAdmin(Request $request)
    {
        // Obtener todas las especialidades que tengan profesionales activos
        $especialidadesConProfesionales = Profesional::where('estado', 'Activo')
            ->whereNull('deleted_at')
            ->pluck('especialidad_id')
            ->unique();

        $especialidades = Especialidad::whereIn('id', $especialidadesConProfesionales)
            ->orderBy('nombre')
            ->get()
            ->map(function ($especialidad) {
                // Contar profesionales activos manualmente
                $especialidad->profesionales_count = Profesional::where('especialidad_id', $especialidad->id)
                    ->where('estado', 'Activo')
                    ->whereNull('deleted_at')
                    ->count();
                return $especialidad;
            });

        // Obtener filtros
        $especialidadId = $request->input('especialidad');
        $profesionalId = $request->input('profesional');

        // Variables para la vista
        $profesionalesDeEspecialidad = null;
        $profesionalSeleccionado = null;

        // Query base para atenciones
        $queryEspera = Atencion::with([
            'persona.tipo_documento',
            'tipo_atencion',
            'estado_atencion',
            'servicio'
        ])->whereHas('estado_atencion', function ($query) {
            $query->where('id', '1'); // Estado "En Espera"
        });

        $queryFinalizadas = Atencion::with([
            'persona.tipo_documento',
            'tipo_atencion',
            'estado_atencion',
            'servicio'
        ])->whereHas('estado_atencion', function ($query) {
            $query->whereIn('nombre', ['Atendido', 'Derivado']);
        })->whereDate('fecha', today());

        // Aplicar filtros
        if ($especialidadId) {
            // Si hay especialidad seleccionada, obtener profesionales de esa especialidad
            $profesionalesDeEspecialidad = Profesional::with(['persona', 'especialidad'])
                ->where('especialidad_id', $especialidadId)
                ->where('estado', 'Activo')
                ->whereNull('deleted_at')
                ->orderBy('id')
                ->get();

            if ($profesionalId && $profesionalId !== 'todos') {
                // Filtrar por profesional específico
                $queryEspera->where('profesional_id', $profesionalId);
                $queryFinalizadas->where('profesional_id', $profesionalId);

                $profesionalSeleccionado = Profesional::with(['persona', 'especialidad'])
                    ->find($profesionalId);
            } else {
                // Filtrar por todos los profesionales de la especialidad
                $profesionalesIds = $profesionalesDeEspecialidad->pluck('id');

                if ($profesionalesIds->isNotEmpty()) {
                    $queryEspera->whereIn('profesional_id', $profesionalesIds);
                    $queryFinalizadas->whereIn('profesional_id', $profesionalesIds);
                } else {
                    // Si no hay profesionales, devolver colecciones vacías
                    $queryEspera->whereRaw('1 = 0'); // Forzar resultado vacío
                    $queryFinalizadas->whereRaw('1 = 0'); // Forzar resultado vacío
                }
            }
        }

        // Ejecutar queries
        $atenciones_espera = $queryEspera
            // PRIORIDAD: Emergencia → Urgencia → Otros
            ->orderByRaw("
        CASE 
            WHEN tipo_atencion_id IN (
                SELECT id FROM tipos_atenciones WHERE nombre = 'Emergencia'
            ) THEN 1
            WHEN tipo_atencion_id IN (
                SELECT id FROM tipos_atenciones WHERE nombre = 'Urgencia'
            ) THEN 2
            ELSE 3
        END
    ")

            // ORDEN DE LLEGADA (primero las más tempranas)
            ->orderBy('hora', 'asc')

            // NUEVO: ORDEN POR CAMBIOS RECIENTES
            ->orderBy('updated_at', 'desc')
            ->get();

        $atenciones_finalizadas = $queryFinalizadas
            ->orderBy('hora_fin_atencion', 'desc')
            ->orderBy('hora', 'desc')
            ->get();

        return Inertia::render('historias-clinicas/ListaEsperaPage', [
            'atenciones_espera' => $atenciones_espera,
            'atenciones_finalizadas' => $atenciones_finalizadas,
            'profesional' => $profesionalSeleccionado, // null si no hay selección específica
            'especialidades' => $especialidades,
            'especialidad_seleccionada' => $especialidadId ? (int)$especialidadId : null,
            'profesionales_de_especialidad' => $profesionalesDeEspecialidad,
            'profesional_seleccionado' => $profesionalId && $profesionalId !== 'todos' ? (int)$profesionalId : null,
        ]);
    }

    /**
     * Lista de espera para profesional normal (sin cambios)
     */
    private function listaEsperaProfesional()
    {
        $user = Auth::user();
        $profesional = $user->profesional;

        if (!$profesional) {
            return redirect()->route('roles.index')
                ->with('error', 'No tienes un perfil de profesional asociado.');
        }

        // Cargar las relaciones del profesional
        $profesional->load(['persona', 'especialidad']);

        // Obtener las atenciones en espera del profesional
        $atenciones_espera = Atencion::with([
            'persona.tipo_documento',
            'tipo_atencion',
            'estado_atencion',
            'servicio'
        ])
            ->where('profesional_id', $profesional->id)
            ->whereHas('estado_atencion', function ($query) {
                $query->where('id', '1'); // Estado "En Espera"
            })

            // PRIORIDAD: Emergencia → Urgencia → Otros
            ->orderByRaw("
        CASE 
            WHEN tipo_atencion_id IN (
                SELECT id FROM tipos_atenciones WHERE nombre = 'Emergencia'
            ) THEN 1
            WHEN tipo_atencion_id IN (
                SELECT id FROM tipos_atenciones WHERE nombre = 'Urgencia'
            ) THEN 2
            ELSE 3
        END
    ")

            // ORDEN DE LLEGADA (primero las más tempranas)
            ->orderBy('hora', 'asc')

            // NUEVO: ORDEN POR CAMBIOS RECIENTES
            ->orderBy('updated_at', 'desc')
            ->get();

        // Obtener las atenciones finalizadas del día (Atendido o Derivado)
        $atenciones_finalizadas = Atencion::with([
            'persona.tipo_documento',
            'tipo_atencion',
            'estado_atencion',
            'servicio'
        ])
            ->where('profesional_id', $profesional->id)
            ->whereHas('estado_atencion', function ($query) {
                $query->whereIn('nombre', ['Atendido', 'Derivado']);
            })
            ->whereDate('fecha', today())
            ->orderBy('hora_fin_atencion', 'desc')
            ->orderBy('hora', 'desc')
            ->get();

        return Inertia::render('historias-clinicas/ListaEsperaPage', [
            'atenciones_espera' => $atenciones_espera,
            'atenciones_finalizadas' => $atenciones_finalizadas,
            'profesional' => $profesional,
            'especialidades' => null, // No se envían para profesionales normales
            'especialidad_seleccionada' => null,
            'profesionales_de_especialidad' => null,
            'profesional_seleccionado' => null,
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
        $fechaNacimiento = $paciente->fecha_de_nacimiento
            ? new \DateTime($paciente->fecha_de_nacimiento)
            : null;

        $edad = $fechaNacimiento
            ? (new \DateTime())->diff($fechaNacimiento)->y
            : null;

        // Obtener historial de atenciones del paciente
        $historialAtenciones = Atencion::with([
            'servicio',
            'tipo_atencion',
            'profesional.persona',
            'estado_atencion'
        ])
            ->where('persona_id', $paciente->id)
            ->where('id', '!=', $atencionId)
            ->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc')
            ->get();

        return Inertia::render('historias-clinicas/HistoriaClinicaPage', [
            'atencionActual' => $atencion,
            'paciente' => [
                'id' => $paciente->id,
                'nombre_completo' => trim(($paciente->nombre ?? '') . ' ' . ($paciente->apellido ?? '')),
                'edad' => $edad,
                'genero' => $paciente->genero->nombre ?? 'No especificado',
                'tipo_documento' => $paciente->tipo_documento->nombre ?? 'No especificado',
                'numero_documento' => $paciente->numero_documento,
            ],
            'historialAtenciones' => $historialAtenciones,
        ]);
    }

    /**
     * Muestra el detalle de una atención específica con sus atributos clínicos
     */
    public function verDetalleAtencion($atencionId)
    {
        $atencion = Atencion::with([
            'persona.tipo_documento',
            'servicio',
            'tipo_atencion',
            'profesional.persona',
            'profesional.especialidad',
            'estado_atencion',
            'atenciones_atributos.atributo' // Cargar los atributos clínicos
        ])->findOrFail($atencionId);

        // Determinar el rol del profesional que registró la atención
        $rolProfesional = $this->determinarRolProfesional($atencion->profesional->especialidad->nombre);

        return Inertia::render('historias-clinicas/DetalleAtencionPage', [
            'atencion' => $atencion,
            'rol_profesional' => $rolProfesional, // NUEVO: Enviar rol al frontend
        ]);
    }

    /**
     * Muestra el formulario para editar una atención finalizada
     */
    public function editarAtencionFinalizada($atencionId)
    {
        $user = Auth::user();
        $profesional = $user->profesional;

        $atencion = Atencion::with([
            'persona.tipo_documento',
            'servicio',
            'profesional.persona',
            'profesional.especialidad',
            'atenciones_atributos.atributo'
        ])->findOrFail($atencionId);

        // Verificar que el profesional autenticado sea el mismo que registró la atención
        if ($atencion->profesional_id !== $profesional->id) {
            return redirect()->route('historias-clinicas.lista-espera')
                ->with('error', 'No tienes permiso para editar esta atención.');
        }

        // Determinar el rol del profesional
        $rolProfesional = $this->determinarRolProfesional($profesional->especialidad->nombre);

        return Inertia::render('historias-clinicas/EditarAtencionFinalizadaPage', [
            'atencion' => $atencion,
            'rol_profesional' => $rolProfesional,
        ]);
    }

    /**
     * Actualiza una atención finalizada
     */
    public function actualizarAtencionFinalizada(Request $request, $atencionId)
    {
        $user = Auth::user();
        $profesional = $user->profesional;

        $atencion = Atencion::findOrFail($atencionId);

        // Verificar que el profesional autenticado sea el mismo que registró la atención
        if ($atencion->profesional_id !== $profesional->id) {
            return redirect()->route('historias-clinicas.lista-espera')
                ->with('error', 'No tienes permiso para editar esta atención.');
        }

        // Determinar el rol del profesional
        $rolProfesional = $this->determinarRolProfesional($profesional->especialidad->nombre);

        // Obtener reglas de validación según el rol (SIN derivación)
        $reglas = $this->obtenerReglasValidacionEdicion($rolProfesional);

        // Validar los datos
        $validated = $request->validate($reglas);

        DB::transaction(function () use ($validated, $atencion, $rolProfesional) {
            // NO se actualizan las horas de inicio y fin en edición
            // Solo se actualizan los campos clínicos

            // Eliminar atributos clínicos existentes
            DB::table('atenciones_atributos')
                ->where('atencion_id', $atencion->id)
                ->delete();

            // Preparar y guardar los nuevos atributos según el rol
            $atributos = $this->prepararAtributos($validated, $rolProfesional);

            // Guardar atributos clínicos
            foreach ($atributos as $nombreAtributo => $valor) {
                if (!empty($valor)) {
                    $atributo = Atributo::where('nombre', $nombreAtributo)->first();

                    if ($atributo) {
                        DB::table('atenciones_atributos')->insert([
                            'atencion_id' => $atencion->id,
                            'atributo_id' => $atributo->id,
                            'valor' => $valor,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }
        });

        return redirect()->route('historias-clinicas.lista-espera')
            ->with('success', 'Atención actualizada correctamente.');
    }

    /**
     * Muestra el formulario para registrar una nueva atención
     */
    public function registrarAtencion($atencionId)
    {
        $user = Auth::user();
        $profesional = $user->profesional;

        // Validar que el usuario tenga un profesional asociado
        if (!$profesional) {
            abort(403, 'El usuario no está asociado a un profesional.');
        }

        // Cargar la atención con relaciones (todas pueden ser null)
        $atencion = Atencion::with([
            'persona.genero',
            'persona.tipo_documento',
            'servicio',
            'profesional.persona',
            'profesional.especialidad'
        ])->findOrFail($atencionId);

        // EXTRA: validar que la atención tenga persona (por si quedó huérfana)
        if (!$atencion->persona) {
            abort(404, 'La atención no tiene un paciente asociado.');
        }

        // Obtener servicios disponibles para derivación
        $servicios = Servicio::where('estado', 'Activo')
            ->where('id', '!=', $atencion->servicio_id)
            ->whereHas('especialidades_servicios.especialidad.profesionales', function ($query) use ($profesional) {
                $query->where('estado', 'Activo')
                    ->where('id', '!=', $profesional->id);
            })
            ->orderBy('nombre')
            ->get();
            //var_dump($servicios->count()); exit;
        // Obtener especialidad del profesional sin romper si es null
        $especialidadNombre = $profesional->especialidad->nombre ?? 'General';

        // Rol seguro
        $rolProfesional = $this->determinarRolProfesional($especialidadNombre);

        // Preparar algunos datos protegidos
        $paciente = $atencion->persona;
        $genero = $paciente->genero->nombre ?? 'No especificado';
        $tipoDocumento = $paciente->tipo_documento->nombre ?? 'No especificado';

        return Inertia::render('historias-clinicas/RegistrarAtencionPage', [
            'atencion' => $atencion,

            // Enviar datos protegidos si los necesitás en el frontend
            'paciente_info' => [
                'id' => $paciente->id,
                'nombre_completo' => trim(($paciente->nombre ?? '') . ' ' . ($paciente->apellido ?? '')),
                'genero' => $genero,
                'tipo_documento' => $tipoDocumento,
                'numero_documento' => $paciente->numero_documento,
            ],

            'servicios' => $servicios,
            'rol_profesional' => $rolProfesional,
        ]);
    }


    /**
     * Determina el rol del profesional según su especialidad
     */
    private function determinarRolProfesional(string $especialidad): string
    {
        $especialidadLower = strtolower($especialidad);

        if (str_contains($especialidadLower, 'enferm')) {
            return 'enfermero';
        } elseif (str_contains($especialidadLower, 'medic') || str_contains($especialidadLower, 'médic')) {
            return 'medico';
        } elseif (str_contains($especialidadLower, 'nutricion')) {
            return 'nutricionista';
        } elseif (str_contains($especialidadLower, 'cardio')) {
            return 'cardiologo';
        } elseif (str_contains($especialidadLower, 'psico')) {
            return 'psicologo';
        }

        return 'medico'; // Por defecto
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
            ->where('estado', 'Activo')
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
                            'hora_inicio' => ($horario->hora_inicio_atencion)->format('H:i'),
                            'hora_fin' => ($horario->hora_fin_atencion)->format('H:i'),
                        ];
                    }),
                ];
            });

        return response()->json($profesionales);
    }

    /**
     * Guarda una nueva atención registrada
     */
    public function guardarAtencion(Request $request, $atencionId)
    {
        // Obtener el rol del profesional actual
        $user = Auth::user();
        $profesional = $user->profesional;
        $rolProfesional = $this->determinarRolProfesional($profesional->especialidad->nombre);

        // Validación dinámica según el rol
        $rules = $this->obtenerReglasValidacion($rolProfesional);

        $validated = $request->validate($rules);

        DB::transaction(function () use ($validated, $atencionId, $rolProfesional, $profesional) {
            $atencion = Atencion::findOrFail($atencionId);

            // Preparar datos de actualización base
            $datosActualizacion = [
                'hora_inicio_atencion' => now()->format('H:i'),
                'hora_fin_atencion' => now()->format('H:i'),
            ];

            // Agregar campos específicos según el rol
            $atributos = $this->prepararAtributos($validated, $rolProfesional);

            // Actualizar la atención
            $atencion->update($datosActualizacion);

            // Guardar atributos clínicos
            foreach ($atributos as $nombreAtributo => $valor) {
                if (!empty($valor)) {
                    $atributo = Atributo::where('nombre', $nombreAtributo)->first();

                    if ($atributo) {
                        DB::table('atenciones_atributos')->insert([
                            'atencion_id' => $atencion->id,
                            'atributo_id' => $atributo->id,
                            'valor' => $valor,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            }

            // Manejar derivación
            if ($validated['derivar']) {
                // Cambiar estado de la atención actual a "Derivado"
                $estadoDerivado = EstadoAtencion::where('nombre', 'Derivado')->first();
                $atencion->update(['estado_atencion_id' => $estadoDerivado->id]);

                // Crear nueva atención derivada con fecha y hora automáticas
                $estadoEnEspera = EstadoAtencion::where('nombre', 'En Espera')->first();

                Atencion::create([
                    'fecha' => now()->format('Y-m-d'),
                    'hora' => now()->format('H:i'),
                    'servicio_id' => $validated['derivacion']['servicio_id'],
                    'profesional_id' => $validated['derivacion']['profesional_id'],
                    'persona_id' => $atencion->persona_id,
                    'tipo_atencion_id' => $atencion->tipo_atencion_id,
                    'estado_atencion_id' => $estadoEnEspera->id,
                    'diagnostico_principal' => 'A definir',
                    'motivo_de_consulta' => 'Derivación de ' . $profesional->especialidad->nombre,
                ]);
            } else {
                // Cambiar estado a "Atendido"
                $estadoAtendido = EstadoAtencion::where('nombre', 'Atendido')->first();
                $atencion->update(['estado_atencion_id' => $estadoAtendido->id]);
            }
        });

        $mensaje = $validated['derivar']
            ? 'Atención registrada y derivada correctamente.'
            : 'Atención finalizada correctamente.';

        return redirect()->route('historias-clinicas.lista-espera')
            ->with('success', $mensaje);
    }

    /**
     * Obtiene las reglas de validación según el rol
     */
    private function obtenerReglasValidacion(string $rol): array
    {
        $reglasBase = [
            'derivar' => ['required', 'boolean'],
            'derivacion' => ['nullable', 'array'],
            'derivacion.servicio_id' => ['required_if:derivar,true', 'nullable', 'exists:servicios,id'],
            'derivacion.profesional_id' => ['required_if:derivar,true', 'nullable', 'exists:profesionales,id'],
        ];

        switch ($rol) {
            case 'enfermero':
                return array_merge($reglasBase, [
                    'respiracion' => ['required', 'numeric', 'min:0'],
                    'pulso' => ['required', 'numeric', 'min:0'],
                    'temperatura' => ['required', 'numeric', 'min:0'],
                    'presion_diastolica' => ['required', 'numeric', 'min:0'],
                    'presion_sistolica' => ['required', 'numeric', 'min:0'],
                    'saturacion' => ['required', 'numeric', 'min:0', 'max:100'],
                    'glucemia' => ['required', 'numeric', 'min:0'],
                    'motivo_consulta' => ['required', 'string'],
                    'prestacion_enfermeria' => ['required', 'string'],
                    'observaciones' => ['nullable', 'string'],
                ]);

            case 'medico':
                return array_merge($reglasBase, [
                    'diagnostico_principal' => ['required', 'string'],
                    'enfermedad_actual' => ['required', 'string'],
                    'indicaciones' => ['required', 'string'],
                    'examen_fisico' => ['required', 'string'],
                    'detalle' => ['nullable', 'string'],
                    'observaciones' => ['nullable', 'string'],
                ]);

            case 'nutricionista':
                return array_merge($reglasBase, [
                    'peso' => ['required', 'numeric', 'min:0'],
                    'altura' => ['required', 'numeric', 'min:0'],
                    'imc' => ['required', 'numeric', 'min:0'],
                    'cintura' => ['required', 'numeric', 'min:0'],
                    'brazo' => ['required', 'numeric', 'min:0'],
                    'antecedentes_alimentarios' => ['required', 'string'],
                    'ingesta_calorica_estimada' => ['required', 'numeric', 'min:0'],
                    'diagnostico_nutricional' => ['required', 'string'],
                    'plan_dieta' => ['required', 'string'],
                    'recomendaciones' => ['required', 'string'],
                ]);

            case 'cardiologo':
            case 'psicologo':
                return array_merge($reglasBase, [
                    'observaciones' => ['required', 'string'],
                ]);

            default:
                return $reglasBase;
        }
    }

    /**
     * Obtiene las reglas de validación para edición según el rol
     */
    private function obtenerReglasValidacionEdicion(string $rol): array
    {
        // Sin reglas de derivación
        $reglasBase = [];

        switch ($rol) {
            case 'enfermero':
                return array_merge($reglasBase, [
                    'respiracion' => ['required', 'numeric', 'min:0'],
                    'pulso' => ['required', 'numeric', 'min:0'],
                    'temperatura' => ['required', 'numeric', 'min:0'],
                    'presion_diastolica' => ['required', 'numeric', 'min:0'],
                    'presion_sistolica' => ['required', 'numeric', 'min:0'],
                    'saturacion' => ['required', 'numeric', 'min:0', 'max:100'],
                    'glucemia' => ['required', 'numeric', 'min:0'],
                    'motivo_consulta' => ['required', 'string'],
                    'prestacion_enfermeria' => ['required', 'string'],
                    'observaciones' => ['nullable', 'string'],
                ]);

            case 'medico':
                return array_merge($reglasBase, [
                    'diagnostico_principal' => ['required', 'string'],
                    'enfermedad_actual' => ['required', 'string'],
                    'indicaciones' => ['required', 'string'],
                    'examen_fisico' => ['required', 'string'],
                    'detalle' => ['nullable', 'string'],
                    'observaciones' => ['nullable', 'string'],
                ]);

            case 'nutricionista':
                return array_merge($reglasBase, [
                    'peso' => ['required', 'numeric', 'min:0'],
                    'altura' => ['required', 'numeric', 'min:0'],
                    'imc' => ['required', 'numeric', 'min:0'],
                    'cintura' => ['required', 'numeric', 'min:0'],
                    'brazo' => ['required', 'numeric', 'min:0'],
                    'antecedentes_alimentarios' => ['required', 'string'],
                    'ingesta_calorica_estimada' => ['required', 'numeric', 'min:0'],
                    'diagnostico_nutricional' => ['required', 'string'],
                    'plan_dieta' => ['required', 'string'],
                    'recomendaciones' => ['required', 'string'],
                ]);

            case 'cardiologo':
            case 'psicologo':
                return array_merge($reglasBase, [
                    'observaciones' => ['required', 'string'],
                ]);

            default:
                return $reglasBase;
        }
    }

    /**
     * Prepara los datos para actualización según el rol
     */
    private function prepararDatosActualizacion(array $validated, string $rol): array
    {
        $datos = [];

        switch ($rol) {
            case 'enfermero':
                $datos = [
                    'motivo_de_consulta' => $validated['motivo_consulta'] ?? null,
                    'prestacion_de_enfermeria' => $validated['prestacion_enfermeria'] ?? null,
                    'observaciones' => $validated['observaciones'] ?? null,
                ];
                break;

            case 'medico':
                $datos = [
                    'diagnostico_principal' => $validated['diagnostico_principal'] ?? null,
                    'enfermedad_actual' => $validated['enfermedad_actual'] ?? null,
                    'indicaciones' => $validated['indicaciones'] ?? null,
                    'examen_fisico' => $validated['examen_fisico'] ?? null,
                    'detalle_consulta' => $validated['detalle_consulta'] ?? null,
                    'observaciones' => $validated['observaciones'] ?? null,
                ];
                break;

            case 'nutricionista':
            case 'cardiologo':
            case 'psicologo':
                $datos = [
                    'observaciones' => $validated['observaciones'] ?? null,
                ];
                break;
        }

        return $datos;
    }

    /**
     * Prepara los atributos para guardar según el rol
     */
    private function prepararAtributos(array $validated, string $rol): array
    {
        $atributos = [];

        switch ($rol) {
            case 'enfermero':
                $atributos = [
                    'Respiración' => $validated['respiracion'] ?? null,
                    'Pulso' => $validated['pulso'] ?? null,
                    'Temperatura' => $validated['temperatura'] ?? null,
                    'Presión Diastólica' => $validated['presion_diastolica'] ?? null,
                    'Presión Sistólica' => $validated['presion_sistolica'] ?? null,
                    'Saturación' => $validated['saturacion'] ?? null,
                    'Glucemia' => $validated['glucemia'] ?? null,
                    'Motivo de Consulta' => $validated['motivo_consulta'] ?? null,
                    'Prestación de Enfermería' => $validated['prestacion_enfermeria'] ?? null,
                    'Observaciones' => $validated['observaciones'] ?? null,
                ];
                break;

            case 'medico':
                $atributos = [
                    'Diagnostico Principal' => $validated['diagnostico_principal'] ?? null,
                    'Enfermedad Actual' => $validated['enfermedad_actual'] ?? null,
                    'Indicaciones' => $validated['indicaciones'] ?? null,
                    'Exámen Físico' => $validated['examen_fisico'] ?? null,
                    'Detalle' => $validated['detalle'] ?? null,
                    'Observaciones' => $validated['observaciones'] ?? null,
                ];
                break;

            case 'nutricionista':
                $atributos = [
                    'Peso' => $validated['peso'] ?? null,
                    'Altura' => $validated['altura'] ?? null,
                    'Índice de Masa Corporal' => $validated['imc'] ?? null,
                    'Cintura' => $validated['cintura'] ?? null,
                    'Brazo' => $validated['brazo'] ?? null,
                    'Antecedentes Alimentarios' => $validated['antecedentes_alimentarios'] ?? null,
                    'Ingesta Calórica Estimada' => $validated['ingesta_calorica_estimada'] ?? null,
                    'Diagnostico Nutricional' => $validated['diagnostico_nutricional'] ?? null,
                    'Plan de Dieta' => $validated['plan_dieta'] ?? null,
                    'Recomendaciones' => $validated['recomendaciones'] ?? null,
                ];
                break;

            case 'cardiologo':
            case 'psicologo':
                $atributos = [
                    'Observaciones' => $validated['observaciones'] ?? null,
                ];
                break;
        }

        return $atributos;
    }

    /**
     * Verifica si un profesional está disponible según día y hora actual
     */
    private function verificarDisponibilidad(Profesional $profesional): bool
    {
        $ahora = now();
        $diaActual = $ahora->dayOfWeek; // 0 (Domingo) - 6 (Sábado)
        $horaActual = $ahora->format('H:i:s');

        // Ajustar el día para que coincida con tu tabla de días
        // Asumiendo que en tu BD: 1=Lunes, 2=Martes, ..., 7=Domingo
        $diaId = $diaActual === 0 ? 7 : $diaActual;

        // Buscar disponibilidad en el día actual
        $disponibilidadHoy = $profesional->disponibilidades_horarias
            ->where('dia_id', $diaId);

        // Verificar si algún horario incluye la hora actual
        $estaDisponible = $disponibilidadHoy->contains(function ($horario) use ($horaActual) {
            // Convertir las horas a formato comparable
            $horaInicio = \Carbon\Carbon::parse($horario->hora_inicio_atencion)->format('H:i:s');
            $horaFin = \Carbon\Carbon::parse($horario->hora_fin_atencion)->format('H:i:s');
            
            return $horaActual >= $horaInicio && $horaActual <= $horaFin;
        });

        return $estaDisponible;
    }
}
