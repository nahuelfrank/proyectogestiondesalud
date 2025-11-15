<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EstadoCivilSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('estados_civiles')->insert([
            ['nombre' => 'Casado'],
            ['nombre' => 'Divorciado'],
            ['nombre' => 'Separado'],
            ['nombre' => 'Soltero'],
            ['nombre' => 'Unión consensual'],
            ['nombre' => 'Viudo']
        ]);
    }
}
