<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DisponibilidadHoraria extends Model
{
    use HasFactory;

    protected $table = "disponibilidades_horarias"; 
    protected $casts = [
        'hora_inicio_atencion' => 'datetime:H:i',
        'hora_fin_atencion' => 'datetime:H:i',
    ];
    protected $fillable = [
        'profesional_id',
        'dia_id',
        'hora_inicio_atencion',
        'hora_fin_atencion',
    ];

    public function profesional()
    {
        return $this->belongsTo(Profesional::class);
    }

    public function dia()
    {
        return $this->belongsTo(Dia::class);
    }

}
