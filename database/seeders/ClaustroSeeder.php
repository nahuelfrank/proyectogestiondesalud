<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ClaustroSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('claustros')->insert([
            ['nombre' => 'Docente'],
            ['nombre' => 'No Docente'],
            ['nombre' => 'Estudiante'],
            ['nombre' => 'Externo']
        ]);
    }
}
