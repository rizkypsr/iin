import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { PageProps } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, ArrowLeft, Award, CheckCircle, Clock, CreditCard, Download, FileText, Shield, Upload } from 'lucide-react';
import { useState } from 'react';

interface PaymentDocument {
    path: string;
    original_name: string;
    uploaded_at: string;
}

interface IinNasionalApplication {
    id: number;
    application_number: string;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
    submitted_at: string;
    iin_number?: string;
    iin_range?: any;
    notes?: string;
    application_form_path?: string;
    requirements_archive_path?: string;
    payment_proof_path?: string;
    payment_proof_documents?: PaymentDocument[];
    payment_proof_uploaded_at?: string;
    certificate_path?: string;
    payment_verified_at?: string;
    field_verification_at?: string;
    issued_at?: string;
    can_upload_payment_proof: boolean;
    can_download_certificate: boolean;
    payment_documents?: PaymentDocument[];
    payment_documents_uploaded_at?: string;
    field_verification_documents?: PaymentDocument[];
    field_verification_documents_uploaded_at?: string;
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
    application: IinNasionalApplication;
    statusLogs: StatusLog[];
}

export default function AdminIinNasionalVerification({ application, statusLogs, auth }: Props) {
    const [activeTab, setActiveTab] = useState('detail');
    const [notes, setNotes] = useState('');
    const [iinNumber, setIinNumber] = useState(application.iin_number || '');
    const [loading, setLoading] = useState(false);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [uploadingCertificate, setUploadingCertificate] = useState(false);
    const [paymentDocuments, setPaymentDocuments] = useState<File[]>([]);
    const [uploadingPaymentDocuments, setUploadingPaymentDocuments] = useState(false);
    const [fieldVerificationDocuments, setFieldVerificationDocuments] = useState<File[]>([]);
    const [uploadingFieldVerificationDocuments, setUploadingFieldVerificationDocuments] = useState(false);

    // Admin can change status from 'pengajuan' to 'pembayaran'
    const canChangeToPayment = application.status === 'pengajuan';

    // Admin can change status from 'pembayaran' to 'verifikasi-lapangan'
    const canChangeToFieldVerification = application.status === 'pembayaran';

    // Admin can complete field verification when:
    // 1. Status is "verifikasi-lapangan"
    // 2. Field verification has NOT been completed yet (field_verification_at is null)
    const canCompleteFieldVerification = application.status === 'verifikasi-lapangan' && !application.field_verification_at;

    // Admin can only issue IIN when:
    // 1. Status is "verifikasi-lapangan"
    // 2. Field verification has been completed (field_verification_at is not null)
    const canIssueIIN = application.status === 'verifikasi-lapangan' && application.field_verification_at;

    // Admin can upload certificate when status is "menunggu-terbit"
    const canUploadCertificate = application.status === 'menunggu-terbit';

    // Admin can upload payment documents when status is pengajuan or pembayaran
    const canUploadPaymentDocuments = application.status === 'pengajuan' || application.status === 'pembayaran';

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'pengajuan':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'perbaikan':
                return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
            case 'pembayaran':
                return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
            case 'verifikasi-lapangan':
                return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
            case 'menunggu-terbit':
                return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
            case 'terbit':
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'ditolak':
                return 'bg-red-100 text-red-800 hover:bg-red-200';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pengajuan':
                return 'Sedang Diajukan';
            case 'perbaikan':
                return 'Perlu Perbaikan';
            case 'pembayaran':
                return 'Menunggu Pembayaran';
            case 'verifikasi-lapangan':
                return 'Verifikasi Lapangan';
            case 'menunggu-terbit':
                return 'Menunggu Terbit';
            case 'terbit':
                return 'Sudah Terbit';
            case 'ditolak':
                return 'Ditolak';
            default:
                return 'Tidak Diketahui';
        }
    };

    const handleIssueIIN = async () => {
        if (!iinNumber.trim()) {
            showErrorToast('Nomor IIN harus diisi');
            return;
        }

        setLoading(true);

        try {
            router.post(
                route('iin-nasional.update-status', application.id),
                {
                    status: 'terbit',
                    notes: notes || 'IIN diterbitkan oleh admin',
                    iin_number: iinNumber.trim(),
                },
                {
                    onSuccess: () => {
                        showSuccessToast('IIN berhasil diterbitkan');
                    },
                    onError: (errors) => {
                        console.error('Error issuing IIN:', errors);
                        showErrorToast('Gagal menerbitkan IIN. Silakan coba lagi.');
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error issuing IIN:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleStatusChangeToPayment = async () => {
        setLoading(true);

        try {
            router.post(
                route('iin-nasional.update-status', application.id),
                {
                    status: 'pembayaran',
                    notes: notes || 'Status diubah ke pembayaran oleh admin',
                },
                {
                    onSuccess: () => {
                        showSuccessToast('Status berhasil diubah ke pembayaran');
                        setNotes('');
                    },
                    onError: (errors) => {
                        console.error('Error changing status:', errors);
                        showErrorToast('Gagal mengubah status. Silakan coba lagi.');
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error changing status:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleStatusChangeToRevision = async () => {
        setLoading(true);

        try {
            router.post(
                route('iin-nasional.update-status', application.id),
                {
                    status: 'perbaikan',
                    notes: notes || 'Aplikasi dikembalikan untuk perbaikan oleh admin',
                },
                {
                    onSuccess: () => {
                        showSuccessToast('Status berhasil diubah ke perbaikan');
                        setNotes('');
                    },
                    onError: (errors) => {
                        console.error('Error changing status:', errors);
                        showErrorToast('Gagal mengubah status. Silakan coba lagi.');
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error changing status:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleStatusChangeToFieldVerification = async () => {
        if (fieldVerificationDocuments.length === 0) {
            showErrorToast('Silakan upload minimal satu dokumen verifikasi lapangan');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('status', 'verifikasi-lapangan');
        formData.append('notes', notes || 'Status diubah ke verifikasi lapangan oleh admin');
        formData.append('upload_and_change_status', '1');
        
        fieldVerificationDocuments.forEach((file, index) => {
            formData.append(`field_verification_documents[${index}]`, file);
        });

        try {
            router.post(
                route('iin-nasional.upload-field-verification-documents', application.id),
                formData,
                {
                    onSuccess: () => {
                        showSuccessToast('Status berhasil diubah ke verifikasi lapangan');
                        setNotes('');
                        setFieldVerificationDocuments([]);
                    },
                    onError: (errors) => {
                        console.error('Error changing status:', errors);
                        showErrorToast('Gagal mengubah status. Silakan coba lagi.');
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error changing status:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleCompleteFieldVerification = async () => {
        setLoading(true);

        try {
            router.post(
                route('iin-nasional.update-status', application.id),
                {
                    status: 'verifikasi-lapangan',
                    field_verification_completed: true,
                    notes: notes || 'Verifikasi lapangan telah diselesaikan oleh admin',
                },
                {
                    onSuccess: () => {
                        showSuccessToast('Verifikasi lapangan berhasil diselesaikan');
                        setNotes('');
                    },
                    onError: (errors) => {
                        console.error('Error completing field verification:', errors);
                        showErrorToast('Gagal menyelesaikan verifikasi lapangan. Silakan coba lagi.');
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error completing field verification:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleCertificateUpload = async () => {
        if (!certificateFile) {
            showErrorToast('Silakan pilih file sertifikat');
            return;
        }

        setUploadingCertificate(true);

        const formData = new FormData();
        formData.append('certificate', certificateFile);

        try {
            router.post(route('iin-nasional.upload-certificate', application.id), formData, {
                onSuccess: () => {
                    showSuccessToast('Sertifikat berhasil diupload');
                    setCertificateFile(null);
                },
                onError: (errors) => {
                    console.error('Error uploading certificate:', errors);
                    showErrorToast('Gagal mengupload sertifikat. Silakan coba lagi.');
                },
                onFinish: () => {
                    setUploadingCertificate(false);
                },
            });
        } catch (error) {
            console.error('Error uploading certificate:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setUploadingCertificate(false);
        }
    };

    const handlePaymentDocumentsUpload = async () => {
        if (paymentDocuments.length === 0) {
            showErrorToast('Silakan pilih minimal satu dokumen pembayaran');
            return;
        }

        setUploadingPaymentDocuments(true);

        const formData = new FormData();
        paymentDocuments.forEach((file, index) => {
            formData.append(`payment_documents[${index}]`, file);
        });

        try {
            router.post(route('iin-nasional.upload-payment-documents', application.id), formData, {
                onSuccess: () => {
                    showSuccessToast('Dokumen pembayaran berhasil diupload');
                    setPaymentDocuments([]);
                },
                onError: (errors) => {
                    console.error('Error uploading payment documents:', errors);
                    showErrorToast('Gagal mengupload dokumen pembayaran. Silakan coba lagi.');
                },
                onFinish: () => {
                    setUploadingPaymentDocuments(false);
                },
            });
        } catch (error) {
            console.error('Error uploading payment documents:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setUploadingPaymentDocuments(false);
        }
    };

    const addPaymentDocument = (file: File) => {
        setPaymentDocuments(prev => [...prev, file]);
    };

    const removePaymentDocument = (index: number) => {
        setPaymentDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const addFieldVerificationDocument = (file: File) => {
        setFieldVerificationDocuments(prev => [...prev, file]);
    };

    const removeFieldVerificationDocument = (index: number) => {
        setFieldVerificationDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const downloadPaymentDocument = (index: number) => {
        window.open(
            route('iin-nasional.download-payment-document', {
                iinNasional: application.id,
                index: index,
            }),
            '_blank',
        );
    };

    const downloadPaymentProof = (index: number) => {
        window.open(
            route('iin-nasional.download-payment-proof', {
                iinNasional: application.id,
                index: index,
            }),
            '_blank',
        );
    };

    const downloadFieldVerificationDocument = (index: number) => {
        window.open(
            route('iin-nasional.download-field-verification-document', {
                iinNasional: application.id,
                index: index,
            }),
            '_blank',
        );
    };

    const downloadFile = (type: string) => {
        window.open(
            route('iin-nasional.download-file', {
                iinNasional: application.id,
                type: type,
            }),
            '_blank',
        );
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Admin - ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.dashboard')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-2xl font-bold text-transparent">
                                {application.application_number}
                            </h1>
                            <p className="text-gray-600">Panel Admin - IIN Nasional</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {!canChangeToPayment && !canChangeToFieldVerification && !canCompleteFieldVerification && (
                            <Badge className={getStatusBadgeClass(application.status)}>{getStatusLabel(application.status)}</Badge>
                        )}
                        {canCompleteFieldVerification && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={loading}>
                                        <CheckCircle className="mr-1 h-4 w-4" />
                                        Selesaikan Verifikasi Lapangan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Konfirmasi Selesaikan Verifikasi Lapangan</DialogTitle>
                                        <DialogDescription>
                                            Apakah Anda yakin ingin menyelesaikan verifikasi lapangan? Status aplikasi akan berubah menjadi <strong>menunggu terbit</strong> dan siap untuk penerbitan IIN.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Batal</Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button
                                                onClick={handleCompleteFieldVerification}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                disabled={loading}
                                            >
                                                {loading ? 'Memproses...' : 'Ya, Selesaikan Verifikasi Lapangan'}
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {canChangeToFieldVerification && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={loading}>
                                        <Shield className="mr-1 h-4 w-4" />
                                        Proses ke Verifikasi Lapangan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Proses ke Verifikasi Lapangan</DialogTitle>
                                        <DialogDescription>
                                            Upload dokumen verifikasi lapangan dan ubah status aplikasi ke <strong>verifikasi lapangan</strong>.
                                            Dokumen ini akan tersedia untuk diunduh oleh pemohon.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        {/* Upload Dokumen Verifikasi Lapangan */}
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="field_verification_documents_modal" className="text-sm font-medium text-gray-700">
                                                    Dokumen Verifikasi Lapangan <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="field_verification_documents_modal"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    multiple
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        files.forEach(file => addFieldVerificationDocument(file));
                                                        e.target.value = ''; // Reset input
                                                    }}
                                                    className="mt-1"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Format yang didukung: PDF, DOC, DOCX, JPG, PNG. Maksimal 10MB per file. Anda dapat memilih beberapa file sekaligus.
                                                </p>
                                            </div>

                                            {/* Selected Files */}
                                            {fieldVerificationDocuments.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">File yang Dipilih:</Label>
                                                    {fieldVerificationDocuments.map((file, index) => (
                                                        <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                            <div className="flex items-center gap-2">
                                                                <FileText className="h-4 w-4 text-gray-600" />
                                                                <div>
                                                                    <span className="text-sm font-medium text-gray-800">{file.name}</span>
                                                                    <span className="ml-2 text-xs text-gray-500">
                                                                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeFieldVerificationDocument(index)}
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                Hapus
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Catatan */}
                                        <div>
                                            <Label htmlFor="field_verification_notes" className="text-sm font-medium text-gray-700">
                                                Catatan (Opsional)
                                            </Label>
                                            <Textarea
                                                id="field_verification_notes"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Catatan untuk verifikasi lapangan..."
                                                rows={3}
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Batal</Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button
                                                onClick={handleStatusChangeToFieldVerification}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                                disabled={loading || fieldVerificationDocuments.length === 0}
                                            >
                                                {loading ? 'Memproses...' : 'Proses ke Verifikasi Lapangan'}
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                        {application.iin_number && (
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                IIN: {application.iin_number}
                            </Badge>
                        )}
                        {canChangeToPayment && (
                            <>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" disabled={loading}>
                                            <ArrowLeft className="mr-1 h-4 w-4" />
                                            Kembalikan untuk Perbaikan
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Konfirmasi Kembalikan untuk Perbaikan</DialogTitle>
                                            <DialogDescription>
                                                Apakah Anda yakin ingin mengembalikan aplikasi ini untuk <strong>perbaikan</strong>?
                                                Pemohon akan diminta untuk memperbaiki dokumen atau informasi yang diperlukan.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label htmlFor="revision_notes" className="text-sm font-medium text-gray-700">
                                                    Catatan Perbaikan (Opsional)
                                                </Label>
                                                <Textarea
                                                    id="revision_notes"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Jelaskan apa yang perlu diperbaiki..."
                                                    rows={3}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Batal</Button>
                                            </DialogClose>
                                            <DialogClose asChild>
                                                <Button
                                                    onClick={handleStatusChangeToRevision}
                                                    className="bg-red-600 hover:bg-red-700 text-white"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Memproses...' : 'Ya, Kembalikan untuk Perbaikan'}
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" disabled={loading}>
                                            <Clock className="mr-1 h-4 w-4" />
                                            Ubah ke Pembayaran
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Ubah Status ke Pembayaran</DialogTitle>
                                            <DialogDescription>
                                                Upload dokumen pembayaran dan ubah status aplikasi ke <strong>pembayaran</strong>.
                                                Dokumen ini akan tersedia untuk diunduh oleh pemohon.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-6 py-4">
                                            {/* Upload Dokumen Pembayaran */}
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="payment_documents_modal" className="text-sm font-medium text-gray-700">
                                                        Dokumen Pembayaran <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="payment_documents_modal"
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                        multiple
                                                        onChange={(e) => {
                                                            const files = Array.from(e.target.files || []);
                                                            files.forEach(file => addPaymentDocument(file));
                                                            e.target.value = ''; // Reset input
                                                        }}
                                                        className="mt-1"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Format yang didukung: PDF, DOC, DOCX, JPG, PNG. Maksimal 10MB per file. Anda dapat memilih beberapa file sekaligus.
                                                    </p>
                                                </div>

                                                {/* Selected Files */}
                                                {paymentDocuments.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-gray-700">File yang Dipilih:</Label>
                                                        {paymentDocuments.map((file, index) => (
                                                            <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                                    <div>
                                                                        <span className="text-sm font-medium text-gray-800">{file.name}</span>
                                                                        <span className="ml-2 text-xs text-gray-500">
                                                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => removePaymentDocument(index)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    Hapus
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Existing Payment Documents */}
                                                {application.payment_documents && application.payment_documents.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-gray-700">Dokumen yang Sudah Diupload:</Label>
                                                        {application.payment_documents.map((document, index) => (
                                                            <div key={index} className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                                    <span className="text-sm text-gray-700">Dokumen Pembayaran {index + 1}</span>
                                                                </div>
                                                                <Button variant="outline" size="sm" onClick={() => downloadPaymentDocument(index)}>
                                                                    <Download className="mr-1 h-3 w-3" />
                                                                    Download
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Catatan */}
                                            <div>
                                                <Label htmlFor="status_notes" className="text-sm font-medium text-gray-700">
                                                    Catatan (Opsional)
                                                </Label>
                                                <Textarea
                                                    id="status_notes"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                    placeholder="Catatan perubahan status..."
                                                    rows={3}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline">Batal</Button>
                                            </DialogClose>
                                            <Button
                                                onClick={async () => {
                                                    setLoading(true);
                                                    
                                                    try {
                                                        // Siapkan FormData untuk upload dokumen dan perubahan status bersamaan
                                                        const formData = new FormData();
                                                        
                                                        // Tambahkan dokumen pembayaran jika ada
                                                        if (paymentDocuments.length > 0) {
                                                            paymentDocuments.forEach((file, index) => {
                                                                formData.append(`payment_documents[${index}]`, file);
                                                            });
                                                        }
                                                        
                                                        // Tambahkan parameter untuk perubahan status
                                                        formData.append('status', 'pembayaran');
                                                        formData.append('notes', notes || 'Status diubah ke pembayaran oleh admin');
                                                        formData.append('upload_and_change_status', '1');
                                                        
                                                        // Kirim request untuk upload dokumen dan ubah status bersamaan
                                                        router.post(
                                                            route('iin-nasional.upload-payment-documents', application.id),
                                                            formData,
                                                            {
                                                                onSuccess: () => {
                                                                    showSuccessToast('Dokumen berhasil diupload dan status diubah ke pembayaran');
                                                                    setPaymentDocuments([]);
                                                                    setNotes('');
                                                                },
                                                                onError: (errors) => {
                                                                    console.error('Error uploading documents and changing status:', errors);
                                                                    showErrorToast('Gagal mengupload dokumen atau mengubah status. Silakan coba lagi.');
                                                                },
                                                                onFinish: () => {
                                                                    setLoading(false);
                                                                },
                                                            },
                                                        );
                                                    } catch (error) {
                                                        console.error('Error in upload and status change:', error);
                                                        showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                disabled={loading || uploadingPaymentDocuments || (paymentDocuments.length === 0 && (!application.payment_documents || application.payment_documents.length === 0))}
                                            >
                                                {loading || uploadingPaymentDocuments ? 'Memproses...' : 'Upload & Ubah Status'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}
                    </div>
                </div>

                {/* Status Alert for Admin */}
                {canChangeToPayment && (
                    <Alert className="border-blue-200 bg-blue-50">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <AlertTitle className="text-blue-800">Siap untuk Diproses</AlertTitle>
                        <AlertDescription className="text-blue-700">
                            Aplikasi ini siap untuk diubah statusnya ke pembayaran.
                        </AlertDescription>
                    </Alert>
                )}

                {canChangeToFieldVerification && (
                    <Alert className="border-indigo-200 bg-indigo-50">
                        <Shield className="h-4 w-4 text-indigo-600" />
                        <AlertTitle className="text-indigo-800">Siap untuk Verifikasi Lapangan</AlertTitle>
                        <AlertDescription className="text-indigo-700">
                            Aplikasi dengan status pembayaran siap untuk diproses ke tahap verifikasi lapangan.
                        </AlertDescription>
                    </Alert>
                )}

                {canCompleteFieldVerification && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Siap Menyelesaikan Verifikasi Lapangan</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Verifikasi lapangan dapat diselesaikan untuk melanjutkan ke tahap penerbitan IIN.
                        </AlertDescription>
                    </Alert>
                )}

                {canIssueIIN && (
                    <Alert className="border-indigo-200 bg-indigo-50">
                        <Shield className="h-4 w-4 text-indigo-600" />
                        <AlertTitle className="text-indigo-800">Siap untuk Diterbitkan</AlertTitle>
                        <AlertDescription className="text-indigo-700">
                            Aplikasi ini telah melewati verifikasi lapangan dan siap untuk diterbitkan IIN-nya.
                        </AlertDescription>
                    </Alert>
                )}



                {canUploadCertificate && (
                    <Alert className="border-orange-200 bg-orange-50">
                        <Upload className="h-4 w-4 text-orange-600" />
                        <AlertTitle className="text-orange-800">Menunggu Upload Sertifikat</AlertTitle>
                        <AlertDescription className="text-orange-700">
                            Aplikasi menunggu untuk diupload sertifikat IIN-nya. Silakan upload dokumen sertifikat untuk menyelesaikan proses
                            penerbitan.
                        </AlertDescription>
                    </Alert>
                )}

                {application.status === 'terbit' && (
                    <Alert className="border-green-200 bg-green-50">
                        <Award className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">IIN Telah Diterbitkan</AlertTitle>
                        <AlertDescription className="text-green-700">
                            IIN nomor <strong>{application.iin_number}</strong> telah diterbitkan pada{' '}
                            {application.issued_at ? format(new Date(application.issued_at), 'dd MMMM yyyy', { locale: id }) : '-'}.
                            {application.admin && ` Diterbitkan oleh: ${application.admin.name}`}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 rounded-lg bg-gray-100/80 p-1 lg:grid-cols-6">
                        <TabsTrigger
                            value="detail"
                            className={
                                activeTab === 'detail'
                                    ? 'from-purple-600 to-purple-800 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white'
                                    : ''
                            }
                        >
                            <FileText className="mr-1 h-4 w-4" />
                            Detail
                        </TabsTrigger>
                        <TabsTrigger
                            value="documents"
                            className={
                                activeTab === 'documents'
                                    ? 'from-purple-600 to-purple-800 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white'
                                    : ''
                            }
                        >
                            <FileText className="mr-1 h-4 w-4" />
                            Dokumen
                        </TabsTrigger>
                        <TabsTrigger
                            value="status"
                            className={
                                activeTab === 'status'
                                    ? 'from-purple-600 to-purple-800 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white'
                                    : ''
                            }
                        >
                            <Clock className="mr-1 h-4 w-4" />
                            Status
                        </TabsTrigger>


                        {canIssueIIN && (
                            <TabsTrigger
                                value="issue"
                                className={
                                    activeTab === 'issue'
                                        ? 'from-green-600 to-green-800 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white'
                                        : 'text-green-700'
                                }
                            >
                                <Award className="mr-1 h-4 w-4" />
                                Terbitkan IIN
                            </TabsTrigger>
                        )}
                        {canUploadCertificate && (
                            <TabsTrigger
                                value="upload-certificate"
                                className={
                                    activeTab === 'upload-certificate'
                                        ? 'from-orange-600 to-orange-800 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white'
                                        : 'text-orange-700'
                                }
                            >
                                <Upload className="mr-1 h-4 w-4" />
                                Upload Sertifikat
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="detail">
                        <Card className="border-purple-100 bg-white/95 shadow-md">
                            <CardHeader>
                                <CardTitle>Informasi Pemohon</CardTitle>
                                <CardDescription>Detail lengkap pemohon IIN Nasional</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <Label className="text-sm text-gray-500">Nama Pemohon</Label>
                                        <p className="font-medium text-gray-800">{application.user.name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Email</Label>
                                        <p className="font-medium text-gray-800">{application.user.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Tanggal Pengajuan</Label>
                                        <p className="font-medium text-gray-800">
                                            {format(new Date(application.created_at), 'dd MMMM yyyy', { locale: id })}
                                        </p>
                                    </div>
                                    <div>
                                        <Label className="text-sm text-gray-500">Nomor Aplikasi</Label>
                                        <p className="font-medium text-gray-800">{application.application_number}</p>
                                    </div>
                                </div>

                                {/* Verification Info */}
                                {application.admin && (
                                    <div className="mt-6 border-t border-gray-200 pt-6">
                                        <h3 className="mb-3 text-sm font-medium text-gray-700">Informasi Verifikasi</h3>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <div>
                                                <Label className="text-xs font-normal text-gray-500">Admin</Label>
                                                <p className="font-medium text-gray-800">{application.admin.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {application.notes && (
                                    <div className="mt-4 rounded-lg bg-gray-50 p-3">
                                        <Label className="text-sm text-gray-500">Catatan</Label>
                                        <p className="mt-1 text-gray-800">{application.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents">
                        <Card className="border-purple-100 bg-white/95 shadow-md">
                            <CardHeader>
                                <CardTitle>Dokumen Aplikasi</CardTitle>
                                <CardDescription>Daftar dokumen yang terkait dengan aplikasi</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Application Form */}
                                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-blue-100 p-2">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Formulir Aplikasi</p>
                                            <p className="text-sm text-gray-500">Formulir permohonan IIN Nasional</p>
                                        </div>
                                    </div>
                                    {application.application_form_path && (
                                        <Button variant="outline" size="sm" onClick={() => downloadFile('application_form')}>
                                            <Download className="mr-1 h-4 w-4" />
                                            Download
                                        </Button>
                                    )}
                                </div>

                                {/* Requirements Archive */}
                                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-purple-100 p-2">
                                            <FileText className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Dokumen Persyaratan</p>
                                            <p className="text-sm text-gray-500">Dokumen persyaratan dalam format ZIP/RAR</p>
                                        </div>
                                    </div>
                                    {application.requirements_archive_path ? (
                                        <Button variant="outline" size="sm" onClick={() => downloadFile('requirements_archive')}>
                                            <Download className="mr-1 h-4 w-4" />
                                            Download
                                        </Button>
                                    ) : (
                                        <span className="text-sm text-gray-400">Tidak ada</span>
                                    )}
                                </div>

                                {/* Payment Proof (Legacy) */}
                                {application.payment_proof_path && (
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-green-100 p-2">
                                                <CreditCard className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Bukti Pembayaran (Legacy)</p>
                                                <p className="text-sm text-gray-500">Bukti pembayaran telah diupload</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => downloadFile('payment_proof')}>
                                            <Download className="mr-1 h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                )}

                                {/* Payment Proof Documents (User Uploaded) */}
                                {application.payment_proof_documents && application.payment_proof_documents.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-green-100 p-2">
                                                <CreditCard className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Bukti Pembayaran User</p>
                                                <p className="text-sm text-gray-500">
                                                    {application.payment_proof_documents.length} file diupload pada{' '}
                                                    {application.payment_proof_uploaded_at
                                                        ? format(new Date(application.payment_proof_uploaded_at), 'dd MMMM yyyy', { locale: id })
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        {application.payment_proof_documents.map((document: PaymentDocument, index: number) => (
                                            <div key={index} className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">{document.original_name}</span>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => downloadPaymentProof(index)}>
                                                    <Download className="mr-1 h-3 w-3" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* No Payment Proof */}
                                {!application.payment_proof_path && (!application.payment_proof_documents || application.payment_proof_documents.length === 0) && (
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-gray-100 p-2">
                                                <CreditCard className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Bukti Pembayaran</p>
                                                <p className="text-sm text-gray-500">Belum ada bukti pembayaran</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Documents */}
                                {application.payment_documents && application.payment_documents.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-blue-100 p-2">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Dokumen Pembayaran</p>
                                                <p className="text-sm text-gray-500">
                                                    {application.payment_documents.length} dokumen diupload pada{' '}
                                                    {application.payment_documents_uploaded_at
                                                        ? format(new Date(application.payment_documents_uploaded_at), 'dd MMMM yyyy', { locale: id })
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        {application.payment_documents.map((document: PaymentDocument, index: number) => (
                                            <div key={index} className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">{document.original_name}</span>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => downloadPaymentDocument(index)}>
                                                    <Download className="mr-1 h-3 w-3" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Field Verification Documents */}
                                {application.field_verification_documents && application.field_verification_documents.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-indigo-100 p-2">
                                                <Shield className="h-5 w-5 text-indigo-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Dokumen Verifikasi Lapangan</p>
                                                <p className="text-sm text-gray-500">
                                                    {application.field_verification_documents.length} dokumen diupload pada{' '}
                                                    {application.field_verification_documents_uploaded_at
                                                        ? format(new Date(application.field_verification_documents_uploaded_at), 'dd MMMM yyyy', { locale: id })
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        {application.field_verification_documents.map((document: PaymentDocument, index: number) => (
                                            <div key={index} className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">{document.original_name}</span>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => downloadFieldVerificationDocument(index)}>
                                                    <Download className="mr-1 h-3 w-3" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Certificate */}
                                {application.status === 'terbit' && (
                                    <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-green-100 p-2">
                                                <Award className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Sertifikat IIN</p>
                                                <p className="text-sm text-gray-500">Sertifikat IIN Nasional</p>
                                            </div>
                                        </div>
                                        {application.can_download_certificate && (
                                            <Button variant="outline" size="sm" onClick={() => downloadFile('certificate')}>
                                                <Download className="mr-1 h-4 w-4" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="status">
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
                                                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                                            log.status_to === 'perbaikan'
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
                                                            className={`${
                                                                log.status_to === 'perbaikan'
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
                                                            {log.status_to === 'pengajuan' ? (
                                                                <FileText className="h-4 w-4" />
                                                            ) : log.status_to === 'perbaikan' ? (
                                                                <AlertCircle className="h-4 w-4" />
                                                            ) : log.status_to === 'pembayaran' ? (
                                                                <CreditCard className="h-4 w-4" />
                                                            ) : log.status_to === 'verifikasi-lapangan' ? (
                                                                <Shield className="h-4 w-4" />
                                                            ) : log.status_to === 'menunggu-terbit' ? (
                                                                <Clock className="h-4 w-4" />
                                                            ) : log.status_to === 'terbit' ? (
                                                                <Award className="h-4 w-4" />
                                                            ) : (
                                                                <Clock className="h-4 w-4" />
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="mb-1 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                                                            <span className="font-medium text-gray-900">
                                                                {log.status_from
                                                                    ? `Status diubah dari ${getStatusLabel(log.status_from)} menjadi ${getStatusLabel(log.status_to)}`
                                                                    : `Status awal: ${getStatusLabel(log.status_to)}`}
                                                            </span>
                                                            <span className="text-sm text-gray-500">{format(new Date(log.created_at), 'dd MMMM yyyy', { locale: id })}</span>
                                                        </div>
                                                        <div className="mb-2 flex items-center gap-2 text-sm text-gray-700">
                                                            <Shield className="h-3.5 w-3.5" />
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





                    {canIssueIIN && (
                        <TabsContent value="issue">
                            <Card className="border-green-200 bg-white/95 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-green-800">Terbitkan IIN Nasional</CardTitle>
                                    <CardDescription>Proses penerbitan IIN untuk aplikasi yang telah melewati verifikasi lapangan</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Alert className="border-green-200 bg-green-50">
                                        <Award className="h-4 w-4 text-green-600" />
                                        <AlertTitle className="text-green-800">Konfirmasi Penerbitan</AlertTitle>
                                        <AlertDescription className="text-green-700">
                                            Pastikan semua dokumen dan verifikasi telah lengkap sebelum menerbitkan IIN.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="iin_number" className="text-sm font-medium text-gray-700">
                                                Nomor IIN <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="iin_number"
                                                value={iinNumber}
                                                onChange={(e) => setIinNumber(e.target.value)}
                                                placeholder="Masukkan nomor IIN"
                                                className="mt-1"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Nomor IIN yang akan diterbitkan</p>
                                        </div>

                                        <div>
                                            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                                                Catatan (Opsional)
                                            </Label>
                                            <Textarea
                                                id="notes"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Catatan penerbitan IIN..."
                                                rows={3}
                                                className="mt-1"
                                            />
                                        </div>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full bg-green-600 hover:bg-green-700" disabled={!iinNumber.trim() || loading}>
                                                    <Award className="mr-2 h-4 w-4" />
                                                    Terbitkan IIN Nasional
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Konfirmasi Penerbitan IIN</DialogTitle>
                                                    <DialogDescription>
                                                        Apakah Anda yakin ingin menerbitkan IIN dengan nomor <strong>{iinNumber}</strong> untuk
                                                        aplikasi ini? Tindakan ini tidak dapat dibatalkan.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Batal</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button
                                                            onClick={handleIssueIIN}
                                                            className="bg-green-600 hover:bg-green-700"
                                                            disabled={loading}
                                                        >
                                                            {loading ? 'Memproses...' : 'Ya, Terbitkan IIN'}
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {canUploadCertificate && (
                        <TabsContent value="upload-certificate">
                            <Card className="border-orange-200 bg-white/95 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-orange-800">Upload Sertifikat IIN</CardTitle>
                                    <CardDescription>
                                        Upload dokumen sertifikat IIN untuk aplikasi yang sudah dalam status menunggu terbit
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Alert className="border-orange-200 bg-orange-50">
                                        <Upload className="h-4 w-4 text-orange-600" />
                                        <AlertTitle className="text-orange-800">Upload Dokumen Sertifikat</AlertTitle>
                                        <AlertDescription className="text-orange-700">
                                            Silakan upload file sertifikat IIN yang sudah diterbitkan. File yang didukung: PDF, JPG, PNG.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="certificate_file" className="text-sm font-medium text-gray-700">
                                                File Sertifikat <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="certificate_file"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                                                className="mt-1"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Format yang didukung: PDF, JPG, PNG. Maksimal 10MB.</p>
                                        </div>

                                        {certificateFile && (
                                            <div className="rounded-lg bg-gray-50 p-3">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-800">{certificateFile.name}</span>
                                                    <span className="text-xs text-gray-500">
                                                        ({(certificateFile.size / 1024 / 1024).toFixed(2)} MB)
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="w-full bg-orange-600 hover:bg-orange-700"
                                                    disabled={!certificateFile || uploadingCertificate}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload Sertifikat IIN
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Konfirmasi Upload Sertifikat</DialogTitle>
                                                    <DialogDescription>
                                                        Apakah Anda yakin ingin mengupload file <strong>{certificateFile?.name}</strong> sebagai
                                                        sertifikat IIN untuk aplikasi ini?
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Batal</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button
                                                            onClick={handleCertificateUpload}
                                                            className="bg-orange-600 hover:bg-orange-700"
                                                            disabled={uploadingCertificate}
                                                        >
                                                            {uploadingCertificate ? 'Mengupload...' : 'Ya, Upload Sertifikat'}
                                                        </Button>
                                                    </DialogClose>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
