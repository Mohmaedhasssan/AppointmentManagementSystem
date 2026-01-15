<?php

namespace App\Http\Controllers\Appointment;

use App\Http\Requests\Appointment\GuestAppointmentRequest;
use App\Services\AppointmentService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class GuestAppointmentController
{
    public function __construct(
        protected AppointmentService $appointmentService
    ) {}

    public function create(): InertiaResponse
    {
        $doctors = $this->appointmentService->getActiveDoctors();

        return Inertia::render('guest/book-appointment', [
            'doctors' => $doctors,
        ]);
    }

    public function store(GuestAppointmentRequest $request): InertiaResponse|RedirectResponse
    {
        $validated = $request->validated();
        $validated['created_by'] = 'guest';

        try {
            $appointment = $this->appointmentService->createAppointment($validated);

            return Inertia::render('guest/booking-confirmation', [
                'appointment' => $appointment->load('doctor'),
                'message' => 'Your appointment request has been submitted. The doctor will review and confirm your appointment shortly.',
            ]);
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()])
                ->withInput();
        }
    }
}
