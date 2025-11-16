<?php

use App\Http\Controllers\AtencionController;
use App\Http\Controllers\EstadisticasController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\ProfesionalController;
use App\Http\Controllers\ServicioController;
use App\Models\Persona;
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
});


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
Route::get('profesionales/reporte_horarios/{profesional}', [ProfesionalController::class,'reporteHorarios'])->name('profesionales.reporte_horarios');

// Rutas para el recurso Atenciones
Route::get('atenciones', [AtencionController::class, 'index'])->name('atenciones.index');
Route::get('atenciones/registrar_atencion', [AtencionController::class, 'crearAtencion'])->name('atenciones.crear_atencion');
Route::get('atenciones/modificar_estado/{atencion}', [AtencionController::class, 'modificarEstadoAtencion'])->name('atenciones.modificar_estado');
Route::put('atenciones/actualizar_estado/{atencion}', [AtencionController::class, 'actualizarEstadoAtencion'])->name('atenciones.actualizar_estado');
Route::post('atenciones/guardar_atencion',[AtencionController::class, 'guardarAtencion'])->name('atenciones.guardar_atencion');
Route::get('atenciones/editar_atencion/{atencion}', [AtencionController::class, 'editarAtencion'])->name('atenciones.editar_atencion');
Route::put('atenciones/{atencion}', [AtencionController::class, 'actualizarAtencion'])->name('atenciones.actualizar_atencion');
Route::get('atenciones/detalles/{persona}', [AtencionController::class, 'verAtencion'])->name('atenciones.ver_atencion');

// Rutas para el recurso Servicios
Route::get('servicios', [ServicioController::class, 'index'])->name('servicios.index');


// Ruta para el modulo de estadisticas
Route::get('estadisticas', [EstadisticasController::class, 'index'])->name('estadisticas.index');


require __DIR__.'/settings.php';
