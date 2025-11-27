import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Save, User } from 'lucide-react';
import { FormEventHandler, useEffect, useState } from 'react';

import FlashMessage from '@/components/flash-message';
import IinNasionalProfileForm from '@/components/iin-nasional-profile-form';
import SingleIinProfileForm from '@/components/single-iin-profile-form';
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
    iin_nasional_profile?: {
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
    single_iin_profile?: {
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
}

interface EditUserProps {
    user: User;
    flash?: {
        success?: string;
        error?: string;
    };
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

export default function EditUser({ user, flash, application_counts }: EditUserProps) {
    const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.roles[0]?.name || 'user',
        iin_nasional_profile: {
            details: user.iin_nasional_profile?.details || '',
            institution_name: user.iin_nasional_profile?.institution_name || '',
            brand: user.iin_nasional_profile?.brand || '',
            iin_national_assignment: user.iin_nasional_profile?.iin_national_assignment || '',
            assignment_year: user.iin_nasional_profile?.assignment_year || undefined,
            regional: user.iin_nasional_profile?.regional || '',
            aspi_recommendation_letter: user.iin_nasional_profile?.aspi_recommendation_letter || '',
            usage_purpose: user.iin_nasional_profile?.usage_purpose || '',
            address: user.iin_nasional_profile?.address || '',
            phone_fax: user.iin_nasional_profile?.phone_fax || '',
            email_office: user.iin_nasional_profile?.email_office || '',
            contact_person_name: user.iin_nasional_profile?.contact_person_name || '',
            contact_person_email: user.iin_nasional_profile?.contact_person_email || '',
            contact_person_phone: user.iin_nasional_profile?.contact_person_phone || '',
            remarks_status: user.iin_nasional_profile?.remarks_status || '',
            card_issued: user.iin_nasional_profile?.card_issued || false,
        },
        single_iin_profile: {
            institution_name: user.single_iin_profile?.institution_name || '',
            institution_type: user.single_iin_profile?.institution_type || '',
            year: user.single_iin_profile?.year || undefined,
            iin_assignment: user.single_iin_profile?.iin_assignment || '',
            assignment_date: user.single_iin_profile?.assignment_date || '',
            regional: user.single_iin_profile?.regional || '',
            usage_purpose: user.single_iin_profile?.usage_purpose || '',
            address: user.single_iin_profile?.address || '',
            address_updated: user.single_iin_profile?.address_updated || '',
            phone_fax: user.single_iin_profile?.phone_fax || '',
            phone_fax_updated: user.single_iin_profile?.phone_fax_updated || '',
            email: user.single_iin_profile?.email || '',
            contact_person: user.single_iin_profile?.contact_person || '',
            remarks_status: user.single_iin_profile?.remarks_status || '',
            card_specimen: user.single_iin_profile?.card_specimen || '',
            previous_name: user.single_iin_profile?.previous_name || '',
        },
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
        put(route('admin.users.update', user.id), { forceFormData: true });
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
        <DashboardLayout applicationCounts={application_counts}>
            <Head title={`Edit User - ${user.name}`} />

            {/* Flash Messages */}
            {flashMessage && <FlashMessage type={flashMessage.type} message={flashMessage.message} onClose={() => setFlashMessage(null)} />}

            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
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

                        <div className="text-center">
                            <h1 className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-3xl font-bold text-transparent">
                                Edit User
                            </h1>
                            <p className="mt-2 text-gray-600">Update user information and IIN profile data</p>
                        </div>
                    </motion.div>

                    <form onSubmit={submit} className="space-y-8">
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
                                    <p className="text-gray-600">Update the basic user account details</p>
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

                                    <div className="space-y-2 md:col-span-2">
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
                            className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6"
                        >
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
                        </motion.div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
