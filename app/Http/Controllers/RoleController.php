<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index()
    {
        $this->authorize('view roles');

        $roles = Role::with('permissions')
            ->withCount('users')
            ->orderBy('name')
            ->get();

        return Inertia::render('roles/RoleIndexPage', [
            'roles' => $roles,
        ]);
    }

    public function create()
    {
        $this->authorize('create roles');

        $permissions = Permission::all()->groupBy(function ($permission) {
            // Agrupar por el primer palabra (view, create, edit, delete)
            return explode(' ', $permission->name)[1] ?? 'otros';
        });

        return Inertia::render('roles/RoleCreatePage', [
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create roles');

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['exists:permissions,name'],
        ], [
            'name.required' => 'El nombre del rol es requerido.',
            'name.unique' => 'Ya existe un rol con ese nombre.',
            'permissions.required' => 'Debes seleccionar al menos un permiso.',
        ]);

        $role = Role::create(['name' => $validated['name']]);
        $role->givePermissionTo($validated['permissions']);

        return redirect()->route('roles.index')
            ->with('success', 'Rol creado correctamente.');
    }

    public function edit(Role $role)
    {
        $this->authorize('edit roles');

        // Prevenir edición de super-admin
        if ($role->name === 'super-admin') {
            return redirect()->route('roles.index')
                ->with('error', 'No puedes editar el rol de Super Admin.');
        }

        $permissions = Permission::all()->groupBy(function ($permission) {
            return explode(' ', $permission->name)[1] ?? 'otros';
        });

        $role->load('permissions');

        return Inertia::render('roles/RoleEditPage', [
            'role' => $role,
            'permissions' => $permissions,
            'rolePermissions' => $role->permissions->pluck('name'),
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $this->authorize('edit roles');

        if ($role->name === 'super-admin') {
            return back()->with('error', 'No puedes editar el rol de Super Admin.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name,' . $role->id],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => ['exists:permissions,name'],
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions']);

        return redirect()->route('roles.index')
            ->with('success', 'Rol actualizado correctamente.');
    }

    public function destroy(Role $role)
    {
        $this->authorize('delete roles');

        if ($role->name === 'super-admin') {
            return back()->with('error', 'No puedes eliminar el rol de Super Admin.');
        }

        if ($role->users()->count() > 0) {
            return back()->with('error', 'No puedes eliminar un rol que tiene usuarios asignados.');
        }

        $role->delete();

        return back()->with('success', 'Rol eliminado correctamente.');
    }
}
