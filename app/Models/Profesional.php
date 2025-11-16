<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Profesional extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'profesionales';

    protected $fillable = [
        'user_id',
        'persona_id',
        'especialidad_id',
        'estado',
        'matricula',
    ];

    // Se agregó la relación con el modelo User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class);
    }

    public function especialidad()
    {
        return $this->belongsTo(Especialidad::class);
    }

    public function disponibilidades_horarias()
    {
        return $this->hasMany(DisponibilidadHoraria::class)->orderBy('dia_id', 'asc')
            ->orderBy('hora_inicio_atencion', 'asc'); // opcional;
    }
}
