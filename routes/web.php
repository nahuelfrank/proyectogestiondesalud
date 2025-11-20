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
    Route::get('usuarios', [UserController::class, 'index'])->name('usuarios.index');
    Route::get('usuarios/crear', [UserController::class, 'create'])->name('usuarios.create');
    Route::post('usuarios', [UserController::class, 'store'])->name('usuarios.store');
    Route::get('usuarios/{usuario}', [UserController::class, 'show'])->name('usuarios.show');
    Route::get('usuarios/{usuario}/editar', [UserController::class, 'edit'])->name('usuarios.edit');
    Route::put('usuarios/{usuario}', [UserController::class, 'update'])->name('usuarios.update');
    Route::delete('usuarios/{usuario}', [UserController::class, 'destroy'])->name('usuarios.destroy');
    Route::post('usuarios/{usuario}/reenviar-password', [UserController::class, 'resendPasswordReset'])->name('usuarios.resend_password');

    // Invitaciones
    //Route::post('profesionales/{profesional}/send-invitation', [InvitationController::class, 'sendInvitation'])->name('profesionales.send_invitation')->middleware('auth');
    //Route::get('invitation/accept/{token}', [InvitationController::class, 'showAcceptForm'])->name('invitation.accept');
    //Route::post('invitation/accept/{token}', [InvitationController::class, 'acceptInvitation'])->name('invitation.process');
    Route::post('profesionales/{profesional}/invitar', [InvitationController::class, 'inviteProfesional'])->name('invitation.process');

    // Roles (protegidas con permisos)
    Route::get('roles', [RoleController::class, 'index'])->name('roles.index');
    Route::get('roles/create', [RoleController::class, 'create'])->name('roles.create');
    Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
    Route::get('roles/{role}/edit', [RoleController::class, 'edit'])->name('roles.edit');
    Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
    Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');

    // Rutas para el recurso Persona
    Route::get('pacientes', [PersonaController::class, 'index'])->name('personas.index');
    Route::get('pacientes/registrar_paciente', [PersonaController::class, 'create'])->name('personas.create');
    Route::post('pacientes', [PersonaController::class, 'store'])->name('personas.store');
    Route::get('pacientes/editar_paciente/{persona}', [PersonaController::class, 'edit'])->name('personas.edit');
    Route::get('/pacientes/carga_rapida', [PersonaController::class, 'fastCreate'])->name('personas.fastCreate');
    Route::post('/pacientes/carga_rapida', [PersonaController::class, 'fastStore'])->name('personas.fastStore');
    Route::delete('pacientes/{persona}', [PersonaController::class, 'destroyFastCreate'])->name('personas.destroyFastCreate');
    Route::put('pacientes/{persona}', [PersonaController::class, 'update'])->name('personas.update');
    Route::get('pacientes/detalles/{persona}', [PersonaController::class, 'show'])->name('personas.show');
    Route::delete('pacientes/{persona}', [PersonaController::class, 'destroy'])->name('personas.destroy');

    // Rutas para el recurso Profesionales
    Route::get('profesionales', [ProfesionalController::class, 'index'])->name('profesionales.index');
    Route::get('profesionales/crear_profesional', [PersonaController::class, 'crearProfesional'])->name('profesionales.crear_profesional');
    Route::post('profesionales/guardar_profesional', [PersonaController::class, 'guardarProfesional'])->name('profesionales.guardar_profesional');
    Route::get('profesionales/edit/{profesional}', [ProfesionalController::class, 'edit'])->name('profesionales.edit');
    Route::put('profesionales/{profesional}', [ProfesionalController::class, 'update'])->name('profesionales.update');
    Route::get('profesionales/{profesional}', [ProfesionalController::class, 'show'])->name('profesionales.show');
    Route::get('profesionales/reporte_horarios/{profesional}', [ProfesionalController::class, 'reporteHorarios'])->name('profesionales.reporte_horarios');
    Route::get('profesionales/reporte_horarios_excel/{profesional}', [ProfesionalController::class, 'reporteHorariosExcel'])->name('profesionales.reporte_horarios_excel');

    // Rutas para el recurso Atenciones
    Route::get('atenciones', [AtencionController::class, 'index'])->name('atenciones.index');
    Route::get('atenciones/registrar_atencion', [AtencionController::class, 'crearAtencion'])->name('atenciones.crear_atencion');
    Route::get('atenciones/modificar_estado/{atencion}', [AtencionController::class, 'modificarEstadoAtencion'])->name('atenciones.modificar_estado');
    Route::put('atenciones/actualizar_estado/{atencion}', [AtencionController::class, 'actualizarEstadoAtencion'])->name('atenciones.actualizar_estado');
    Route::post('atenciones/guardar_atencion', [AtencionController::class, 'guardarAtencion'])->name('atenciones.guardar_atencion');
    Route::get('atenciones/editar_atencion/{atencion}', [AtencionController::class, 'editarAtencion'])->name('atenciones.editar_atencion');
    Route::put('atenciones/{atencion}', [AtencionController::class, 'actualizarAtencion'])->name('atenciones.actualizar_atencion');
    Route::get('atenciones/detalles/{persona}', [AtencionController::class, 'verAtencion'])->name('atenciones.ver_atencion');

    // Rutas para el recurso Servicios
    Route::get('servicios', [ServicioController::class, 'index'])->name('servicios.index');

    // Ruta para el modulo de estadisticas
    Route::get('estadisticas', [EstadisticasController::class, 'index'])->name('estadisticas.index');

    // Rutas de exportación
    Route::get('/estadisticas/exportar-pdf', [EstadisticasController::class, 'exportarPDF'])->name('estadisticas.exportar-pdf');
    Route::get('/estadisticas/exportar-excel', [EstadisticasController::class, 'exportarExcel'])->name('estadisticas.exportar-excel');

    // Lista de espera del profesional
    Route::get('historias-clinicas/lista-espera', [HistoriaClinicaController::class, 'listaEspera'])
        ->name('historias-clinicas.lista-espera');

    // Ver historia clínica del paciente
    Route::get('historias-clinicas/{atencion}/ver', [HistoriaClinicaController::class, 'verHistoriaClinica'])
        ->name('historias-clinicas.ver');

    // Registrar atención
    Route::get('historias-clinicas/{atencion}/registrar', [HistoriaClinicaController::class, 'registrarAtencion'])
        ->name('historias-clinicas.registrar');

    // Guardar atención
    Route::post('historias-clinicas/{atencion}/guardar', [HistoriaClinicaController::class, 'guardarAtencion'])
        ->name('historias-clinicas.guardar');

    // Ver detalle de una atención específica
    Route::get('historias-clinicas/atenciones/{atencion}/detalle', [HistoriaClinicaController::class, 'verDetalleAtencion'])
        ->name('historias-clinicas.detalle-atencion');

    // API para obtener profesionales por servicio
    Route::get('historias-clinicas/servicios/{servicio}/profesionales', [HistoriaClinicaController::class, 'obtenerProfesionalesPorServicio'])
        ->name('historias-clinicas.profesionales-por-servicio');
});


require __DIR__ . '/settings.php';
