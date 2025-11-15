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
        Schema::create('especialidades_servicios', function (Blueprint $table) {

            $table->foreignId('especialidad_id')
                  ->constrained('especialidades')
                  ->cascadeOnDelete();

            $table->foreignId('servicio_id')
                  ->constrained('servicios')
                  ->cascadeOnDelete();

            $table->primary(['especialidad_id', 'servicio_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('especialidades_servicios');
    }
};
