<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Atencion extends Model
{
    use HasFactory;

    protected $table = 'atenciones';

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

    // Accesor: Calcula el tiempo de espera en minutos
    // hora = momento de registro (llegada del paciente)
    // hora_inicio_atencion = cuando el profesional lo empieza a atender
    public function getTiempoEsperaAttribute()
    {
        if (!$this->hora || !$this->hora_inicio_atencion) {
            return null;
        }

        $llegada = Carbon::parse($this->fecha . ' ' . $this->hora);
        $inicio = Carbon::parse($this->fecha . ' ' . $this->hora_inicio_atencion);

        // Si la hora de inicio es menor que la hora de llegada, 
        // significa que cruzó la medianoche
        if ($inicio->lt($llegada)) {
            $inicio->addDay();
        }

        return max(0, $llegada->diffInMinutes($inicio));
    }

    // Accesor: Calcula la duración de la atención en minutos
    public function getDuracionAtencionAttribute()
    {
        if (!$this->hora_inicio_atencion || !$this->hora_fin_atencion) {
            return null;
        }

        $inicio = Carbon::parse($this->fecha . ' ' . $this->hora_inicio_atencion);
        $fin = Carbon::parse($this->fecha . ' ' . $this->hora_fin_atencion);

        // Si la hora de fin es menor que la hora de inicio, 
        // significa que cruzó la medianoche
        if ($fin->lt($inicio)) {
            $fin->addDay();
        }

        return max(0, $inicio->diffInMinutes($fin));
    }

    // Accesor: Tiempo total desde registro hasta fin
    public function getTiempoTotalAttribute()
    {
        if (!$this->hora || !$this->hora_fin_atencion) {
            return null;
        }

        $registro = Carbon::parse($this->fecha . ' ' . $this->hora);
        $fin = Carbon::parse($this->fecha . ' ' . $this->hora_fin_atencion);

        // Si la hora de fin es menor que la hora de registro, 
        // significa que cruzó la medianoche
        if ($fin->lt($registro)) {
            $fin->addDay();
        }

        return max(0, $registro->diffInMinutes($fin));
    }

    // Scope: Atenciones completadas (con todos los tiempos registrados)
    public function scopeCompletadas($query)
    {
        return $query->whereNotNull('hora')
            ->whereNotNull('hora_inicio_atencion')
            ->whereNotNull('hora_fin_atencion');
    }

    // Scope: Atenciones con tiempo de espera calculable
    public function scopeConTiempoEspera($query)
    {
        return $query->whereNotNull('hora')
            ->whereNotNull('hora_inicio_atencion');
    }
}
