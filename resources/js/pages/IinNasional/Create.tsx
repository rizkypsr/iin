import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast } from '@/lib/toast-helper';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Download, FileText, Upload } from 'lucide-react';
import { FormEventHandler } from 'react';



export default function IinNasionalCreate() {
    const { auth } = usePage().props as any;
    const { data, setData, post, processing, errors, progress } = useForm({
        application_form: null as File | null,
        requirements_archive: null as File | null,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('iin-nasional.store'), {
            onError: (errors) => {
                const errorMessage = (Object.values(errors)[0] as string) || 'Terjadi kesalahan saat mengajukan aplikasi';
                showErrorToast(errorMessage);
            },
        });
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Ajukan IIN Nasional" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('iin-nasional.index')}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Ajukan IIN Nasional</h1>
                        <p className="text-gray-600">Isi formulir aplikasi Issuer Identification Number Nasional</p>
                    </div>
                </div>

                {/* Instructions */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Pastikan Anda telah mengunduh, mengisi, dan menyiapkan formulir aplikasi sebelum melanjutkan.</AlertDescription>
                </Alert>

                {/* Download Forms */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Download className="h-5 w-5" />
                            Download Form Aplikasi
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-lg border p-4 transition-colors hover:border-purple-300">
                            <h3 className="mb-2 font-semibold text-gray-900">IIN Nasional</h3>
                            <p className="mb-3 text-sm text-gray-600">Permohonan Issuer Identification Number untuk layanan IIN Nasional</p>
                            <Button variant="outline" size="sm" onClick={() => window.open(route('download-form', 'nasional'), '_blank')}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Form
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Instructions */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>Gabungkan berkas-berkas persyaratan menjadi berkas ZIP/RAR.</AlertDescription>
                </Alert>

                {/* Document Requirements */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Dokumen Persyaratan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ol className="list-decimal space-y-2 pl-6 text-sm text-gray-900">
                            <li>Surat Pengantar Perihal Permohonan Layanan IIN / IIN Nasional kepada Direktur Penguatan Penerapan Standar dan Penilaian Kesesuaian - BSN di Jakarta</li>
                            <li>Salinan Akta Pendirian Perusahaan</li>
                            <li>Salinan Akta Perubahan Nama (jika ada)</li>
                            <li>Salinan Akta Terakhir</li>
                            <li>Salinan Izin Usaha (NIB) Perusahaan yang terkini</li>
                            <li>Salinan NPWP Perusahaan</li>
                            <li>Salinan Identitas Pimpinan Perusahaan (KTP/KITAS)</li>
                            <li>Salinan Surat Izin Penyelenggaraan Sistem Pembayaran oleh pihak yang berwenang (Surat Izin Bank Indonesia atau Otoritas Jasa Keuangan)</li>
                            <li>Form Pendaftaran</li>
                            <li>Term and condition yang sudah ditandatangani</li>
                            <li>
                                Salah satu persyaratan yaitu kepemilikan dokumen standar SNI ISO/IEC 7812 : 2017 part 1 dan part 2 dapat dilakukan pembelian melalui{' '}
                                <a
                                    href="https://pesta.bsn.go.id/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-purple-600 hover:underline"
                                >
                                    https://pesta.bsn.go.id/
                                </a>
                            </li>
                            <li>Struktur Organisasi</li>
                        </ol>
                    </CardContent>
                </Card>

                {/* Application Form */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Upload Formulir dan Persyaratan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6" method="post" action="#">
                            {/* File Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="application_form">Upload Formulir Aplikasi *</Label>
                                <motion.div
                                    className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-purple-300"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <label htmlFor="application_form" className="flex cursor-pointer flex-col items-center">
                                        <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-900">Klik untuk upload atau drag and drop</p>
                                            <p className="text-xs text-gray-500">Format asli, maksimal 10MB</p>
                                            {data.application_form && (
                                                <p className="mt-2 text-sm font-medium text-purple-600">{data.application_form.name}</p>
                                            )}
                                        </div>
                                    </label>
                                    <input
                                        id="application_form"
                                        type="file"
                                        onChange={(e) => setData('application_form', e.target.files?.[0] || null)}
                                        className="hidden"
                                        required
                                    />
                                    {progress && (
                                        <div className="mt-4 h-2.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div className="bg-gradient-accent h-2.5 rounded-full" style={{ width: `${progress.percentage}%` }}></div>
                                        </div>
                                    )}
                                </motion.div>
                                {errors.application_form && <p className="text-sm text-red-600">{errors.application_form}</p>}
                            </div>

                            {/* Requirements Archive Upload */}
                            <div className="space-y-2">
                                <Label htmlFor="requirements_archive">Upload Persyaratan (ZIP/RAR) *</Label>
                                <motion.div
                                    className="relative rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-purple-300"
                                    whileHover={{ scale: 1.01 }}
                                >
                                    <label htmlFor="requirements_archive" className="flex cursor-pointer flex-col items-center">
                                        <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-900">Klik untuk upload atau drag and drop</p>
                                            <p className="text-xs text-gray-500">Format ZIP/RAR, maksimal 50MB</p>
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
                                        required
                                    />
                                </motion.div>
                                {errors.requirements_archive && <p className="text-sm text-red-600">{errors.requirements_archive}</p>}
                            </div>



                            {/* Submit Buttons */}
                            <div className="flex items-center gap-4 pt-4">
                                <Button type="submit" disabled={processing} className="bg-gradient-accent hover:bg-gradient-secondary text-white">
                                    {processing ? 'Sedang Memproses...' : 'Ajukan Aplikasi'}
                                </Button>
                                <Link href={route('iin-nasional.index')}>
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