<?php

namespace App\Enums;

enum AppointmentCreatedBy: string
{
    case Admin = 'admin';
    case Patient = 'patient';
    case Guest = 'guest';
}
