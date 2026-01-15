<?php

namespace App\Http\Requests\Appointment;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doctor_id' => 'required|exists:users,id',
            'patient_id' => ['nullable', 'exists:users,id', 'required_without:guest_email'],
            'guest_email' => ['nullable', 'email', 'required_without:patient_id'],
            'appointment_date' => 'required|date|date_format:Y-m-d',
            'appointment_time' => 'required|date_format:H:i:s|regex:/^([0-9]{2}):00:00$/',
            'status' => 'required|in:pending,approved,rejected,completed',
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Invalid appointment status.',
            'appointment_time.regex' => 'Appointment time must be on the hour (e.g., 10:00:00).',
            'patient_id.required_without' => 'Please select a patient or provide guest email.',
            'guest_email.required_without' => 'Please provide guest email or select a patient.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $patientId = $this->input('patient_id');
            $guestEmail = $this->input('guest_email');
            $doctorId = $this->input('doctor_id');
            $appointmentId = $this->route('appointment')->id;

            // Ensure either patient_id or guest_email is provided, but not both
            if (!$patientId && !$guestEmail) {
                $validator->errors()->add(
                    'patient_id',
                    'Either patient or guest email must be provided.'
                );
            } elseif ($patientId && $guestEmail) {
                $validator->errors()->add(
                    'patient_id',
                    'Cannot have both patient and guest email.'
                );
            }

            // Check if patient already has an active appointment with this doctor (excluding current)
            if ($patientId && $doctorId) {
                $hasActiveAppointment = Appointment::where('patient_id', $patientId)
                    ->where('doctor_id', $doctorId)
                    ->whereIn('status', ['pending', 'approved'])
                    ->where('id', '!=', $appointmentId)
                    ->exists();

                if ($hasActiveAppointment) {
                    $validator->errors()->add(
                        'doctor_id',
                        'This patient already has an active appointment with this doctor.'
                    );
                }
            }
        });
    }
}
