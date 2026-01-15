<?php

namespace App\Http\Requests\Appointment;

use Illuminate\Foundation\Http\FormRequest;

class GuestAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doctor_id' => ['required', 'exists:users,id'],
            'appointment_date' => ['required', 'date', 'date_format:Y-m-d', 'after_or_equal:today'],
            'appointment_time' => ['required', 'date_format:H:i:s', 'regex:/^([0-9]{2}):00:00$/'],
            'guest_email' => ['required', 'email'],
            'g-recaptcha-response' => ['required'],
        ];
    }

    public function messages(): array
    {
        return [
            'appointment_time.regex' => 'Appointment time must be on the hour (e.g., 10:00:00).',
            'appointment_date.after_or_equal' => 'Appointment date must be today or later.',
            'guest_email.required' => 'Please provide your email address.',
            'g-recaptcha-response.required' => 'Please complete the captcha.',
        ];
    }
}
