import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { index as appointmentsIndex, show as appointmentShow, create as appointmentCreate } from '@/routes/appointments';
import type { Appointment, BreadcrumbItem, User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import type { SharedData } from '@/types';
import { Calendar, Clock, Eye, Plus, User as UserIcon } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appointments',
        href: appointmentsIndex().url,
    },
];

type AppointmentsIndexProps = {
    appointments: {
        data: Appointment[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
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
        weekday: 'short',
        year: 'numeric',
        month: 'short',
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

export default function AppointmentsIndex({ appointments }: AppointmentsIndexProps) {
    const hasAppointments = appointments.data.length > 0;
    const { auth } = usePage<SharedData>().props;
    const userRole = auth.user.role;
    const canCreateAppointment = userRole === 'admin' || userRole === 'patient';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Appointments" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
                        <p className="text-sm text-muted-foreground">
                            {appointments.total} total appointment{appointments.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    {canCreateAppointment && (
                        <Button asChild>
                            <Link href={appointmentCreate().url}>
                                <Plus />
                                New Appointment
                            </Link>
                        </Button>
                    )}
                </div>

                {/* Appointments List */}
                {hasAppointments ? (
                    <div className="grid gap-4">
                        {appointments.data.map((appointment) => (
                            <Card key={appointment.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <UserIcon className="size-4" />
                                                Dr. {appointment.doctor?.name || 'Unknown'}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-4 text-sm">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="size-3" />
                                                    {formatDate(appointment.appointment_date)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    {formatTime(appointment.appointment_time)}
                                                </span>
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusBadge(appointment.status)}
                                            {getCreatedByBadge(appointment.created_by)}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1 text-sm">
                                            {appointment.patient && (
                                                <p className="text-muted-foreground">
                                                    Patient: <span className="font-medium text-foreground">{appointment.patient.name}</span>
                                                </p>
                                            )}
                                            {appointment.guest_email && (
                                                <p className="text-muted-foreground">
                                                    Guest: <span className="font-medium text-foreground">{appointment.guest_email}</span>
                                                </p>
                                            )}
                                        </div>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={appointmentShow(appointment.id).url}>
                                                <Eye />
                                                View Details
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <Calendar className="mb-4 size-12 text-muted-foreground" />
                            <h3 className="mb-2 text-lg font-semibold">No appointments yet</h3>
                            <p className="mb-4 text-center text-sm text-muted-foreground">
                                Get started by creating your first appointment
                            </p>
                            <Button asChild>
                                <Link href={appointmentCreate().url}>
                                    <Plus />
                                    Create Appointment
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {appointments.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {Array.from({ length: appointments.last_page }, (_, i) => i + 1).map((page) => (
                            <Button
                                key={page}
                                variant={page === appointments.current_page ? 'default' : 'outline'}
                                size="sm"
                                asChild
                            >
                                <Link href={appointmentsIndex({ query: { page } }).url}>{page}</Link>
                            </Button>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
