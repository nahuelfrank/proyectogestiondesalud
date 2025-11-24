<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePersonaRequest;
use App\Http\Requests\UpdatePersonaRequest;
use App\Http\Requests\UpdateProfesionalRequest;
use App\Models\Claustro;
use App\Models\DependenciaArea;
use App\Models\EstadoCivil;
use App\Models\Genero;
use App\Models\Persona;
use App\Models\TipoDocumento;
use App\Http\Controllers\PersonaDependenciaAreaController as PDAController;
use App\Http\Requests\StoreProfesionalRequest;
use App\Models\Dia;
use App\Models\DisponibilidadHoraria;
use App\Models\Especialidad;
use App\Models\Profesional;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class PersonaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Persona::query()
            ->with(['genero', 'estado_civil', 'tipo_documento']);

        // Filtro de búsqueda (case-insensitive)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('numero_documento', 'ILIKE', "%{$search}%")
                    ->orWhere('nombre', 'ILIKE', "%{$search}%")
                    ->orWhere('apellido', 'ILIKE', "%{$search}%")
                    ->orWhereRaw("CONCAT(nombre, ' ', apellido) ILIKE ?", ["%{$search}%"]);
            });
        }

        /* Ordenamiento
        if ($sort = $request->input('sort')) {
            $direction = $request->input('direction', 'asc');
            $query->orderBy($sort, $direction);
        } else {
            $query->orderBy('created_at', 'asc');
        }
        */

        $query->orderBy('apellido', 'asc')->orderBy('nombre', 'asc');

        // Paginación
        $personas = $query->paginate($request->input('perPage', 10))->withQueryString();

        return Inertia::render('personas/PersonaIndexPage', [
            'items' => $personas->items(),
            'meta' => [
                'current_page' => $personas->currentPage(),
                'last_page' => $personas->lastPage(),
                'per_page' => $personas->perPage(),
                'total' => $personas->total(),
            ],
            'filters' => $request->only(['search', 'sort', 'direction', 'perPage']),
        ]);
    }


    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('personas/PersonaCreatePage', [
            'generos' => Genero::all(),
            'estadosCiviles' => EstadoCivil::all(),
            'tiposDocumento' => TipoDocumento::all(),
            'claustros' => Claustro::all(),
            'dependenciasAreas' => DependenciaArea::with(['dependencia', 'area'])->get(),
            'estados' => [
                ['value' => 'activo', 'label' => 'Activo'],
                ['value' => 'inactivo', 'label' => 'Inactivo'],
            ],
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StorePersonaRequest $request)
    {
        $validated = $request->validated();

        // Si no existe, proceder a crear dentro de una transacción
        DB::transaction(function () use ($validated) {
            $persona = Persona::create(collect($validated)->except('dependencias')->toArray());
            PDAController::attachToPersona($persona, $validated['dependencias']);

            // Guardar el ID del paciente reciente en la sesión
            session()->flash(
                'paciente_reciente',
                $persona->fresh(['tipo_documento'])
            );

        });

        return redirect()->route('atenciones.crear_atencion')
            ->with('success', 'El paciente fue registrado correctamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Persona $persona)
    {
        $persona->load([
            'genero',
            'estado_civil',
            'tipo_documento',
            'personas_dependencias_areas.claustro',
            'personas_dependencias_areas.dependencia_area.dependencia',
            'personas_dependencias_areas.dependencia_area.area',
        ]);

        return Inertia::render('personas/PersonaShowPage', [
            'persona' => $persona,
        ]);
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Persona $persona)
    {
        $persona->load([
            'personas_dependencias_areas.claustro',
            'personas_dependencias_areas.dependencia_area.dependencia',
            'personas_dependencias_areas.dependencia_area.area',
        ]);

        return Inertia::render('personas/PersonaEditPage', [
            'persona' => $persona,
            'generos' => Genero::all(),
            'estadosCiviles' => EstadoCivil::all(),
            'tiposDocumento' => TipoDocumento::all(),
            'claustros' => Claustro::all(),
            'dependenciasAreas' => DependenciaArea::with(['dependencia', 'area'])->get(),
            'estados' => [
                ['value' => 'activo', 'label' => 'Activo'],
                ['value' => 'inactivo', 'label' => 'Inactivo'],
            ],
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdatePersonaRequest $request, Persona $persona)
    {
        $data = $request->validated();

        // Guardamos dependencias aparte
        $dependenciasNuevas = $data['dependencias'];
        unset($data['dependencias']);

        // Actualizamos la persona
        $persona->update($data);

        // Traemos las dependencias actuales
        $dependenciasActuales = $persona->personas_dependencias_areas()->get();

        // Para saber cuales borrar después
        $clavesNuevas = [];

        foreach ($dependenciasNuevas as $dep) {

            // Clave compuesta
            $clave = [
                'persona_id' => $persona->id,
                'claustro_id' => $dep['claustro_id'],
                'dependencia_id' => $dep['dependencia_id'],
                'area_id' => $dep['area_id'],
            ];

            $clavesNuevas[] = $clave;

            // Buscar si existe
            $registro = $persona->personas_dependencias_areas()
                ->where($clave)
                ->first();

            if ($registro) {
                //Actualizar
                $registro->update([
                    'fecha_ingreso' => $dep['fecha_ingreso'],
                    'resolucion' => $dep['resolucion'] ?? null,
                    'expediente' => $dep['expediente'] ?? null,
                    'estado' => $dep['estado'],
                ]);
            } else {
                //Crear
                $persona->personas_dependencias_areas()->create(array_merge($clave, [
                    'fecha_ingreso' => $dep['fecha_ingreso'],
                    'resolucion' => $dep['resolucion'] ?? null,
                    'expediente' => $dep['expediente'] ?? null,
                    'estado' => $dep['estado'],
                ]));
            }
        }

        // -----------------------
        // BORRAR LAS QUE YA NO ESTÁN
        // -----------------------
        foreach ($dependenciasActuales as $depActual) {
            $existeEnFront = collect($clavesNuevas)->contains(function ($item) use ($depActual) {
                return
                    $item['persona_id'] == $depActual->persona_id &&
                    $item['claustro_id'] == $depActual->claustro_id &&
                    $item['dependencia_id'] == $depActual->dependencia_id &&
                    $item['area_id'] == $depActual->area_id;
            });

            if (!$existeEnFront) {
                $depActual->delete();
            }
        }

        return redirect()
            ->route('personas.index')
            ->with('success', 'El paciente fue modificado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Persona $persona)
    {
        $persona->delete(); // Esto marca el deleted_at, no borra realmente

        return back()->with('success', 'El paciente fue eliminado correctamente.');
    }

    /**
     * Show the form for fast creating a new resource.
     */
    public function fastCreate()
    {
        return inertia('personas/PersonaFastCreatePage', [
            'tiposDocumento' => TipoDocumento::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage quickly.
     */
    public function fastStore(Request $request)
    {
        $data = $request->validate([
            'nombre' => ['required', 'string'],
            'apellido' => ['nullable', 'string'],

            // si numero_documento existe → tipo_documento_id es requerido
            'tipo_documento_id' => [
                'nullable',
                'exists:tipos_documento,id',
                'required_with:numero_documento'
            ],

            // si tipo_documento_id existe → numero_documento es requerido
            'numero_documento' => [
                'nullable',
                'string',
                Rule::unique('personas', 'numero_documento')->withoutTrashed(),
                'required_with:tipo_documento_id'
            ],

        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'numero_documento.unique' => 'El número de documento ya existe en el sistema.',

            // mensajes personalizados
            'tipo_documento_id.required_with' => 'Debes seleccionar el tipo de documento.',
            'numero_documento.required_with' => 'Debes ingresar el número de documento.',
        ]);
        // SI FALTAN DATOS → completar automáticamente

        if (!$data['apellido']) {
            $data['apellido'] = "Urgencia";
        }

        if (!$data['tipo_documento_id']) {
            $data['tipo_documento_id'] = TipoDocumento::where('nombre', 'Documento Nacional de Identidad')->first()->id;
        }

        if (!($data['numero_documento'] ?? null)) {

            $max = Persona::withTrashed()
                ->whereRaw("numero_documento !~ '[^0-9]'")
                ->whereRaw('CAST(numero_documento AS BIGINT) < 1000000')
                ->max('numero_documento');

            $numero = $max ? $max + 1 : 1;

            while (Persona::withTrashed()->where('numero_documento', $numero)->exists()) {
                $numero++;
            }

            $data['numero_documento'] = (string) $numero;
        }

        Persona::create($data);
        session()->flash(
            'carga_rapida',
            $data
        );

        return redirect()->route('atenciones.crear_atencion')
            ->with('success', 'El paciente fue registrado correctamente (carga rápida).');
    }

    public function destroyFastCreate(Persona $persona)
    {
        $persona->delete(); // Esto marca el deleted_at, no borra realmente

        return back()->with('success', 'El paciente fue eliminado correctamente.');
    }


    public function indexProfesionales(Request $request)
    {
        $query = Persona::query()
            ->with(['profesionales', 'profesionales.especialidad', 'profesionales.disponibilidades_horarias.dia']);

        // Filtro de búsqueda (case-insensitive)
        if ($search = $request->input('search')) {
            $query->whereHas('persona', function ($q) use ($search) {
                $searchTerm = '%' . strtolower($search) . '%';
                $q->whereRaw('LOWER(nombre) like ?', [$searchTerm])
                    ->orWhereRaw('LOWER(apellido) like ?', [$searchTerm])
                    ->orWhereRaw('LOWER(numero_documento) like ?', [$searchTerm])
                    ->orWhereRaw('LOWER(email) like ?', [$searchTerm]);
            });
        }

        // Ordenamiento
        if ($sort = $request->input('sort')) {
            $direction = $request->input('direction', 'asc');

            // Si se ordena por campos de la tabla persona
            if (in_array($sort, ['nombre', 'apellido', 'nombre_apellido'])) {
                $query->orderBy('apellido', $direction)->orderBy('nombre', $direction);
            } else {
                // Para otros campos que estén en la tabla profesionales
                $query->orderBy($sort, $direction);
            }
        } else {
            // Ordenamiento por defecto: por apellido de la persona
            $query->orderBy('apellido', 'asc')
                ->orderBy('nombre', 'asc');
        }

        // Paginación
        //Le vamos a llamar $profesionales pero en realidad es una persona
        $profesionales = $query->paginate($request->input('perPage', 10))->withQueryString();

        return Inertia::render('profesionales/ProfesionalIndexPage', [
            'items' => $profesionales->items(),
            'meta' => [
                'current_page' => $profesionales->currentPage(),
                'last_page' => $profesionales->lastPage(),
                'per_page' => $profesionales->perPage(),
                'total' => $profesionales->total(),
            ],
            'filters' => $request->only(['search', 'sort', 'direction', 'perPage']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function crearProfesional()
    {
        return Inertia::render('profesionales/ProfesionalCreatePage', [
            'generos' => Genero::orderBy('nombre')->get(),
            'estados_civiles' => EstadoCivil::orderBy('nombre')->get(),
            'tipos_documento' => TipoDocumento::orderBy('nombre')->get(),
            'especialidades' => Especialidad::orderBy('nombre')->get(), // ← AGREGADO
            'disponibilidades_horarias' => DisponibilidadHoraria::get(),
            'dias' => Dia::get(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function guardarProfesional(StoreProfesionalRequest $request)
    {
        // Validar los datos
        $validated = $request->validated();


        // Crear dentro de una transacción
        DB::transaction(function () use ($validated) {
            // Crear la Persona
            $persona = Persona::create([
                'nombre' => $validated['nombre'],
                'apellido' => $validated['apellido'],
                'fecha_de_nacimiento' => $validated['fecha_de_nacimiento'],
                'genero_id' => $validated['genero_id'],
                'tipo_documento_id' => $validated['tipo_documento_id'],
                'numero_documento' => $validated['numero_documento'],
                'estado_civil_id' => $validated['estado_civil_id'],
                'nacionalidad' => $validated['nacionalidad'],
                'email' => $validated['email'],
                'domicilio' => $validated['domicilio'],
                'lugar_de_nacimiento' => $validated['lugar_de_nacimiento'],
                'telefono_fijo' => $validated['telefono_fijo'],
                'telefono_celular' => $validated['telefono_celular'],
            ]);

            // Crear el Profesional y sus horarios usando el método attach
            $datosProfesional = [
                'especialidad_id' => $validated['especialidad_id'],
                'estado' => $validated['estado'],
                'matricula' => $validated['matricula'],
                'disponibilidades_horarias' => $validated['disponibilidades_horarias'] ?? [],
            ];

            ProfesionalController::attachProfesionalToPersona($persona, $datosProfesional);
        });

        return redirect()->route('profesionales.index')
            ->with('success', 'Profesional creado correctamente con sus horarios de atención.');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function editarProfesional(Persona $persona)
    {
        // Cargar el profesional de esta persona con sus relaciones
        $persona->load([
            'profesionales.especialidad',
            'profesionales.disponibilidades_horarias.dia',
            'genero',
            'estado_civil',
            'tipo_documento'
        ]);

        // Obtener el primer profesional (asumiendo que una persona tiene un solo profesional activo)
        $profesional = $persona->profesionales->first();

        //if (!$profesional) {
        //    return redirect()->route('profesionales.index')
        //        ->with('error', 'Esta persona no tiene datos de profesional.');
        //}

        return Inertia::render('profesionales/ProfesionalEditPage', [
            'persona' => $persona,
            'profesional' => $profesional,
            'generos' => Genero::orderBy('nombre')->get(),
            'estados_civiles' => EstadoCivil::orderBy('nombre')->get(),
            'tipos_documento' => TipoDocumento::orderBy('nombre')->get(),
            'especialidades' => Especialidad::orderBy('nombre')->get(),
            'dias' => Dia::orderBy('id')->get(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function actualizarProfesional(UpdateProfesionalRequest $request, Persona $persona)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $persona) {
            // 1. Actualizar datos de la Persona
            $persona->update([
                'nombre' => $validated['nombre'],
                'apellido' => $validated['apellido'],
                'fecha_de_nacimiento' => $validated['fecha_de_nacimiento'],
                'genero_id' => $validated['genero_id'],
                'tipo_documento_id' => $validated['tipo_documento_id'],
                'numero_documento' => $validated['numero_documento'],
                'estado_civil_id' => $validated['estado_civil_id'],
                'nacionalidad' => $validated['nacionalidad'],
                'email' => $validated['email'],
                'domicilio' => $validated['domicilio'],
                'lugar_de_nacimiento' => $validated['lugar_de_nacimiento'],
                'telefono_fijo' => $validated['telefono_fijo'],
                'telefono_celular' => $validated['telefono_celular'],
            ]);

            // 2. Actualizar datos del Profesional
            $profesional = $persona->profesionales->first();
            if ($profesional) {
                $profesional->update([
                    'especialidad_id' => $validated['especialidad_id'],
                    'estado' => $validated['estado'],
                    'matricula' => $validated['matricula'],
                ]);

                // 3. Eliminar horarios anteriores
                $profesional->disponibilidades_horarias()->delete();

                // 4. Crear los nuevos horarios
                if (
                    isset($validated['disponibilidades_horarias']) &&
                    count($validated['disponibilidades_horarias']) > 0
                ) {

                    foreach ($validated['disponibilidades_horarias'] as $horario) {
                        DisponibilidadHoraria::create([
                            'profesional_id' => $profesional->id,
                            'dia_id' => $horario['dia_id'],
                            'hora_inicio_atencion' => $horario['hora_inicio_atencion'],
                            'hora_fin_atencion' => $horario['hora_fin_atencion'],
                        ]);
                    }
                }
            }
        });

        return redirect()->route('profesionales.index')
            ->with('success', 'El profesional fue modificado correctamente.');
    }
}
