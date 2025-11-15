<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dia extends Model
{

    public function disponibilidades_horarias()
    {
        return $this->hasMany(DisponibilidadHoraria::class);
    }

}
