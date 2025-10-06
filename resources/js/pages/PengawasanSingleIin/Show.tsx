import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, ArrowLeft, Award, CheckCircle, Clock, CreditCard, Download, FileText, Upload, User, X, Shield } from 'lucide-react';
import { useState } from 'react';

interface PaymentDocument {
    path: string;
    original_name: string;
    uploaded_at: string;
}

interface PengawasanSingleIinApplication {
    id: number;
    application_number: string;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
    submitted_at: string;
    notes?: string;
    application_form_path?: string;
    requirements_archive_path?: string;
    payment_proof_path?: string;
    payment_proof_documents_stage_2?: PaymentDocument[];
    payment_proof_uploaded_at_stage_2?: string;
    payment_proof_documents?: PaymentDocument[];
    payment_documents?: PaymentDocument[];
    payment_documents_stage_2?: PaymentDocument[];
    payment_documents_uploaded_at_stage_2?: string;
    field_verification_documents?: PaymentDocument[];
    issuance_documents?: PaymentDocument[];
    field_verification_documents_uploaded_at?: string;
    payment_verified_at?: string;
    payment_verified_at_stage_2?: string;
    field_verification_at?: string;
    issued_at?: string;
    can_upload_payment_proof: boolean;
    user: {
        name: string;
        email: string;
    };
    admin?: {
        name: string;
    };
}

interface StatusLog {
    id: number;
    status_from?: string;
    status_to: string;
    notes?: string;
    created_at: string;
    changed_by: {
        name: string;
    };
}

interface Props {
    application: PengawasanSingleIinApplication;
    statusLogs: StatusLog[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
}

export default function PengawasanSingleIinShow({ application, statusLogs, auth }: Props) {
    console.log(application);

    const [activeTab, setActiveTab] = useState('detail');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        payment_proof: [] as File[],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFormData({
                ...formData,
                payment_proof: [...formData.payment_proof, ...newFiles],
            });
        }
    };

    const removeFile = (index: number) => {
        const newFiles = formData.payment_proof.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            payment_proof: newFiles,
        });
    };

    const handleUploadPaymentProof = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.payment_proof.length === 0) {
            showErrorToast('Silahkan pilih file bukti pembayaran terlebih dahulu');
            return;
        }

        setUploading(true);

        const data = new FormData();
        formData.payment_proof.forEach((file, index) => {
            data.append(`payment_proof[${index}]`, file);
        });

        // Tentukan stage berdasarkan status aplikasi
        const stage = application.status === 'pembayaran-tahap-2' ? 2 : 1;
        data.append('stage', stage.toString());

        router.post(route('pengawasan-single-iin.upload-payment-proof', application.id), data, {
            onProgress: (progress) => {
                setUploadProgress(progress?.percentage || 0);
            },
            onSuccess: () => {
                setUploading(false);
                setUploadProgress(0);
                setFormData({ payment_proof: [] });
                const stageText = stage === 2 ? 'Tahap 2' : 'Tahap 1';
                showSuccessToast(`Bukti pembayaran ${stageText} berhasil diunggah`);
            },
            onError: (errors) => {
                setUploading(false);
                setUploadProgress(0);
                const errorMessage = (Object.values(errors)[0] as string) || 'Gagal mengunggah bukti pembayaran';
                showErrorToast(errorMessage);
            },
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return <FileText className="h-4 w-4" />;
            case 'submitted':
                return <Clock className="h-4 w-4" />;
            case 'payment_verified':
                return <CreditCard className="h-4 w-4" />;
            case 'field_verification':
                return <User className="h-4 w-4" />;
            case 'issued':
                return <Award className="h-4 w-4" />;
            default:
                return <FileText className="h-4 w-4" />;
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'submitted':
                return 'bg-blue-100 text-blue-800';
            case 'payment_verified':
                return 'bg-green-100 text-green-800';
            case 'field_verification':
                return 'bg-yellow-100 text-yellow-800';
            case 'issued':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        // Normalize status to handle potential whitespace or case issues
        const normalizedStatus = String(status).trim().toLowerCase();

        switch (normalizedStatus) {
            case 'pengajuan':
                return 'Sedang Diajukan';
            case 'perbaikan':
                return 'Perlu Perbaikan';
            case 'pembayaran':
                return 'Pembayaran Tahap 1';
            case 'verifikasi-lapangan':
                return 'Verifikasi Lapangan';
            case 'pembayaran-tahap-2':
                return 'Pembayaran Tahap 2';
            case 'terbit':
                return 'Sudah Terbit';
            default:
                return 'Tidak Diketahui';
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Pengawasan Single IIN - ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('pengawasan-single-iin.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Pengawasan Single IIN
                            </h1>
                            <p className="text-gray-600">{application.application_number}</p>
                        </div>
                    </div>
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(application.status)}`}>
                        {getStatusLabel(application.status)}
                    </div>
                </div>

                {/* Status Alert */}
                {application.status === 'submitted' && (
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Aplikasi Sedang Diproses</AlertTitle>
                        <AlertDescription>
                            Aplikasi pengawasan Anda sedang dalam tahap review. Kami akan menghubungi Anda jika diperlukan informasi tambahan.
                        </AlertDescription>
                    </Alert>
                )}

                {application.status === 'payment_verified' && application.can_upload_payment_proof && (
                    <Alert>
                        <CreditCard className="h-4 w-4" />
                        <AlertTitle>Upload Bukti Pembayaran</AlertTitle>
                        <AlertDescription>
                            Silakan upload bukti pembayaran untuk melanjutkan proses pengawasan.
                        </AlertDescription>
                    </Alert>
                )}

                {application.status === 'field_verification' && (
                    <Alert>
                        <User className="h-4 w-4" />
                        <AlertTitle>Verifikasi Lapangan</AlertTitle>
                        <AlertDescription>
                            Tim verifikasi akan melakukan kunjungan lapangan. Pastikan dokumen dan fasilitas siap untuk diperiksa.
                        </AlertDescription>
                    </Alert>
                )}

                {application.status === 'issued' && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Pengawasan Selesai</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Proses pengawasan telah selesai. Dokumen hasil pengawasan dapat diunduh di bawah ini.
                        </AlertDescription>
                    </Alert>
                )}

                {application.status === 'terbit' && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Pengawasan Selesai</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Proses pengawasan telah selesai. Dokumen hasil pengawasan dapat diunduh di tab Dokumen.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="detail">Detail Aplikasi</TabsTrigger>
                        <TabsTrigger value="documents">Dokumen</TabsTrigger>
                        <TabsTrigger value="payment">Pembayaran</TabsTrigger>
                        <TabsTrigger value="history">Riwayat Status</TabsTrigger>
                    </TabsList>

                    {/* Detail Tab */}
                    <TabsContent value="detail" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Informasi Aplikasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Nomor Aplikasi</Label>
                                        <p className="mt-1 text-sm text-gray-900">{application.application_number}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                                        <div className={`mt-1 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                                            {getStatusLabel(application.status)}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Tanggal Dibuat</Label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {format(new Date(application.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Tanggal Diajukan</Label>
                                        <p className="mt-1 text-sm text-gray-900">
                                            {application.submitted_at
                                                ? format(new Date(application.submitted_at), 'dd MMMM yyyy HH:mm', { locale: id })
                                                : '-'
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Pemohon</Label>
                                        <p className="mt-1 text-sm text-gray-900">{application.user.name}</p>
                                        <p className="text-xs text-gray-500">{application.user.email}</p>
                                    </div>
                                    {application.admin && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Admin Penanggungjawab</Label>
                                            <p className="mt-1 text-sm text-gray-900">{application.admin.name}</p>
                                        </div>
                                    )}
                                </div>
                                {application.notes && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Catatan</Label>
                                        <p className="mt-1 text-sm text-gray-900">{application.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Dokumen Aplikasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Issuance Documents */}
                                {application.issuance_documents && application.issuance_documents.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-green-800 flex items-center gap-2">
                                            <Award className="h-5 w-5" />
                                            Dokumen Pengawasan Terbit
                                        </h4>
                                        {application.issuance_documents.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-8 w-8 text-green-600" />
                                                    <div>
                                                        <p className="font-medium text-green-900">{doc.original_name}</p>
                                                        <p className="text-sm text-green-700">
                                                            Diupload: {format(new Date(doc.uploaded_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(route('pengawasan-single-iin.download-issuance-document', [application.id, index]), '_blank')}
                                                    className="border-green-200 bg-white text-green-700 hover:bg-green-50 hover:text-green-800"
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Field Verification Documents */}
                                {application.field_verification_documents && application.field_verification_documents.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-medium text-gray-900">Dokumen Verifikasi Lapangan</h4>
                                        {application.field_verification_documents.map((doc, index) => (
                                            <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-8 w-8 text-yellow-600" />
                                                    <div>
                                                        <p className="font-medium text-gray-900">{doc.original_name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Diupload: {format(new Date(doc.uploaded_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(route('pengawasan-single-iin.download-field-verification-document', [application.id, index]), '_blank')}
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payment Tab */}
                    <TabsContent value="payment" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pembayaran</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {application.status === 'pembayaran' && (
                                    <div className="space-y-4">
                                        {application.payment_documents && application.payment_documents.length > 0 ? (
                                            <div className="rounded-lg border border-green-200 bg-gradient-to-br from-green-50 to-emerald-100 p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="rounded-full bg-white p-3 shadow-sm">
                                                        <FileText className="h-6 w-6 text-green-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="mb-2 font-semibold text-gray-900">Dokumen Pembayaran dari Admin</h3>
                                                        <p className="mb-4 text-sm text-gray-700">
                                                            Admin telah mengunggah dokumen pembayaran untuk aplikasi Anda. Silakan unduh dan isi dokumen tersebut sebagai bukti pembayaran.
                                                        </p>
                                                        <div className="space-y-3">
                                                            {application.payment_documents.map((document: PaymentDocument, index: number) => (
                                                                <div key={index} className="flex items-center justify-between rounded-lg border border-white/40 bg-white/60 p-4 backdrop-blur-sm">
                                                                    <div className="flex items-center gap-3">
                                                                        <FileText className="h-5 w-5 text-green-600" />
                                                                        <div>
                                                                            <div className="font-medium text-gray-900">{document.original_name}</div>
                                                                            <div className="text-sm text-gray-600">
                                                                                Diunggah pada {new Date(document.uploaded_at).toLocaleDateString('id-ID')}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            window.open(route('pengawasan-single-iin.download-payment-document', [application.id, index]), '_blank')
                                                                        }
                                                                        className="bg-white hover:bg-green-50"
                                                                    >
                                                                        <Download className="mr-2 h-4 w-4" />
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                                                <div className="text-sm text-blue-800">
                                                                    <div className="mb-1 font-medium">Petunjuk:</div>
                                                                    <ul className="list-inside list-disc space-y-1 text-blue-700">
                                                                        <li>Unduh dokumen pembayaran yang telah disediakan admin</li>
                                                                        <li>Isi dokumen tersebut dengan lengkap dan benar</li>
                                                                        <li>Unggah kembali dokumen yang telah diisi sebagai bukti pembayaran</li>
                                                                        <li>Pastikan semua informasi yang diisi sudah sesuai</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="rounded-full bg-white p-3 shadow-sm">
                                                        <Clock className="h-6 w-6 text-amber-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="mb-2 font-semibold text-gray-900">Menunggu Dokumen Pembayaran</h3>
                                                        <p className="text-sm text-gray-700">
                                                            Admin sedang memproses dokumen pembayaran untuk aplikasi Anda. Silakan tunggu hingga admin mengunggah dokumen pembayaran.
                                                        </p>
                                                        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                                                <div className="text-sm text-blue-800">
                                                                    <div className="mb-1 font-medium">Informasi:</div>
                                                                    <ul className="list-inside list-disc space-y-1 text-blue-700">
                                                                        <li>Dokumen pembayaran akan dikirim oleh admin dalam 1-2 hari kerja</li>
                                                                        <li>Anda akan mendapat notifikasi ketika dokumen sudah tersedia</li>
                                                                        <li>Setelah dokumen tersedia, Anda dapat mengunduh dan mengisi dokumen tersebut</li>
                                                                        <li>Kemudian unggah kembali dokumen yang telah diisi sebagai bukti pembayaran</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Dokumen Pembayaran Tahap 2 dari Admin */}
                                {application.status === 'pembayaran-tahap-2' && (
                                    <div className="space-y-4">
                                        {application.payment_documents_stage_2 && application.payment_documents_stage_2.length > 0 ? (
                                            <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="rounded-full bg-white p-3 shadow-sm">
                                                        <FileText className="h-6 w-6 text-indigo-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="mb-2 font-semibold text-gray-900">Dokumen Pembayaran Tahap 2 dari Admin</h3>
                                                        <p className="mb-4 text-sm text-gray-700">
                                                            Admin telah mengunggah dokumen pembayaran tahap 2 untuk aplikasi Anda. Silakan unduh dan isi dokumen tersebut sebagai bukti pembayaran tahap 2.
                                                        </p>
                                                        <div className="space-y-3">
                                                            {application.payment_documents_stage_2.map((document: PaymentDocument, index: number) => (
                                                                <div key={index} className="flex items-center justify-between rounded-lg border border-white/40 bg-white/60 p-4 backdrop-blur-sm">
                                                                    <div className="flex items-center gap-3">
                                                                        <FileText className="h-5 w-5 text-indigo-600" />
                                                                        <div>
                                                                            <div className="font-medium text-gray-900">{document.original_name}</div>
                                                                            <div className="text-sm text-gray-600">
                                                                                Diunggah pada {new Date(document.uploaded_at).toLocaleDateString('id-ID')}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            window.open(route('iin-single-blockholder.download-payment-document-stage-2', [application.id, index]), '_blank')
                                                                        }
                                                                        className="bg-white hover:bg-indigo-50"
                                                                    >
                                                                        <Download className="mr-2 h-4 w-4" />
                                                                        Download
                                                                    </Button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                                                <div className="text-sm text-blue-800">
                                                                    <div className="mb-1 font-medium">Petunjuk:</div>
                                                                    <ul className="list-inside list-disc space-y-1 text-blue-700">
                                                                        <li>Unduh dokumen pembayaran tahap 2 yang telah disediakan admin</li>
                                                                        <li>Isi dokumen tersebut dengan lengkap dan benar</li>
                                                                        <li>Unggah kembali dokumen yang telah diisi sebagai bukti pembayaran tahap 2</li>
                                                                        <li>Pastikan semua informasi yang diisi sudah sesuai</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-100 p-6">
                                                <div className="flex items-start gap-4">
                                                    <div className="rounded-full bg-white p-3 shadow-sm">
                                                        <Clock className="h-6 w-6 text-amber-600" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h3 className="mb-2 font-semibold text-gray-900">Menunggu Dokumen Pembayaran Tahap 2</h3>
                                                        <p className="text-sm text-gray-700">
                                                            Admin sedang memproses dokumen pembayaran tahap 2 untuk aplikasi Anda. Silakan tunggu hingga admin mengunggah dokumen pembayaran tahap 2.
                                                        </p>
                                                        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                                            <div className="flex items-start gap-2">
                                                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                                                <div className="text-sm text-blue-800">
                                                                    <div className="mb-1 font-medium">Informasi:</div>
                                                                    <ul className="list-inside list-disc space-y-1 text-blue-700">
                                                                        <li>Dokumen pembayaran tahap 2 akan dikirim oleh admin dalam 1-2 hari kerja</li>
                                                                        <li>Anda akan mendapat notifikasi ketika dokumen sudah tersedia</li>
                                                                        <li>Setelah dokumen tersedia, Anda dapat mengunduh dan mengisi dokumen tersebut</li>
                                                                        <li>Kemudian unggah kembali dokumen yang telah diisi sebagai bukti pembayaran tahap 2</li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Bukti Pembayaran Tahap 1 */}
                                {(application.payment_proof_path || (application.payment_proof_documents && application.payment_proof_documents.length > 0)) && (
                                    <div className="space-y-4">
                                        <div className="rounded-lg border bg-gradient-to-r from-gray-50 to-gray-100 p-4">
                                            <h3 className="mb-2 font-medium text-gray-800">Bukti Pembayaran Tahap 1</h3>
                                            {application.payment_proof_documents && application.payment_proof_documents.length > 0 ? (
                                                <div className="space-y-3">
                                                    {application.payment_proof_documents.map((document: PaymentDocument, index: number) => (
                                                        <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                                                            <div className="flex items-center gap-3">
                                                                <FileText className="h-5 w-5 text-purple-500" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-700">{document.original_name}</p>
                                                                    <p className="text-xs text-gray-500">
                                                                        Diunggah pada {new Date(document.uploaded_at).toLocaleDateString('id-ID')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() =>
                                                                    window.open(route('pengawasan-single-iin.download-payment-proof', [application.id, index, 1]), '_blank')
                                                                }
                                                            >
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download
                                                            </Button>
                                                        </div>
                                                    ))}
                                                    {application.payment_verified_at ? (
                                                        <p className="mt-2 flex items-center gap-1 text-sm font-medium text-green-600">
                                                            <CheckCircle className="h-3.5 w-3.5" />
                                                            Terverifikasi pada {formatDate(application.payment_verified_at)}
                                                        </p>
                                                    ) : (
                                                        <p className="mt-2 flex items-center gap-1 text-sm text-amber-600">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            Menunggu verifikasi
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <FileText className="h-6 w-6 text-purple-500" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700">Bukti pembayaran tahap 1 telah diunggah</p>
                                                            {application.payment_verified_at ? (
                                                                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-green-600">
                                                                    <CheckCircle className="h-3.5 w-3.5" />
                                                                    Terverifikasi pada {formatDate(application.payment_verified_at)}
                                                                </p>
                                                            ) : (
                                                                <p className="mt-1 flex items-center gap-1 text-sm text-amber-600">
                                                                    <Clock className="h-3.5 w-3.5" />
                                                                    Menunggu verifikasi
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            window.open(route('iin-single-blockholder.download-file', [application.id, 'payment_proof']), '_blank')
                                                        }
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Download
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Bukti Pembayaran Tahap 2 */}
                                {(application.payment_proof_documents_stage_2 && application.payment_proof_documents_stage_2.length > 0) && (
                                    <div className="space-y-4">
                                        <div className="rounded-lg border bg-gradient-to-r from-indigo-50 to-indigo-100 p-4">
                                            <h3 className="mb-2 font-medium text-gray-800">Bukti Pembayaran Tahap 2</h3>
                                            <div className="space-y-3">
                                                {application.payment_proof_documents_stage_2.map((document: PaymentDocument, index: number) => (
                                                    <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-5 w-5 text-indigo-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-700">{document.original_name}</p>
                                                                <p className="text-xs text-gray-500">
                                                                    Diunggah pada {new Date(document.uploaded_at).toLocaleDateString('id-ID')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                window.open(route('iin-single-blockholder.download-payment-proof', [application.id, index, 2]), '_blank')
                                                            }
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                ))}
                                                {application.payment_verified_at_stage_2 ? (
                                                    <p className="mt-2 flex items-center gap-1 text-sm font-medium text-green-600">
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                        Terverifikasi pada {formatDate(application.payment_verified_at_stage_2)}
                                                    </p>
                                                ) : (
                                                    <p className="mt-2 flex items-center gap-1 text-sm text-amber-600">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Menunggu verifikasi
                                                    </p>
                                                )}
                                            </div>
                                        </div>


                                    </div>
                                )}

                                {application.can_upload_payment_proof && auth.user.role === 'user' ? (
                                    <form onSubmit={handleUploadPaymentProof} className="space-y-4">
                                        <Alert className="border border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                                            <CreditCard className="h-4 w-4 text-blue-600" />
                                            <AlertDescription className="text-blue-700">
                                                Silakan unggah bukti pembayaran {application.status === 'pembayaran-tahap-2' ? 'tahap 2' : 'tahap 1'} untuk melanjutkan proses aplikasi Anda.
                                            </AlertDescription>
                                        </Alert>

                                        <div className="rounded-lg border p-4">
                                            <h3 className="mb-2 font-medium text-gray-800">
                                                Unggah Bukti Pembayaran {application.status === 'pembayaran-tahap-2' ? 'Tahap 2' : 'Tahap 1'}
                                            </h3>
                                            <p className="mb-4 text-sm text-gray-600">
                                                Silakan unggah bukti transfer atau pembayaran {application.status === 'pembayaran-tahap-2' ? 'tahap 2' : 'tahap 1'} dalam format PDF, JPG, atau PNG. Anda dapat mengunggah beberapa file sekaligus.
                                            </p>

                                            {/* Selected Files Display */}
                                            {formData.payment_proof.length > 0 && (
                                                <div className="mb-4 space-y-2">
                                                    <h4 className="text-sm font-medium text-gray-700">File yang dipilih:</h4>
                                                    {formData.payment_proof.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-purple-500" />
                                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                                <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeFile(index)}
                                                                className="h-8 w-8 p-0"
                                                            >
                                                                ×
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="relative mb-4 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-purple-300">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Upload className="mb-1 h-8 w-8 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        Klik untuk memilih file bukti pembayaran
                                                    </span>
                                                    <span className="text-xs text-gray-500">Format: PDF, JPG, JPEG, PNG (Maks. 5MB per file)</span>
                                                </div>
                                                <label htmlFor="payment_proof_new" className="absolute inset-0 cursor-pointer">
                                                    <span className="sr-only">Pilih file</span>
                                                </label>
                                                <input
                                                    id="payment_proof_new"
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    multiple
                                                />
                                            </div>

                                            {uploadProgress > 0 && (
                                                <div className="space-y-1">
                                                    <div className="flex justify-between text-xs">
                                                        <span>Mengunggah...</span>
                                                        <span>{uploadProgress}%</span>
                                                    </div>
                                                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                                                        <div
                                                            className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300"
                                                            style={{ width: `${uploadProgress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={uploading || formData.payment_proof.length === 0}
                                            className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800"
                                        >
                                            {uploading ? (
                                                <span className="flex items-center gap-2">
                                                    <svg
                                                        className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <circle
                                                            className="opacity-25"
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                        ></circle>
                                                        <path
                                                            className="opacity-75"
                                                            fill="currentColor"
                                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                        ></path>
                                                    </svg>
                                                    Sedang Mengunggah...
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-2">
                                                    <Upload className="h-4 w-4" />
                                                    Unggah Bukti Pembayaran
                                                </span>
                                            )}
                                        </Button>
                                    </form>
                                ) : (
                                    <div className="p-8 text-center">
                                        <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                                        <h3 className="mb-1 text-lg font-medium text-gray-700">Belum Ada Informasi Pembayaran</h3>
                                        <p className="text-gray-500">
                                            {application.status === 'pengajuan' || application.status === 'perbaikan'
                                                ? 'Aplikasi masih dalam tahap pengajuan. Informasi pembayaran akan tersedia setelah aplikasi diverifikasi.'
                                                : 'Tidak ada informasi pembayaran yang tersedia saat ini.'}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Riwayat Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {statusLogs.map((log, index) => (
                                        <div key={log.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full`}>
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                {index < statusLogs.length - 1 && (
                                                    <div className="mt-2 h-8 w-px bg-gray-200" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900">
                                                        Status diubah ke: {getStatusLabel(log.status_to)}
                                                    </p>
                                                    <span className="text-sm text-gray-500">
                                                        oleh {log.changed_by.name}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(log.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                                                </p>
                                                {log.notes && (
                                                    <p className="mt-1 text-sm text-gray-700">{log.notes}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}