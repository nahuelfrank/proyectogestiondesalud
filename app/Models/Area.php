<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{

    use HasFactory;

    protected $table = 'areas';

    protected $fillable = ['nombre'];

    public function dependencias_areas(){
        return $this->hasMany(DependenciaArea::class, 'area_id', 'id');
    }
    
}
