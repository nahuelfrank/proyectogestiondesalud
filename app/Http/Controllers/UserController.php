<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{

    public function index()
    {
        $users = User::with('roles')
            ->orderBy('name')
            ->get();

        return Inertia::render('usuarios/UserIndexPage', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        $roles = Role::whereIn('name', ['administrativo'])
            ->orderBy('name')
            ->get();

        return Inertia::render('usuarios/UserCreatePage', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => ['required', 'exists:roles,name'],
        ], [
            'name.required' => 'El nombre es requerido.',
            'email.required' => 'El email es requerido.',
            'email.unique' => 'Este email ya está registrado.',
            'password.required' => 'La contraseña es requerida.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'role.required' => 'Debes seleccionar un rol.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        $user->assignRole($validated['role']);

        Password::sendResetLink(['email' => $user->email]);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado correctamente. Se ha enviado un email para restablecer la contraseña.');
    }

    public function show(User $usuario)
    {
        $usuario->load('roles');

        return Inertia::render('usuarios/UserShowPage', [
            'user' => $usuario,
        ]);
    }

    public function edit(User $usuario)
    {
        // No se puede editar al super-admin
        if ($usuario->hasRole('super-admin')) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No puedes editar al Super Admin.');
        }

        if ($usuario->hasRole('administrativo')) {
            $roles = Role::whereIn('name', ['administrativo'])
                ->orderBy('name')
                ->get();
        } else {
            $roles = Role::whereIn('name', ['profesional', 'administrativo'])
                ->orderBy('name')
                ->get();
        }

        $usuario->load('roles');

        return Inertia::render('usuarios/UserEditPage', [
            'user' => $usuario,
            'roles' => $roles,
            'currentRole' => $usuario->roles->first()->name ?? null,
        ]);
    }

    public function update(Request $request, User $usuario)
    {
        // No se puede editar al super-admin
        if ($usuario->hasRole('super-admin')) {
            return back()->with('error', 'No puedes editar al Super Admin.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $usuario->id],
            'role' => ['required', 'exists:roles,name'],
        ]);

        $usuario->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        $usuario->syncRoles([$validated['role']]);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $usuario)
    {
        // No se puede eliminar al super-admin
        if ($usuario->hasRole('super-admin')) {
            return back()->with('error', 'No puedes eliminar al Super Admin.');
        }

        // No se puede eliminar a si mismo
        if ($usuario->id === auth()->id()) {
            return back()->with('error', 'No puedes eliminarte a ti mismo.');
        }

        $usuario->delete();

        return back()->with('success', 'Usuario eliminado correctamente.');
    }

    public function resendPasswordReset(User $usuario)
    {
        Password::sendResetLink(['email' => $usuario->email]);

        return back()->with('success', 'Email de restablecimiento de contraseña reenviado correctamente.');
    }
}
