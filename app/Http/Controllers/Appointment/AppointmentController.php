<?php

namespace App\Http\Controllers\Appointment;

use App\Http\Requests\Appointment\CreateAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentRequest;
use App\Http\Requests\Appointment\UpdateAppointmentStatusRequest;
use App\Models\Appointment;
use App\Services\AppointmentService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class AppointmentController
{
    use AuthorizesRequests;
    public function __construct(
        protected AppointmentService $appointmentService
    ) {}

    public function index(): InertiaResponse
    {
        $user = auth()->user();
        $query = $this->appointmentService->getAppointmentsForUser($user);
        $appointments = $query->paginate(10);

        return Inertia::render('Appointments/Index', [
            'appointments' => $appointments,
        ]);
    }

    public function create(): InertiaResponse
    {
        $this->authorize('create', Appointment::class);

        $user = auth()->user();
        $doctors = $this->appointmentService->getActiveDoctors();
        $patients = $user->isAdmin() ? $this->appointmentService->getActivePatients() : [];

        return Inertia::render('Appointments/Create', [
            'doctors' => $doctors,
            'patients' => $patients,
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    public function store(CreateAppointmentRequest $request): RedirectResponse
    {
        $this->authorize('create', Appointment::class);

        $user = auth()->user();
        $validated = $request->validated();

        // Admin can select patient, regular patient is assigned automatically
        if ($user->isAdmin() && !empty($validated['patient_id'])) {
            $validated['patient_id'] = $validated['patient_id'];
        } else {
            $validated['patient_id'] = $user->id;
        }

        $validated['created_by'] = $user->isAdmin() ? 'admin' : 'patient';

        try {
            $appointment = $this->appointmentService->createAppointment($validated);

            return redirect()
                ->route('appointments.show', $appointment->id, status: 303)
                ->with('success', 'Appointment created successfully.');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()])
                ->withInput();
        }
    }

    public function show(Appointment $appointment): InertiaResponse
    {
        $this->authorize('view', $appointment);

        return Inertia::render('Appointments/Show', [
            'appointment' => $appointment->load('doctor', 'patient'),
        ]);
    }

    public function edit(Appointment $appointment): InertiaResponse
    {
        $this->authorize('updateFull', $appointment);

        $doctors = $this->appointmentService->getActiveDoctors();
        $patients = $this->appointmentService->getActivePatients();

        return Inertia::render('Appointments/Edit', [
            'appointment' => $appointment->load('doctor', 'patient'),
            'doctors' => $doctors,
            'patients' => $patients,
            'isAdmin' => true,
        ]);
    }

    public function update(UpdateAppointmentRequest $request, Appointment $appointment): RedirectResponse
    {
        $this->authorize('updateFull', $appointment);

        $validated = $request->validated();

        try {
            $this->appointmentService->updateAppointment($appointment, $validated);

            return redirect()
                ->route('appointments.show', $appointment->id, status: 303)
                ->with('success', 'Appointment updated successfully.');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => $e->getMessage()])
                ->withInput();
        }
    }

    /**
     * Show form to update appointment status (for doctors).
     */
    public function editStatus(Appointment $appointment): InertiaResponse
    {
        $this->authorize('updateStatus', $appointment);

        return Inertia::render('Appointments/EditStatus', [
            'appointment' => $appointment->load('doctor', 'patient'),
        ]);
    }

    /**Status
     * Update appointment status only (for doctors).
     */
    public function updateStatus(UpdateAppointmentStatusRequest $request, Appointment $appointment): RedirectResponse
    {
        $this->authorize('updateStatus', $appointment);

        $validated = $request->validated();

        $this->appointmentService->updateAppointmentStatus($appointment, $validated['status']);

        return redirect()
            ->route('appointments.show', $appointment->id, status: 303)
            ->with('success', 'Appointment status updated successfully.');
    }

    public function destroy(Appointment $appointment): RedirectResponse
    {
        $this->authorize('delete', $appointment);

        $appointment->delete();

        return redirect()
            ->route('appointments.index', status: 303)
            ->with('success', 'Appointment deleted successfully.');
    }

    /**
     * Get available time slots for a doctor on a specific date.
     */
    public function availableSlots(int $doctorId, string $date): \Illuminate\Http\JsonResponse
    {
        $slots = $this->appointmentService->getAvailableTimeSlots($doctorId, $date);

        return response()->json([
            'slots' => $slots,
        ]);
    }
}
