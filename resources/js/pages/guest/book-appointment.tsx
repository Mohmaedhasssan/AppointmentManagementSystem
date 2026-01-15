import GuestAppointmentForm from '@/components/appointment/guest-appointment-form';
import { dashboard, login, register } from '@/routes';
import { type SharedData, type User } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';

type GuestDoctor = Pick<User, 'id' | 'name'>;

type BookAppointmentProps = {
    doctors: GuestDoctor[];
    canRegister?: boolean;
};

export default function BookAppointment({ doctors, canRegister = true }: BookAppointmentProps) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Book Appointment">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-[#FDFDFC] text-[#1b1b18] dark:bg-[#0a0a0a]">
                <header className="w-full px-6 py-4 lg:px-8">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <main className="flex flex-1 items-center justify-center px-4 pb-12 pt-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-3xl">
                        <GuestAppointmentForm doctors={doctors} />
                    </div>
                </main>
            </div>
        </>
    );
}
