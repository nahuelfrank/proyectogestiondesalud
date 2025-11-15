<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Especialidad extends Model
{

    protected $table = 'especialidades';

    public function profesionales()
    {
        return $this->hasMany(Profesional::class);
    }

    // Una especialidad tiene muchas especialidades_servicios
    public function especialidades_servicios()
    {
        return $this->hasMany(EspecialidadServicio::class, 'especialidad_id', 'id');
    }

}
