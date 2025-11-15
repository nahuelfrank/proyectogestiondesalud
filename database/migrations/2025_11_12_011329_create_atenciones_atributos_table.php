<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('atenciones_atributos', function (Blueprint $table) {
            $table->foreignId('atencion_id')
                ->constrained('atenciones')
                ->cascadeOnDelete();

            $table->foreignId('atributo_id')
                ->constrained('atributos')
                ->cascadeOnDelete();

            $table->primary(['atencion_id', 'atributo_id']);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('atenciones_atributos');
    }
};

