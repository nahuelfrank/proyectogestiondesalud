<?php

namespace App\Models;

use Awobaz\Compoships\Compoships;
use Illuminate\Database\Eloquent\Model;
use Thiagoprz\CompositeKey\HasCompositeKey;

class EspecialidadServicio extends Model
{
    use HasCompositeKey;
    use Compoships;

    protected $table = 'especialidades_servicios';

    protected $primaryKey = ['especialidad_id', 'servicio_id'];

    protected $fillable = [
        'especialidad_id',
        'servicio_id',
    ];

    /**
     * Indica si las IDs son auto-incrementables. Debe ser false para claves compuestas.
     */
    public $incrementing = false;

    public function especialidad()
    {
        return $this->belongsTo(Especialidad::class, 'especialidad_id');
    }

    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

}
