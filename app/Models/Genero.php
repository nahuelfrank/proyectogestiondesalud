<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Genero extends Model
{
    protected $fillable = ['nombre'];

    // Un género tiene muchas personas
    public function personas()
    {
        return $this->hasMany(Persona::class);
    }
}
