<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Atributo extends Model
{
    //
    public function atenciones_atributos()
    {
        return $this->hasMany(AtencionAtributo::class, 'atributo_id', 'id');
    }

    // Relación many-to-many con Atencion
    public function atenciones()
    {
        return $this->belongsToMany(
            Atencion::class,
            'atenciones_atributos',
            'atributo_id',
            'atencion_id'
        )->withPivot('valor')->withTimestamps();
    }
}
