<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profesionales', function (Blueprint $table) {
            $table->id();

             // Clave foránea a personas
            $table->foreignId('persona_id')
                  ->constrained('personas')
                  ->cascadeOnDelete();
            
            // Clave foránea a especialidades 
            $table->foreignId('especialidad_id')
                  ->constrained('especialidades');

            // Atributos
            $table->string('estado')->notNullable();   // obligatorio
            $table->string('matricula')->nullable();   // opcional
            
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profesionales');
    }
};
