# Appointment Management System

## Tech Stack

- Laravel 12
- Inertia.js
- React
- MySQL
- Tailwind CSS

## Project Setup

- Requirements: PHP 8.3, Composer, Node 20+, npm, MySQL.
- Copy env: `cp .env.example .env` and fill DB settings plus reCAPTCHA keys (`RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`; frontend uses `VITE_RECAPTCHA_SITE_KEY` if set).
- Install deps: `composer install` and `npm install`.
- Generate key: `php artisan key:generate`.
- Run migrations: `php artisan migrate --seed`.
- Run dev servers:
    - Backend: `php artisan serve`
    - Frontend/Vite: `npm run dev`

Home after login: `/appointments` (Fortify home).

### Demo Accounts (all passwords: `password`)

- Admin: `admin@example.com`
- Doctors: `doctor1@example.com`, `doctor2@example.com`, `doctor3@example.com`
- Patients: `patient1@example.com` … `patient5@example.com`

## Approach

delivered the brief with Laravel 12 + Inertia + React, single users table with roles, guest booking, admin/user management, and reCAPTCHA on login/guest flows; enforced core guards (no double-booking, one active per patient per doctor).

## Architecture Overview

- Backend: Laravel 12 + Fortify, single `users` table with roles (`admin`, `doctor`, `patient`), inactivity flag, policies for user management.
- Frontend: Inertia + React + Tailwind, shared layouts, role-aware sidebar, pages under `resources/js/pages`.
- Appointments: service + controller; doctor availability is enforced via unique composite (doctor/date/time) and application checks.
- Guest flow: public booking page uses reCAPTCHA v2 and creates appointments as `created_by = guest`.

## Database Design

The database schema was intentionally kept simple and normalized to match the scope of the assignment while ensuring data integrity and scalability.

### Users Table

All system users (Admin, Doctor, Patient) are stored in a single `users` table and differentiated by a `role` field.

Roles:

- `admin`
- `doctor`
- `patient`

This approach avoids unnecessary table duplication and aligns with the Laravel React starter kit authentication model. User access and permissions are handled at the application level using role-based authorization.

An `is_active` flag is used to allow administrators to disable users without permanently deleting records. Soft deletes are enabled to preserve historical data.

### Appointments Table

The `appointments` table represents the core business entity of the system.

Each appointment:

- Belongs to exactly one doctor (referencing `users.id`)
- May belong to one registered patient (referencing `users.id`) or a guest user via email
- Is scheduled using separate `appointment_date` and `appointment_time` fields
- Uses fixed one-hour time slots
- Has a lifecycle status: `pending`, `approved`, `rejected`, `completed`

To prevent double-booking, a composite unique constraint is applied on:

- `doctor_id`
- `appointment_date`
- `appointment_time`

This ensures that a doctor cannot have more than one appointment in the same time slot, even under concurrent requests.

### Guest Appointments

Guest users are allowed to create appointments using an email address without registering an account. Guest-created appointments are identified using a `created_by` field and may optionally be linked to an existing patient account if the email matches a registered user.

### Audit & Traceability

The `created_by` field (`admin`, `patient`, `guest`) is used to explicitly track who initiated the appointment creation. This simplifies authorization logic, auditing, and future extensibility without relying on implicit assumptions.

## Assumptions & Design Decisions

### Design Decisions & Assumptions

- Users (Admin, Doctor, Patient) are stored in a single users table using role-based access.
- Appointments use fixed one-hour time slots (e.g., 1:00 PM, 2:00 PM). Slot validation is handled at the application level.
- Doctors cannot be double-booked for the same date and time.
- Patients and admins are restricted to one active appointment at a time via business logic.
- Patients are limited to one pending/approved appointment per doctor (per business logic guard).
- Guest users can create appointments using an email address but cannot manage them without authentication.
- Timezone handling assumes doctors and patients operate in the same timezone.

### Time Zones

Appointments are stored using separate `date` and `time` fields without explicit time zone handling.

This project assumes that doctors and patients operate within the same local time zone (e.g., a physical clinic scenario). Time zone conversion and multi-region scheduling were considered out of scope for this assignment but could be addressed in a future iteration by storing timestamps in UTC and converting them at the presentation layer.

## Security Considerations

- Login protected by reCAPTCHA v2 (site/secret required). Inactive users are blocked during auth.
- Rate limiting: Fortify login limiter (5/min per user+IP) and two-factor limiter.
- Authorization: `can:manage-users` gate for admin user management; policies for appointments.
- CSRF: Laravel middleware stack; Inertia handles XSRF token automatically.

## What I Liked / Didn’t Like

- Liked: cohesive stack fit, clear CRUD flows, fixed one-hour slots with a simple status set (pending/approved/rejected/completed) kept validation straightforward.
- Didn’t like / open questions: guest appointment ownership/management, handling guest email that matches a registered patient, whether admins bypass the “one-at-a-time” rule, and lack of explicit doctor hours/timezone guidance—documented assumptions accordingly.

## Pending / Future Improvements

- Configurable doctor availability (beyond fixed on-the-hour slots) and timezone-safe scheduling.
- Guest appointment management via emailed link (view/cancel), including clear handling when email matches a registered patient.
- Additional notifications (email) for status changes and reminders.
- Pest browser/feature tests for auth, booking (guest/patient/admin), and role gates.
- Seed richer demo scenarios (appointments per status) to showcase flows.
