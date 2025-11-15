<?php

namespace App\Models;

use Awobaz\Compoships\Compoships;
use Illuminate\Database\Eloquent\Model;
use Thiagoprz\CompositeKey\HasCompositeKey;

class DependenciaArea extends Model
{
    use HasCompositeKey;
    use Compoships;

    protected $table = 'dependencias_areas';

    protected $primaryKey = ['dependencia_id', 'area_id'];

    protected $fillable = [
        'dependencia_id',
        'area_id',
    ];

    /**
     * Indica si las IDs son auto-incrementables. Debe ser false para claves compuestas.
     */
    public $incrementing = false;

    public function dependencia()
    {
        return $this->belongsTo(Dependencia::class, 'dependencia_id');
    }

    public function area()
    {
        return $this->belongsTo(Area::class, 'area_id');
    }

    public function personas_dependencias_areas()
    {

        return $this->hasMany(
            PersonaDependenciaArea::class,
            ['dependencia_id', 'area_id'],
            ['dependencia_id', 'area_id']
        );
    }
}
