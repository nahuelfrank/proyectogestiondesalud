<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EstadoAtencion extends Model
{
    use HasFactory;

    protected $table = 'estados_atenciones';

    protected $fillable = ['nombre'];

    // Un estado de atencion tiene muchas atenciones
    public function atenciones()
    {
        return $this->hasMany(Atencion::class);
    }
}
