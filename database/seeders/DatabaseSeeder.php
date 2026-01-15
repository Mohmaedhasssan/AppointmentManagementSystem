<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Appointment;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'role' => UserRole::Admin,
            'is_active' => true,
        ]);

        // Doctors
        $doctors = User::factory(3)->create([
            'role' => UserRole::Doctor,
            'is_active' => true,
        ]);

        foreach ($doctors as $i => $doctor) {
            $doctor->update([
                'email' => 'doctor' . ($i + 1) . '@example.com',
            ]);
        }

        // Patients
        $patients = User::factory(5)->create([
            'role' => UserRole::Patient,
            'is_active' => true,
        ]);

        foreach ($patients as $i => $patient) {
            $patient->update([
                'email' => 'patient' . ($i + 1) . '@example.com',
            ]);
        }

        // Sample appointments (reduced count to avoid unique constraint conflicts)
        Appointment::factory(5)->create();

        // Specific demo appointments
        Appointment::factory()->create([
            'doctor_id' => $doctors[0]->id,
            'patient_id' => $patients[0]->id,
            'guest_email' => null,
            'appointment_date' => now()->addDays(7)->format('Y-m-d'),
            'appointment_time' => '10:00:00',
            'status' => 'pending',
            'created_by' => 'patient',
        ]);

        Appointment::factory()->create([
            'doctor_id' => $doctors[1]->id,
            'patient_id' => null,
            'guest_email' => 'guest@example.com',
            'appointment_date' => now()->addDays(8)->format('Y-m-d'),
            'appointment_time' => '14:00:00',
            'status' => 'pending',
            'created_by' => 'guest',
        ]);
    }
}
