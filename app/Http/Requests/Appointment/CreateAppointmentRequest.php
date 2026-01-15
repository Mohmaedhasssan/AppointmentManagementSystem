<?php

namespace App\Http\Requests\Appointment;

use App\Models\Appointment;
use Illuminate\Foundation\Http\FormRequest;

class CreateAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $rules = [
            'doctor_id' => 'required|exists:users,id',
            'appointment_date' => ['required', 'date', 'date_format:Y-m-d', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i:s', 'regex:/^([0-9]{2}):00:00$/'],
        ];

        // Admins select patient explicitly
        if (auth()->user()?->isAdmin()) {
            $rules['patient_id'] = 'required|exists:users,id';
        }

        return $rules;
    }

    public function messages(): array
    {
        return [
            'appointment_time.regex' => 'Appointment time must be on the hour (e.g., 10:00:00).',
            'appointment_date.after_or_equal' => 'Appointment date must be today or later.',
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Get patient_id: from form for admin, or from auth user for patient
            $patientId = auth()->user()?->isAdmin()
                ? $this->input('patient_id')
                : auth()->id();

            $doctorId = $this->input('doctor_id');

            // Check if this patient already has an active appointment with this doctor
            if ($patientId && $doctorId) {
                $hasActiveAppointment = Appointment::where('patient_id', $patientId)
                    ->where('doctor_id', $doctorId)
                    ->whereIn('status', ['pending', 'approved'])
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
