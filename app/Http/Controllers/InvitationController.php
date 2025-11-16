<?php

namespace App\Http\Controllers;

use App\Mail\ProfesionalInvitation;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class InvitationController extends Controller
{
    public function sendInvitation(Request $request, $profesionalId)
    {
        $request->validate([
            'email' => ['required', 'email', 'unique:users,email'],
        ]);

        $profesional = \App\Models\Profesional::with('persona')->findOrFail($profesionalId);

        // Verificar que el profesional no tenga usuario ya
        if ($profesional->user_id) {
            return back()->with('error', 'Este profesional ya tiene un usuario asociado.');
        }

        // Crear invitación
        $invitation = UserInvitation::createForProfesional(
            $profesional,
            $request->email,
            'profesional'
        );

        // Enviar email
        Mail::to($request->email)->send(
            new ProfesionalInvitation(
                $invitation,
                $profesional->persona->nombre . ' ' . $profesional->persona->apellido
            )
        );

        return back()->with('success', 'Invitación enviada correctamente.');
    }

    public function showAcceptForm($token)
    {
        $invitation = UserInvitation::where('token', $token)->firstOrFail();

        if ($invitation->isExpired()) {
            return Inertia::render('auth/InvitationExpired');
        }

        if ($invitation->isAccepted()) {
            return Inertia::render('auth/InvitationAlreadyAccepted');
        }

        return Inertia::render('auth/AcceptInvitation', [
            'token' => $token,
            'email' => $invitation->email,
            'profesional' => $invitation->profesional->load('persona'),
        ]);
    }

    public function acceptInvitation(Request $request, $token)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $invitation = UserInvitation::where('token', $token)->firstOrFail();

        if ($invitation->isExpired() || $invitation->isAccepted()) {
            return back()->with('error', 'Invitación no válida.');
        }

        DB::transaction(function () use ($request, $invitation) {
            // Crear usuario
            $user = User::create([
                'name' => $request->name,
                'email' => $invitation->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(),
            ]);

            // Asignar rol
            $user->assignRole($invitation->role);

            // Asociar con profesional
            $invitation->profesional->update(['user_id' => $user->id]);

            // Marcar invitación como aceptada
            $invitation->update(['accepted_at' => now()]);
        });

        return redirect()->route('login')->with('success', 'Cuenta creada correctamente. Ya puedes iniciar sesión.');
    }
}