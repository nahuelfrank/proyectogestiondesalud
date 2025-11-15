<?php

namespace App\Http\Controllers;

use App\Models\Servicio;
use Illuminate\Validation\Rules\In;
use Inertia\Inertia;
use Illuminate\Http\Request;

class ServicioController extends Controller
{

    public function index(Request $request)
    {
        $query = Servicio::query();

        // Filtro de búsqueda por nombre (case-insensitive)
        if ($search = $request->input('search')) {
            $query->whereRaw('LOWER(nombre) like ?', ['%' . strtolower($search) . '%']);
        }

        // Ordenamiento por nombre por defecto
        $query->orderBy('nombre', 'asc');

        // Paginación
        $servicios = $query->paginate($request->input('perPage', 10))->withQueryString();

        return Inertia::render('servicios/ServicioIndexPage', [
            'items' => $servicios->items(),
            'meta' => [
                'current_page' => $servicios->currentPage(),
                'last_page' => $servicios->lastPage(),
                'per_page' => $servicios->perPage(),
                'total' => $servicios->total(),
            ],
            'filters' => $request->only(['search', 'sort', 'direction', 'perPage']),
        ]);
    }

}
