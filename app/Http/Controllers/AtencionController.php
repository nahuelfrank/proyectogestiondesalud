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

        return Inertia::render('atenciones/AtencionEditPage', [
            'atencion' => $atencion,
            'estadosAtenciones' => EstadoAtencion::all(),
        ]);
    }

    public function actualizarEstadoAtencion(Request $request, Atencion $atencion)
    {
        $validated = $request->validate([
            'estado_atencion_id' => 'required|exists:estados_atenciones,id',
        ]);

        // Guardamos el estado anterior antes de actualizar
        $estadoAnterior = $atencion->estado_atencion_id;

        // Aplicamos cambios
        $atencion->update($validated);

        // Si el estado cambia a 2 ("En atención")
        if ($validated['estado_atencion_id'] == 2 && $estadoAnterior != 2) {
            $this->iniciarAtencion($atencion);
        }

        // Si el estado cambia a 3 ("Atendido")
        if ($validated['estado_atencion_id'] == 3 && $estadoAnterior != 3) {
            $this->finalizarAtencion($request, $atencion);
        }

        return redirect()->route('atenciones.index')
            ->with('success', 'El estado de atención fue modificado exitosamente.');
    }


    public function iniciarAtencion(Atencion $atencion)
    {
        $atencion->update([
            'hora_inicio_atencion' => now()->format('H:i:s'),
            'estado_atencion_id' => 2, // "En Atención"
        ]);

        return response()->json([
            'message' => 'Atención iniciada',
            'tiempo_espera' => $atencion->tiempo_espera . ' minutos'
        ]);
    }

    public function finalizarAtencion(Request $request, Atencion $atencion)
    {
        $atencion->update([
            'hora_fin_atencion' => now()->format('H:i:s'),
            'estado_atencion_id' => 3
        ]);

        return response()->json([
            'message' => 'Atención finalizada',
            'duracion' => $atencion->duracion_atencion . ' minutos',
            'tiempo_total' => $atencion->tiempo_total . ' minutos'
        ]);
    }

    public function editarAtencion()
    {
    }

    public function actualizarAtencion()
    {

    }

    public function verAtencion()
    {

    }

}
