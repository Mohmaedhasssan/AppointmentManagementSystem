import { InertiaLinkProps } from '@inertiajs/react';
import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: NonNullable<InertiaLinkProps['href']>;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    role: 'admin' | 'doctor' | 'patient';
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Appointment {
    id: number;
    doctor_id: number;
    patient_id: number | null;
    guest_email: string | null;
    appointment_date: string; // YYYY-MM-DD
    appointment_time: string; // HH:mm:ss
    status: 'pending' | 'approved' | 'rejected' | 'completed';
    created_by: 'admin' | 'patient' | 'guest';
    created_at: string;
    updated_at: string;
    doctor?: User;
    patient?: User | null;
}
