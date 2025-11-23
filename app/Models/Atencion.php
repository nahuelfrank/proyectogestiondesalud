<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Atencion extends Model
{
    use HasFactory;

    protected $table = 'atenciones';
    protected $casts = [
        'hora' => 'datetime:H:i',
    ];
    protected $fillable = [
        'fecha',
        'hora',
        'hora_inicio_atencion',
        'hora_fin_atencion',
        'servicio_id',
        'estado_atencion_id',
        'tipo_atencion_id',
        'persona_id',
        'profesional_id',
        'diagnostico_principal',
        'motivo_de_consulta',
        'detalle_consulta',
        'enfermedad_actual',
        'indicaciones',
        'examen_fisico',
        'prestacion_de_enfermeria',
        'realizacion_de_tratamiento',
        'observaciones',
    ];

    // Una atencion pertenece a un servicio
    public function servicio()
    {
        return $this->belongsTo(Servicio::class, 'servicio_id');
    }

    // Una atencion pertenece a un estado de atencion
    public function estado_atencion()
    {
        return $this->belongsTo(EstadoAtencion::class, 'estado_atencion_id');
    }

    // Una atencion pertenece a un tipo de atencion
    public function tipo_atencion()
    {
        return $this->belongsTo(TipoAtencion::class, 'tipo_atencion_id');
    }

    // Una atencion pertenece a un profesional
    public function profesional()
    {
        return $this->belongsTo(Profesional::class, 'profesional_id');
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class);
    }

    // Relación con atributos clínicos
    public function atenciones_atributos()
    {
        return $this->hasMany(AtencionAtributo::class, 'atencion_id');
    }

    // También se puede agregar una relación many-to-many directa con Atributo
    public function atributos()
    {
        return $this->belongsToMany(
            Atributo::class,
            'atenciones_atributos',
            'atencion_id',
            'atributo_id'
        )->withPivot('valor')->withTimestamps();
    }
}
