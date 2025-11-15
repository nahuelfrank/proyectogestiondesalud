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
        Schema::create('dependencias_areas', function (Blueprint $table) {

            $table->foreignId('dependencia_id')
                  ->constrained('dependencias');

            $table->foreignId('area_id')
                  ->constrained('areas');

            $table->primary(['dependencia_id', 'area_id']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('dependencias_areas');
    }
};
