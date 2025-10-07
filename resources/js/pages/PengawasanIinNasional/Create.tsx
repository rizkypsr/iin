import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { PageProps } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, FileText, Shield } from 'lucide-react';
import { useState } from 'react';

interface Props extends PageProps {
    documentRequirements?: {
        id: number;
        type: string;
        content: string;
        created_at: string;
        updated_at: string;
    } | null;
    iinNasionalProfile?: {
        id: number;
        institution_name: string;
        brand: string;
        iin_national_assignment: string;
        assignment_year: string;
        regional: string;
        usage_purpose: string;
        address: string;
        phone_fax: string;
        email_office: string;
        contact_person_name: string;
        contact_person_email: string;
        contact_person_phone: string;
        status_remarks?: string;
        detail?: string;
        card_issued?: string;
        aspi_recommendation_letter?: string;
        created_at: string;
        updated_at: string;
    } | null;
    [key: string]: any;
}

export default function PengawasanIinNasionalCreate() {
    const { auth, flash, documentRequirements, iinNasionalProfile } = usePage<Props>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!iinNasionalProfile) {
            showErrorToast('Profil IIN Nasional belum lengkap. Silakan lengkapi terlebih dahulu.');
            return;
        }

        setIsSubmitting(true);

        try {
            router.post(
                route('pengawasan-iin-nasional.store'),
                {},
                {
                    onSuccess: () => {
                        showSuccessToast('Aplikasi pengawasan berhasil diajukan.');
                    },
                    onError: (errors) => {
                        const errorMessage = (Object.values(errors)[0] as string) || 'Terjadi kesalahan saat mengajukan aplikasi pengawasan';
                        showErrorToast(errorMessage);
                    },
                    onFinish: () => {
                        setIsSubmitting(false);
                    },
                },
            );
        } catch (error) {
            showErrorToast('Terjadi kesalahan saat mengajukan aplikasi pengawasan');
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Ajukan Pengawasan IIN Nasional" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('pengawasan-iin-nasional.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Ajukan Pengawasan IIN Nasional</h1>
                        <p className="text-gray-600">Isi formulir aplikasi pengawasan untuk IIN Nasional</p>
                    </div>
                </div>

                {/* IIN Nasional Profile Information */}
                {iinNasionalProfile && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Informasi Profil IIN Nasional
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Nama Institusi</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.institution_name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Brand</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.brand}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">IIN National Assignment</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.iin_national_assignment}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Tahun Assignment</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.assignment_year}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Regional</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.regional}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Telepon/Fax</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.phone_fax}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Email Kantor</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.email_office}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Contact Person</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.contact_person_name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Email Contact Person</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.contact_person_email}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Telepon Contact Person</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.contact_person_phone}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-sm font-medium text-gray-700">Alamat</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.address}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <Label className="text-sm font-medium text-gray-700">Tujuan Penggunaan</Label>
                                    <p className="mt-1 text-sm text-gray-900">{iinNasionalProfile.usage_purpose}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submit Button */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Ajukan Pengawasan</h3>
                                    <p className="mt-1 text-sm text-gray-600">Pastikan semua informasi sudah benar sebelum mengajukan pengawasan</p>
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !iinNasionalProfile}
                                    className="bg-blue-600 px-8 py-2 text-white hover:bg-blue-700"
                                    size="lg"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Mengajukan...
                                        </>
                                    ) : (
                                        <>
                                            <Shield className="mr-2 h-4 w-4" />
                                            Ajukan Pengawasan
                                        </>
                                    )}
                                </Button>

                                {!iinNasionalProfile && (
                                    <Alert className="w-full">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Anda harus melengkapi profil IIN Nasional terlebih dahulu sebelum dapat mengajukan pengawasan.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
