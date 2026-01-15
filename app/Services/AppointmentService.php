<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\User;
use Carbon\Carbon;
use DateTimeInterface;

class AppointmentService
{
    /**
     * Check if a doctor already has a confirmed appointment at the given date/time.
     * Only pending and approved appointments block the slot.
     */
    public function isDoctorAvailable(int $doctorId, string $date, string $time, ?int $ignoreAppointmentId = null): bool
    {
        $query = Appointment::where('doctor_id', $doctorId)
            ->where('appointment_date', $date)
            ->where('appointment_time', $time)
            ->whereIn('status', ['pending', 'approved']);

        if ($ignoreAppointmentId !== null) {
            $query->where('id', '!=', $ignoreAppointmentId);
        }

        return !$query->exists();
    }

    /**
     * Check if a patient has any active (pending or approved) appointments with a specific doctor.
     */
    public function patientHasActiveAppointment(int $patientId, int $doctorId): bool
    {
        return Appointment::where('patient_id', $patientId)
            ->where('doctor_id', $doctorId)
            ->whereIn('status', ['pending', 'approved'])
            ->exists();
    }

    /**
     * Get available time slots for a given date.
     * Returns array of time slots from 9 AM to 5 PM.
     * Only pending and approved appointments block time slots.
     */
    public function getAvailableTimeSlots(int $doctorId, string $date): array
    {
        // Only count pending/approved appointments as blocking slots
        $bookedSlots = Appointment::where('doctor_id', $doctorId)
            ->where('appointment_date', $date)
            ->whereIn('status', ['pending', 'approved'])
            ->pluck('appointment_time')
            ->map(function ($time) {
                if ($time instanceof DateTimeInterface) {
                    return $time->format('H:i');
                }

                return Carbon::parse($time)->format('H:i');
            })
            ->toArray();
        $allSlots = [];
        for ($hour = 9; $hour <= 17; $hour++) {
            $slot = sprintf('%02d:00', $hour);
            $allSlots[] = [
                'time' => $slot . ':00',
                'display' => date('g:i A', strtotime($slot)),
                'available' => !in_array($slot, $bookedSlots),
            ];
        }
        return $allSlots;
    }

    /**
     * Create an appointment with business logic validation.
     * Handles both authenticated patients and guest bookings.
     */
    public function createAppointment(array $data): Appointment
    {
        if (!$this->isDoctorAvailable($data['doctor_id'], $data['appointment_date'], $data['appointment_time'])) {
            throw new \Exception('This time slot is already booked for this doctor.');
        }

        // Only check active appointments for authenticated patients
        if (isset($data['patient_id']) && $this->patientHasActiveAppointment($data['patient_id'], $data['doctor_id'])) {
            throw new \Exception('This patient already has an active appointment with this doctor.');
        }

        return Appointment::create([
            'doctor_id' => $data['doctor_id'],
            'patient_id' => $data['patient_id'] ?? null,
            'guest_email' => $data['guest_email'] ?? null,
            'appointment_date' => $data['appointment_date'],
            'appointment_time' => $data['appointment_time'],
            'status' => $data['status'] ?? 'pending',
            'created_by' => $data['created_by'],
        ]);
    }

    /**
     * Update appointment status only (for doctors).
     * No validation - just update the status field.
     */
    public function updateAppointmentStatus(Appointment $appointment, string $status): Appointment
    {
        $appointment->update(['status' => $status]);

        return $appointment->fresh();
    }

    /**
     * Update appointment with full details (admin only).
     * Smart handling: if only status and related fields are provided, skip slot validation.
     */
    public function updateAppointment(Appointment $appointment, array $data): Appointment
    {
        // Normalize times to HH:MM format for comparison
        $normalizeTime = function ($time) {
            if ($time instanceof DateTimeInterface) {
                return $time->format('H:i');
            }
            // Extract HH:MM from HH:MM:SS format
            return substr(Carbon::parse($time)->format('H:i:s'), 0, 5);
        };

        // Check if this is a status-only update (all other fields match existing data)
        $requestedDoctorId = (int) $data['doctor_id'];
        $currentDoctorId = (int) $appointment->doctor_id;

        $isStatusOnlyUpdate = ($requestedDoctorId === $currentDoctorId)
            && (($data['appointment_date'] ?? null) == $appointment->appointment_date)
            && (
                !isset($data['appointment_time'])
                || $normalizeTime($data['appointment_time']) === $normalizeTime($appointment->appointment_time)
            );

        // Only validate slot availability if we're actually changing the slot
        if (!$isStatusOnlyUpdate) {
            $isSlotChanged = $currentDoctorId !== $requestedDoctorId
                || $appointment->appointment_date != $data['appointment_date']
                || $normalizeTime($appointment->appointment_time) !== $normalizeTime($data['appointment_time']);

            if (
                $isSlotChanged
                && !$this->isDoctorAvailable($requestedDoctorId, $data['appointment_date'], $data['appointment_time'], $appointment->id)
            ) {
                throw new \Exception('This time slot is already booked for this doctor.');
            }
        }

        $updateData = [
            'status' => $data['status'],
        ];

        // Only update appointment details if they're provided (not status-only)
        if (isset($data['doctor_id'])) {
            $updateData['doctor_id'] = $data['doctor_id'];
        }
        if (isset($data['appointment_date'])) {
            $updateData['appointment_date'] = $data['appointment_date'];
        }
        if (isset($data['appointment_time'])) {
            $updateData['appointment_time'] = $data['appointment_time'];
        }

        // Handle patient vs guest appointment
        if (isset($data['patient_id']) && !empty($data['patient_id'])) {
            $updateData['patient_id'] = $data['patient_id'];
            $updateData['guest_email'] = null;
        } elseif (isset($data['guest_email']) && !empty($data['guest_email'])) {
            $updateData['patient_id'] = null;
            $updateData['guest_email'] = $data['guest_email'];
        }

        $appointment->update($updateData);

        return $appointment->fresh();
    }

    /**
     * Get active doctors for selection.
     */
    public function getActiveDoctors(): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereRole('doctor')
            ->where('is_active', true)
            ->select('id', 'name', 'email')
            ->get();
    }

    /**
     * Get active patients for selection (admin only).
     */
    public function getActivePatients(): \Illuminate\Database\Eloquent\Collection
    {
        return User::whereRole('patient')
            ->where('is_active', true)
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get appointments filtered by user role.
     */
    public function getAppointmentsForUser(User $user): \Illuminate\Database\Eloquent\Builder
    {
        $query = Appointment::with('doctor', 'patient');

        if ($user->isDoctor()) {
            return $query->where('doctor_id', $user->id)->latest();
        }

        if ($user->isPatient()) {
            return $query->where('patient_id', $user->id)->latest();
        }

        return $query->latest();
    }
}
