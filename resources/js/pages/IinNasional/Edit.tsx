import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Upload } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

interface IinNasionalApplication {
    id: number;
    application_number: string;
    status: string;
}

interface Props extends PageProps {
    application: IinNasionalApplication;
}

export default function IinNasionalEdit({ application, auth }: Props) {
    const { data, setData, errors, progress } = useForm({
        application_form: null as File | null,
        requirements_archive: null as File | null,
    });

    const [processing, setProcessing] = useState(false);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        setProcessing(true);

        // Prepare form data
        const formData = new FormData();
        if (data.application_form) {
            formData.append('application_form', data.application_form);
        }
        if (data.requirements_archive) {
            formData.append('requirements_archive', data.requirements_archive);
        }
        formData.append('_method', 'PUT');

        router.post(route('iin-nasional.update', application.id), formData, {
            onSuccess: () => {
                setProcessing(false);
                if (application.status === 'perbaikan' && (data.application_form || data.requirements_archive)) {
                    showSuccessToast('Aplikasi berhasil diperbarui dan status dikembalikan ke tahap pengajuan untuk ditinjau ulang');
                } else {
                    showSuccessToast('Aplikasi IIN Nasional berhasil diperbarui');
                }
            },
            onError: (errors: any) => {
                setProcessing(false);
                const errorMessage = (Object.values(errors)[0] as string) || 'Terjadi kesalahan saat memperbarui aplikasi';
                showErrorToast(errorMessage);
            },
        });
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Edit IIN Nasional - ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('iin-nasional.show', application.id)}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Aplikasi IIN Nasional</h1>
                        <p className="text-gray-600">Perbarui data {application.application_number}</p>
                    </div>
                </div>

                {/* Instructions */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {application.status === 'perbaikan'
                            ? 'Setelah Anda mengunggah dokumen baru (form aplikasi atau dokumen persyaratan), status aplikasi akan berubah kembali ke "Pengajuan" dan akan ditinjau ulang oleh verifikator.'
                            : 'Perubahan informasi ini akan diverifikasi kembali oleh pihak verifikator.'}
                    </AlertDescription>
                </Alert>

                {/* Application Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Formulir Aplikasi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {/* File Upload - Application Form */}
                            <div className="space-y-2">
                                <Label htmlFor="application_form">Upload Formulir Aplikasi Baru (Opsional)</Label>
                                <motion.div
                                    className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-purple-300"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <label htmlFor="application_form" className="flex cursor-pointer flex-col items-center">
                                        <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-900">Klik untuk upload formulir baru atau drag and drop</p>
                                            <p className="text-xs text-gray-500">Format: PDF, DOC, DOCX (Maksimal 20MB)</p>
                                            {data.application_form && (
                                                <p className="mt-2 text-sm font-medium text-purple-600">{data.application_form.name}</p>
                                            )}
                                        </div>
                                    </label>
                                    <input
                                        id="application_form"
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={(e) => setData('application_form', e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                    {progress && (
                                        <div className="mt-4 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                className="bg-gradient-accent h-2.5 rounded-full"
                                                style={{ width: `${progress.percentage || 0}%` }}
                                            ></div>
                                        </div>
                                    )}
                                </motion.div>
                                {errors.application_form && <p className="text-sm text-red-600">{errors.application_form}</p>}
                            </div>

                            {/* File Upload - Requirements Archive */}
                            <div className="space-y-2">
                                <Label htmlFor="requirements_archive">Upload Dokumen Persyaratan (Opsional)</Label>
                                <motion.div
                                    className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-purple-300"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <label htmlFor="requirements_archive" className="flex cursor-pointer flex-col items-center">
                                        <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-900">
                                                Klik untuk upload dokumen persyaratan atau drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">Format: ZIP, RAR (Maksimal 50MB)</p>
                                            {data.requirements_archive && (
                                                <p className="mt-2 text-sm font-medium text-purple-600">{data.requirements_archive.name}</p>
                                            )}
                                        </div>
                                    </label>
                                    <input
                                        id="requirements_archive"
                                        type="file"
                                        accept=".zip,.rar"
                                        onChange={(e) => setData('requirements_archive', e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                </motion.div>
                                {errors.requirements_archive && <p className="text-sm text-red-600">{errors.requirements_archive}</p>}
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing} className="bg-gradient-accent hover:bg-gradient-secondary text-white">
                                    {processing ? 'Memproses...' : application.status === 'perbaikan' ? 'Kirim Perbaikan' : 'Perbarui Pengajuan'}
                                </Button>
                                <Link href={route('iin-nasional.show', application.id)}>
                                    <Button variant="outline">Batal</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
