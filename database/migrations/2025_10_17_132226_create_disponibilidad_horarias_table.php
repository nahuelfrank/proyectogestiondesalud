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
        Schema::create('disponibilidades_horarias', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('profesional_id')
                  ->constrained('profesionales')
                  ->cascadeOnDelete();

            $table->foreignId('dia_id')
                  ->constrained('dias');

            // Atributos 
            $table->time('hora_inicio_atencion');
            $table->time('hora_fin_atencion');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('disponibilidades_horarias');
    }
};
