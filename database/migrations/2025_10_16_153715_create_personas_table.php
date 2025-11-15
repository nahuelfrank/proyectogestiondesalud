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
        Schema::create('personas', function (Blueprint $table) {
            $table->id();

            // Claves foráneas
            $table->foreignId('genero_id')
                ->nullable()
                ->constrained('generos');

            $table->foreignId('estado_civil_id')
                ->nullable()
                ->constrained('estados_civiles');

            $table->foreignId('tipo_documento_id')
                ->nullable()
                ->constrained('tipos_documento');

            // Atributos personales
            $table->string('nombre');
            $table->string('apellido');
            $table->string('numero_documento')->unique();
            $table->date('fecha_de_nacimiento')->nullable();
            $table->string('domicilio')->nullable();
            $table->string('lugar_de_nacimiento')->nullable();
            $table->string('telefono_fijo')->nullable();
            $table->string('telefono_celular')->nullable();
            $table->string('nacionalidad')->nullable();
            $table->string('email')->nullable();

            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personas');
    }
};
