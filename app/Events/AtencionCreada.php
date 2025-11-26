<?php

namespace App\Events;

use App\Models\Atencion;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AtencionCreada implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $atencion;

    // Recibimos la atención creada
    public function __construct(Atencion $atencion)
    {
        $this->atencion = $atencion->load([
            'persona:nombre,apellido',
            'tipo_atencion:nombre'
        ]);
    }

    public function broadcastOn(): array
    {
        // Usamos un canal público para simplificar, 
        // pero idealmente debería ser PrivateChannel si hay auth estricta.
        return [
            new Channel('atenciones'),
        ];
    }

    public function broadcastAs()
    {
        return 'atencion.creada';
    }
}