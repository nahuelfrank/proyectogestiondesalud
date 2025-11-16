<?php

namespace App\Mail;

use App\Models\UserInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ProfesionalInvitation extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public UserInvitation $invitation,
        public string $profesionalName
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Invitación para unirse al sistema',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.profesional-invitation',
            with: [
                'acceptUrl' => route('invitation.accept', ['token' => $this->invitation->token]),
                'profesionalName' => $this->profesionalName,
                'expiresAt' => $this->invitation->expires_at->format('d/m/Y H:i'),
            ],
        );
    }
}