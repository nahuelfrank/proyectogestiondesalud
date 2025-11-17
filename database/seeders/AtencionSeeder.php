<?php

namespace Database\Seeders;

use App\Models\Atencion;
use Illuminate\Database\Seeder;

class AtencionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Atencion::factory()
            ->count(10000)
            ->create();
    }
}
