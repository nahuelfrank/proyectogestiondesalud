# Proyecto — Sanidad

Instrucciones rápidas para levantar el proyecto localmente (con Docker / Sail).

## Requisitos
- Docker y Docker Compose
- PHP, Composer (opcional si se usa Sail para instalar dependencias)
- Node.js / npm (opcional si se usa Sail para frontend)
- Ver [compose.yaml](compose.yaml), [composer.json](composer.json) y [package.json](package.json)

## Flujo recomendado con Sail (contenedores)

1. Clonar el repositorio y situarse en la raíz del proyecto.

2. (Opcional, recomendado la primera vez) Instalar dependencias PHP en el host:
```sh
composer install
```

3. Copiar y ajustar el .env:
```sh
cp .env.example .env
# editar .env (BD, APP_URL, VITE_PORT, APP_PORT, etc.)
```
- Para configuración de contenedores ver [compose.yaml](compose.yaml).

4. Iniciar los contenedores Sail:
```sh
./vendor/bin/sail up -d

# por si quieres usar un alias para ejecutar comandos más fácilmente
alias sail='sh $([ -f sail ] && echo sail || echo vendor/bin/sail)'
Ej: sail up -d

```

5. Instalar dependencias Node (dentro del contenedor) y compilar assets:
```sh
# instalar dentro del contenedor
./vendor/bin/sail npm install
./vendor/bin/sail composer install

# modo desarrollo (Vite con HMR)
./vendor/bin/sail npm run dev

# para build de producción
./vendor/bin/sail npm run build
```

6. Generar clave y ejecutar migraciones / seed:
```sh
./vendor/bin/sail php artisan key:generate
./vendor/bin/sail php artisan migrate
# si quieres cargar seeders
./vendor/bin/sail php artisan db:seed
```

7. (Opcional) Crear enlace de almacenamiento:
```sh
./vendor/bin/sail php artisan storage:link
```

8. Acceder a la app:
- Navegar a http://localhost o al puerto configurado en `APP_PORT` (ver [compose.yaml](compose.yaml) y `.env`).

## Comandos útiles dentro de Sail
- Ejecutar tasts/tests PHP:
```sh
./vendor/bin/sail php artisan test
# o
./vendor/bin/sail php ./vendor/bin/phpunit
```
- Ejecutar Artisan:
```sh
./vendor/bin/sail php artisan migrate:status
./vendor/bin/sail php artisan tinker
```
- Parar y remover contenedores:
```sh
./vendor/bin/sail down
```

## Referencias rápidas
- Configuración Docker / Sail: [compose.yaml](compose.yaml)  
- Scripts de PHP / instalación: [composer.json](composer.json)  
- Scripts de frontend / Vite: [package.json](package.json) y [vite.config.ts](vite.config.ts)  
- Entrypoint / comandos Artisan: [artisan](artisan)

Si prefieres que añada un script de Composer para ejecutar Sail o un archivo .env.example adaptado para Sail, lo añado rápidamente.