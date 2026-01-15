<?php

namespace App\Http\Requests\Appointment;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppointmentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'required|in:pending,approved,rejected,completed',
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Invalid appointment status.',
        ];
    }
}
