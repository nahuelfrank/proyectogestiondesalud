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
        Schema::table('atenciones_atributos', function (Blueprint $table) {
            // Agregar campo valor para almacenar el valor del atributo clínico
            $table->string('valor', 100)->after('atributo_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('atenciones_atributos', function (Blueprint $table) {
            $table->dropColumn('valor');
        });
    }
};
