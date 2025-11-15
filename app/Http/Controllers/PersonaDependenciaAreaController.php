<?php

namespace App\Http\Controllers;

use App\Models\PersonaDependenciaArea;
use Illuminate\Http\Request;

class PersonaDependenciaAreaController extends Controller
{
    public static function attachToPersona($persona, array $dependencias)
    {
        foreach ($dependencias as $dep) {
            PersonaDependenciaArea::create([
                'persona_id' => $persona->id,
                'claustro_id' => $dep['claustro_id'],
                'dependencia_id' => $dep['dependencia_id'],
                'area_id' => $dep['area_id'],
                'fecha_ingreso' => $dep['fecha_ingreso'] ?? null,
                'resolucion' => $dep['resolucion'] ?? null,
                'expediente' => $dep['expediente'] ?? null,
                'estado' => $dep['estado'],
            ]);
        }
    }
}
