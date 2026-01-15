<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return (bool) $user->is_active;
    }

    public function view(User $user, Appointment $appointment): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isDoctor() && $appointment->doctor_id === $user->id) {
            return true;
        }

        if ($user->isPatient() && $appointment->patient_id === $user->id) {
            return true;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return (bool) $user->is_active && ($user->isPatient() || $user->isAdmin());
    }

    public function update(User $user, Appointment $appointment): bool
    {
        // Default update - for backwards compatibility
        return $this->updateStatus($user, $appointment);
    }

    public function updateFull(User $user, Appointment $appointment): bool
    {
        // Only admins can fully edit appointments
        return (bool) $user->is_active && $user->isAdmin();
    }

    public function updateStatus(User $user, Appointment $appointment): bool
    {
        // Only doctors can update status of their appointments
        return (bool) $user->is_active && $user->isDoctor() && $appointment->doctor_id === $user->id;
    }

    public function delete(User $user, Appointment $appointment): bool
    {
        return $user->isAdmin();
    }
}
