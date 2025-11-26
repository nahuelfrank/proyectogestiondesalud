<?php

namespace App\Events;

use App\Models\Atencion;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AtencionActualizada implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $atencion;

    public function __construct(Atencion $atencion)
    {
        $this->atencion = $atencion->load([
            'estado_atencion:nombre'
        ]);
    }

    public function broadcastOn()
    {
        return new Channel('atenciones');
    }

    public function broadcastAs()
    {
        return 'atencion.actualizada';
    }
}
