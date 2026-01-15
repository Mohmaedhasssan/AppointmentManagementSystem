import { type FormEvent } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import type { Appointment, BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { index as appointmentsIndex, show as appointmentShow } from '@/routes/appointments';
import { ArrowLeft, Save } from 'lucide-react';

type EditStatusProps = {
    appointment: Appointment;
};

type UpdateStatusPayload = {
    status: Appointment['status'];
};

export default function EditStatus({ appointment }: EditStatusProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Appointments',
            href: appointmentsIndex().url,
        },
        {
            title: `Appointment #${appointment.id}`,
            href: appointmentShow(appointment.id).url,
        },
        {
            title: 'Update Status',
            href: '#',
        },
    ];

    const { data, setData, patch, processing, errors } = useForm<UpdateStatusPayload>({
        status: appointment.status,
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        patch(`/appointments/${appointment.id}/status`);
    };

    const generalError = (errors as Record<string, string | undefined>).error;

    const statusOptions = [
        { value: 'pending', label: 'Pending', description: 'Awaiting review' },
        { value: 'approved', label: 'Approved', description: 'Confirmed and scheduled' },
        { value: 'rejected', label: 'Rejected', description: 'Request declined' },
        { value: 'completed', label: 'Completed', description: 'Appointment finished' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Update Status - Appointment #${appointment.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild>
                            <Link href={appointmentShow(appointment.id).url}>
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Update Appointment Status</h1>
                            <p className="text-sm text-muted-foreground">Change the appointment status</p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Status Update Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>Update Status</CardTitle>
                            <CardDescription>Change the appointment status</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Appointment Status</Label>
                                    <Select value={data.status} onValueChange={(value) => setData('status', value as Appointment['status'])}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Choose status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{option.label}</span>
                                                        <span className="text-xs text-muted-foreground">{option.description}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                                </div>

                                {/* Error Alert */}
                                {generalError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{generalError}</AlertDescription>
                                    </Alert>
                                )}

                                {/* Submit Button */}
                                <div className="flex gap-3">
                                    <Button type="submit" disabled={processing || data.status === appointment.status}>
                                        <Save />
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                    <Button type="button" variant="outline" asChild>
                                        <Link href={appointmentShow(appointment.id).url}>Cancel</Link>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Appointment Info Sidebar */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Appointment Info</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <p className="font-medium">Doctor</p>
                                <p className="text-muted-foreground">Dr. {appointment.doctor?.name}</p>
                            </div>
                            <div>
                                <p className="font-medium">{appointment.patient ? 'Patient' : 'Guest'}</p>
                                <p className="text-muted-foreground">
                                    {appointment.patient ? appointment.patient.name : appointment.guest_email}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">Date & Time</p>
                                <p className="text-muted-foreground">
                                    {new Date(appointment.appointment_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}{' '}
                                    at{' '}
                                    {new Date(`2000-01-01T${appointment.appointment_time}`).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true,
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="font-medium">Current Status</p>
                                <p className="text-muted-foreground capitalize">{appointment.status}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
