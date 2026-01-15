import { type FormEvent, useState, useEffect } from 'react';
import { useForm, Head, Link } from '@inertiajs/react';
import { store as appointmentStore } from '@/routes/appointments';
import type { User, BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { index as appointmentsIndex } from '@/routes/appointments';
import { ArrowLeft, Calendar, Clock, Search, UserIcon, Users, Loader2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Appointments',
        href: appointmentsIndex().url,
    },
    {
        title: 'Create',
        href: '#',
    },
];

type Doctor = Pick<User, 'id' | 'name' | 'email'>;
type Patient = Pick<User, 'id' | 'name' | 'email'>;

type TimeSlot = {
    time: string;
    display: string;
    available: boolean;
};

type CreateAppointmentProps = {
    doctors: Doctor[];
    patients: Patient[];
    isAdmin: boolean;
};

type AppointmentPayload = {
    doctor_id: string;
    patient_id?: string;
    appointment_date: string;
    appointment_time: string;
};

export default function CreateAppointment({ doctors, patients, isAdmin }: CreateAppointmentProps) {
    const [patientSearch, setPatientSearch] = useState('');
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm<AppointmentPayload>({
        doctor_id: '',
        patient_id: isAdmin ? '' : undefined,
        appointment_date: '',
        appointment_time: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(appointmentStore.url());
    };

    // Fetch available slots when doctor and date are selected
    useEffect(() => {
        if (data.doctor_id && data.appointment_date) {
            setLoadingSlots(true);
            setData('appointment_time', ''); // Reset time selection

            fetch(`/appointments/available-slots/${data.doctor_id}/${data.appointment_date}`)
                .then((res) => res.json())
                .then((result) => {
                    setAvailableSlots(result.slots || []);
                })
                .catch((error) => {
                    console.error('Failed to fetch slots:', error);
                    setAvailableSlots([]);
                })
                .finally(() => {
                    setLoadingSlots(false);
                });
        } else {
            setAvailableSlots([]);
        }
    }, [data.doctor_id, data.appointment_date]);

    const generalError = (errors as Record<string, string | undefined>).error;

    // Get today's date in YYYY-MM-DD format for min attribute
    const today = new Date().toISOString().split('T')[0];

    // Filter patients based on search
    const filteredPatients = patients.filter(
        (patient) =>
            patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
            patient.email.toLowerCase().includes(patientSearch.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Appointment" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={appointmentsIndex().url}>
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Appointment</h1>
                        <p className="text-sm text-muted-foreground">Schedule a new appointment with a doctor</p>
                    </div>
                </div>

                <Card className="mx-auto w-full max-w-2xl">
                    <CardHeader>
                        <CardTitle>Appointment Details</CardTitle>
                        <CardDescription>Fill in the details to book your appointment</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Patient Selection (Admin Only) */}
                            {isAdmin && (
                                <div className="space-y-2">
                                    <Label htmlFor="patient" className="flex items-center gap-2">
                                        <Users className="size-4" />
                                        Select Patient
                                    </Label>
                                    <div className="relative">
                                        <Select
                                            value={data.patient_id}
                                            onValueChange={(value) => setData('patient_id', value)}
                                        >
                                            <SelectTrigger id="patient">
                                                <SelectValue placeholder="Choose a patient" />
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
                                                <div className="max-h-64 overflow-y-auto">
                                                    {filteredPatients.length > 0 ? (
                                                        filteredPatients.map((patient) => (
                                                            <SelectItem key={patient.id} value={patient.id.toString()}>
                                                                <div className="flex flex-col">
                                                                    <span className="font-medium">{patient.name}</span>
                                                                    <span className="text-xs text-muted-foreground">{patient.email}</span>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="py-6 text-center text-sm text-muted-foreground">
                                                            No patients found
                                                        </div>
                                                    )}
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {errors.patient_id && <p className="text-sm text-destructive">{errors.patient_id}</p>}
                                </div>
                            )}

                            {/* Doctor Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="doctor" className="flex items-center gap-2">
                                    <UserIcon className="size-4" />
                                    Select Doctor
                                </Label>
                                <Select value={data.doctor_id} onValueChange={(value) => setData('doctor_id', value)}>
                                    <SelectTrigger id="doctor">
                                        <SelectValue placeholder="Choose a doctor" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctors.map((doctor) => (
                                            <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{doctor.name}</span>
                                                    <span className="text-xs text-muted-foreground">{doctor.email}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.doctor_id && <p className="text-sm text-destructive">{errors.doctor_id}</p>}
                            </div>

                            {/* Appointment Date */}
                            <div className="space-y-2">
                                <Label htmlFor="date" className="flex items-center gap-2">
                                    <Calendar className="size-4" />
                                    Appointment Date
                                </Label>
                                <Input
                                    id="date"
                                    type="date"
                                    min={today}
                                    value={data.appointment_date}
                                    onChange={(e) => setData('appointment_date', e.target.value)}
                                />
                                {errors.appointment_date && <p className="text-sm text-destructive">{errors.appointment_date}</p>}
                            </div>

                            {/* Appointment Time */}
                            <div className="space-y-2">
                                <Label htmlFor="time" className="flex items-center gap-2">
                                    <Clock className="size-4" />
                                    Appointment Time
                                </Label>
                                <Select 
                                    value={data.appointment_time} 
                                    onValueChange={(value) => setData('appointment_time', value)}
                                    disabled={!data.doctor_id || !data.appointment_date || loadingSlots}
                                >
                                    <SelectTrigger id="time">
                                        <SelectValue placeholder={
                                            loadingSlots 
                                                ? "Loading available slots..." 
                                                : !data.doctor_id || !data.appointment_date
                                                    ? "Select doctor and date first"
                                                    : "Choose a time slot"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {loadingSlots ? (
                                            <div className="flex items-center justify-center py-6">
                                                <Loader2 className="size-4 animate-spin" />
                                            </div>
                                        ) : availableSlots.filter(slot => slot.available).length > 0 ? (
                                            availableSlots
                                                .filter((slot) => slot.available)
                                                .map((slot) => (
                                                    <SelectItem key={slot.time} value={slot.time}>
                                                        {slot.display}
                                                    </SelectItem>
                                                ))
                                        ) : (
                                            <div className="py-6 text-center text-sm text-muted-foreground">
                                                No available time slots
                                            </div>
                                        )}
                                    </SelectContent>
                                </Select>
                                {errors.appointment_time && <p className="text-sm text-destructive">{errors.appointment_time}</p>}
                            </div>

                            {/* Error Alert */}
                            {generalError && (
                                <Alert variant="destructive">
                                    <AlertDescription>{generalError}</AlertDescription>
                                </Alert>
                            )}

                            {/* Submit Buttons */}
                            <div className="flex gap-3">
                                <Button type="submit" disabled={processing} className="flex-1">
                                    {processing ? 'Creating...' : 'Create Appointment'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <Link href={appointmentsIndex().url}>Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
