<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UserInvitation extends Model
{
    protected $fillable = [
        'email',
        'token',
        'profesional_id',
        'role',
        'expires_at',
        'accepted_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function profesional()
    {
        return $this->belongsTo(Profesional::class);
    }

    public static function createForProfesional($profesional, $email, $role = 'profesional')
    {
        return static::create([
            'email' => $email,
            'token' => Str::random(60),
            'profesional_id' => $profesional->id,
            'role' => $role,
            'expires_at' => now()->addDays(7),
        ]);
    }

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    public function isAccepted()
    {
        return !is_null($this->accepted_at);
    }
}
