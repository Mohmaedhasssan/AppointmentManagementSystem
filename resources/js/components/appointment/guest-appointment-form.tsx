import { useState, type FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import ReCAPTCHA from 'react-google-recaptcha';
import { store as guestStore } from '@/routes/guest';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

type GuestDoctor = Pick<User, 'id' | 'name'>;
type GuestAppointmentFormProps = {
    doctors: GuestDoctor[];
};

type GuestAppointmentPayload = {
    doctor_id: string;
    appointment_date: string;
    appointment_time: string;
    guest_email: string;
    'g-recaptcha-response': string;
};

export default function GuestAppointmentForm({ doctors }: GuestAppointmentFormProps) {
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm<GuestAppointmentPayload>({
        doctor_id: '',
        appointment_date: '',
        appointment_time: '',
        guest_email: '',
        'g-recaptcha-response': '',
    });

    const handleCaptcha = (token: string | null) => {
        setRecaptchaToken(token);
        setData('g-recaptcha-response', token ?? '');
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post(guestStore.url());
    };

    const timeSlots = Array.from({ length: 9 }, (_, i) => {
        const hour = 9 + i;
        return {
            value: `${hour.toString().padStart(2, '0')}:00:00`,
            label: `${hour.toString().padStart(2, '0')}:00 (${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'})`,
        };
    });

    const generalError = (errors as Record<string, string | undefined>).error;

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>Book an Appointment</CardTitle>
                <CardDescription>Fill in your details to request an appointment with one of our doctors</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Doctor Selection */}
                    <div>
                        <Label htmlFor="doctor">Select Doctor</Label>
                        <Select value={data.doctor_id} onValueChange={(value) => setData('doctor_id', value)}>
                            <SelectTrigger id="doctor">
                                <SelectValue placeholder="Choose a doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map((doctor) => (
                                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                                        {doctor.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.doctor_id && <p className="mt-1 text-sm text-red-600">{errors.doctor_id}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <Label htmlFor="email">Your Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.guest_email}
                            onChange={(e) => setData('guest_email', e.target.value)}
                            placeholder="you@example.com"
                        />
                        {errors.guest_email && <p className="mt-1 text-sm text-red-600">{errors.guest_email}</p>}
                    </div>

                    {/* Appointment Date */}
                    <div>
                        <Label htmlFor="date">Appointment Date</Label>
                        <Input
                            id="date"
                            type="date"
                            value={data.appointment_date}
                            onChange={(e) => setData('appointment_date', e.target.value)}
                        />
                        {errors.appointment_date && <p className="mt-1 text-sm text-red-600">{errors.appointment_date}</p>}
                    </div>

                    {/* Appointment Time */}
                    <div>
                        <Label htmlFor="time">Appointment Time</Label>
                        <Select value={data.appointment_time} onValueChange={(value) => setData('appointment_time', value)}>
                            <SelectTrigger id="time">
                                <SelectValue placeholder="Choose a time slot" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeSlots.map((slot) => (
                                    <SelectItem key={slot.value} value={slot.value}>
                                        {slot.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.appointment_time && <p className="mt-1 text-sm text-red-600">{errors.appointment_time}</p>}
                    </div>

                    {/* reCAPTCHA */}
                    <div className="flex justify-center">
                        <ReCAPTCHA
                            sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                            onChange={handleCaptcha}
                        />
                    </div>
                    {errors['g-recaptcha-response'] && (
                        <p className="text-sm text-red-600">{errors['g-recaptcha-response']}</p>
                    )}

                    {/* Error Alert */}
                    {generalError && (
                        <Alert variant="destructive">
                            <AlertDescription>{generalError}</AlertDescription>
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <Button type="submit" disabled={processing || !recaptchaToken} className="w-full">
                        {processing ? 'Booking...' : 'Book Appointment'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
