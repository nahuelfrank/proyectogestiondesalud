<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Persona extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $table = 'personas';

    protected $fillable = [
        'nombre',
        'apellido',
        'numero_documento',
        'fecha_de_nacimiento',
        'domicilio',
        'lugar_de_nacimiento',
        'telefono_fijo',
        'telefono_celular',
        'nacionalidad',
        'email',
        'genero_id',
        'estado_civil_id',
        'tipo_documento_id',
    ];

    // Relaciones inversas (cada persona pertenece a un género, estado civil y tipo de documento)
    public function genero()
    {
        return $this->belongsTo(Genero::class);
    }

    public function estado_civil()
    {
        return $this->belongsTo(EstadoCivil::class);
    }

    public function tipo_documento()
    {
        return $this->belongsTo(TipoDocumento::class);
    }

    public function profesionales()
    {
        return $this->hasMany(Profesional::class);
    }

    public function personas_dependencias_areas()
    {
        return $this->hasMany(
            PersonaDependenciaArea::class, 
            'persona_id', // Clave foránea en PersonaDependenciaArea que apunta a Persona
            'id'          // Clave local en Persona (asumimos que es 'id')
        );
    }

    public function atenciones()
    {
        return $this->hasMany(Atencion::class);
    }

}
