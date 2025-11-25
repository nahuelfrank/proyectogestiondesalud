<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * IMPORTANTE: Este seeder gestiona TODOS los permisos del sistema.
     * 
     * REGLAS:
     * 1. Los permisos SOLO se crean/modifican en este seeder
     * 2. NO se pueden crear permisos desde la interfaz web
     * 3. Para agregar nuevos permisos, edita el array $permissions
     * 4. Después de modificar permisos, ejecuta: php artisan db:seed --class=RolePermissionSeeder
     * 
     * ESTRUCTURA DE PERMISOS:
     * - Los permisos siguen el patrón: "acción recurso"
     * - Ejemplos: "ver pacientes", "crear atenciones", "editar roles"
     * - Se agrupan automáticamente por recurso en la interfaz
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ==========================================
        // DEFINICIÓN DE PERMISOS DEL SISTEMA
        // ==========================================
        // Para agregar nuevos permisos, simplemente añádelos a este array
        // y ejecuta el seeder nuevamente
        $permissions = [
            // Pacientes
            'ver pacientes',
            'crear pacientes',
            'editar pacientes',
            'eliminar pacientes',

            // Profesionales
            'ver profesionales',
            'crear profesionales',
            'editar profesionales',
            'eliminar profesionales',
            'invitar profesionales',
            'ver-espera profesionales',

            // Atenciones
            'ver atenciones',
            'crear atenciones',
            'editar atenciones',
            'eliminar atenciones',
            
            // Servicios
            'ver servicios',
            'crear servicios',
            'editar servicios',
            'eliminar servicios',

            // Roles y Permisos
            'ver roles',
            'crear roles',
            'editar roles',
            'eliminar roles',
            'asignar permisos',

            // Reportes
            'ver reportes',
            'generar reportes',

            // Estadisticas
            'ver estadisticas',

            // Usuarios
            'ver usuarios',
            'crear usuarios',
            'editar usuarios',
            'eliminar usuarios',

            // ==========================================
            // NUEVO: Permiso para super-admin
            // ==========================================
            // Permite ver todas las listas de espera con filtros
            'ver-todas-listas-espera',
        ];

        // Crear todos los permisos definidos
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // ==========================================
        // DEFINICIÓN DE ROLES Y ASIGNACIÓN DE PERMISOS
        // ==========================================

        // Crear o actualizar roles
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin']);
        $profesional = Role::firstOrCreate(['name' => 'profesional']);
        $administrativo = Role::firstOrCreate(['name' => 'administrativo']);

        // Super Admin - Tiene TODOS los permisos (incluyendo el nuevo)
        $superAdmin->syncPermissions(Permission::all());

        // Profesional - Puede trabajar con pacientes y atenciones
        $profesional->syncPermissions([
            'ver-espera profesionales',
            'crear atenciones',
            'editar atenciones',
        ]);

        // Administrativo - Principalmente gestión de pacientes y consulta
        $administrativo->syncPermissions([
            'ver pacientes',
            'crear pacientes',
            'editar pacientes',
            'crear profesionales',
            'ver profesionales',
            'editar profesionales',
            'ver atenciones',
            'crear atenciones',
            'editar atenciones',
            'ver servicios',
            'editar servicios',
            'eliminar servicios',
        ]);

        // ==========================================
        // USUARIO SUPER ADMIN POR DEFECTO
        // ==========================================
        // Crear usuario super admin si no existe
        $user = \App\Models\User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        // Asignar rol administrador-del-sistema
        if (!$user->hasRole('super-admin')) {
            $user->assignRole('super-admin');
        }

        // ==========================================
        // NOTAS PARA DESARROLLO
        // ==========================================
        // 1. Para agregar un nuevo permiso:
        //    - Añádelo al array $permissions
        //    - Ejecuta: php artisan db:seed --class=RolePermissionSeeder
        //    - Asígnalo a los roles correspondientes en la interfaz web
        //
        // 2. Para crear un nuevo rol:
        //    - Usa la interfaz web (/roles/create)
        //    - O agrégalo aquí en el seeder
        //
        // 3. Los permisos se agrupan automáticamente por la segunda palabra
        //    Ejemplo: "ver pacientes" se agrupa en "pacientes"
        //
        // 4. El rol 'super-admin' está protegido y no se puede:
        //    - Editar desde la interfaz
        //    - Eliminar
        //    - Modificar sus permisos (siempre tiene todos)
        //
        // 5. NUEVO PERMISO 'ver-todas-listas-espera':
        //    - Permite al super-admin ver listas de espera de cualquier profesional
        //    - Incluye filtros por especialidad y profesional
        //    - Solo asignado al rol 'super-admin'
    }
}