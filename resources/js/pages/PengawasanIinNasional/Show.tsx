import QrisModal from '@/components/QrisModal';
import SurveyModal from '@/components/SurveyModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { User } from '@/types';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Award, CheckCircle, Clock, CreditCard, Download, FileText, Shield, Upload, User as UserIcon, X } from 'lucide-react';
import { useState } from 'react';

interface PaymentDocument {
    path: string;
    original_name: string;
    uploaded_at: string;
}

interface PengawasanIinNasionalApplication {
    id: number;
    application_number: string;
    status: string;
    created_at: string;
    submitted_at: string;
    payment_proof_path?: string;
    payment_documents?: PaymentDocument[];
    payment_proof_documents?: PaymentDocument[];
    field_verification_documents?: PaymentDocument[];
    issuance_documents?: PaymentDocument[];
    supervision_issued_documents?: PaymentDocument[];
    field_verification_documents_uploaded_at?: string;
    additional_documents?: string;
    payment_verified_at?: string;
    field_verification_at?: string;
    issued_at?: string;
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
    application: PengawasanIinNasionalApplication;
    statusLogs: StatusLog[];
    auth: {
        user: User;
    };
    attachmentBaseUrl: string;
}

export default function PengawasanIinNasionalShow({ application, statusLogs, auth, attachmentBaseUrl }: Props) {
    const [activeTab, setActiveTab] = useState('detail');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        payment_proof: [] as File[],
    });
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

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

    const handleUploadPaymentProof = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.payment_proof.length === 0) {
            showErrorToast('Pilih file bukti pembayaran terlebih dahulu');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const formDataToSend = new FormData();
        formData.payment_proof.forEach((file, index) => {
            formDataToSend.append(`payment_proof_documents[${index}]`, file);
        });

        try {
            router.post(route('pengawasan-iin-nasional.upload-payment-proof', application.id), formDataToSend, {
                onProgress: (progress) => {
                    setUploadProgress((progress as any)?.percentage || 0);
                },
                onSuccess: () => {
                    showSuccessToast('Bukti pembayaran berhasil diupload');
                    setFormData({ payment_proof: [] });
                    setUploading(false);
                    setUploadProgress(0);
                },
                onError: (errors) => {
                    const errorMessage = (Object.values(errors)[0] as string) || 'Terjadi kesalahan saat mengupload bukti pembayaran';
                    showErrorToast(errorMessage);
                    setUploading(false);
                    setUploadProgress(0);
                },
            });
        } catch (error) {
            showErrorToast('Terjadi kesalahan saat mengupload bukti pembayaran');
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Pemantauan IIN Nasional - ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('pengawasan-iin-nasional.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pemantauan IIN Nasional</h1>
                            <p className="text-gray-600">{application.application_number}</p>
                        </div>
                    </div>
                    <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(application.status)}`}
                    >
                        {getStatusLabel(application.status)}
                    </div>
                </div>

                {/* Status Alert */}
                {application.status === 'pengajuan' && (
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertTitle>Aplikasi Sedang Diproses</AlertTitle>
                        <AlertDescription>
                            Aplikasi Pemantauan Anda sedang dalam tahap review. Kami akan menghubungi Anda jika diperlukan informasi tambahan.
                        </AlertDescription>
                    </Alert>
                )}

                {application.status === 'pembayaran' && (
                    <Alert>
                        <CreditCard className="h-4 w-4" />
                        <AlertTitle>Upload Bukti Pembayaran</AlertTitle>
                        <AlertDescription>Silakan upload bukti pembayaran untuk melanjutkan proses pemantauan.</AlertDescription>
                    </Alert>
                )}

                {application.status === 'verifikasi-lapangan' && (
                    <Alert>
                        <UserIcon className="h-4 w-4" />
                        <AlertTitle>Verifikasi Lapangan</AlertTitle>
                        <AlertDescription>Tim verifikasi akan melakukan kunjungan lapangan.</AlertDescription>
                    </Alert>
                )}

                {application.status === 'terbit' && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Pemantauan Selesai</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Proses pemantauan telah selesai. Dokumen hasil pemantauan dapat diunduh di tab Dokumen.
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
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Nomor Aplikasi</Label>
                                        <p className="mt-1 text-sm text-gray-900">{application.application_number}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Status</Label>
                                        <div
                                            className={`mt-1 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium ${getStatusBadgeClass(application.status)}`}
                                        >
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
                                                : '-'}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Pemohon</Label>
                                        <p className="mt-1 text-sm text-gray-900">{application.user.name}</p>
                                        <p className="text-xs text-gray-500">{application.user.email}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Dokumen Verifikasi dan Hasil
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Issuance Documents */}
                                {application.issuance_documents && application.issuance_documents.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="flex items-center gap-2 font-medium text-green-800">
                                            <Award className="h-5 w-5" />
                                            Dokumen Pemberitahuan Pemantauan
                                        </h4>
                                        {application.issuance_documents.map((doc, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-green-100 p-4"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-8 w-8 text-green-600" />
                                                    <div>
                                                        <p className="">Dokumen Pemberitahuan Pemantauan</p>
                                                        <p className="text-sm text-green-700">
                                                            Diupload: {format(new Date(doc.uploaded_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setIsSurveyModalOpen(true)}
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
                                                        <p className="font-medium text-gray-900">Dokumen Verifikasi Lapangan</p>
                                                        <p className="text-sm text-gray-500">
                                                            Diupload: {format(new Date(doc.uploaded_at), 'dd MMM yyyy HH:mm', { locale: id })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        window.open(
                                                            route('pengawasan-iin-nasional.download', {
                                                                id: application.id,
                                                                type: 'field-verification',
                                                            }),
                                                            '_blank',
                                                        )
                                                    }
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Empty State */}
                                {(!application.field_verification_documents || application.field_verification_documents.length === 0) &&
                                    (!application.issuance_documents || application.issuance_documents.length === 0) &&
                                    (!application.supervision_issued_documents || application.supervision_issued_documents.length === 0) && (
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                                            <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                            <h3 className="mb-2 text-lg font-medium text-gray-900">Belum Ada Dokumen</h3>
                                            <p className="text-gray-600">Dokumen verifikasi dan hasil pemantauan belum tersedia.</p>
                                        </div>
                                    )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payment Tab */}
                    <TabsContent value="payment" className="space-y-6">
                        {/* Admin Payment Documents */}
                        {application.payment_documents && application.payment_documents.length > 0 && (
                            <div className="rounded-lg border bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-purple-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Dokumen Pembayaran dari Admin</h3>
                                </div>
                                <div className="grid gap-3">
                                    {application.payment_documents.map((doc, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-purple-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{doc.original_name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Diunggah pada {format(new Date(doc.uploaded_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        `/pengawasan-iin-nasional/${application.id}/download?type=payment&file=${encodeURIComponent(doc.path)}`,
                                                        '_blank',
                                                    )
                                                }
                                                className="flex items-center gap-2 border-purple-200 text-purple-700 hover:bg-purple-50"
                                            >
                                                <Download className="h-4 w-4" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Waiting for Payment Documents */}
                        {(!application.payment_documents || application.payment_documents.length === 0) && (
                            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                                <Clock className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                <h3 className="mb-2 text-lg font-medium text-gray-900">Menunggu Dokumen Pembayaran</h3>
                                <p className="text-gray-600">
                                    Admin sedang memproses aplikasi Anda. Dokumen pembayaran akan tersedia setelah verifikasi selesai.
                                </p>
                            </div>
                        )}

                        {/* Payment Instructions Alert */}
                        {application.status === 'pembayaran' && auth.user.role === 'user' && (
                            <Alert className="border-blue-200 bg-blue-50">
                                <CreditCard className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-800">Instruksi Pembayaran</AlertTitle>
                                <AlertDescription className="text-blue-700">
                                    Silakan lakukan pembayaran sesuai dengan dokumen yang telah diberikan oleh admin, kemudian unggah bukti pembayaran
                                    Anda.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Payment Proof Documents */}
                        {application.payment_proof_documents && application.payment_proof_documents.length > 0 && (
                            <div className="rounded-lg border bg-white p-6 shadow-sm">
                                <div className="mb-4 flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Bukti Pembayaran Anda</h3>
                                </div>
                                <div className="grid gap-3">
                                    {application.payment_proof_documents.map((doc, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{doc.original_name}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Diunggah pada {format(new Date(doc.uploaded_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        `/pengawasan-iin-nasional/${application.id}/download?type=payment_proof&file=${encodeURIComponent(doc.path)}`,
                                                        '_blank',
                                                    )
                                                }
                                                className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
                                            >
                                                <Download className="h-4 w-4" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Payment Proof Message */}
                        {(!application.payment_proof_documents || application.payment_proof_documents.length === 0) &&
                            application.status === 'pembayaran' &&
                            auth.user.role === 'user' && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                                    <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">Belum Ada Bukti Pembayaran</h3>
                                    <p className="text-gray-600">
                                        Silakan unggah bukti pembayaran Anda setelah melakukan transfer sesuai dengan dokumen pembayaran yang telah
                                        diberikan.
                                    </p>
                                </div>
                            )}

                        {/* Upload Payment Proof Form - First Condition */}
                        {application.status === 'pembayaran' &&
                            auth.user.role === 'user' &&
                            application.payment_documents &&
                            application.payment_documents.length > 0 &&
                            application.payment_proof_path && (
                                <div className="rounded-lg border bg-white p-6 shadow-sm">
                                    <form onSubmit={handleUploadPaymentProof} className="space-y-4">
                                        <div className="rounded-lg border p-4">
                                            <h3 className="mb-2 font-medium text-gray-800">Unggah Bukti Pembayaran</h3>
                                            <p className="mb-4 text-sm text-gray-600">
                                                Silakan unggah bukti transfer atau pembayaran dalam format PDF, JPG, atau PNG.
                                            </p>
                                            <div className="relative mb-4 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-purple-300">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Upload className="mb-1 h-8 w-8 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formData.payment_proof.length > 0
                                                            ? `${formData.payment_proof.length} file dipilih`
                                                            : 'Klik untuk memilih file bukti pembayaran'}
                                                    </span>
                                                    <span className="text-xs text-gray-500">Format: PDF, JPG, JPEG, PNG (Maks. 5MB per file)</span>
                                                </div>
                                                <label htmlFor="payment_proof" className="absolute inset-0 cursor-pointer">
                                                    <span className="sr-only">Pilih file</span>
                                                </label>
                                                <input
                                                    id="payment_proof"
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                    multiple
                                                />
                                            </div>

                                            {/* Display selected files */}
                                            {formData.payment_proof.length > 0 && (
                                                <div className="mb-4 space-y-2">
                                                    <p className="text-sm font-medium text-gray-700">File yang dipilih:</p>
                                                    {formData.payment_proof.map((file: File, index: number) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-gray-500" />
                                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                                <span className="text-xs text-gray-500">
                                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                                </span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => removeFile(index)}
                                                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

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
                                                        Unggah Bukti Pembayaran ({formData.payment_proof.length} file)
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                        {/* Upload Payment Proof Form - Second Condition */}
                        {application.status === 'pembayaran' &&
                            auth.user.role === 'user' &&
                            application.payment_documents &&
                            application.payment_documents.length > 0 &&
                            !application.payment_proof_path && (
                                <form onSubmit={handleUploadPaymentProof} className="space-y-4">
                                    <div className="rounded-lg border p-4">
                                        <h3 className="mb-2 font-medium text-gray-800">Unggah Bukti Pembayaran</h3>
                                        <p className="mb-4 text-sm text-gray-600">
                                            Silakan unggah bukti transfer atau pembayaran dalam format PDF, JPG, atau PNG.
                                        </p>
                                        <div className="relative mb-4 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-purple-300">
                                            <div className="flex flex-col items-center gap-2">
                                                <Upload className="mb-1 h-8 w-8 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formData.payment_proof.length > 0
                                                        ? `${formData.payment_proof.length} file dipilih`
                                                        : 'Klik untuk memilih file bukti pembayaran'}
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

                                        {/* Display selected files */}
                                        {formData.payment_proof.length > 0 && (
                                            <div className="mb-4 space-y-2">
                                                <p className="text-sm font-medium text-gray-700">File yang dipilih:</p>
                                                {formData.payment_proof.map((file: File, index: number) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-gray-500" />
                                                            <span className="text-sm text-gray-700">{file.name}</span>
                                                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeFile(index)}
                                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

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
                                                Unggah Bukti Pembayaran ({formData.payment_proof.length} file)
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            )}

                        {/* No Payment Information Yet */}
                        {(!application.payment_documents || application.payment_documents.length === 0) &&
                            (!application.payment_proof_documents || application.payment_proof_documents.length === 0) && (
                                <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
                                    <FileText className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">Belum Ada Informasi Pembayaran</h3>
                                    <p className="text-gray-600">Informasi pembayaran akan tersedia setelah aplikasi Anda diverifikasi oleh admin.</p>
                                </div>
                            )}
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
                                                {index < statusLogs.length - 1 && <div className="mt-2 h-8 w-px bg-gray-200" />}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium text-gray-900">Status diubah ke: {getStatusLabel(log.status_to)}</p>
                                                    <span className="text-sm text-gray-500">oleh {log.changed_by.name}</span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {format(new Date(log.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                                                </p>
                                                {log.notes && <p className="mt-1 text-sm text-gray-700">{log.notes}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <SurveyModal
                isOpen={isSurveyModalOpen}
                onClose={() => setIsSurveyModalOpen(false)}
                onDownload={() => {
                    window.open(
                        route('pengawasan-iin-nasional.download-issuance-document', {
                            pengawasanIinNasional: application.id,
                            index: 0,
                        }),
                        '_blank',
                    )
                }}
                certificateType="Pemberitahuan Pemantauan IIN Nasional"
            />
        </DashboardLayout>
    );
}
