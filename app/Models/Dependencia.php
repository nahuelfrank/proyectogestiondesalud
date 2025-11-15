<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dependencia extends Model
{

    public function dependencias_areas()
    {
        return $this->hasMany(DependenciaArea::class, 'dependencia_id', 'id');
    }

}
