<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Atencion extends Model
{
    use HasFactory;

    protected $table = 'atenciones';

    protected $fillable = [
        'fecha',
        'hora',
        'diagnostico_principal',
        'motivo_de_consulta',
        'detalle_consulta',
        'enfermedad_actual',
        'indicaciones',
        'examen_fisico',
        'prestacion_de_enfermeria',
        'realizacion_de_tratamiento',
        'observaciones',
        'servicio_id',
        'estado_atencion_id',
        'tipo_atencion_id',
        'profesional_id'
    ];

    // Una atencion pertenece a un servicio
    public function servicio(){
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    // Una atencion pertenece a un estado de atencion
    public function estado_atencion(){
        return $this->belongsTo(EstadoAtencion::class, 'estado_atencion_id');
    }

    // Una atencion pertenece a un tipo de atencion
    public function tipo_atencion(){
        return $this->belongsTo(TipoAtencion::class, 'tipo_atencion_id');
    }

    // Una atencion pertenece a un profesional
    public function profesional(){
        return $this->belongsTo(Profesional::class, 'profesional_id');  
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class);
    }
    
}
