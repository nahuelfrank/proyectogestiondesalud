<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EstadoCivil extends Model
{
    protected $table = 'estados_civiles';

    public function personas()
    {
        return $this->hasMany(Persona::class);
    }
    
}
