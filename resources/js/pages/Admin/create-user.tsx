import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import FlashMessage from '@/components/flash-message';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/layouts/dashboard-layout';

type CreateUserForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'user' | 'admin';
};

interface CreateUserProps {
    flash?: {
        success?: string;
        error?: string;
    };
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

export default function CreateUser({ flash, application_counts }: CreateUserProps) {
    const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const { data, setData, post, processing, errors, reset } = useForm<Required<CreateUserForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
    });

    useEffect(() => {
        if (flash?.success) {
            setFlashMessage({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setFlashMessage({ type: 'error', message: flash.error });
        }
    }, [flash]);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('admin.users.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const user = {
        id: 1,
        name: 'Admin User',
        email: 'admin@iin.go.id',
        email_verified_at: '2024-01-01T00:00:00.000000Z',
        created_at: '2024-01-01T00:00:00.000000Z',
        updated_at: '2024-01-01T00:00:00.000000Z',
        role: 'admin' as const,
        roles: [{
            id: 1,
            name: 'admin',
            guard_name: 'web',
            created_at: '2024-01-01T00:00:00.000000Z',
            updated_at: '2024-01-01T00:00:00.000000Z',
        }],
    };

    return (
        <DashboardLayout title="Create User" user={user} applicationCounts={application_counts}>
            <Head title="Create User" />

            {/* Flash Messages */}
            {flashMessage && <FlashMessage type={flashMessage.type} message={flashMessage.message} onClose={() => setFlashMessage(null)} />}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mx-auto max-w-2xl">
                <div className="rounded-2xl border border-purple-200/50 bg-white/95 p-8 shadow-lg shadow-purple-200/30 backdrop-blur-sm">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h1 className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-2xl font-semibold text-transparent">
                                Create New User
                            </h1>
                            <p className="text-gray-600">Create a new user account with the specified role</p>
                        </div>

                        <form className="space-y-6" onSubmit={submit}>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    disabled={processing}
                                    placeholder="Full name"
                                    className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <InputError message={errors.name} className="text-xs" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                    placeholder="email@example.com"
                                    className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                />
                                <InputError message={errors.email} className="text-xs" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                                    Role
                                </Label>
                                <Select value={data.role} onValueChange={(value) => setData('role', value as any)}>
                                    <SelectTrigger className="h-11 w-full border-gray-300 bg-white transition-all duration-200 hover:border-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent className="border border-gray-200 bg-white shadow-lg">
                                        <SelectItem value="user" className="hover:bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                                User
                                            </div>
                                        </SelectItem>

                                        <SelectItem value="admin" className="hover:bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                                Admin
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.role} className="text-xs" />
                                <p className="mt-1 text-xs text-gray-500">
                                    <strong>User:</strong> Standard access • <strong>Admin:</strong> Full system access
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    disabled={processing}
                                    placeholder="Password"
                                    className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                />
                                <InputError message={errors.password} className="text-xs" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    disabled={processing}
                                    placeholder="Confirm password"
                                    className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                />
                                <InputError message={errors.password_confirmation} className="text-xs" />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="submit"
                                    className="h-11 flex-1 bg-gradient-to-r from-blue-700 to-blue-900 font-medium text-white transition-all duration-200 hover:from-blue-800 hover:to-blue-950 hover:shadow-lg hover:shadow-blue-500/25"
                                    disabled={processing}
                                >
                                    {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                    Create User
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 border-blue-300 text-blue-700 hover:bg-blue-50"
                                    onClick={() => window.history.back()}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
}
