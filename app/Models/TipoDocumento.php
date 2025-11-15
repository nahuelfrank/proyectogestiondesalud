<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
class TipoDocumento extends Model
{
    protected $table = 'tipos_documento';

    protected $fillable = ['nombre'];

    // Un tipo de documento tiene muchas personas
    public function personas()
    {
        return $this->hasMany(Persona::class);
    }
}
