<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class CustomLoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $user = $request->user();

        // Redirección según rol
        if ($user->hasRole('super-admin')) {
            return redirect()->route('roles.index');
        }

        if ($user->hasRole('profesional')) {
            return redirect()->route('historias-clinicas.lista-espera');
        }

        if ($user->hasRole('administrativo')) {
            return redirect()->route('personas.index');
        }

        // Fallback para otros roles
        return redirect()->intended('dashboard');
    }
}
