<?php

namespace Database\Seeders;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => 'password',
                'email_verified_at' => now(),
            ]
        );

        $this->call([
            GeneroSeeder::class,
            EstadoCivilSeeder::class,
            TipoDocumentoSeeder::class,
            ClaustroSeeder::class,
            DiaSeeder::class,
            DependenciaSeeder::class,
            AreaSeeder::class,
            DependenciaAreaSeeder::class,
            PersonaSeeder::class,
            EspecialidadSeeder::class,
            ServicioSeeder::class,
            EspecialidadServicioSeeder::class,
            EstadoAtencionSeeder::class,
            TipoAtencionSeeder::class,
            AtributoSeeder::class,
        ]);
    }
}
