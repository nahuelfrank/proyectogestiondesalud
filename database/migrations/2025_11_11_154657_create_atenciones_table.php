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
        Schema::create('atenciones', function (Blueprint $table) {
            $table->id();

            // Claves foráneas
            $table->foreignId('servicio_id')
                ->constrained('servicios');

            $table->foreignId('estado_atencion_id')
                ->constrained('estados_atenciones');

            $table->foreignId('tipo_atencion_id')
                ->constrained('tipos_atenciones');

            $table->foreignId('profesional_id')
                ->constrained('profesionales');

            $table->foreignId('persona_id')
                ->constrained('personas');

            // Atributos personales
            $table->date('fecha');
            $table->time('hora');
            $table->string('diagnostico_principal');
            $table->string('motivo_de_consulta');
            $table->string('detalle_consulta')->nullable();
            $table->string('enfermedad_actual')->nullable();
            $table->string('indicaciones')->nullable();
            $table->string('examen_fisico')->nullable();
            $table->string('prestacion_de_enfermeria')->nullable();
            $table->string('realizacion_de_tratamiento')->nullable();
            $table->string('observaciones')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('atenciones');
    }
};
