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
     * - Ejemplos: "view pacientes", "create atenciones", "edit roles"
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
            'view pacientes',
            'create pacientes',
            'edit pacientes',
            'delete pacientes',

            // Profesionales
            'view profesionales',
            'create profesionales',
            'edit profesionales',
            'delete profesionales',
            'invite profesionales',

            // Atenciones
            'view atenciones',
            'create atenciones',
            'edit atenciones',
            'delete atenciones',

            // Servicios
            'view servicios',
            'create servicios',
            'edit servicios',
            'delete servicios',

            // Roles y Permisos
            'view roles',
            'create roles',
            'edit roles',
            'delete roles',
            'assign permissions',

            // Reportes
            'view reportes',
            'generate reportes',
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
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $profesional = Role::firstOrCreate(['name' => 'profesional']);
        $recepcionista = Role::firstOrCreate(['name' => 'recepcionista']);

        // Super Admin - Tiene TODOS los permisos
        $superAdmin->syncPermissions(Permission::all());

        // Admin - Gestión completa excepto super-admin
        $admin->syncPermissions([
            'view pacientes',
            'create pacientes',
            'edit pacientes',
            'delete pacientes',
            'view profesionales',
            'create profesionales',
            'edit profesionales',
            'view atenciones',
            'create atenciones',
            'edit atenciones',
            'view servicios',
            'create servicios',
            'edit servicios',
            'view reportes',
            'generate reportes',
        ]);

        // Profesional - Puede trabajar con pacientes y atenciones
        $profesional->syncPermissions([
            'view pacientes',
            'create pacientes',
            'edit pacientes',
            'view profesionales',
            'view atenciones',
            'create atenciones',
            'edit atenciones',
            'view servicios',
        ]);

        // Recepcionista - Principalmente gestión de pacientes y consulta
        $recepcionista->syncPermissions([
            'view pacientes',
            'create pacientes',
            'edit pacientes',
            'view profesionales',
            'view atenciones',
            'create atenciones',
            'view servicios',
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

        // Asignar rol super-admin
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
        //    Ejemplo: "view pacientes" se agrupa en "pacientes"
        //
        // 4. El rol 'super-admin' está protegido y no se puede:
        //    - Editar desde la interfaz
        //    - Eliminar
        //    - Modificar sus permisos (siempre tiene todos)
    }
}
