import { type FormEvent, useState, useEffect } from 'react';
import { useForm, Head, Link, router, usePage } from '@inertiajs/react';
import type { Appointment, BreadcrumbItem, SharedData, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { index as appointmentsIndex, show as appointmentShow } from '@/routes/appointments';
import { ArrowLeft, Save, Trash2, Calendar, Clock, Search, UserIcon, Users, Loader2, Mail } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

type Doctor = Pick<User, 'id' | 'name' | 'email'>;
type Patient = Pick<User, 'id' | 'name' | 'email'>;

type TimeSlot = {
    time: string;
    display: string;
    available: boolean;
};

type EditAppointmentProps = {
    appointment: Appointment;
    doctors?: Doctor[];
    patients?: Patient[];
    isAdmin: boolean;
};

type UpdatePayload = {
    status: Appointment['status'];
    doctor_id?: string;
    patient_id?: string;
    guest_email?: string;
    appointment_date?: string;
    appointment_time?: string;
};

export default function EditAppointment({ appointment, doctors = [], patients = [], isAdmin }: EditAppointmentProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { auth } = usePage<SharedData>().props;
    const [patientSearch, setPatientSearch] = useState('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

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
            title: 'Edit',
            href: '#',
        },
    ];

    // Format time to ensure HH:MM:SS format for Select component matching
    const formatTimeForSelect = (time: string | null | undefined): string | undefined => {
        if (!time) return undefined;
        // If already has seconds, return as-is
        if (time.match(/^\d{2}:\d{2}:\d{2}$/)) {
            return time;
        }
        // If only has HH:MM, add :00 for seconds
        if (time.match(/^\d{2}:\d{2}$/)) {
            return `${time}:00`;
        }
        return time;
    };

    // Format date from ISO string to YYYY-MM-DD for input[type="date"]
    const formatDateForInput = (dateString: string | null | undefined): string | undefined => {
        if (!dateString) return undefined;
        // If it's already in YYYY-MM-DD format, return as-is
        if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateString;
        }
        // If it's an ISO string, extract just the date part
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const { data, setData, patch, processing, errors } = useForm<UpdatePayload>({
        status: appointment.status,
        doctor_id: isAdmin ? String(appointment.doctor_id) : undefined,
        patient_id: isAdmin ? String(appointment.patient_id || '') : undefined,
        guest_email: isAdmin ? appointment.guest_email || '' : undefined,
        appointment_date: isAdmin ? formatDateForInput(appointment.appointment_date) : undefined,
        appointment_time: isAdmin ? formatTimeForSelect(appointment.appointment_time) : undefined,
    });

    // Fetch available time slots with AbortController to prevent race conditions
    useEffect(() => {
        if (!isAdmin || !data.doctor_id || !data.appointment_date) {
            setAvailableSlots([]);
            return;
        }

        const abortController = new AbortController();
        setLoadingSlots(true);

        fetch(`/appointments/available-slots/${data.doctor_id}/${data.appointment_date}`, {
            signal: abortController.signal,
        })
            .then((res) => res.json())
            .then((result) => {
                setAvailableSlots(result.slots || []);
            })
            .catch((error) => {
                if (error.name !== 'AbortError') {
                    console.error('Failed to fetch slots:', error);
                    setAvailableSlots([]);
                }
            })
            .finally(() => {
                setLoadingSlots(false);
            });

        return () => abortController.abort();
    }, [data.doctor_id, data.appointment_date, isAdmin]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        patch(`/appointments/${appointment.id}`);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(`/appointments/${appointment.id}`, {
            onFinish: () => {
                setIsDeleting(false);
                setDeleteDialogOpen(false);
            },
        });
    };

    const generalError = (errors as Record<string, string | undefined>).error;

    const statusOptions = [
        { value: 'pending', label: 'Pending', description: 'Awaiting review' },
        { value: 'approved', label: 'Approved', description: 'Confirmed and scheduled' },
        { value: 'rejected', label: 'Rejected', description: 'Request declined' },
        { value: 'completed', label: 'Completed', description: 'Appointment finished' },
    ];

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    // Check if this is a guest appointment
    const isGuest = !appointment.patient_id && appointment.guest_email;

    // Filter patients based on search
    const filteredPatients = patients.filter(
        (patient) =>
            patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
            patient.email.toLowerCase().includes(patientSearch.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Appointment #${appointment.id}`} />
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
                            <h1 className="text-2xl font-bold tracking-tight">{isAdmin ? 'Edit' : 'Update Status'} Appointment</h1>
                            <p className="text-sm text-muted-foreground">
                                {isAdmin ? 'Update all appointment details' : 'Update appointment status'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Form */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>{isAdmin ? 'Appointment Details' : 'Update Status'}</CardTitle>
                            <CardDescription>{isAdmin ? 'Edit all appointment information' : 'Change the appointment status'}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {isAdmin && (
                                    <>
                                        {isGuest ? (
                                            /* Guest Email Field */
                                            <div className="space-y-2">
                                                <Label htmlFor="guest_email">
                                                    <Mail className="mr-2 inline h-4 w-4" />
                                                    Guest Email *
                                                </Label>
                                                <Input
                                                    type="email"
                                                    id="guest_email"
                                                    placeholder="guest@example.com"
                                                    value={data.guest_email}
                                                    onChange={(e) => setData('guest_email', e.target.value)}
                                                />
                                                {errors.guest_email && <p className="text-sm text-destructive">{errors.guest_email}</p>}
                                            </div>
                                        ) : (
                                            /* Patient Selection */
                                            <div className="space-y-2">
                                                <Label htmlFor="patient_id">
                                                    <Users className="mr-2 inline h-4 w-4" />
                                                    Patient *
                                                </Label>
                                                <Select
                                                    value={data.patient_id}
                                                    onValueChange={(value) => setData('patient_id', value)}
                                                >
                                                    <SelectTrigger id="patient_id">
                                                        <SelectValue placeholder="Choose patient" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <div className="sticky top-0 bg-background p-2">
                                                            <div className="relative">
                                                                <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
                                                                <Input
                                                                    placeholder="Search patients..."
                                                                    value={patientSearch}
                                                                    onChange={(e) => setPatientSearch(e.target.value)}
                                                                    className="pl-8"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                />
                                                            </div>
                                                        </div>
                                                        {filteredPatients.map((patient) => (
                                                            <SelectItem key={patient.id} value={String(patient.id)}>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{patient.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{patient.email}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {errors.patient_id && <p className="text-sm text-destructive">{errors.patient_id}</p>}
                                            </div>
                                        )}

                                        {/* Doctor Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="doctor_id">
                                                <UserIcon className="mr-2 inline h-4 w-4" />
                                                Doctor *
                                            </Label>
                                            <Select
                                                value={data.doctor_id}
                                                onValueChange={(value) => {
                                                    setData('doctor_id', value);
                                                    setData('appointment_time', '');
                                                }}
                                            >
                                                <SelectTrigger id="doctor_id">
                                                    <SelectValue placeholder="Choose doctor" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {doctors.map((doctor) => (
                                                        <SelectItem key={doctor.id} value={String(doctor.id)}>
                                                            <div className="flex flex-col">
                                                                <span className="font-medium">Dr. {doctor.name}</span>
                                                                <span className="text-xs text-muted-foreground">{doctor.email}</span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.doctor_id && <p className="text-sm text-destructive">{errors.doctor_id}</p>}
                                        </div>

                                        {/* Date Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="appointment_date">
                                                <Calendar className="mr-2 inline h-4 w-4" />
                                                Appointment Date *
                                            </Label>
                                            <Input
                                                type="date"
                                                id="appointment_date"
                                                value={data.appointment_date}
                                                onChange={(e) => {
                                                    setData('appointment_date', e.target.value);
                                                    setData('appointment_time', '');
                                                }}
                                                min={today}
                                            />
                                            {errors.appointment_date && <p className="text-sm text-destructive">{errors.appointment_date}</p>}
                                        </div>

                                        {/* Time Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="appointment_time">
                                                <Clock className="mr-2 inline h-4 w-4" />
                                                Appointment Time *
                                            </Label>
                                            <Select
                                                value={data.appointment_time || ''}
                                                onValueChange={(value) => setData('appointment_time', value)}
                                                disabled={!data.doctor_id || !data.appointment_date || loadingSlots}
                                            >
                                                <SelectTrigger id="appointment_time">
                                                    <SelectValue
                                                        placeholder={
                                                            loadingSlots
                                                                ? 'Loading available times...'
                                                                : !data.doctor_id || !data.appointment_date
                                                                ? 'Select doctor and date first'
                                                                : 'Choose time slot'
                                                        }
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {loadingSlots ? (
                                                        <div className="flex items-center justify-center p-4">
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        </div>
                                                    ) : (
                                                        availableSlots
                                                            .filter((slot) => slot.available || slot.time === data.appointment_time)
                                                            .map((slot) => (
                                                                <SelectItem key={slot.time} value={slot.time}>
                                                                    {slot.display}
                                                                    {slot.time === data.appointment_time && ' (Current)'}
                                                                </SelectItem>
                                                            ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {errors.appointment_time && <p className="text-sm text-destructive">{errors.appointment_time}</p>}
                                        </div>
                                    </>
                                )}

                                {/* Status */}
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
                                    <Button type="submit" disabled={processing}>
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

                {/* Danger Zone - Admin Only */}
                {isAdmin && (
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Permanently delete this appointment</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive">
                                        <Trash2 />
                                        Delete Appointment
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Are you sure?</DialogTitle>
                                        <DialogDescription>
                                            This will permanently delete appointment #{appointment.id}. This action cannot be undone.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                                            Cancel
                                        </Button>
                                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                                            {isDeleting ? 'Deleting...' : 'Delete'}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
