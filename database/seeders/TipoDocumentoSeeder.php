<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoDocumentoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('tipos_documento')->insert([
            ['nombre' => 'Carta de Identidad'],
            ['nombre' => 'Cédula de Identidad'],
            ['nombre' => 'Cédula Diplomática'],
            ['nombre' => 'Cédula Mercosur'],
            ['nombre' => 'CUIL/CUIT'],
            ['nombre' => 'Doc. Nac. de Identidad Temporario'],
            ['nombre' => 'Documento Nacional de Identidad'],
            ['nombre' => 'Libreta Cívica'],
            ['nombre' => 'Libreta de Enrolamiento'],
            ['nombre' => 'Pasaporte']
        ]);
    }
}
