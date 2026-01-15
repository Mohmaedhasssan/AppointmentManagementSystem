<?php

use App\Http\Controllers\Appointment\AppointmentController;
use App\Http\Controllers\Appointment\GuestAppointmentController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', [GuestAppointmentController::class, 'create'])->name('home');

Route::get('/welcome-legacy', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('welcome.legacy');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('appointments', AppointmentController::class);
    Route::get('appointments/{appointment}/status/edit', [AppointmentController::class, 'editStatus'])
        ->name('appointments.status.edit');
    Route::patch('appointments/{appointment}/status', [AppointmentController::class, 'updateStatus'])
        ->name('appointments.status.update');
    Route::get('appointments/available-slots/{doctor}/{date}', [AppointmentController::class, 'availableSlots'])
        ->name('appointments.available-slots');

    Route::middleware('can:manage-users')->prefix('admin')->as('admin.')->group(function () {
        Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
        Route::patch('users/{user}', [AdminUserController::class, 'update'])->name('users.update');
        Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');
    });
});

// Guest appointment routes (public, no auth required)
Route::get('guest/book', [GuestAppointmentController::class, 'create'])->name('guest.book');
Route::post('guest/book', [GuestAppointmentController::class, 'store'])->name('guest.store');

require __DIR__ . '/settings.php';
