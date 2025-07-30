import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Save, Shield, User } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import FlashMessage from '@/components/flash-message';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/layouts/dashboard-layout';

interface User {
    id: number;
    name: string;
    email: string;
    roles: Array<{ name: string }>;
}

interface EditUserProps {
    user: User;
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function EditUser({ user, flash }: EditUserProps) {
    const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.roles[0]?.name || 'user',
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
        put(route('admin.users.update', user.id));
    };

    const getRoleDescription = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Full access to all system features and user management';

            case 'user':
                return 'Standard user access with limited permissions';
            default:
                return 'Unknown role';
        }
    };

    return (
        <DashboardLayout>
            <Head title={`Edit User - ${user.name}`} />

            {/* Flash Messages */}
            {flashMessage && <FlashMessage type={flashMessage.type} message={flashMessage.message} onClose={() => setFlashMessage(null)} />}

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
                <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
                        <div className="mb-6 flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.history.back()}
                                className="flex items-center gap-2 text-gray-600 transition-colors hover:bg-gray-100/50 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Users
                            </Button>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
                                <p className="mt-1 text-gray-600">Update user information and permissions</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Form */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="rounded-2xl border border-purple-200/50 bg-white/95 p-8 shadow-lg shadow-purple-200/30 backdrop-blur-sm"
                    >
                        <form onSubmit={submit} className="space-y-6">
                            {/* User Information Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                                    <User className="h-5 w-5 text-purple-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">User Information</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                            Full Name
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                            required
                                        />
                                        {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                className="h-11 pl-10 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                                required
                                            />
                                        </div>
                                        {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Role Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">Role & Permissions</h2>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role" className="text-sm font-medium text-gray-700">
                                        User Role
                                    </Label>
                                    <Select value={data.role} onValueChange={(value) => setData('role', value)}>
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
                                    {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}

                                    <p className="mt-1 text-xs text-gray-500">
                                        <strong>User:</strong> Standard access • <strong>Admin:</strong> Full system access
                                    </p>

                                    <p className="mt-2 text-sm text-gray-600">{getRoleDescription(data.role)}</p>
                                </div>
                            </div>

                            {/* Current Role Info */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className="rounded-xl border border-purple-200/50 bg-gradient-to-r from-purple-50 to-blue-50 p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="h-5 w-5 text-purple-600" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Current Role</p>
                                        <p className="text-sm text-gray-600">
                                            This user currently has <strong>{user.roles[0]?.name || 'no role'}</strong> permissions
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Form Actions */}
                            <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => window.history.back()}
                                    className="h-11 border-gray-300 px-6 py-2 transition-colors hover:bg-gray-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-11 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-2 text-white shadow-lg shadow-purple-200/50 transition-all duration-200 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl hover:shadow-purple-300/50"
                                >
                                    {processing ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Update User
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
