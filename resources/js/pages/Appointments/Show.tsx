import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as appointmentsIndex, edit as appointmentEdit } from '@/routes/appointments';
import type { Appointment, BreadcrumbItem } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { ArrowLeft, Calendar, Clock, Edit, Mail, User as UserIcon } from 'lucide-react';

type ShowAppointmentProps = {
    appointment: Appointment;
};

function getStatusBadge(status: Appointment['status']) {
    const variants = {
        pending: { variant: 'outline' as const, label: 'Pending', className: 'border-yellow-500 text-yellow-700 dark:text-yellow-400' },
        approved: { variant: 'default' as const, label: 'Approved', className: 'bg-green-600 text-white' },
        rejected: { variant: 'destructive' as const, label: 'Rejected', className: '' },
        completed: { variant: 'secondary' as const, label: 'Completed', className: '' },
    };

    const config = variants[status] || variants.pending;
    return (
        <Badge variant={config.variant} className={config.className}>
            {config.label}
        </Badge>
    );
}

function getCreatedByBadge(createdBy: Appointment['created_by']) {
    const variants = {
        admin: { label: 'Admin', className: 'bg-purple-600 text-white' },
        patient: { label: 'Patient', className: 'bg-blue-600 text-white' },
        guest: { label: 'Guest', className: 'bg-gray-600 text-white' },
    };

    const config = variants[createdBy] || variants.patient;
    return (
        <Badge variant="default" className={config.className}>
            {config.label}
        </Badge>
    );
}

function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatTime(time: string): string {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

export default function ShowAppointment({ appointment }: ShowAppointmentProps) {
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user.role;
    const isAdmin = userRole === 'admin';
    const isDoctor = userRole === 'doctor';

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Appointments',
            href: appointmentsIndex().url,
        },
        {
            title: `Appointment #${appointment.id}`,
            href: '#',
        },
    ];

    const canEdit = (isAdmin || (isDoctor && appointment.doctor_id === auth.user.id)) && 
                    (appointment.status === 'pending' || appointment.status === 'approved');
    const editButtonLabel = isAdmin ? 'Edit' : 'Update Status';
    const editUrl = isAdmin 
        ? appointmentEdit(appointment.id).url 
        : `/appointments/${appointment.id}/status/edit`;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Appointment #${appointment.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={appointmentsIndex().url}>
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Appointment Details</h1>
                            <p className="text-sm text-muted-foreground">Appointment #{appointment.id}</p>
                        </div>
                    </div>
                    {canEdit && (
                        <Button asChild>
                            <Link href={editUrl}>
                                <Edit />
                                {editButtonLabel}
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Appointment Details Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <UserIcon className="size-5" />
                                    Dr. {appointment.doctor?.name || 'Unknown'}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {appointment.doctor?.email}
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {getStatusBadge(appointment.status)}
                                {getCreatedByBadge(appointment.created_by)}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Date & Time */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Calendar className="size-4" />
                                    Date
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(appointment.appointment_date)}
                                </p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                    <Clock className="size-4" />
                                    Time
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {formatTime(appointment.appointment_time)}
                                </p>
                            </div>
                        </div>

                        {/* Patient/Guest Info */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                {appointment.patient ? <UserIcon className="size-4" /> : <Mail className="size-4" />}
                                {appointment.patient ? 'Patient' : 'Guest'}
                            </div>
                            {appointment.patient ? (
                                <div>
                                    <p className="font-medium">{appointment.patient.name}</p>
                                    <p className="text-sm text-muted-foreground">{appointment.patient.email}</p>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">{appointment.guest_email}</p>
                            )}
                        </div>

                        {/* Timestamps */}
                        <div className="border-t pt-4">
                            <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Created</span>
                                    <span>{new Date(appointment.created_at).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated</span>
                                    <span>{new Date(appointment.updated_at).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric', 
                                        year: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit'
                                    })}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
