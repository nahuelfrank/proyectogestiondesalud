<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Estadísticas</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: DejaVu Sans, Arial, sans-serif;
            font-size: 12px;
            color: #333;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #444;
            /* igual que el segundo reporte */
            padding-bottom: 15px;
        }

        .header h1 {
            color: #444;
            /* reemplaza el azul por el gris oscuro del otro reporte */
            font-size: 24px;
            margin-bottom: 5px;
        }

        .header p {
            color: #666;
            /* gris medio */
            margin: 5px 0;
        }

        .section {
            margin-bottom: 25px;
        }

        .section-title {
            background-color: #eee;
            /* igual que los <th> del segundo reporte */
            color: #333;
            padding: 10px;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            border-left: 4px solid #444;
            /* banda lateral igual a day-title */
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }

        .stat-card {
            border: 1px solid #aaa;
            /* mismo borde del segundo reporte */
            padding: 15px;
            border-radius: 4px;
            background-color: #f0f0f0;
            /* equivalente a day-title */
        }

        .stat-card .label {
            color: #666;
            font-size: 11px;
            margin-bottom: 5px;
        }

        .stat-card .value {
            font-size: 24px;
            font-weight: bold;
            color: #444;
            /* reemplaza azul por gris oscuro */
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        table th {
            background-color: #eee;
            /* igual al segundo reporte */
            padding: 10px;
            text-align: left;
            border: 1px solid #aaa;
            font-weight: bold;
            color: #333;
        }

        table td {
            padding: 8px 10px;
            border: 1px solid #aaa;
            color: #333;
        }

        table tr:hover {
            background-color: #f0f0f0;
            /* igual que day-title */
        }

        .comparativa {
            background-color: #f0f0f0;
            /* gris suave */
            border: 1px solid #aaa;
            padding: 15px;
            border-radius: 4px;
            margin-top: 10px;
        }

        .comparativa .trend-up {
            color: #333;
            /* ya no verde */
            font-weight: bold;
        }

        .comparativa .trend-down {
            color: #333;
            /* ya no rojo */
            font-weight: bold;
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
    <div class="header">
        <h1>Reporte de Estadísticas</h1>
        <p>Sistema de Gestión de Atención Médica</p>
        <p><strong>Fecha de generación:</strong> {{ $fecha_reporte }}</p>
        <p><strong>Período:</strong> {{ $periodo }}</p>
    </div>

    <div class="section">
        <div class="section-title">Resumen General</div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="label">Total de Atenciones</div>
                <div class="value">{{ number_format($estadisticas['total_atenciones']) }}</div>
            </div>
            <div class="stat-card">
                <div class="label">Total de Pacientes</div>
                <div class="value">{{ number_format($estadisticas['total_pacientes']) }}</div>
            </div>
            <div class="stat-card">
                <div class="label">Profesionales Activos</div>
                <div class="value">{{ number_format($estadisticas['total_profesionales']) }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Comparativa Mensual</div>
        <div class="comparativa">
            <p><strong>{{ $comparativa['mes_actual']['periodo'] }}:</strong> {{ number_format($comparativa['mes_actual']['total']) }} atenciones</p>
            <p><strong>{{ $comparativa['mes_anterior']['periodo'] }}:</strong> {{ number_format($comparativa['mes_anterior']['total']) }} atenciones</p>
            <p style="margin-top: 10px;">
                <strong>Diferencia:</strong>
                <span class="trend-{{ $comparativa['tendencia'] == 'aumento' ? 'up' : 'down' }}">
                    {{ $comparativa['diferencia'] > 0 ? '+' : '' }}{{ number_format($comparativa['diferencia']) }}
                    ({{ $comparativa['porcentaje'] > 0 ? '+' : '' }}{{ $comparativa['porcentaje'] }}%)
                </span>
            </p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Consultas por Especialidad</div>
        <table>
            <thead>
                <tr>
                    <th>Especialidad</th>
                    <th style="text-align: right;">Total de Consultas</th>
                    <th style="text-align: right;">Porcentaje</th>
                </tr>
            </thead>
            <tbody>
                @php
                $totalConsultas = $consultasPorEspecialidad->sum('total');
                @endphp
                @foreach($consultasPorEspecialidad as $especialidad)
                <tr>
                    <td>{{ $especialidad->especialidad }}</td>
                    <td style="text-align: right;">{{ number_format($especialidad->total) }}</td>
                    <td style="text-align: right;">{{ $totalConsultas > 0 ? number_format(($especialidad->total / $totalConsultas) * 100, 1) : 0 }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <div class="section-title">Top 10 Profesionales</div>
        <table>
            <thead>
                <tr>
                    <th>Posición</th>
                    <th>Profesional</th>
                    <th>Especialidad</th>
                    <th style="text-align: right;">Total Atenciones</th>
                </tr>
            </thead>
            <tbody>
                @foreach($topProfesionales as $index => $profesional)
                <tr>
                    <td>#{{ $index + 1 }}</td>
                    <td>{{ $profesional->nombre_completo }}</td>
                    <td>{{ $profesional->especialidad }}</td>
                    <td style="text-align: right;">{{ number_format($profesional->total_atenciones) }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>Este reporte fue generado automáticamente por el Sistema de Gestión de Atención Médica</p>
        <p>Todos los derechos reservados © {{ date('Y') }}</p>
    </div>
</body>

</html>