<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Atributo extends Model
{
    //
    public function atenciones_atributos(){
        return $this->hasMany(AtencionAtributo::class, 'atributo_id', 'id');
    }
}
