<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Claustro extends Model
{

    public function personas_dependencias_areas()
    {
        return $this->hasMany(PersonaDependenciaArea::class);
    }

}
