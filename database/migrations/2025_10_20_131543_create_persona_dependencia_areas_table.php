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
    Schema::create('personas_dependencias_areas', function (Blueprint $table) {
        
        // Claves foráneas de las tablas personas y claustros
        $table->foreignId('persona_id')
            ->constrained('personas')
            ->cascadeOnDelete();

        $table->foreignId('claustro_id')
            ->constrained('claustros')
            ->cascadeOnDelete();

        // Claves que formarán parte de la clave compuesta hacia dependencias_areas
        $table->unsignedBigInteger('dependencia_id');
        $table->unsignedBigInteger('area_id');

        // Columnas adicionales
        $table->date('fecha_ingreso')->nullable();
        $table->string('resolucion')->nullable();
        $table->string('expediente')->nullable();
        $table->string('estado');

        // Clave foránea compuesta hacia dependencias_areas
        $table->foreign(['dependencia_id', 'area_id'])
            ->references(['dependencia_id', 'area_id'])
            ->on('dependencias_areas')
            ->onDelete('cascade')
            ->onUpdate('cascade');

        // Clave primaria compuesta
        $table->primary(['persona_id', 'claustro_id', 'dependencia_id', 'area_id']);

        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personas_dependencias_areas');
    }
};
