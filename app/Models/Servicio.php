<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Servicio extends Model
{
    protected $table = 'servicios';

    protected $fillable = ['nombre', 'estado'];

    // Un servicio tiene muchas atenciones
    public function atenciones()
    {
        return $this->hasMany(Atencion::class);
    }

    // Un servicio tiene muchas especialidades_servicios
    public function especialidades_servicios()
    {
        return $this->hasMany(EspecialidadServicio::class, 'servicio_id', 'id');
    }

}
