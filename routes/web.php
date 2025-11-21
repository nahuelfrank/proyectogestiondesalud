<?php

use App\Http\Controllers\AtencionController;
use App\Http\Controllers\EstadisticasController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\ProfesionalController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\ServicioController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\HistoriaClinicaController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    /**
     * ============================
     * USUARIOS
     * ============================ 
     */
    Route::get('usuarios', [UserController::class, 'index'])
        ->name('usuarios.index')
        ->middleware('permission:ver usuarios');

    Route::get('usuarios/crear_usuario', [UserController::class, 'create'])
        ->name('usuarios.create')
        ->middleware('permission:crear usuarios');

    Route::post('usuarios', [UserController::class, 'store'])
        ->name('usuarios.store')
        ->middleware('permission:crear usuarios');

    Route::get('usuarios/{usuario}', [UserController::class, 'show'])
        ->name('usuarios.show')
        ->middleware('permission:ver usuarios');

    Route::get('usuarios/editar/{usuario}', [UserController::class, 'edit'])
        ->name('usuarios.edit')
        ->middleware('permission:editar usuarios');

    Route::put('usuarios/{usuario}', [UserController::class, 'update'])
        ->name('usuarios.update')
        ->middleware('permission:editar usuarios');

    Route::delete('usuarios/{usuario}', [UserController::class, 'destroy'])
        ->name('usuarios.destroy')
        ->middleware('permission:eliminar usuarios');
    Route::post('usuarios/{usuario}/reenviar-password', [UserController::class, 'resendPasswordReset'])
        ->name('usuarios.resend_password')
        ->middleware('permission:editar usuarios');

    /**
     * ============================
     * INVITACIONES
     * ============================
     */
    Route::post('profesionales/{profesional}/invitar', [InvitationController::class, 'inviteProfesional'])
        ->name('invitation.process')
        ->middleware('permission:invitar profesionales');

    /**
     * ============================
     * ROLES
     * ============================
     */
    Route::get('roles', [RoleController::class, 'index'])
        ->name('roles.index')
        ->middleware('permission:ver roles');

    Route::get('roles/crear_rol', [RoleController::class, 'create'])
        ->name('roles.create')
        ->middleware('permission:crear roles');

    Route::post('roles', [RoleController::class, 'store'])
        ->name('roles.store')
        ->middleware('permission:crear roles');

    Route::get('roles/editar_role/{role}', [RoleController::class, 'edit'])
        ->name('roles.edit')
        ->middleware('permission:editar roles');

    Route::put('roles/{role}', [RoleController::class, 'update'])
        ->name('roles.update')
        ->middleware('permission:editar roles');

    Route::delete('roles/{role}', [RoleController::class, 'destroy'])
        ->name('roles.destroy')
        ->middleware('permission:eliminar roles');

    /**
     * ============================
     * PACIENTES
     * ============================
     */
    Route::get('pacientes', [PersonaController::class, 'index'])
        ->name('personas.index')
        ->middleware('permission:ver pacientes');

    Route::get('pacientes/registrar_paciente', [PersonaController::class, 'create'])
        ->name('personas.create')
        ->middleware('permission:crear pacientes');

    Route::post('pacientes', [PersonaController::class, 'store'])
        ->name('personas.store')
        ->middleware('permission:crear pacientes');

    Route::get('/pacientes/carga_rapida', [PersonaController::class, 'fastCreate'])
        ->name('personas.fastCreate')
        ->middleware('permission:crear pacientes');

    Route::post('/pacientes/carga_rapida', [PersonaController::class, 'fastStore'])
        ->name('personas.fastStore')
        ->middleware('permission:crear pacientes');

    Route::get('pacientes/editar_paciente/{persona}', [PersonaController::class, 'edit'])
        ->name('personas.edit')
        ->middleware('permission:editar pacientes');

    Route::put('pacientes/{persona}', [PersonaController::class, 'update'])
        ->name('personas.update')
        ->middleware('permission:editar pacientes');

    Route::get('pacientes/detalles/{persona}', [PersonaController::class, 'show'])
        ->name('personas.show')
        ->middleware('permission:ver pacientes');

    Route::delete('pacientes/{persona}', [PersonaController::class, 'destroy'])
        ->name('personas.destroy')
        ->middleware('permission:eliminar pacientes');


    /**
     * ============================
     * PROFESIONALES
     * ============================
     */

    Route::get('profesionales', [ProfesionalController::class, 'index'])
        ->name('profesionales.index')
        ->middleware('permission:ver profesionales');

    Route::get('profesionales/crear_profesional', [PersonaController::class, 'crearProfesional'])
        ->name('profesionales.crear_profesional')
        ->middleware('permission:crear profesionales');

    Route::post('profesionales/guardar_profesional', [PersonaController::class, 'guardarProfesional'])
        ->name('profesionales.guardar_profesional')
        ->middleware('permission:crear profesionales');

    Route::get('profesionales/edit/{profesional}', [ProfesionalController::class, 'edit'])
        ->name('profesionales.edit')
        ->middleware('permission:editar profesionales');

    Route::put('profesionales/{profesional}', [ProfesionalController::class, 'update'])
        ->name('profesionales.update')
        ->middleware('permission:editar profesionales');

    Route::get('profesionales/{profesional}', [ProfesionalController::class, 'show'])
        ->name('profesionales.show')
        ->middleware('permission:ver profesionales');

    Route::get('profesionales/reporte_horarios/{profesional}', [ProfesionalController::class, 'reporteHorarios'])
        ->name('profesionales.reporte_horarios')
        ->middleware('permission:ver profesionales');

    Route::get('profesionales/reporte_horarios_excel/{profesional}', [ProfesionalController::class, 'reporteHorariosExcel'])
        ->name('profesionales.reporte_horarios_excel')
        ->middleware('permission:ver profesionales');

    /**
     * ============================
     * ATENCIONES
     * ============================
     */
    Route::get('atenciones', [AtencionController::class, 'index'])
        ->name('atenciones.index')
        ->middleware('permission:ver atenciones');

    Route::get('atenciones/registrar_atencion', [AtencionController::class, 'crearAtencion'])
        ->name('atenciones.crear_atencion')
        ->middleware('permission:crear atenciones');

    Route::post('atenciones/guardar_atencion', [AtencionController::class, 'guardarAtencion'])
        ->name('atenciones.guardar_atencion')
        ->middleware('permission:crear atenciones');

    Route::get('atenciones/editar_atencion/{atencion}', [AtencionController::class, 'editarAtencion'])
        ->name('atenciones.editar_atencion')
        ->middleware('permission:editar atenciones');

    Route::put('atenciones/{atencion}', [AtencionController::class, 'actualizarAtencion'])
        ->name('atenciones.actualizar_atencion')
        ->middleware('permission:editar atenciones');

    Route::get('atenciones/modificar_estado/{atencion}', [AtencionController::class, 'modificarEstadoAtencion'])
        ->name('atenciones.modificar_estado')
        ->middleware('permission:editar atenciones');

    Route::put('atenciones/{atencion}', [AtencionController::class, 'actualizarEstadoAtencion'])
        ->name('atenciones.actualizar_estado')
        ->middleware('permission:editar atenciones');

    Route::get('atenciones/modificar_estado/{atencion}', [AtencionController::class, 'modificarEstadoAtencion'])
        ->name('atenciones.modificar_estado')
        ->middleware('permission:editar atenciones');

    Route::get('atenciones/detalles/{persona}', [AtencionController::class, 'verAtencion'])
        ->name('atenciones.ver_atencion')
        ->middleware('permission: ver atenciones');


    /**
     * ============================
     * SERVICIOS
     * ============================
     */
    Route::get('servicios', [ServicioController::class, 'index'])
        ->name('servicios.index')
        ->middleware('permission:ver servicios');

    /**
     * ============================
     * ESTADÍSTICAS / REPORTES
     * ============================
     */
    Route::get('estadisticas', [EstadisticasController::class, 'index'])
        ->name('estadisticas.index')
        ->middleware('permission:ver estadisticas');

    Route::get('/estadisticas/exportar-pdf', [EstadisticasController::class, 'exportarPDF'])
        ->name('estadisticas.exportar-pdf')
        ->middleware('permission:generar reportes');

    Route::get('/estadisticas/exportar-excel', [EstadisticasController::class, 'exportarExcel'])
        ->name('estadisticas.exportar-excel')
        ->middleware('permission:generar reportes');

    /**
     * ============================
     * HISTORIAS CLÍNICAS
     * ============================
     * Los permisos de historias clínicas NO están en el seeder,
     * así que (por ahora) no se pueden proteger con Spatie.
     */
    Route::get('historias-clinicas/lista-espera', [HistoriaClinicaController::class, 'listaEspera'])
        ->name('historias-clinicas.lista-espera')
        ->middleware('permission:ver-espera profesionales');

    Route::get('historias-clinicas/{atencion}/ver', [HistoriaClinicaController::class, 'verHistoriaClinica'])
        ->name('historias-clinicas.ver');

    Route::get('historias-clinicas/{atencion}/registrar', [HistoriaClinicaController::class, 'registrarAtencion'])
        ->name('historias-clinicas.registrar');

    Route::post('historias-clinicas/{atencion}/guardar', [HistoriaClinicaController::class, 'guardarAtencion'])
        ->name('historias-clinicas.guardar');

    Route::get('historias-clinicas/atenciones/{atencion}/detalle', [HistoriaClinicaController::class, 'verDetalleAtencion'])
        ->name('historias-clinicas.detalle-atencion');

    Route::get('historias-clinicas/servicios/{servicio}/profesionales', [HistoriaClinicaController::class, 'obtenerProfesionalesPorServicio'])
        ->name('historias-clinicas.profesionales-por-servicio');
});

require __DIR__ . '/settings.php';
