<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        $this->authorize('view usuarios');

        $users = User::with('roles')
            ->orderBy('name')
            ->get();

        return Inertia::render('usuarios/UserIndexPage', [
            'users' => $users,
        ]);
    }

    public function create()
    {
        $this->authorize('create usuarios');

        // Solo super-admin puede crear usuarios
        if (!auth()->user()->hasRole('super-admin')) {
            return redirect()->route('usuarios.index')
                ->with('error', 'Solo el Super Admin puede crear usuarios.');
        }

        $roles = Role::whereIn('name', ['profesional', 'administrativo'])
            ->orderBy('name')
            ->get();

        return Inertia::render('usuarios/UserCreatePage', [
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create usuarios');

        // Solo super-admin puede crear usuarios
        if (!auth()->user()->hasRole('super-admin')) {
            return back()->with('error', 'Solo el Super Admin puede crear usuarios.');
        }

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

        // Crear usuario
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        // Asignar rol
        $user->assignRole($validated['role']);

        // Enviar email de restablecimiento de contraseña
        Password::sendResetLink(['email' => $user->email]);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario creado correctamente. Se ha enviado un email para restablecer la contraseña.');
    }

    public function show(User $usuario)
    {
        $this->authorize('view usuarios');

        $usuario->load('roles');

        return Inertia::render('usuarios/UserShowPage', [
            'user' => $usuario,
        ]);
    }

    public function edit(User $usuario)
    {
        $this->authorize('edit usuarios');

        // Solo super-admin puede editar usuarios
        if (!auth()->user()->hasRole('super-admin')) {
            return redirect()->route('usuarios.index')
                ->with('error', 'Solo el Super Admin puede editar usuarios.');
        }

        // No se puede editar al super-admin
        if ($usuario->hasRole('super-admin')) {
            return redirect()->route('usuarios.index')
                ->with('error', 'No puedes editar al Super Admin.');
        }

        $roles = Role::whereIn('name', ['profesional', 'administrativo'])
            ->orderBy('name')
            ->get();

        $usuario->load('roles');

        return Inertia::render('usuarios/UserEditPage', [
            'user' => $usuario,
            'roles' => $roles,
            'currentRole' => $usuario->roles->first()->name ?? null,
        ]);
    }

    public function update(Request $request, User $usuario)
    {
        $this->authorize('edit usuarios');

        // Solo super-admin puede editar usuarios
        if (!auth()->user()->hasRole('super-admin')) {
            return back()->with('error', 'Solo el Super Admin puede editar usuarios.');
        }

        // No se puede editar al super-admin
        if ($usuario->hasRole('super-admin')) {
            return back()->with('error', 'No puedes editar al Super Admin.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $usuario->id],
            'role' => ['required', 'exists:roles,name'],
        ], [
            'name.required' => 'El nombre es requerido.',
            'email.required' => 'El email es requerido.',
            'email.unique' => 'Este email ya está registrado.',
            'role.required' => 'Debes seleccionar un rol.',
        ]);

        // Actualizar usuario
        $usuario->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        // Actualizar rol
        $usuario->syncRoles([$validated['role']]);

        return redirect()->route('usuarios.index')
            ->with('success', 'Usuario actualizado correctamente.');
    }

    public function destroy(User $usuario)
    {
        $this->authorize('delete usuarios');

        // Solo super-admin puede eliminar usuarios
        if (!auth()->user()->hasRole('super-admin')) {
            return back()->with('error', 'Solo el Super Admin puede eliminar usuarios.');
        }

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
        $this->authorize('edit usuarios');

        // Solo super-admin puede reenviar el email
        if (!auth()->user()->hasRole('super-admin')) {
            return back()->with('error', 'Solo el Super Admin puede reenviar el email.');
        }

        // Enviar email de restablecimiento de contraseña
        Password::sendResetLink(['email' => $usuario->email]);

        return back()->with('success', 'Email de restablecimiento de contraseña reenviado correctamente.');
    }
}