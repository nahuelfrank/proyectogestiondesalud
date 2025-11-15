<?php

namespace App\Models;

use Awobaz\Compoships\Compoships;
use Illuminate\Database\Eloquent\Model;
use Thiagoprz\CompositeKey\HasCompositeKey;

class PersonaDependenciaArea extends Model
{
    use HasCompositeKey;
    use Compoships;

    protected $fillable = [
        'persona_id',
        'claustro_id',
        'dependencia_id',
        'area_id',
        'fecha_ingreso',
        'resolucion',
        'expediente',
        'estado',
    ];

    protected $table = 'personas_dependencias_areas';

    protected $primaryKey = ['persona_id', 'claustro_id', 'dependencia_id', 'area_id'];

    /**
     * Indica si las IDs son auto-incrementables. Debe ser false para claves compuestas.
     */
    public $incrementing = false;

    public function claustro()
    {
        return $this->belongsTo(Claustro::class);
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class);
    }

    public function dependencia_area()
    {
        return $this->belongsTo(
            DependenciaArea::class,
            ['dependencia_id', 'area_id'], 
            ['dependencia_id', 'area_id']
        );
    }
}
