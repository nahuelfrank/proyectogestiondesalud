<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Horarios de un Profesional</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 12px;
            color: #333;
            padding: 20px;
        }

        h2,
        h3 {
            margin: 0;
            padding: 0;
        }

        .header {
            margin-bottom: 20px;
            border-bottom: 2px solid #444;
            padding-bottom: 10px;
        }

        .info {
            margin-bottom: 20px;
        }

        .day-title {
            margin-top: 15px;
            font-weight: bold;
            font-size: 14px;
            background: #f0f0f0;
            padding: 6px;
            border-left: 4px solid #444;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
            margin-bottom: 10px;
        }

        th {
            background: #eee;
        }

        th,
        td {
            border: 1px solid #aaa;
            padding: 6px;
            text-align: left;
        }

        .no-horarios {
            margin-top: 20px;
            text-align: center;
            font-size: 14px;
            color: #666;
        }

        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #aaa;
            padding-top: 15px;
        }
    </style>
</head>

<body>
    @php
    $titulos = [
    1 => 'Enfermería',
    2 => 'Médico',
    3 => 'Nutricionista',
    4 => 'Cardiología',
    ];
    $titulo = $titulos[$profesional->especialidad->id] ?? 'Psicología';
    @endphp
    <div class="header">
        <h2>Horarios - {{ $titulo }}</h2>
    </div>
    <div class="info">
        <strong>Profesional:</strong>
        {{ $profesional->persona->apellido }}, {{ $profesional->persona->nombre }} <br>

        <strong>Especialidad:</strong>
        {{ $profesional->especialidad->nombre ?? 'Sin especialidad' }} <br>

        <strong>Matrícula:</strong>
        {{ $profesional->matricula ?? 'No registrada' }}
    </div>

    @if($horariosPorDia->isEmpty())
    <p class="no-horarios">No hay horarios de atención configurados.</p>
    @else

    @foreach($horariosPorDia as $dia => $horarios)
    <div class="day-title">{{ $dia }}</div>

    <table>
        <thead>
            <tr>
                <th>Inicio de Atención</th>
                <th>Fin de Atención</th>
            </tr>
        </thead>
        <tbody>
            @foreach($horarios as $h)
            <tr>
                <td>{{ ($h->hora_inicio_atencion)->format('H:i') }}</td>
                <td>{{ ($h->hora_fin_atencion)->format('H:i') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
    @endforeach

    @endif
    <div class="footer">
        <p>Este reporte fue generado automáticamente por el Sistema de Gestión de Atención Médica</p>
        <p>Todos los derechos reservados © {{ date('Y') }}</p>
    </div>
</body>

</html>