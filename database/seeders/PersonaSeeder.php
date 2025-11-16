<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Persona;
use Illuminate\Support\Facades\DB;

class PersonaSeeder extends Seeder
{
    public function run(): void
    {

        Persona::factory(200)->create();
        /*
        // Obtenemos TODAS las combinaciones válidas
        $dependenciasAreasValidas = DB::table('dependencias_areas')->get();

        $personas = [
            [
                'nombre' => 'Dionicio',
                'apellido' => 'Corrillo',
                'genero_id' => 2,
                'estado_civil_id' => 1,
                'tipo_documento_id' => 7,
                'numero_documento' => '16753473',
                'nacionalidad' => 'Argentino',
                'email' => 'dico@gmail.com',
                'telefono_celular' => '3872134563',
                'fecha_de_nacimiento' => '1974-03-12',

                'dependencias' => [
                    [
                        'claustro_id'    => 1,
                        'fecha_ingreso'  => '2024-01-10',
                        'resolucion'     => 'ABC123',
                        'expediente'     => 'EXP001',
                        'estado'         => 'activo',
                    ]
                ]
            ],
            [
                'nombre' => 'Marcela',
                'apellido' => 'Rodas',
                'genero_id' => 1,
                'estado_civil_id' => 1,
                'tipo_documento_id' => 7,
                'numero_documento' => '19898763',
                'nacionalidad' => 'Argentino',
                'email' => 'marcela@gmail.com',
                'telefono_celular' => '3878765489',
                'fecha_de_nacimiento' => '1988-11-04',

                'dependencias' => [
                    [
                        'claustro_id'    => 2,
                        'fecha_ingreso'  => '2024-01-05',
                        'resolucion'     => null,
                        'expediente'     => null,
                        'estado'         => 'activo',
                    ],
                    [
                        'claustro_id'    => 3,
                        'fecha_ingreso'  => '2024-02-22',
                        'resolucion'     => 'XYZ999',
                        'expediente'     => 'EXP909',
                        'estado'         => 'inactivo',
                    ]
                ]
            ],
            [
                'nombre' => 'Nahuel',
                'apellido' => 'Rojas',
                'genero_id' => 2,
                'estado_civil_id' => 4,
                'tipo_documento_id' => 7,
                'numero_documento' => '44567649',
                'nacionalidad' => 'Argentino',
                'email' => 'nahuel@gmail.com',
                'telefono_celular' => '3877893840',
                'fecha_de_nacimiento' => '1999-08-21',

                'dependencias' => [
                    [
                        'claustro_id'    => 1,
                        'fecha_ingreso'  => '2024-03-15',
                        'resolucion'     => 'RES112',
                        'expediente'     => 'EXP880',
                        'estado'         => 'activo',
                    ]
                ]
            ],
            [
                'nombre' => 'Pablo',
                'apellido' => 'Cruz Miguez',
                'genero_id' => 1,
                'estado_civil_id' => 1,
                'tipo_documento_id' => 7,
                'numero_documento' => '41486303',
                'nacionalidad' => 'Argentino',
                'email' => 'pablo@gmail.com',
                'telefono_celular' => '3878354390',
                'fecha_de_nacimiento' => '1970-06-22',

                'dependencias' => [
                    [
                        'claustro_id'    => 4,
                        'fecha_ingreso'  => '2024-02-01',
                        'resolucion'     => null,
                        'expediente'     => 'EXP772',
                        'estado'         => 'activo',
                    ]
                ]
            ],
            [
                'nombre' => 'María',
                'apellido' => 'González',
                'genero_id' => 1,
                'estado_civil_id' => 4,
                'tipo_documento_id' => 7,
                'numero_documento' => '30123456',
                'nacionalidad' => 'Argentina',
                'email' => 'maria.gonzalez@gmail.com',
                'telefono_celular' => '3815123456',
                'fecha_de_nacimiento' => '1982-02-14',

                'dependencias' => [
                    [
                        'claustro_id'    => 2,
                        'fecha_ingreso'  => '2024-04-12',
                        'resolucion'     => 'GGH332',
                        'expediente'     => 'EXP332',
                        'estado'         => 'activo',
                    ]
                ]
            ],
            [
                'nombre' => 'Juan',
                'apellido' => 'Pérez',
                'genero_id' => 2,
                'estado_civil_id' => 1,
                'tipo_documento_id' => 7,
                'numero_documento' => '27123457',
                'nacionalidad' => 'Argentina',
                'email' => 'juan.perez@gmail.com',
                'telefono_celular' => '3815234567',
                'fecha_de_nacimiento' => '1990-09-09',

                'dependencias' => [
                    [
                        'claustro_id'    => 1,
                        'fecha_ingreso'  => '2024-01-18',
                        'resolucion'     => null,
                        'expediente'     => null,
                        'estado'         => 'activo',
                    ]
                ]
            ],

        ];

        foreach ($personas as $data) {

            // Extraemos dependencias
            $dependencias = $data['dependencias'];
            unset($data['dependencias']);

            // Crear persona
            $persona = Persona::create($data);

            // 🔥 A cada dependencia le asignamos un par válido
            foreach ($dependencias as $dep) {

                // Obtener un par dependencia–área al azar
                $pair = $dependenciasAreasValidas->random();

                $persona->personas_dependencias_areas()->create([
                    'claustro_id'    => $dep['claustro_id'],
                    'dependencia_id' => $pair->dependencia_id,
                    'area_id'        => $pair->area_id,
                    'fecha_ingreso'  => $dep['fecha_ingreso'],
                    'resolucion'     => $dep['resolucion'],
                    'expediente'     => $dep['expediente'],
                    'estado'         => $dep['estado'],
                ]);
            }
        }
        */
    }
}
