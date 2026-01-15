export default function BookingConfirmation({ appointment, message }) {
    return (
        <div className="min-h-screen bg-green-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl rounded-lg border border-green-200 bg-white p-8 shadow-lg">
                <div className="mb-6 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-green-900">Appointment Requested</h1>
                </div>

                <p className="mb-8 text-center text-lg text-gray-600">{message}</p>

                <div className="space-y-4 rounded-lg bg-gray-50 p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Appointment Details</h2>
                    <div className="grid gap-4">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-600">Doctor:</span>
                            <span className="font-semibold text-gray-900">{appointment.doctor.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-600">Email:</span>
                            <span className="font-semibold text-gray-900">{appointment.guest_email}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                            <span className="text-gray-600">Date:</span>
                            <span className="font-semibold text-gray-900">{appointment.appointment_date}</span>
                        </div>
                        <div className="flex justify-between pb-2">
                            <span className="text-gray-600">Time:</span>
                            <span className="font-semibold text-gray-900">{appointment.appointment_time}</span>
                        </div>
                    </div>
                </div>

                <p className="mt-8 text-center text-sm text-gray-500">
                    You will receive an email confirmation once the doctor approves your appointment.
                </p>

                <div className="mt-8 text-center">
                    <a href="/" className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700">
                        Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}
