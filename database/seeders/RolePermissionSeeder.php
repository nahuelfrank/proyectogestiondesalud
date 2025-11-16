<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Definir permisos
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

        // Crear permisos
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Crear roles
        $superAdmin = Role::create(['name' => 'super-admin']);
        $admin = Role::create(['name' => 'admin']);
        $profesional = Role::create(['name' => 'profesional']);
        $recepcionista = Role::create(['name' => 'recepcionista']);

        // Super Admin tiene todos los permisos
        $superAdmin->givePermissionTo(Permission::all());

        // Admin
        $admin->givePermissionTo([
            'view pacientes', 'create pacientes', 'edit pacientes', 'delete pacientes',
            'view profesionales', 'create profesionales', 'edit profesionales',
            'view atenciones', 'create atenciones', 'edit atenciones',
            'view servicios', 'create servicios', 'edit servicios',
            'view reportes', 'generate reportes',
        ]);

        // Profesional
        $profesional->givePermissionTo([
            'view pacientes', 'create pacientes', 'edit pacientes',
            'view profesionales',
            'view atenciones', 'create atenciones', 'edit atenciones',
            'view servicios',
        ]);

        // Recepcionista
        $recepcionista->givePermissionTo([
            'view pacientes', 'create pacientes', 'edit pacientes',
            'view profesionales',
            'view atenciones', 'create atenciones',
            'view servicios',
        ]);

        // Crear usuario super admin por defecto
        $user = \App\Models\User::create([
            'name' => 'Super Admin',
            'email' => 'admin@tuapp.com',
            'password' => bcrypt('password'),
            'email_verified_at' => now(),
        ]);

        $user->assignRole('super-admin');
    }
}