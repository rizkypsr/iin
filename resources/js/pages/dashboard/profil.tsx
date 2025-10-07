import { Head, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Mail, Save, User } from 'lucide-react';
import { FormEventHandler, useEffect } from 'react';

import IinNasionalProfileForm from '@/components/iin-nasional-profile-form';
import InputError from '@/components/input-error';
import SingleIinProfileForm from '@/components/single-iin-profile-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { PageProps, User as UserType } from '@/types';

type ProfileForm = {
    name: string;
    email: string;
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

interface ProfilePageProps extends PageProps {
    user: UserType & {
        iin_nasional_profile?: any;
        single_iin_profile?: any;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

export default function DashboardProfil() {
    const { user, flash, application_counts } = usePage<ProfilePageProps>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        name: user.name,
        email: user.email,
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

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('dashboard.profil.update'), {
            preserveScroll: true,
            onSuccess: () => {
                showSuccessToast('Profil berhasil diperbarui');
            },
            onError: () => {
                showErrorToast('Terjadi kesalahan saat memperbarui profil');
            },
        });
    };

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            showSuccessToast(flash.success);
        }
        if (flash?.error) {
            showErrorToast(flash.error);
        }
    }, [flash]);

    return (
        <DashboardLayout user={user} applicationCounts={application_counts}>
            <Head title="Profil" />

            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Profil Pengguna</h1>
                        <p className="mt-2 text-gray-600">Kelola informasi profil dan data IIN Anda</p>
                    </div>
                </motion.div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Basic Profile Information */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        <Card className="border-blue-200/50 bg-white/95 shadow-lg shadow-blue-200/30 backdrop-blur-sm">
                            <CardHeader className="border-b border-gray-200 pb-4">
                                <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                                    <User className="h-5 w-5 text-blue-600" />
                                    Informasi Dasar
                                </CardTitle>
                                <CardDescription>Perbarui informasi dasar akun Anda</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                            Nama Lengkap <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            disabled={processing}
                                            placeholder="Masukkan nama lengkap"
                                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <InputError message={errors.name} className="text-xs" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            <Mail className="mr-1 inline h-4 w-4" />
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            disabled={processing}
                                            placeholder="Masukkan alamat email"
                                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <InputError message={errors.email} className="text-xs" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
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

                    {/* Submit Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className="flex justify-end"
                    >
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-2 text-white transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Simpan Perubahan
                                </>
                            )}
                        </Button>
                    </motion.div>
                </form>

                {/* User Information Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
                    <Card className="border-gray-200/50 bg-white/95 shadow-lg shadow-gray-200/30 backdrop-blur-sm">
                        <CardHeader className="border-b border-gray-200 pb-4">
                            <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                                <User className="h-5 w-5 text-gray-600" />
                                Informasi Akun
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status Akun</p>
                                    <p className="text-lg font-semibold text-green-600">Aktif</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Role</p>
                                    <p className="text-lg font-semibold text-gray-900 capitalize">{user.role_names?.[0] || 'User'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Bergabung Sejak</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(user.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Terakhir Diperbarui</p>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {new Date(user.updated_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
