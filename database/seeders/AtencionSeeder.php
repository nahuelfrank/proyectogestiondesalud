<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Atencion;

class AtencionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Generando atenciones de prueba...');

        // 1. Atenciones de hoy (mezcla de estados)
        $this->command->info('Generando atenciones de hoy...');

        // En espera (5 pacientes esperando)
        Atencion::factory()
            ->count(5)
            ->hoy()
            ->enEspera()
            ->create();

        // En atención (3 siendo atendidos)
        Atencion::factory()
            ->count(3)
            ->hoy()
            ->enAtencion()
            ->create();

        // Completadas hoy (15 ya atendidas)
        Atencion::factory()
            ->count(15)
            ->hoy()
            ->completada()
            ->create();

        /*    
        // 2. Atenciones de esta semana
        $this->command->info('Generando atenciones de esta semana...');

        Atencion::factory()
            ->count(50)
            ->estaSemana()
            ->completada()
            ->create();

        // 3. Atenciones del último mes
        $this->command->info('Generando atenciones del último mes...');

        Atencion::factory()
            ->count(200)
            ->esteMes()
            ->completada()
            ->create();

        
        // 4. Mix de tipos de atención del último año
        $this->command->info('Generando mezcla de consultas, emergencias y urgencias...');

        // Consultas (la mayoría)
        Atencion::factory()
            ->count(300)
            ->consulta()
            ->completada()
            ->create();

        // Emergencias (pocas pero críticas)
        Atencion::factory()
            ->count(30)
            ->emergencia()
            ->create();

        // Urgencias (cantidad media)
        Atencion::factory()
            ->count(80)
            ->urgencia()
            ->create();

        // 5. Algunas canceladas
        $this->command->info('Generando atenciones canceladas...');

        Atencion::factory()
            ->count(20)
            ->cancelada()
            ->create();

        $this->command->info('¡Atenciones generadas exitosamente!');

        // Resumen
        $total = Atencion::count();
        $enEspera = Atencion::where('estado_atencion_id', 1)->count();
        $enAtencion = Atencion::where('estado_atencion_id', 2)->count();
        $completadas = Atencion::where('estado_atencion_id', 3)->count();
        $canceladas = Atencion::where('estado_atencion_id', 4)->count();

        $this->command->table(
            ['Estado', 'Cantidad'],
            [
                ['En Espera', $enEspera],
                ['En Atención', $enAtencion],
                ['Completadas', $completadas],
                ['Canceladas', $canceladas],
                ['TOTAL', $total],
            ]
        );

        */
    }
}