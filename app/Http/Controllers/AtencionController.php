<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAtencionRequest;
use App\Models\Atencion;
use App\Models\Especialidad;
use App\Models\EspecialidadServicio;
use App\Models\EstadoAtencion;
use App\Models\Persona;
use App\Models\Profesional;
use App\Models\TipoAtencion;
use App\Models\TipoDocumento;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\In;
use Inertia\Inertia;


class AtencionController extends Controller
{

    public function index(Request $request)
    {
        $hoy = Carbon::today()->toDateString();

        // Estados permitidos
        $estados = ['En Espera', 'En Atención', 'Cancelado'];

        $query = Atencion::query()
            ->with([
                'servicio:id,nombre',
                'tipo_atencion:id,nombre',
                'estado_atencion:id,nombre',
                'profesional.persona:id,nombre,apellido',
                'persona:id,nombre,apellido',
            ])
            ->whereDate('fecha', $hoy)
            ->whereHas('estado_atencion', function ($q) use ($estados) {
                $q->whereIn('nombre', $estados);
            });

        // Filtro de búsqueda (por paciente o profesional)
        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('persona', function ($q2) use ($search) {
                    $q2->whereRaw("LOWER(nombre) LIKE ?", ['%' . strtolower($search) . '%'])
                        ->orWhereRaw("LOWER(apellido) LIKE ?", ['%' . strtolower($search) . '%']);
                })
                    ->orWhereHas('profesional.persona', function ($q3) use ($search) {
                        $q3->whereRaw("LOWER(nombre) LIKE ?", ['%' . strtolower($search) . '%'])
                            ->orWhereRaw("LOWER(apellido) LIKE ?", ['%' . strtolower($search) . '%']);
                    });
            });
        }

        // PRIORIDAD: Emergencia → Urgencia → Otros
        $query->orderByRaw("
        CASE 
            WHEN tipo_atencion_id IN (
                SELECT id FROM tipos_atenciones WHERE nombre = 'Emergencia'
            ) THEN 1
            WHEN tipo_atencion_id IN (
                SELECT id FROM tipos_atenciones WHERE nombre = 'Urgencia'
            ) THEN 2
            ELSE 3
        END
        ");

        // ORDEN DE LLEGADA (primero las más tempranas)
        $query->orderBy('hora', 'asc');

        // NUEVO: ORDEN POR CAMBIOS RECIENTES
        $query->orderBy('updated_at', 'desc');

        // Paginación
        $atenciones = $query->paginate($request->input('perPage', 10))->withQueryString();

        return Inertia::render('atenciones/AtencionIndexPage', [
            'items' => $atenciones->items(),
            'meta' => [
                'current_page' => $atenciones->currentPage(),
                'last_page' => $atenciones->lastPage(),
                'per_page' => $atenciones->perPage(),
                'total' => $atenciones->total(),
            ],
            'filters' => $request->only(['search', 'perPage']),
        ]);
    }

    public function indexAtendidas(Request $request)
    {
        $estados = ['Atendido', 'Derivado'];

        $query = Atencion::query()
            ->with([
                'servicio:id,nombre',
                'tipo_atencion:id,nombre',
                'estado_atencion:id,nombre',
                'profesional.persona:id,nombre,apellido',
                'persona:id,nombre,apellido,email',
            ])
            ->whereHas('estado_atencion', function ($q) use ($estados) {
                $q->whereIn('nombre', $estados);
            });

        // Filtro search general: paciente o profesional
        if ($search = $request->input('search')) {
            $search = strtolower($search);

            $query->where(function ($q) use ($search) {

                // Paciente
                $q->whereHas('persona', function ($q2) use ($search) {
                    $q2->whereRaw("LOWER(nombre) LIKE ?", ["%$search%"])
                        ->orWhereRaw("LOWER(apellido) LIKE ?", ["%$search%"]);
                })

                    // Profesional
                    ->orWhereHas('profesional.persona', function ($q3) use ($search) {
                        $q3->whereRaw("LOWER(nombre) LIKE ?", ["%$search%"])
                            ->orWhereRaw("LOWER(apellido) LIKE ?", ["%$search%"]);
                    });
            });
        }

        // Ordenar por más recientes (fecha y hora)
        $query->orderBy('fecha', 'desc')
            ->orderBy('hora', 'desc');

        // Paginado
        $atenciones = $query->paginate($request->input('perPage', 10))->withQueryString();

        return Inertia::render('atenciones/AtencionCompletedListPage', [
            'items' => $atenciones->items(),
            'meta' => [
                'current_page' => $atenciones->currentPage(),
                'last_page' => $atenciones->lastPage(),
                'per_page' => $atenciones->perPage(),
                'total' => $atenciones->total(),
            ],
            'filters' => $request->only(['search', 'perPage']),
        ]);
    }

    public function crearAtencion()
    {
        return Inertia::render('atenciones/AtencionCreatePage', [
            'especialidadesServicios' => EspecialidadServicio::with('especialidad', 'servicio')->get(),
            'tiposAtenciones' => TipoAtencion::all(),
            'pacientes' => Persona::with('tipo_documento')->get(),
            'profesionales' => Profesional::with(['persona.tipo_documento', 'disponibilidades_horarias'])->get(),
            'pacienteReciente' => session('paciente_reciente'),
            'pacienteCargaRapida' => session('carga_rapida'),
        ]);
    }

    public function guardarAtencion(Request $request)
    {
        $validated = $request->validate([
            'fecha' => 'required|date',
            'hora' => 'required',
            'servicio_id' => 'required|exists:servicios,id',
            'estado_atencion_id' => 'required|exists:estados_atenciones,id',
            'tipo_atencion_id' => 'required|exists:tipos_atenciones,id',
            'persona_id' => 'required|exists:personas,id',
            'profesional_id' => 'required|exists:profesionales,id',
            'diagnostico_principal' => 'required|string|max:5000',
            'motivo_de_consulta' => 'required|string|max:5000',
        ]);

        // Obtener el profesional y su persona vinculada
        $profesional = Profesional::with('persona')->findOrFail($request->profesional_id);

        // Regla: NO puede atenderse a sí mismo
        if ($profesional->persona_id == $request->persona_id) {
            return back()->withErrors([
                'profesional_id' => 'El profesional no puede atenderse a sí mismo.',
            ])->withInput();
        }

        // Crear la atención directamente
        Atencion::create($validated);

        // Limpiar la sesión
        session()->forget('carga_rapida');

        return redirect()->route('atenciones.index')
            ->with('success', 'La atención fue registrada exitosamente.');
    }


    public function modificarEstadoAtencion(Atencion $atencion)
    {
        $atencion->load([
            'servicio',
            'tipo_atencion',
            'estado_atencion',
            'profesional.persona',
            'persona.tipo_documento',
        ]);

        return Inertia::render('atenciones/AtencionEditStatusPage', [
            'atencion' => $atencion,
            'estadosAtenciones' => EstadoAtencion::whereIn('nombre', ['Cancelado', 'En Espera'])->get(),
        ]);
    }

    public function actualizarEstadoAtencion(Request $request, Atencion $atencion)
    {
        $validated = $request->validate([
            'estado_atencion_id' => 'required|exists:estados_atenciones,id',
        ]);

        // Aplicamos cambios
        $atencion->update($validated);

        return redirect()->route('atenciones.index')
            ->with('success', 'El estado de atención fue modificado exitosamente.');
    }



    public function editarAtencion(Atencion $atencion)
    {
        $atencion->load([
            'servicio',
            'tipo_atencion',
            'persona.tipo_documento',
            'profesional.persona.tipo_documento',
            'profesional.especialidad'
        ]);

        return Inertia::render('atenciones/AtencionEditPage', [
            'atencion' => $atencion,
            'pacientes' => Persona::with('tipo_documento')
                ->where('id', '!=', $atencion->persona_id)
                ->where('id', '!=', $atencion->profesional->persona->id) // ← nuevo filtro
                ->get(),
            'tiposDocumento' => TipoDocumento::all()
        ]);
    }

    // En tu controlador de atenciones:
    public function asociarPaciente(Atencion $atencion, Request $request)
    {
        $request->validate([
            'persona_id' => 'required|exists:personas,id'
        ]);

        // Validación: impedir que el profesional sea seleccionado como paciente
        if ($request->persona_id == $atencion->profesional->persona->id) {
            return back()->with('error', 'El profesional no puede ser seleccionado como paciente.');
        }

        if ($request->persona_id == $atencion->persona_id) {
            return back()->with('error', 'No puedes volver a asignar la misma persona.');
        }


        $pacienteAnteriorId = $atencion->persona_id;

        // Asociar nuevo paciente
        $atencion->persona_id = $request->persona_id;
        $atencion->save();

        // Borrar físicamente el paciente anterior si existía
        if ($pacienteAnteriorId) {
            Persona::withTrashed()
                ->where('id', $pacienteAnteriorId)
                ->forceDelete();   // <- Elimina REALMENTE de la BD
        }

        return redirect()->route('atenciones.index_atendidas')
            ->with('success', 'Paciente asociado correctamente');
    }


    public function actualizarAtencion() {}

    public function verAtencion() {}

    public function verAtencionAdministrativos(Atencion $atencion)
    {
        $atencion->load([
            'servicio',
            'tipo_atencion',
            'estado_atencion',
            'profesional.persona',
            'persona.tipo_documento',
        ]);

        return Inertia::render('atenciones/AtencionShowPage', [
            'atencion' => $atencion,
        ]);
    }
}
