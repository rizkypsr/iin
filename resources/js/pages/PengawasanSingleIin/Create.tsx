import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, FileText, Shield } from 'lucide-react';
import { PageProps } from '@/types';
import { useState } from 'react';

interface Props extends PageProps {
    documentRequirements?: {
        id: number;
        type: string;
        content: string;
        created_at: string;
        updated_at: string;
    } | null;
    singleIinProfile?: {
        id: number;
        institution_name: string;
        institution_type: string;
        year: number;
        iin_assignment: string;
        assignment_date: string;
        regional: string;
        usage_purpose: string;
        address: string;
        address_updated: string;
        phone_fax: string;
        phone_fax_updated: string;
        email: string;
        contact_person: string;
        remarks_status?: string;
        card_specimen?: string;
        previous_name?: string;
        created_at: string;
        updated_at: string;
    } | null;
    [key: string]: any;
}

export default function PengawasanSingleIinCreate() {
    const { auth, flash, documentRequirements, singleIinProfile } = usePage<Props>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!singleIinProfile) {
            showErrorToast('Profil Single IIN belum lengkap. Silakan lengkapi terlebih dahulu.');
            return;
        }

        setIsSubmitting(true);

        try {
            router.post(route('pengawasan-single-iin.store'), {}, {
                onError: (errors) => {
                    const errorMessage = (Object.values(errors)[0] as string) || 'Terjadi kesalahan saat mengajukan aplikasi pengawasan';
                    showErrorToast(errorMessage);
                },
                onFinish: () => {
                    setIsSubmitting(false);
                }
            });
        } catch (error) {
            showErrorToast('Terjadi kesalahan saat mengajukan aplikasi pengawasan');
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Ajukan Pengawasan Single IIN" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('pengawasan-single-iin.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Ajukan Pengawasan Single IIN</h1>
                        <p className="text-gray-600">Isi formulir aplikasi pengawasan untuk Single IIN</p>
                    </div>
                </div>

                {/* Single IIN Profile Information */}
                {singleIinProfile && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Informasi Profil Single IIN
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Nama Institusi</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.institution_name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Tipe Institusi</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.institution_type}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Tahun</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.year}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">IIN Assignment</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.iin_assignment}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Tanggal Assignment</Label>
                                    <p className="mt-1 text-sm text-gray-900">{new Date(singleIinProfile.assignment_date).toLocaleDateString('id-ID')}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Regional</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.regional}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Tujuan Penggunaan</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.usage_purpose}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Alamat</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.address}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Alamat (Update)</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.address_updated}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Telepon/Fax</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.phone_fax}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Telepon/Fax (Update)</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.phone_fax_updated}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.email}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Contact Person</Label>
                                    <p className="mt-1 text-sm text-gray-900">{singleIinProfile.contact_person}</p>
                                </div>
                                {singleIinProfile.remarks_status && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Status Remarks</Label>
                                        <p className="mt-1 text-sm text-gray-900">{singleIinProfile.remarks_status}</p>
                                    </div>
                                )}
                                {singleIinProfile.card_specimen && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Card Specimen</Label>
                                        <p className="mt-1 text-sm text-gray-900">{singleIinProfile.card_specimen}</p>
                                    </div>
                                )}
                                {singleIinProfile.previous_name && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Nama Sebelumnya</Label>
                                        <p className="mt-1 text-sm text-gray-900">{singleIinProfile.previous_name}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Submit Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center space-y-4">
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-gray-900">Ajukan Pengawasan</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Pastikan semua informasi sudah benar sebelum mengajukan pengawasan
                                    </p>
                                </div>

                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !singleIinProfile}
                                    className="bg-blue-600 hover:bg-blue-700 px-8 py-2 text-white"
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

                                {!singleIinProfile && (
                                    <Alert className="w-full">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Anda harus melengkapi profil Single IIN terlebih dahulu sebelum dapat mengajukan pengawasan.
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