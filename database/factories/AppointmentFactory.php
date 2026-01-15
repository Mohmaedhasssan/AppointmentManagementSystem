<?php

namespace Database\Factories;

use App\Enums\AppointmentCreatedBy;
use App\Enums\AppointmentStatus;
use App\Models\Appointment;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<\App\Models\Appointment>
 */
class AppointmentFactory extends Factory
{
    protected $model = Appointment::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $doctor = User::query()->where('role', 'doctor')->inRandomOrder()->first()
            ?? User::factory()->create(['role' => 'doctor']);

        $patient = $this->faker->boolean(50)
            ? (User::query()->where('role', 'patient')->inRandomOrder()->first()
                ?? User::factory()->create(['role' => 'patient']))
            : null;

        // Generate unique (doctor_id, appointment_date, appointment_time) combination
        $attempts = 0;
        do {
            $appointmentDate = $this->faker->dateTimeBetween('+7 days', '+30 days')->format('Y-m-d');
            $hour = $this->faker->randomElement(range(9, 17));
            $appointmentTime = sprintf('%02d:00:00', $hour);

            $exists = Appointment::query()
                ->where('doctor_id', $doctor->id)
                ->where('appointment_date', $appointmentDate)
                ->where('appointment_time', $appointmentTime)
                ->exists();

            $attempts++;
            if ($attempts > 50) break;
        } while ($exists);

        $createdBy = $patient ? AppointmentCreatedBy::Patient : AppointmentCreatedBy::Guest;

        return [
            'doctor_id' => $doctor->id,
            'patient_id' => $patient?->id,
            'guest_email' => $patient ? null : $this->faker->unique()->safeEmail(),
            'appointment_date' => $appointmentDate,
            'appointment_time' => $appointmentTime,
            'status' => $this->faker->randomElement(AppointmentStatus::cases()),
            'created_by' => $createdBy,
        ];
    }

    /**
     * Indicate the appointment has a patient (not guest).
     */
    public function withPatient(): static
    {
        return $this->state(function () {
            $patient = User::query()->where('role', 'patient')->inRandomOrder()->first()
                ?? User::factory()->create(['role' => 'patient']);

            return [
                'patient_id' => $patient->id,
                'guest_email' => null,
                'created_by' => AppointmentCreatedBy::Patient,
            ];
        });
    }

    /**
     * Indicate the appointment was created by a guest.
     */
    public function asGuest(): static
    {
        return $this->state(fn() => [
            'patient_id' => null,
            'guest_email' => $this->faker->unique()->safeEmail(),
            'created_by' => AppointmentCreatedBy::Guest,
        ]);
    }

    public function pending(): static
    {
        return $this->state(fn() => [
            'status' => AppointmentStatus::Pending,
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn() => [
            'status' => AppointmentStatus::Approved,
        ]);
    }
}
