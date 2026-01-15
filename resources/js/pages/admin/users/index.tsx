import AppSidebarLayout from '@/layouts/app/app-sidebar-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SharedData } from '@/types';
import { useForm, usePage, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';

type UserRow = {
    id: number;
    name: string;
    email: string;
    role: 'doctor' | 'patient';
    is_active: boolean;
    created_at: string | null;
};

type PageProps = SharedData & {
    users: {
        data: UserRow[];
        links: Array<{ url: string | null; label: string; active: boolean }>;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    filters: {
        role: string;
        search: string;
    };
};

export default function AdminUsersIndex() {
    const { users, filters } = usePage<PageProps>().props;
    const [role, setRole] = useState(filters.role ?? 'doctor');
    const [search, setSearch] = useState(filters.search ?? '');

    const createForm = useForm({
        name: '',
        email: '',
        role: 'doctor' as 'doctor' | 'patient',
        password: '',
        password_confirmation: '',
        is_active: true,
    });

    const submitCreate = (e: FormEvent) => {
        e.preventDefault();
        createForm.post('/admin/users', {
            preserveScroll: true,
            onSuccess: () => createForm.reset('name', 'email', 'password', 'password_confirmation'),
        });
    };

    const submitFilters = (e: FormEvent) => {
        e.preventDefault();
        router.get('/admin/users', { role, search }, { preserveState: true, replace: true });
    };

    const toggleActive = (user: UserRow) => {
        router.patch(`/admin/users/${user.id}`, { is_active: !user.is_active }, { preserveScroll: true });
    };

    const deleteUser = (user: UserRow) => {
        if (!confirm(`Delete ${user.name}?`)) return;
        router.delete(`/admin/users/${user.id}`, { preserveScroll: true });
    };

    return (
        <AppSidebarLayout breadcrumbs={[{ title: 'Users', href: '/admin/users' }]}> 
            <div className="space-y-8 p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-2xl font-semibold">Manage Users</h1>
                    <p className="text-sm text-muted-foreground">Admins can manage doctor and patient accounts.</p>
                </div>
                <form onSubmit={submitFilters} className="flex flex-wrap items-end gap-3">
                    <div className="w-36">
                        <Label htmlFor="role">Role</Label>
                        <Select value={role} onValueChange={(value) => setRole(value)}>
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="doctor">Doctor</SelectItem>
                                <SelectItem value="patient">Patient</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-64">
                        <Label htmlFor="search">Search</Label>
                        <Input
                            id="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or email"
                        />
                    </div>
                    <Button type="submit">Apply</Button>
                </form>
            </div>

            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="overflow-hidden rounded-lg border bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                        <thead className="bg-neutral-50 text-left text-sm font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-200">
                            <tr>
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Role</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 text-sm dark:divide-neutral-800">
                            {users.data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-center text-neutral-500 dark:text-neutral-400">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                            {users.data.map((user) => (
                                <tr key={user.id}>
                                    <td className="px-4 py-3 font-medium">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3 capitalize">{user.role}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            type="button"
                                            onClick={() => toggleActive(user)}
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                user.is_active
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-200'
                                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200'
                                            }`}
                                        >
                                            {user.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleActive(user)}
                                        >
                                            {user.is_active ? 'Deactivate' : 'Activate'}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => deleteUser(user)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                    <h2 className="mb-3 text-lg font-semibold">Create User</h2>
                    <form onSubmit={submitCreate} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={createForm.data.name}
                                onChange={(e) => createForm.setData('name', e.target.value)}
                                placeholder="Full name"
                            />
                            {createForm.errors.name && (
                                <p className="text-sm text-red-600">{createForm.errors.name}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={createForm.data.email}
                                onChange={(e) => createForm.setData('email', e.target.value)}
                                placeholder="name@example.com"
                            />
                            {createForm.errors.email && (
                                <p className="text-sm text-red-600">{createForm.errors.email}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="role-create">Role</Label>
                            <Select
                                value={createForm.data.role}
                                onValueChange={(value: 'doctor' | 'patient') => createForm.setData('role', value)}
                            >
                                <SelectTrigger id="role-create">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="doctor">Doctor</SelectItem>
                                    <SelectItem value="patient">Patient</SelectItem>
                                </SelectContent>
                            </Select>
                            {createForm.errors.role && (
                                <p className="text-sm text-red-600">{createForm.errors.role}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={createForm.data.password}
                                onChange={(e) => createForm.setData('password', e.target.value)}
                                placeholder="Set password"
                            />
                            {createForm.errors.password && (
                                <p className="text-sm text-red-600">{createForm.errors.password}</p>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="password_confirmation">Confirm Password</Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={createForm.data.password_confirmation}
                                onChange={(e) =>
                                    createForm.setData('password_confirmation', e.target.value)
                                }
                                placeholder="Confirm password"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={createForm.data.is_active}
                                onChange={(e) => createForm.setData('is_active', e.target.checked)}
                                className="size-4 rounded border-neutral-300 text-primary focus:ring-primary"
                            />
                            <Label htmlFor="is_active" className="!m-0">
                                Active
                            </Label>
                        </div>
                        <Button type="submit" disabled={createForm.processing} className="w-full">
                            {createForm.processing ? 'Creating...' : 'Create User'}
                        </Button>
                    </form>
                </div>
            </div>
            </div>
        </AppSidebarLayout>
    );
}
