<?php

namespace App\Http\Controllers;

use App\Models\Profesional;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules;

class InvitationController extends Controller
{
    /**
     * Crear usuario automáticamente para un profesional y enviar email de contraseña
     */
    public function inviteProfesional(Request $request, $profesionalId)
    {
        // Solo super-admin puede invitar
        if (!auth()->user()->hasRole('super-admin')) {
            return back()->with('error', 'Solo el Super Admin puede crear usuarios.');
        }

        $profesional = Profesional::with('persona')->findOrFail($profesionalId);

        // Verificar que el profesional no tenga usuario ya
        if ($profesional->user_id) {
            return back()->with('error', 'Este profesional ya tiene un usuario asociado.');
        }

        // Verificar que el profesional tenga email
        if (!$profesional->persona->email) {
            return back()->with('error', 'El profesional no tiene un email registrado. Por favor, edítalo primero.');
        }

        // Verificar que el email no esté usado
        if (User::where('email', $profesional->persona->email)->exists()) {
            return back()->with('error', 'Ya existe un usuario con ese email.');
        }

        DB::beginTransaction();
        try {
            // Generar contraseña temporal aleatoria
            $temporalPassword = \Illuminate\Support\Str::random(16);

            // Crear usuario
            $user = User::create([
                'name' => $profesional->persona->nombre . ' ' . $profesional->persona->apellido,
                'email' => $profesional->persona->email,
                'password' => Hash::make($temporalPassword),
                'email_verified_at' => now(),
            ]);

            // Asignar rol profesional
            $user->assignRole('profesional');

            // Asociar con profesional
            $profesional->update(['user_id' => $user->id]);

            // Enviar email de restablecimiento de contraseña
            Password::sendResetLink(['email' => $user->email]);

            DB::commit();

            return back()->with('success', 'Usuario creado correctamente. Se ha enviado un email a ' . $user->email . ' para establecer su contraseña.');
        } catch (\Exception $e) {
            DB::rollBack();

            return back()->with('error', 'Error al crear el usuario: ' . $e->getMessage());
        }
    }
}
