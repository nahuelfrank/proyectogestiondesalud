<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #4F46E5;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }

        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>

<body>
    <div class="container">
        <h2>¡Bienvenido al sistema!</h2>

        <p>Hola {{ $profesionalName }},</p>

        <p>Has sido invitado a formar parte del sistema como profesional. Para completar tu registro y crear tu cuenta, haz clic en el siguiente enlace:</p>

        <a href="{{ $acceptUrl }}" class="button">Aceptar Invitación</a>

        <p>O copia y pega este enlace en tu navegador:</p>
        <p><a href="{{ $acceptUrl }}">{{ $acceptUrl }}</a></p>

        <p><strong>Nota:</strong> Esta invitación expira el {{ $expiresAt }}</p>

        <div class="footer">
            <p>Si no solicitaste esta invitación, puedes ignorar este correo.</p>
        </div>
    </div>
</body>

</html>