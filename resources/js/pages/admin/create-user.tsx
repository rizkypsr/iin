import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Key, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import FlashMessage from '@/components/flash-message';
import IinNasionalProfileForm from '@/components/iin-nasional-profile-form';
import InputError from '@/components/input-error';
import SingleIinProfileForm from '@/components/single-iin-profile-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
    iin_nasional_profile: {
        details?: string;
        institution_name?: string;
        brand?: string;
        iin_national_assignment?: string;
        assignment_year?: number;
        regional?: string;
        aspi_recommendation_letter?: string;
        usage_purpose?: string;
        address?: string;
        phone_fax?: string;
        email_office?: string;
        contact_person_name?: string;
        contact_person_email?: string;
        contact_person_phone?: string;
        remarks_status?: string;
        card_issued?: boolean;
    };
    single_iin_profile: {
        institution_name?: string;
        institution_type?: string;
        year?: number;
        iin_assignment?: string;
        assignment_date?: string;
        regional?: string;
        usage_purpose?: string;
        address?: string;
        address_updated?: string;
        phone_fax?: string;
        phone_fax_updated?: string;
        email?: string;
        contact_person?: string;
        remarks_status?: string;
        card_specimen?: string;
        previous_name?: string;
    };
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
    const [useDefaultPassword, setUseDefaultPassword] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const defaultPassword = 'password123';

    const { data, setData, post, processing, errors, reset } = useForm<Required<CreateUserForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'user',
        iin_nasional_profile: {
            details: '',
            institution_name: '',
            brand: '',
            iin_national_assignment: '',
            assignment_year: undefined,
            regional: '',
            aspi_recommendation_letter: '',
            usage_purpose: '',
            address: '',
            phone_fax: '',
            email_office: '',
            contact_person_name: '',
            contact_person_email: '',
            contact_person_phone: '',
            remarks_status: '',
            card_issued: false,
        },
        single_iin_profile: {
            institution_name: '',
            institution_type: '',
            year: undefined,
            iin_assignment: '',
            assignment_date: '',
            regional: '',
            usage_purpose: '',
            address: '',
            address_updated: '',
            phone_fax: '',
            phone_fax_updated: '',
            email: '',
            contact_person: '',
            remarks_status: '',
            card_specimen: '',
            previous_name: '',
        },
    });

    useEffect(() => {
        if (flash?.success) {
            setFlashMessage({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setFlashMessage({ type: 'error', message: flash.error });
        }
    }, [flash]);

    // Handle default password toggle
    useEffect(() => {
        if (useDefaultPassword) {
            setData('password', defaultPassword);
            setData('password_confirmation', defaultPassword);
        } else {
            setData('password', '');
            setData('password_confirmation', '');
        }
    }, [useDefaultPassword]);

    const handleDefaultPasswordToggle = (checked: boolean) => {
        setUseDefaultPassword(checked);
    };

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
        roles: [
            {
                id: 1,
                name: 'admin',
                guard_name: 'web',
                created_at: '2024-01-01T00:00:00.000000Z',
                updated_at: '2024-01-01T00:00:00.000000Z',
            },
        ],
    };

    return (
        <DashboardLayout title="Create User" user={user} applicationCounts={application_counts}>
            <Head title="Create User" />

            {/* Flash Messages */}
            {flashMessage && <FlashMessage type={flashMessage.type} message={flashMessage.message} onClose={() => setFlashMessage(null)} />}

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-8">
                        {/* Header */}
                        <div className="text-center">
                            <h1 className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-3xl font-bold text-transparent">
                                Create New User
                            </h1>
                            <p className="mt-2 text-gray-600">Create a new user account with IIN profile information</p>
                        </div>

                        <form className="space-y-8" onSubmit={submit}>
                            {/* Basic User Information */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="rounded-2xl border border-purple-200/50 bg-white/95 p-8 shadow-lg shadow-purple-200/30 backdrop-blur-sm"
                            >
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
                                        <p className="text-gray-600">Enter the basic user account details</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                                Name <span className="text-red-500">*</span>
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
                                                Email address <span className="text-red-500">*</span>
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
                                                Role <span className="text-red-500">*</span>
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

                                        {/* Default Password Toggle */}
                                        <div className="space-y-3 md:col-span-2">
                                            <div className="flex items-center space-x-2">
                                                <Checkbox
                                                    id="use-default-password"
                                                    checked={useDefaultPassword}
                                                    onCheckedChange={handleDefaultPasswordToggle}
                                                    disabled={processing}
                                                />
                                                <Label
                                                    htmlFor="use-default-password"
                                                    className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700"
                                                >
                                                    <Key className="h-4 w-4" />
                                                    Gunakan password default
                                                </Label>
                                            </div>
                                            {useDefaultPassword && (
                                                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                    <p className="text-sm text-blue-800">
                                                        <strong>Password default:</strong> {defaultPassword}
                                                    </p>
                                                    <p className="mt-1 text-xs text-blue-600">
                                                        User dapat mengubah password setelah login pertama kali.
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                                Password <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="password"
                                                    type={showPassword ? 'text' : 'password'}
                                                    required
                                                    value={data.password}
                                                    onChange={(e) => setData('password', e.target.value)}
                                                    disabled={processing || useDefaultPassword}
                                                    placeholder="Password"
                                                    className="h-11 pr-10 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                                                    disabled={processing}
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                            <InputError message={errors.password} className="text-xs" />
                                        </div>

                                        <div className="space-y-2 md:col-span-2">
                                            <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                                                Confirm password <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                required
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                disabled={processing || useDefaultPassword}
                                                placeholder="Confirm password"
                                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                            />
                                            <InputError message={errors.password_confirmation} className="text-xs" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* IIN Nasional Profile */}
                            <IinNasionalProfileForm
                                data={data.iin_nasional_profile}
                                setData={(key, value) => setData('iin_nasional_profile', { ...data.iin_nasional_profile, [key]: value })}
                                errors={errors}
                                processing={processing}
                            />

                            {/* Single IIN Profile */}
                            <SingleIinProfileForm
                                data={data.single_iin_profile}
                                setData={(key, value) => setData('single_iin_profile', { ...data.single_iin_profile, [key]: value })}
                                errors={errors}
                                processing={processing}
                            />

                            {/* Form Actions */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="flex gap-4 pt-4"
                            >
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
                            </motion.div>
                        </form>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
