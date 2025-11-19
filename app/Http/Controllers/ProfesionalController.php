<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProfesionalRequest;
use App\Http\Requests\UpdateProfesionalRequest;
use App\Models\Dia;
use App\Models\DisponibilidadHoraria;
use App\Models\Especialidad;
use App\Models\EstadoCivil;
use App\Models\Genero;
use App\Models\Persona;
use App\Models\Profesional;
use App\Models\TipoDocumento;
use App\Exports\ProfesionalHorariosExport;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ProfesionalController extends Controller
{

    public function index(Request $request)
    {
        $query = Profesional::query()
            ->with(['persona', 'persona.tipo_documento', 'especialidad', 'disponibilidades_horarias.dia']);

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
                $query->join('personas', 'profesionales.persona_id', '=', 'personas.id')
                    ->select('profesionales.*')
                    ->orderBy('personas.apellido', $direction)
                    ->orderBy('personas.nombre', $direction);
            } else {
                // Para otros campos que estén en la tabla profesionales
                $query->orderBy($sort, $direction);
            }
        } else {
            // Ordenamiento por defecto: por apellido de la persona
            $query->join('personas', 'profesionales.persona_id', '=', 'personas.id')
                ->select('profesionales.*')
                ->orderBy('personas.apellido', 'asc')
                ->orderBy('personas.nombre', 'asc');
        }

        // Paginación
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
    public function create()
    {
        $personas = Persona::get();
        $especialidades = Especialidad::get();
        $disponibilidades_horarias = DisponibilidadHoraria::get();
        $dias = Dia::get();

        return inertia('profesionales/ProfesionalCreatePage', [
            'profesionales' => new Profesional(),
            'especialidades' => $especialidades,
            'personas' => $personas,
            'disponibilidades_horarias' => $disponibilidades_horarias,
            'dias' => $dias,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProfesionalRequest $request)
    {
        $validaciones = $request->validated();
        Profesional::create($validaciones);

        return redirect()->route('profesionales.index');
    }

    /**
     * Display the specified resource.
     */
    public function show(Profesional $profesional)
    {
        // Cargar todas las relaciones necesarias para mostrar los detalles
        $profesional->load([
            'persona.genero',
            'persona.estado_civil',
            'persona.tipo_documento',
            'especialidad',
            'disponibilidades_horarias.dia'
        ]);

        return Inertia::render('profesionales/ProfesionalShowPage', [
            'persona' => $profesional->persona,
            'profesional' => $profesional,
        ]);
    }
    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Profesional $profesional)
    {
        // Cargar todas las relaciones
        $profesional->load([
            'persona.genero',
            'persona.estado_civil',
            'persona.tipo_documento',
            'especialidad',
            'disponibilidades_horarias.dia'
        ]);

        return Inertia::render('profesionales/ProfesionalEditPage', [
            'persona' => $profesional->persona,
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
    public function update(UpdateProfesionalRequest $request, Profesional $profesional)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($validated, $profesional) {
            // 1. Actualizar datos de la Persona
            $profesional->persona->update([
                'nombre' => $validated['nombre'],
                'apellido' => $validated['apellido'],
                'fecha_de_nacimiento' => $validated['fecha_de_nacimiento'],
                'genero_id' => $validated['genero_id'],
                'tipo_documento_id' => $validated['tipo_documento_id'],
                'numero_documento' => $validated['numero_documento'],
                'estado_civil_id' => $validated['estado_civil_id'],
                'email' => $validated['email'],
            ]);

            // 2. Actualizar datos del Profesional
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
        });

        return redirect()->route('profesionales.index')
            ->with('success', 'Profesional actualizado correctamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public static function attachProfesionalToPersona($persona, $datosProfesional)
    {
        // Crear el profesional
        $profesional = Profesional::create([
            'persona_id' => $persona->id,
            'especialidad_id' => $datosProfesional['especialidad_id'],
            'estado' => $datosProfesional['estado'],
            'matricula' => $datosProfesional['matricula'],
        ]);

        // Crear las disponibilidades horarias si existen
        if (
            isset($datosProfesional['disponibilidades_horarias']) &&
            is_array($datosProfesional['disponibilidades_horarias'])
        ) {

            foreach ($datosProfesional['disponibilidades_horarias'] as $horario) {
                DisponibilidadHoraria::create([
                    'profesional_id' => $profesional->id,
                    'dia_id' => $horario['dia_id'],
                    'hora_inicio_atencion' => $horario['hora_inicio_atencion'],
                    'hora_fin_atencion' => $horario['hora_fin_atencion'],
                ]);
            }
        }

        return $profesional;
    }

    public function reporteHorarios(Profesional $profesional)
    {
        // Cargar relaciones necesarias + ordenar horarios por día y hora
        $profesional->load([
            'persona',
            'especialidad',
            'disponibilidades_horarias' => function ($query) {
                $query->orderBy('dia_id')->orderBy('hora_inicio_atencion');
            },
            'disponibilidades_horarias.dia'
        ]);

        // Agrupar horarios por día (para la vista)
        $horariosAgrupados = $profesional->disponibilidades_horarias
            ->groupBy(fn($h) => $h->dia->nombre);

        return Pdf::loadView(
            'profesionales.reporte_horarios',
            [
                'profesional'      => $profesional,
                'horariosPorDia'   => $horariosAgrupados
            ]
        )->stream("horarios_profesional_{$profesional->id}.pdf");
    }

    public function reporteHorariosExcel(Profesional $profesional)
    {
        return Excel::download(
            new ProfesionalHorariosExport($profesional),
            "horarios_profesional_{$profesional->id}.xlsx"
        );
    }
}
