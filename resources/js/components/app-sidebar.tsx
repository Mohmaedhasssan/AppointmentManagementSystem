import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import * as appointments from '@/routes/appointments';
import * as profile from '@/routes/profile';
import { type NavItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import {
    CalendarClock,
    LifeBuoy,
    PlusCircle,
    UserRound,
    Users,
} from 'lucide-react';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const role = auth?.user?.role ?? 'patient';

    // Dashboard link temporarily hidden per request.
    const baseItems: NavItem[] = [];

    const appointmentItems: NavItem[] = [
        {
            title: 'Appointments',
            href: appointments.index(),
            icon: CalendarClock,
        },
        {
            title: 'New Appointment',
            href: appointments.create(),
            icon: PlusCircle,
        },
    ];

    const doctorItems: NavItem[] = [
        ...baseItems,
        appointmentItems[0],
    ];

    const patientItems: NavItem[] = [
        ...baseItems,
        ...appointmentItems,
    ];

    const adminItems: NavItem[] = [
        ...baseItems,
        ...appointmentItems,
        {
            title: 'Manage Users',
            href: '/admin/users',
            icon: Users,
        },
    ];

    const accountItems: NavItem[] = [
        {
            title: 'Profile',
            href: profile.edit(),
            icon: UserRound,
        },
    ];

    const roleNavMap: Record<string, NavItem[]> = {
        admin: adminItems,
        doctor: doctorItems,
        patient: patientItems,
    };

    const mainNavItems = roleNavMap[role] ?? patientItems;

    const footerNavItems: NavItem[] = [
        {
            title: 'Support',
            href: 'mailto:support@appointments.local',
            icon: LifeBuoy,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={appointments.index()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Scheduling" />
                <NavMain items={accountItems} label="Account" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
