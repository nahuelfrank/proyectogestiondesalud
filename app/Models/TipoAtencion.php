<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoAtencion extends Model
{
    protected $table = 'tipos_atenciones';

    protected $fillable = ['nombre'];

    // Un tipo de atencion tiene muchas atenciones
    public function atenciones()
    {
        return $this->hasMany(Atencion::class);
    }
}
