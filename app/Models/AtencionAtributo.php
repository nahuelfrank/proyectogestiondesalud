<?php

namespace App\Models;

use Awobaz\Compoships\Compoships;
use Illuminate\Database\Eloquent\Model;
use Thiagoprz\CompositeKey\HasCompositeKey;

class AtencionAtributo extends Model
{
    use HasCompositeKey;
    use Compoships;

    protected $table = 'atenciones_atributos';

    protected $primaryKey = ['atencion_id', 'atributo_id'];

    protected $fillable = [
        'atencion_id',
        'atributo_id',
    ];

    /**
     * Indica si las IDs son auto-incrementables. Debe ser false para claves compuestas.
     */
    public $incrementing = false;

    public function atencion()
    {
        return $this->belongsTo(Atencion::class, 'atencion_id');
    }

    public function atributo()
    {
        return $this->belongsTo(Atributo::class, 'atributo_id');
    }

    public function atenciones()
    {
        return $this->hasMany(
            Atencion::class,
            ['atencion_id', 'atencion_id'],
            ['atributo_id', 'atributo_id']
        );
    }

}
