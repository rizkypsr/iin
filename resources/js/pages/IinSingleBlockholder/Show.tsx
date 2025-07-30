import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, ArrowLeft, Award, CheckCircle, Clock, CreditCard, Download, FileText, Upload, User } from 'lucide-react';
import { useState } from 'react';

interface PaymentDocument {
    path: string;
    original_name: string;
    uploaded_at: string;
}

interface IinSingleBlockholderApplication {
    id: number;
    application_number: string;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
    submitted_at: string;
    iin_number?: string;
    iin_block_range?: any;
    notes?: string;
    application_form_path?: string;
    payment_proof_path?: string;
    payment_proof_documents?: PaymentDocument[];
    payment_proof_documents_stage_2?: PaymentDocument[];
    payment_proof_uploaded_at_stage_2?: string;
    certificate_path?: string;
    requirements_archive_path?: string;
    payment_documents?: PaymentDocument[];
    payment_documents_stage_2?: PaymentDocument[];
    payment_documents_uploaded_at_stage_2?: string;
    payment_verified_at?: string;
    payment_verified_at_stage_2?: string;
    field_verification_at?: string;
    issued_at?: string;
    can_upload_payment_proof: boolean;
    can_download_certificate: boolean;
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
    user: {
        name: string;
    };
}

interface Props extends PageProps {
    application: IinSingleBlockholderApplication;
    statusLogs: StatusLog[];
}

export default function IinSingleBlockholderShow({ application, statusLogs, auth, attachmentBaseUrl }: Props) {
    const [activeTab, setActiveTab] = useState('detail');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        payment_proof: [] as File[],
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setFormData({
                ...formData,
                payment_proof: [...formData.payment_proof, ...filesArray],
            });
        }
    };

    const removeFile = (index: number) => {
        const updatedFiles = formData.payment_proof.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            payment_proof: updatedFiles,
        });
    };

    const uploadPaymentProof = (e: React.FormEvent) => {
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

        router.post(route('iin-single-blockholder.upload-payment-proof', application.id), data, {
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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pengajuan':
                return 'Pengajuan';
            case 'perbaikan':
                return 'Perlu Perbaikan';
            case 'pembayaran':
                return 'Menunggu Pembayaran Tahap 1';
            case 'pembayaran-tahap-2':
                return 'Menunggu Pembayaran Tahap 2';
            case 'verifikasi-lapangan':
                return 'Verifikasi Lapangan';
            case 'menunggu-terbit':
                return 'Menunggu Terbit';
            case 'terbit':
                return 'Terbit';
            default:
                return status ? status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ') : 'Tidak Diketahui';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pengajuan':
                return <FileText className="h-4 w-4" />;
            case 'perbaikan':
                return <AlertCircle className="h-4 w-4" />;
            case 'pembayaran':
                return <CreditCard className="h-4 w-4" />;
            case 'pembayaran-tahap-2':
                return <CreditCard className="h-4 w-4" />;
            case 'verifikasi-lapangan':
                return <CheckCircle className="h-4 w-4" />;
            case 'menunggu-terbit':
                return <Clock className="h-4 w-4" />;
            case 'terbit':
                return <Award className="h-4 w-4" />;
            default:
                return <Clock className="h-4 w-4" />;
        }
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Single IIN/Blockholder - ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('iin-single-blockholder.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{application.application_number}</h1>
                            <div className="flex items-center gap-2">
                                <p className="text-gray-600">Single IIN/Blockholder</p>
                                <span className="mx-1 text-gray-400">•</span>
                                <div
                                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-sm font-medium ${application.status === 'perbaikan'
                                        ? 'border border-amber-200 bg-amber-50 text-amber-700'
                                        : application.status === 'terbit'
                                            ? 'border border-green-200 bg-green-50 text-green-700'
                                            : application.status === 'pembayaran'
                                                ? 'border border-blue-200 bg-blue-50 text-blue-700'
                                                : application.status === 'pembayaran-tahap-2'
                                                    ? 'border border-indigo-200 bg-indigo-50 text-indigo-700'
                                                    : application.status === 'verifikasi-lapangan'
                                                        ? 'border border-purple-200 bg-purple-50 text-purple-700'
                                                        : application.status === 'menunggu-terbit'
                                                            ? 'border border-cyan-200 bg-cyan-50 text-cyan-700'
                                                            : 'border border-gray-200 bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span
                                        className={`${application.status === 'perbaikan'
                                            ? 'text-amber-600'
                                            : application.status === 'terbit'
                                                ? 'text-green-600'
                                                : application.status === 'pembayaran'
                                                    ? 'text-blue-600'
                                                    : application.status === 'pembayaran-tahap-2'
                                                        ? 'text-indigo-600'
                                                        : application.status === 'verifikasi-lapangan'
                                                            ? 'text-purple-600'
                                                            : application.status === 'menunggu-terbit'
                                                                ? 'text-cyan-600'
                                                                : 'text-gray-600'
                                            }`}
                                    >
                                        {getStatusIcon(application.status)}
                                    </span>
                                    <span>{application.status_label || getStatusLabel(application.status)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {application.status === 'perbaikan' && auth.user.role === 'user' && (
                        <Link href={route('iin-single-blockholder.edit', application.id)}>
                            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Perbaiki Aplikasi
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="detail" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="detail">Detail</TabsTrigger>
                        <TabsTrigger value="documents">Dokumen</TabsTrigger>
                        <TabsTrigger value="payment">Pembayaran</TabsTrigger>
                        <TabsTrigger value="history">Riwayat</TabsTrigger>
                    </TabsList>

                    {/* Detail Tab */}
                    <TabsContent value="detail" className="space-y-4">
                        {application.status === 'perbaikan' && auth.user.role === 'user' && (
                            <Alert className="border border-amber-200 bg-gradient-to-r from-amber-50 to-amber-100 text-amber-800">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <AlertTitle className="font-medium text-amber-800">Perbaikan Diperlukan</AlertTitle>
                                <AlertDescription className="text-amber-700">
                                    Pengajuan ini memerlukan perbaikan sesuai catatan dari verifikator. Silakan klik tombol "Perbaiki Aplikasi" di
                                    bagian atas halaman untuk melakukan perbaikan.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Card className="overflow-hidden border-0 shadow-sm">
                            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-gray-800">
                                    <FileText className="h-5 w-5 text-purple-600" />
                                    Informasi Pengajuan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-normal text-gray-500">Nomor Pengajuan</Label>
                                        <p className="font-medium text-gray-800">{application.application_number}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-normal text-gray-500">Tanggal Pengajuan</Label>
                                        <p className="font-medium text-gray-800">{formatDate(application.submitted_at)}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-normal text-gray-500">Status</Label>
                                        <div
                                            className={`flex w-fit items-center gap-1.5 rounded-md px-3 py-1.5 ${application.status === 'perbaikan'
                                                ? 'border border-amber-200 bg-amber-50'
                                                : application.status === 'terbit'
                                                    ? 'border border-green-200 bg-green-50'
                                                    : application.status === 'pembayaran'
                                                        ? 'border border-blue-200 bg-blue-50'
                                                        : application.status === 'pembayaran-tahap-2'
                                                            ? 'border border-indigo-200 bg-indigo-50'
                                                            : application.status === 'verifikasi-lapangan'
                                                                ? 'border border-purple-200 bg-purple-50'
                                                                : 'border border-gray-200 bg-gray-50'
                                                }`}
                                        >
                                            <span
                                                className={`${application.status === 'perbaikan'
                                                    ? 'text-amber-600'
                                                    : application.status === 'terbit'
                                                        ? 'text-green-600'
                                                        : application.status === 'pembayaran'
                                                            ? 'text-blue-600'
                                                            : application.status === 'pembayaran-tahap-2'
                                                                ? 'text-indigo-600'
                                                                : application.status === 'verifikasi-lapangan'
                                                                    ? 'text-purple-600'
                                                                    : 'text-gray-600'
                                                    }`}
                                            >
                                                {getStatusIcon(application.status)}
                                            </span>
                                            <span
                                                className={`font-medium ${application.status === 'perbaikan'
                                                    ? 'text-amber-700'
                                                    : application.status === 'terbit'
                                                        ? 'text-green-700'
                                                        : application.status === 'pembayaran'
                                                            ? 'text-blue-700'
                                                            : application.status === 'pembayaran-tahap-2'
                                                                ? 'text-indigo-700'
                                                                : application.status === 'verifikasi-lapangan'
                                                                    ? 'text-purple-700'
                                                                    : 'text-gray-700'
                                                    }`}
                                            >
                                                {getStatusLabel(application.status)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-normal text-gray-500">Pemohon</Label>
                                        <p className="font-medium text-gray-800">{application.user.name}</p>
                                    </div>
                                </div>

                                {application.iin_number && (
                                    <div className="mt-6 border-t border-dashed pt-5">
                                        <div className="mb-4 flex items-center gap-2">
                                            <Award className="h-5 w-5 text-green-600" />
                                            <h3 className="font-semibold text-gray-800">Informasi IIN</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 rounded-lg border border-green-100 bg-green-50 p-4 md:grid-cols-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs font-normal text-gray-500">Nomor IIN</Label>
                                                <p className="font-medium text-gray-800">{application.iin_number}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-normal text-gray-500">Tanggal Terbit</Label>
                                                <p className="font-medium text-gray-800">{formatDate(application.issued_at)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}





                                {application.notes && (
                                    <div className="mt-6 border-t border-dashed pt-5">
                                        <div className="mb-3 flex items-start gap-3">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                className="mt-0.5 text-purple-600"
                                            >
                                                <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"></path>
                                                <path d="M15 3v6h6"></path>
                                                <path d="M10 16h4"></path>
                                                <path d="M8 12h8"></path>
                                            </svg>
                                            <div>
                                                <Label className="text-xs font-normal text-gray-500">Catatan</Label>
                                                <p className="mt-1 font-medium text-gray-800">{application.notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Show admin info if available */}
                                {application.admin && (
                                    <div className="mt-6 border-t border-dashed pt-5">
                                        <div className="mb-4 flex items-center gap-2">
                                            <User className="h-5 w-5 text-blue-600" />
                                            <h3 className="font-semibold text-gray-800">Informasi Petugas</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-6 rounded-lg border border-blue-100 bg-blue-50 p-4 md:grid-cols-2">
                                            <div className="space-y-1">
                                                <Label className="text-xs font-normal text-gray-500">Admin</Label>
                                                <p className="font-medium text-gray-800">{application.admin.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-4">
                        <Card className="overflow-hidden border-0 shadow-sm">
                            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-gray-800">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-purple-600"
                                    >
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                    </svg>
                                    Dokumen Aplikasi
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    {application.certificate_path && (
                                        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-full bg-white p-2">
                                                    <Award className="h-8 w-8 text-green-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-green-800">Sertifikat Single IIN/Blockholder</h3>
                                                    <p className="text-sm text-green-700">Sertifikat resmi Single IIN/Blockholder</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(route('iin-single-blockholder.download-file', [application.id, 'certificate']), '_blank')
                                                }
                                                className="border-green-200 bg-white text-green-700 hover:bg-green-50 hover:text-green-800"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                    )}

                                    {application.application_form_path && (
                                        <div className="flex items-center justify-between rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-full bg-purple-100 p-2">
                                                    <FileText className="h-7 w-7 text-purple-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-800">Formulir Aplikasi</h3>
                                                    <p className="text-sm text-gray-500">Formulir pendaftaran Single IIN/Blockholder</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(route('iin-single-blockholder.download-file', [application.id, 'application_form']), '_blank')
                                                }
                                                className="bg-white"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                    )}

                                    {application.payment_proof_path && (
                                        <div className="flex items-center justify-between rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-full bg-indigo-100 p-2">
                                                    <CreditCard className="h-7 w-7 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-800">Bukti Pembayaran</h3>
                                                    <p className="text-sm text-gray-500">Bukti pembayaran aplikasi</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(route('iin-single-blockholder.download-file', [application.id, 'payment_proof']), '_blank')
                                                }
                                                className="bg-white"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                    )}

                                    {application.requirements_archive_path && (
                                        <div className="flex items-center justify-between rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50">
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-full bg-orange-100 p-2">
                                                    <FileText className="h-7 w-7 text-orange-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-800">Persyaratan (ZIP/RAR)</h3>
                                                    <p className="text-sm text-gray-500">File persyaratan dalam format arsip</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(route('iin-single-blockholder.download-file', [application.id, 'requirements_archive']), '_blank')
                                                }
                                                className="bg-white"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                Download
                                            </Button>
                                        </div>
                                    )}

                                    {!application.application_form_path &&
                                        !application.certificate_path &&
                                        !application.payment_proof_path &&
                                        !application.requirements_archive_path && (
                                            <div className="p-8 text-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="48"
                                                    height="48"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="1"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="mx-auto mb-3 text-gray-300"
                                                >
                                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                                                    <path d="M12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"></path>
                                                    <path d="m9 16 1.5-2.5L12 15l1.5-2.5L15 15"></path>
                                                    <path d="M14 2v6h6"></path>
                                                </svg>
                                                <h3 className="mb-1 text-lg font-medium text-gray-700">Tidak Ada Dokumen</h3>
                                                <p className="text-gray-500">Belum ada dokumen yang tersedia untuk aplikasi ini.</p>
                                            </div>
                                        )}
                                </div>
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
                                                                            window.open(route('iin-single-blockholder.download-payment-document', [application.id, index]), '_blank')
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
                                                                    window.open(route('iin-single-blockholder.download-payment-proof', [application.id, index, 1]), '_blank')
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
                                    <form onSubmit={uploadPaymentProof} className="space-y-4">
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
                    <TabsContent value="history" className="space-y-4">
                        <Card className="overflow-hidden border-0 shadow-sm">
                            <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 pb-4">
                                <CardTitle className="flex items-center gap-2 text-gray-800">
                                    <Clock className="h-5 w-5 text-purple-600" />
                                    Riwayat Status
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y">
                                    {statusLogs.length > 0 ? (
                                        statusLogs.map((log, index) => (
                                            <div key={log.id} className="p-4 transition-colors hover:bg-gray-50">
                                                <div className="flex items-start gap-4">
                                                    <div
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${log.status_to === 'perbaikan'
                                                            ? 'bg-amber-100'
                                                            : log.status_to === 'pembayaran'
                                                                ? 'bg-blue-100'
                                                                : log.status_to === 'verifikasi-lapangan'
                                                                    ? 'bg-purple-100'
                                                                    : log.status_to === 'terbit'
                                                                        ? 'bg-green-100'
                                                                        : 'bg-gray-100'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`${log.status_to === 'perbaikan'
                                                                ? 'text-amber-600'
                                                                : log.status_to === 'pembayaran'
                                                                    ? 'text-blue-600'
                                                                    : log.status_to === 'verifikasi-lapangan'
                                                                        ? 'text-purple-600'
                                                                        : log.status_to === 'terbit'
                                                                            ? 'text-green-600'
                                                                            : 'text-gray-600'
                                                                }`}
                                                        >
                                                            {getStatusIcon(log.status_to)}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="mb-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                                            <span className="font-medium text-gray-900">
                                                                {log.status_from
                                                                    ? `Status diubah dari ${getStatusLabel(log.status_from)} menjadi ${getStatusLabel(log.status_to)}`
                                                                    : `Status awal: ${getStatusLabel(log.status_to)}`}
                                                            </span>
                                                            <span className="text-sm text-gray-500">{formatDate(log.created_at)}</span>
                                                        </div>
                                                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                                                            <User className="h-3.5 w-3.5" />
                                                            <span>{log.user.name}</span>
                                                        </div>
                                                        {log.notes && (
                                                            <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                                                                <p className="mb-1 font-medium text-gray-600">Catatan:</p>
                                                                <p>{log.notes}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="py-8 text-center">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                                <Clock className="h-6 w-6 text-gray-400" />
                                            </div>
                                            <h3 className="mb-1 font-medium text-gray-800">Belum Ada Riwayat</h3>
                                            <p className="text-sm text-gray-500">Belum ada perubahan status yang tercatat</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
