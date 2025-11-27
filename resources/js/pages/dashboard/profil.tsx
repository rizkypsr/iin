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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
        card_specimen?: File | string;
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

    const { data: basicData, setData: setBasicData, patch: patchBasic, errors: basicErrors, processing: basicProcessing } = useForm({
        name: user.name,
        email: user.email,
    });

    const { data: nasionalData, setData: setNasionalData, patch: patchNasional, errors: nasionalErrors, processing: nasionalProcessing } =
        useForm({
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
        });

    const { data: singleData, setData: setSingleData, post: postSingle, errors: singleErrors, processing: singleProcessing } = useForm({
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

    const submitBasic: FormEventHandler = (e) => {
        e.preventDefault();
        patchBasic(route('dashboard.profil.update-basic'), {
            preserveScroll: true,
            onSuccess: () => {
                showSuccessToast('Informasi dasar berhasil diperbarui');
            },
            onError: () => {
                showErrorToast('Terjadi kesalahan saat memperbarui informasi dasar');
            },
        });
    };

    const submitNasional: FormEventHandler = (e) => {
        e.preventDefault();
        patchNasional(route('dashboard.profil.update-iin-nasional'), {
            preserveScroll: true,
            onSuccess: () => {
                showSuccessToast('Profil IIN Nasional berhasil diperbarui');
            },
            onError: () => {
                showErrorToast('Terjadi kesalahan saat memperbarui Profil IIN Nasional');
            },
        });
    };

    const submitSingle: FormEventHandler = (e) => {
        e.preventDefault();
        postSingle(route('dashboard.profil.update-single-iin'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                showSuccessToast('Profil Single IIN berhasil diperbarui');
            },
            onError: (e) => {
                showErrorToast('Terjadi kesalahan saat memperbarui Profil Single IIN');
            },
        });
    };

    return (
        <DashboardLayout user={user} applicationCounts={application_counts}>
            <Head title="Profil" />

            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-between items-center"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Profil Pengguna</h1>
                        <p className="mt-2 text-gray-600">Kelola informasi profil dan data IIN Anda</p>
                    </div>
                </motion.div>

                <form onSubmit={submitBasic} className="space-y-8">
                    {/* Basic Profile Information */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        <Card className="shadow-lg backdrop-blur-sm border-blue-200/50 bg-white/95 shadow-blue-200/30">
                            <CardHeader className="pb-4 border-b border-gray-200">
                                <CardTitle className="flex gap-3 items-center text-xl text-gray-900">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Informasi Dasar
                                </CardTitle>
                                <CardDescription>Perbarui informasi dasar akun Anda</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                            Nama Lengkap <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            type="text"
                                            value={basicData.name}
                                            onChange={(e) => setBasicData('name', e.target.value)}
                                            disabled={basicProcessing}
                                            placeholder="Masukkan nama lengkap"
                                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <InputError message={basicErrors.name as any} className="text-xs" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                            <Mail className="inline mr-1 w-4 h-4" />
                                            Email <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={basicData.email}
                                            onChange={(e) => setBasicData('email', e.target.value)}
                                            disabled={basicProcessing}
                                            placeholder="Masukkan alamat email"
                                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <InputError message={basicErrors.email as any} className="text-xs" />
                                    </div>
                                </div>
                            </CardContent>
                            <div className="flex justify-end px-6 pb-6">
                                <Button
                                    type="submit"
                                    disabled={basicProcessing}
                                    className="px-8 py-2 h-11 text-white bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:opacity-50"
                                >
                                    {basicProcessing ? (
                                        <>
                                            <div className="mr-2 w-4 h-4 rounded-full border-2 border-white animate-spin border-t-transparent" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 w-4 h-4" />
                                            Simpan Informasi Dasar
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </form>

                    <Tabs defaultValue="iin-nasional" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="iin-nasional">IIN Nasional</TabsTrigger>
                            <TabsTrigger value="single-iin">Single IIN</TabsTrigger>
                        </TabsList>

                        <TabsContent value="iin-nasional">
                            <div className="space-y-6">
                                <IinNasionalProfileForm
                                    data={nasionalData.iin_nasional_profile}
                                    setData={(key, value) =>
                                        setNasionalData('iin_nasional_profile', {
                                            ...nasionalData.iin_nasional_profile,
                                            [key]: value,
                                        })
                                    }
                                    errors={nasionalErrors as any}
                                    processing={nasionalProcessing}
                                />
                                <div className="flex justify-end">
                                    <Button type="button" onClick={submitNasional} disabled={nasionalProcessing} className="px-8 py-2 h-11 text-white bg-blue-600">
                                        {nasionalProcessing ? 'Menyimpan...' : 'Simpan IIN Nasional'}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="single-iin">
                            <div className="space-y-6">
                                <SingleIinProfileForm
                                    data={singleData.single_iin_profile}
                                    setData={(key, value) =>
                                        setSingleData((prev: any) => ({
                                            ...prev,
                                            single_iin_profile: {
                                                ...prev.single_iin_profile,
                                                [key]: value,
                                            },
                                        }))
                                    }
                                    errors={singleErrors as any}
                                    processing={singleProcessing}
                                />
                                <div className="flex justify-end">
                                    <Button type="button" onClick={submitSingle} disabled={singleProcessing} className='px-8 py-2 h-11 text-white bg-gradient-to-r from-blue-600 to-blue-700 transition-all duration-200 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:opacity-50'>
                                        {singleProcessing ? 'Menyimpan...' : 'Simpan Single IIN'}
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                

                {/* User Information Card */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }}>
                    <Card className="shadow-lg backdrop-blur-sm border-gray-200/50 bg-white/95 shadow-gray-200/30">
                        <CardHeader className="pb-4 border-b border-gray-200">
                            <CardTitle className="flex gap-3 items-center text-xl text-gray-900">
                                <User className="w-5 h-5 text-gray-600" />
                                Informasi Akun
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
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
