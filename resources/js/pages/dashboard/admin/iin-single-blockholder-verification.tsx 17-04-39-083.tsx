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
import { AlertCircle, ArrowLeft, Award, CheckCircle, Clock, CreditCard, Download, FileText, Shield, Upload, X } from 'lucide-react';
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
    iin_range?: any;
    notes?: string;
    application_form_path?: string;
    requirements_archive_path?: string;
    payment_proof_path?: string;
    payment_proof_documents?: PaymentDocument[];
    certificate_path?: string;
    additional_documents?: PaymentDocument[];
    payment_verified_at?: string;
    payment_verified_at_stage_2?: string;
    field_verification_at?: string;
    issued_at?: string;
    can_upload_payment_proof: boolean;
    can_download_certificate: boolean;
    payment_documents?: string[];
    payment_documents_uploaded_at?: string;
    payment_documents_stage_2?: string[];
    payment_documents_uploaded_at_stage_2?: string;
    payment_proof_documents_stage_2?: PaymentDocument[];
    payment_proof_uploaded_at_stage_2?: string;
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

export default function AdminIinSingleBlockholderVerification({ application, statusLogs, auth }: Props) {
    const [activeTab, setActiveTab] = useState('detail');
    const [notes, setNotes] = useState('');
    const [iinNumber, setIinNumber] = useState(application.iin_number || '');
    const [loading, setLoading] = useState(false);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [uploadingCertificate, setUploadingCertificate] = useState(false);
    const [paymentDocuments, setPaymentDocuments] = useState<File[]>([]);
    const [paymentDocumentsForStatusChange, setPaymentDocumentsForStatusChange] = useState<File[]>([]);
    const [uploadingPaymentDocuments, setUploadingPaymentDocuments] = useState(false);
    const [statusNotes, setStatusNotes] = useState('');
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [fieldVerificationDocuments, setFieldVerificationDocuments] = useState<File[]>([]);
    const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);

    // Admin can only issue IIN when status is "menunggu-terbit"
    // This ensures payment stage 2 documents have been uploaded
    const canIssueIIN = application.status === 'menunggu-terbit';

    // Certificate upload is now integrated with IIN issuance
    // const canUploadCertificate = application.status === 'terbit';

    // Admin can upload payment documents when status is pembayaran only
    // Hide upload tab when status is pembayaran-tahap-2 as requested
    const canUploadPaymentDocuments = application.status === 'pembayaran';

    // Admin can change to field verification when status is "pembayaran"
    const canChangeToFieldVerification = application.status === 'pembayaran';

    // Admin can complete field verification when status is "verifikasi-lapangan" and field verification hasn't been completed
    const canCompleteFieldVerification = application.status === 'verifikasi-lapangan' && !application.field_verification_at;

    // Admin can change status from pembayaran-tahap-2 to menunggu-terbit when user has uploaded payment proof stage 2
    const canChangeToWaitingForIssuance =
        application.status === 'pembayaran-tahap-2' &&
        application.payment_proof_documents_stage_2 &&
        application.payment_proof_documents_stage_2.length > 0;

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'pengajuan':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'perbaikan':
                return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
            case 'pembayaran':
                return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
            case 'pembayaran-tahap-2':
                return 'bg-red-100 text-red-800 hover:bg-red-200';
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
                return 'Menunggu Pembayaran Tahap 1';
            case 'pembayaran-tahap-2':
                return 'Menunggu Pembayaran Tahap 2';
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

    const handleStatusUpdate = async (status: string) => {
        if (status === application.status) {
            showErrorToast('Status tidak berubah');
            return;
        }

        setUpdatingStatus(true);

        try {
            router.post(
                route('iin-single-blockholder.update-status', application.id),
                {
                    status: status,
                    notes: statusNotes || `Status diubah ke ${getStatusLabel(status)}`,
                },
                {
                    onSuccess: () => {
                        showSuccessToast(`Status berhasil diubah ke ${getStatusLabel(status)}`);
                        setStatusNotes('');
                    },
                    onError: (errors) => {
                        console.error('Error updating status:', errors);
                        showErrorToast('Gagal mengubah status. Silakan coba lagi.');
                    },
                    onFinish: () => {
                        setUpdatingStatus(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error updating status:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setUpdatingStatus(false);
        }
    };

    const handleIssueIIN = async () => {
        if (!iinNumber.trim()) {
            showErrorToast('Nomor IIN harus diisi');
            return;
        }

        if (!certificateFile) {
            showErrorToast('Silakan pilih file sertifikat IIN');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('status', 'terbit');
        formData.append('notes', notes || 'IIN diterbitkan oleh admin');
        formData.append('iin_number', iinNumber.trim());
        formData.append('certificate', certificateFile);

        // Add additional documents if any
        additionalDocuments.forEach((file, index) => {
            formData.append(`additional_documents[${index}]`, file);
        });

        try {
            router.post(route('iin-single-blockholder.issue-iin-with-certificate', application.id), formData, {
                onSuccess: () => {
                    showSuccessToast('IIN berhasil diterbitkan dan sertifikat diupload');
                    setCertificateFile(null);
                    setAdditionalDocuments([]);
                },
                onError: (errors) => {
                    console.error('Error issuing IIN:', errors);
                    showErrorToast('Gagal menerbitkan IIN. Silakan coba lagi.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error issuing IIN:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    // Certificate upload is now integrated with IIN issuance
    // handleCertificateUpload function removed

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

        // Add stage parameter based on current status
        const stage = application.status === 'pembayaran-tahap-2' ? '2' : '1';
        formData.append('stage', stage);

        try {
            router.post(route('iin-single-blockholder.upload-payment-documents', application.id), formData, {
                onSuccess: () => {
                    const stageText = stage === '2' ? 'Tahap 2' : 'Tahap 1';
                    showSuccessToast(`Dokumen pembayaran ${stageText} berhasil diupload`);
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

    const handleStatusChangeToFieldVerification = async () => {
        if (fieldVerificationDocuments.length === 0) {
            showErrorToast('Silakan upload minimal satu dokumen verifikasi lapangan');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('status', 'verifikasi-lapangan');
        formData.append('notes', statusNotes || 'Status diubah ke verifikasi lapangan oleh admin');
        formData.append('upload_and_change_status', '1');

        fieldVerificationDocuments.forEach((file, index) => {
            formData.append(`field_verification_documents[${index}]`, file);
        });

        try {
            router.post(route('iin-single-blockholder.upload-field-verification-documents', application.id), formData, {
                onSuccess: () => {
                    showSuccessToast('Status berhasil diubah ke verifikasi lapangan');
                    setStatusNotes('');
                    setFieldVerificationDocuments([]);
                },
                onError: (errors) => {
                    console.error('Error changing status:', errors);
                    showErrorToast('Gagal mengubah status. Silakan coba lagi.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error changing status:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleCompleteFieldVerificationWithPayment = async () => {
        if (paymentDocuments.length === 0) {
            showErrorToast('Silakan upload minimal satu dokumen pembayaran tahap 2');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        paymentDocuments.forEach((file, index) => {
            formData.append(`payment_documents[${index}]`, file);
        });

        // Add stage parameter for stage 2
        formData.append('stage', '2');
        formData.append('complete_field_verification', '1');
        formData.append('notes', statusNotes || 'Verifikasi lapangan diselesaikan dengan upload dokumen pembayaran tahap 2');

        try {
            router.post(route('iin-single-blockholder.upload-payment-documents', application.id), formData, {
                onSuccess: () => {
                    showSuccessToast('Verifikasi lapangan berhasil diselesaikan dan dokumen pembayaran tahap 2 diupload');
                    setPaymentDocuments([]);
                    setStatusNotes('');
                },
                onError: (errors) => {
                    console.error('Error completing field verification with payment:', errors);
                    showErrorToast('Gagal menyelesaikan verifikasi lapangan. Silakan coba lagi.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error completing field verification with payment:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    // New function to handle status change from verifikasi-lapangan to pembayaran-tahap-2
    const handleStatusChangeToPaymentStage2 = async () => {
        if (paymentDocuments.length === 0) {
            showErrorToast('Silakan upload minimal satu dokumen pembayaran tahap 2');
            return;
        }

        setLoading(true);

        const formData = new FormData();
        paymentDocuments.forEach((file, index) => {
            formData.append(`payment_documents[${index}]`, file);
        });

        // Add stage parameter for stage 2
        formData.append('stage', '2');
        formData.append('status', 'pembayaran-tahap-2');
        formData.append('notes', statusNotes || 'Proses ke pembayaran tahap 2');

        try {
            router.post(route('iin-single-blockholder.upload-payment-documents', application.id), formData, {
                onSuccess: () => {
                    showSuccessToast('Status berhasil diubah ke pembayaran tahap 2');
                    setPaymentDocuments([]);
                    setStatusNotes('');
                },
                onError: (errors) => {
                    console.error('Error changing status to payment stage 2:', errors);
                    showErrorToast('Gagal mengubah status ke pembayaran tahap 2. Silakan coba lagi.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error changing status to payment stage 2:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const addPaymentDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                if (file.size <= 10 * 1024 * 1024) {
                    // 10MB limit
                    setPaymentDocuments((prev) => [...prev, file]);
                } else {
                    showErrorToast(`File ${file.name} terlalu besar. Maksimal 10MB per file.`);
                }
            });
        }
        // Reset input value to allow selecting the same files again
        event.target.value = '';
    };

    const removePaymentDocument = (index: number) => {
        setPaymentDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const addPaymentDocumentForStatusChange = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            showErrorToast(`File ${file.name} terlalu besar. Maksimal 10MB per file.`);
            return;
        }
        setPaymentDocumentsForStatusChange((prev) => [...prev, file]);
    };

    const removePaymentDocumentForStatusChange = (index: number) => {
        setPaymentDocumentsForStatusChange((prev) => prev.filter((_, i) => i !== index));
    };

    const downloadPaymentDocument = (index: number, stage?: string) => {
        const params: any = {
            iinSingleBlockholder: application.id,
            index: index,
        };

        if (stage) {
            params.stage = stage;
        }

        window.open(route('iin-single-blockholder.download-payment-document', params), '_blank');
    };

    const downloadFile = (type: string, stage?: string) => {
        const params: any = {
            iinSingleBlockholder: application.id,
            type: type,
        };

        if (stage) {
            params.stage = stage;
        }

        window.open(route('iin-single-blockholder.download-file', params), '_blank');
    };

    const addFieldVerificationDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files) {
            Array.from(files).forEach((file) => {
                if (file.size <= 10 * 1024 * 1024) {
                    // 10MB limit
                    setFieldVerificationDocuments((prev) => [...prev, file]);
                } else {
                    showErrorToast(`File ${file.name} terlalu besar. Maksimal 10MB per file.`);
                }
            });
        }
        // Reset input value to allow selecting the same files again
        event.target.value = '';
    };

    const removeFieldVerificationDocument = (index: number) => {
        setFieldVerificationDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const downloadFieldVerificationDocument = (index: number) => {
        window.open(
            route('iin-single-blockholder.download-field-verification-document', {
                iinSingleBlockholder: application.id,
                index: index,
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
                        <Link href={route('dashboard.admin.pengajuan')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-2xl font-bold text-transparent">
                                {application.application_number}
                            </h1>
                            <p className="text-gray-600">Panel Admin - Single IIN/Blockholder</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Show status badge only when no action buttons are displayed */}
                        {application.status !== 'pengajuan' &&
                            application.status !== 'pembayaran' &&
                            application.status !== 'verifikasi-lapangan' &&
                            application.status !== 'pembayaran-tahap-2' && (
                                <Badge className={getStatusBadgeClass(application.status)}>{getStatusLabel(application.status)}</Badge>
                            )}
                        {application.iin_number && (
                            <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                                IIN: {application.iin_number}
                            </Badge>
                        )}

                        {/* Status Pengajuan - Tombol Perbaikan dan Proses ke Pembayaran Tahap 1 */}
                        {application.status === 'pengajuan' && (
                            <>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" disabled={updatingStatus}>
                                            <ArrowLeft className="mr-1 h-4 w-4" />
                                            Kembalikan untuk Perbaikan
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Konfirmasi Kembalikan untuk Perbaikan</DialogTitle>
                                            <DialogDescription>
                                                Apakah Anda yakin ingin mengembalikan aplikasi ini untuk <strong>perbaikan</strong>? Pemohon akan
                                                diminta untuk memperbaiki dokumen atau informasi yang diperlukan.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label htmlFor="revision_notes" className="text-sm font-medium text-gray-700">
                                                    Catatan Perbaikan (Opsional)
                                                </Label>
                                                <Textarea
                                                    id="revision_notes"
                                                    value={statusNotes}
                                                    onChange={(e) => setStatusNotes(e.target.value)}
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
                                                    onClick={async () => {
                                                        await handleStatusUpdate('perbaikan');
                                                    }}
                                                    className="bg-red-600 text-white hover:bg-red-700"
                                                    disabled={updatingStatus}
                                                >
                                                    {updatingStatus ? 'Memproses...' : 'Ya, Kembalikan untuk Perbaikan'}
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" disabled={updatingStatus}>
                                            <Clock className="mr-1 h-4 w-4" />
                                            Proses ke Pembayaran Tahap 1
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>Ubah Status ke Pembayaran</DialogTitle>
                                            <DialogDescription>
                                                Upload dokumen pembayaran dan ubah status aplikasi ke <strong>pembayaran</strong>. Dokumen ini akan
                                                tersedia untuk diunduh oleh pemohon.
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
                                                            files.forEach((file) => addPaymentDocumentForStatusChange(file));
                                                            e.target.value = ''; // Reset input
                                                        }}
                                                        className="mt-1"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Format yang didukung: PDF, DOC, DOCX, JPG, PNG. Maksimal 10MB per file. Anda dapat memilih
                                                        beberapa file sekaligus.
                                                    </p>
                                                </div>

                                                {/* Selected Files */}
                                                {paymentDocumentsForStatusChange.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-gray-700">File yang Dipilih:</Label>
                                                        {paymentDocumentsForStatusChange.map((file, index) => (
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
                                                                    onClick={() => removePaymentDocumentForStatusChange(index)}
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
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                                                            >
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
                                                <Label htmlFor="payment_notes" className="text-sm font-medium text-gray-700">
                                                    Catatan (Opsional)
                                                </Label>
                                                <Textarea
                                                    id="payment_notes"
                                                    value={statusNotes}
                                                    onChange={(e) => setStatusNotes(e.target.value)}
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
                                                    setUpdatingStatus(true);

                                                    try {
                                                        // Siapkan FormData untuk upload dokumen dan perubahan status bersamaan
                                                        const formData = new FormData();

                                                        // Tambahkan dokumen pembayaran jika ada
                                                        if (paymentDocumentsForStatusChange.length > 0) {
                                                            paymentDocumentsForStatusChange.forEach((file, index) => {
                                                                formData.append(`payment_documents[${index}]`, file);
                                                            });
                                                        }

                                                        // Tambahkan parameter untuk perubahan status
                                                        formData.append('status', 'pembayaran');
                                                        formData.append('notes', statusNotes || 'Status diubah ke pembayaran oleh admin');
                                                        formData.append('upload_and_change_status', '1');

                                                        // Kirim request untuk upload dokumen dan ubah status bersamaan
                                                        router.post(
                                                            route('iin-single-blockholder.upload-payment-documents', application.id),
                                                            formData,
                                                            {
                                                                onSuccess: () => {
                                                                    showSuccessToast('Dokumen berhasil diupload dan status diubah ke pembayaran');
                                                                    setPaymentDocumentsForStatusChange([]);
                                                                    setStatusNotes('');
                                                                },
                                                                onError: (errors) => {
                                                                    console.error('Error uploading documents and changing status:', errors);
                                                                    showErrorToast(
                                                                        'Gagal mengupload dokumen atau mengubah status. Silakan coba lagi.',
                                                                    );
                                                                },
                                                                onFinish: () => {
                                                                    setUpdatingStatus(false);
                                                                },
                                                            },
                                                        );
                                                    } catch (error) {
                                                        console.error('Error in upload and status change:', error);
                                                        showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
                                                        setUpdatingStatus(false);
                                                    }
                                                }}
                                                className="bg-blue-600 text-white hover:bg-blue-700"
                                                disabled={
                                                    updatingStatus ||
                                                    (paymentDocumentsForStatusChange.length === 0 &&
                                                        (!application.payment_documents || application.payment_documents.length === 0))
                                                }
                                            >
                                                {updatingStatus ? 'Memproses...' : 'Upload & Ubah Status'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}

                        {/* Status Pembayaran - Tombol Proses ke Verifikasi Lapangan */}
                        {application.status === 'pembayaran' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={loading}>
                                        <Shield className="mr-1 h-4 w-4" />
                                        Proses ke Verifikasi Lapangan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
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
                                                    onChange={addFieldVerificationDocument}
                                                    className="mt-1"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Format yang didukung: PDF, DOC, DOCX, JPG, PNG. Maksimal 10MB per file. Anda dapat memilih
                                                    beberapa file sekaligus.
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
                                                value={statusNotes}
                                                onChange={(e) => setStatusNotes(e.target.value)}
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
                                                className="bg-indigo-600 text-white hover:bg-indigo-700"
                                                disabled={loading || fieldVerificationDocuments.length === 0}
                                            >
                                                {loading ? 'Memproses...' : 'Proses ke Verifikasi Lapangan'}
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Status Verifikasi Lapangan - Tombol Proses ke Pembayaran Tahap 2 */}
                        {application.status === 'verifikasi-lapangan' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={loading}>
                                        <CheckCircle className="mr-1 h-4 w-4" />
                                        Proses ke Pembayaran Tahap 2
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Proses ke Pembayaran Tahap 2</DialogTitle>
                                        <DialogDescription>
                                            Upload dokumen pembayaran tahap 2 dan ubah status aplikasi ke <strong>pembayaran tahap 2</strong>.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        {/* Upload Dokumen Pembayaran Tahap 2 */}
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="payment_documents_stage2" className="text-sm font-medium text-gray-700">
                                                    Dokumen Pembayaran Tahap 2 <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="payment_documents_stage2"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    multiple
                                                    onChange={addPaymentDocument}
                                                    className="mt-1"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Format yang didukung: PDF, DOC, DOCX, JPG, PNG. Maksimal 10MB per file. Anda dapat memilih
                                                    beberapa file sekaligus.
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
                                        </div>

                                        {/* Catatan */}
                                        <div>
                                            <Label htmlFor="completion_notes" className="text-sm font-medium text-gray-700">
                                                Catatan (Opsional)
                                            </Label>
                                            <Textarea
                                                id="completion_notes"
                                                value={statusNotes}
                                                onChange={(e) => setStatusNotes(e.target.value)}
                                                placeholder="Catatan untuk pembayaran tahap 2..."
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
                                                onClick={handleStatusChangeToPaymentStage2}
                                                className="bg-green-600 text-white hover:bg-green-700"
                                                disabled={loading || paymentDocuments.length === 0}
                                            >
                                                {loading ? 'Memproses...' : 'Proses ke Pembayaran Tahap 2'}
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {/* Status Pembayaran Tahap 2 - Tombol Terbitkan IIN */}
                        {application.status === 'pembayaran-tahap-2' &&
                            application.payment_proof_documents_stage_2 &&
                            application.payment_proof_documents_stage_2.length > 0 && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm" disabled={updatingStatus}>
                                            <CheckCircle className="mr-1 h-4 w-4" />
                                            Terbitkan IIN
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Terbitkan IIN</DialogTitle>
                                            <DialogDescription>
                                                Ubah status aplikasi menjadi <strong>menunggu terbit</strong>. User telah mengunggah bukti pembayaran
                                                tahap 2.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label htmlFor="waiting_issuance_notes" className="text-sm font-medium text-gray-700">
                                                    Catatan (Opsional)
                                                </Label>
                                                <Textarea
                                                    id="waiting_issuance_notes"
                                                    value={statusNotes}
                                                    onChange={(e) => setStatusNotes(e.target.value)}
                                                    placeholder="Catatan untuk perubahan status ke menunggu terbit..."
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
                                                    onClick={async () => {
                                                        await handleStatusUpdate('menunggu-terbit');
                                                    }}
                                                    className="bg-cyan-600 text-white hover:bg-cyan-700"
                                                    disabled={updatingStatus}
                                                >
                                                    {updatingStatus ? 'Memproses...' : 'Ya, Terbitkan IIN'}
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}

                        {canCompleteFieldVerification && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={loading}>
                                        <CheckCircle className="mr-1 h-4 w-4" />
                                        Selesaikan Verifikasi Lapangan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Selesaikan Verifikasi Lapangan</DialogTitle>
                                        <DialogDescription>
                                            Upload dokumen pembayaran tahap 2 dan selesaikan verifikasi lapangan. Status aplikasi akan berubah menjadi{' '}
                                            <strong>menunggu terbit</strong>.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        {/* Upload Dokumen Pembayaran Tahap 2 */}
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="payment_documents_stage2" className="text-sm font-medium text-gray-700">
                                                    Dokumen Pembayaran Tahap 2 <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="payment_documents_stage2"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    multiple
                                                    onChange={addPaymentDocument}
                                                    className="mt-1"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Format yang didukung: PDF, DOC, DOCX, JPG, PNG. Maksimal 10MB per file. Anda dapat memilih
                                                    beberapa file sekaligus.
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
                                        </div>

                                        {/* Catatan */}
                                        <div>
                                            <Label htmlFor="completion_notes" className="text-sm font-medium text-gray-700">
                                                Catatan (Opsional)
                                            </Label>
                                            <Textarea
                                                id="completion_notes"
                                                value={statusNotes}
                                                onChange={(e) => setStatusNotes(e.target.value)}
                                                placeholder="Catatan untuk penyelesaian verifikasi lapangan..."
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
                                                onClick={handleCompleteFieldVerificationWithPayment}
                                                className="bg-green-600 text-white hover:bg-green-700"
                                                disabled={loading || paymentDocuments.length === 0}
                                            >
                                                {loading ? 'Memproses...' : 'Selesaikan Verifikasi Lapangan'}
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Alert for Change to Waiting for Issuance */}
                {canChangeToWaitingForIssuance && (
                    <Alert className="border-cyan-200 bg-cyan-50">
                        <CheckCircle className="h-4 w-4 text-cyan-600" />
                        <AlertTitle className="text-cyan-800">Siap Ubah ke Menunggu Terbit</AlertTitle>
                        <AlertDescription className="text-cyan-700">
                            User telah mengunggah bukti pembayaran tahap 2. Aplikasi siap untuk diubah ke status <strong>menunggu terbit</strong>.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Status Alert for Admin - Hidden when action buttons are available */}
                {!canChangeToFieldVerification && !canCompleteFieldVerification && !canChangeToWaitingForIssuance && (
                    <>
                        {canIssueIIN && (
                            <Alert className="border-indigo-200 bg-indigo-50">
                                <Shield className="h-4 w-4 text-indigo-600" />
                                <AlertTitle className="text-indigo-800">Siap untuk Diterbitkan</AlertTitle>
                                <AlertDescription className="text-indigo-700">
                                    Aplikasi ini telah melewati verifikasi lapangan dan siap untuk diterbitkan IIN-nya.
                                </AlertDescription>
                            </Alert>
                        )}

                        {canUploadPaymentDocuments && (
                            <Alert className="border-blue-200 bg-blue-50">
                                <Upload className="h-4 w-4 text-blue-600" />
                                <AlertTitle className="text-blue-800">Siap Upload Dokumen Pembayaran</AlertTitle>
                                <AlertDescription className="text-blue-700">
                                    Aplikasi telah melewati verifikasi lapangan dan siap untuk upload dokumen pembayaran.
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
                    </>
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
                        {canUploadPaymentDocuments && (
                            <TabsTrigger
                                value="upload-payment-documents"
                                className={
                                    activeTab === 'upload-payment-documents'
                                        ? 'from-blue-600 to-blue-800 data-[state=active]:bg-gradient-to-r data-[state=active]:text-white'
                                        : 'text-blue-700'
                                }
                            >
                                <Upload className="mr-1 h-4 w-4" />
                                Upload Pembayaran
                            </TabsTrigger>
                        )}
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
                    </TabsList>

                    <TabsContent value="detail">
                        <Card className="border-purple-100 bg-white/95 shadow-md">
                            <CardHeader>
                                <CardTitle>Informasi Pemohon</CardTitle>
                                <CardDescription>Detail lengkap pemohon Single IIN/Blockholder</CardDescription>
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
                                            <p className="text-sm text-gray-500">Formulir permohonan Single IIN/Blockholder</p>
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

                                {/* Payment Proof Tahap 1 */}
                                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="rounded-lg bg-green-100 p-2">
                                            <CreditCard className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">Bukti Pembayaran Tahap 1</p>
                                            <p className="text-sm text-gray-500">
                                                {application.payment_proof_path ||
                                                (application.payment_proof_documents && application.payment_proof_documents.length > 0)
                                                    ? 'Bukti pembayaran tahap 1 telah diupload'
                                                    : 'Belum ada bukti pembayaran tahap 1'}
                                            </p>
                                        </div>
                                    </div>
                                    {(application.payment_proof_path ||
                                        (application.payment_proof_documents && application.payment_proof_documents.length > 0)) && (
                                        <Button variant="outline" size="sm" onClick={() => downloadFile('payment_proof', '1')}>
                                            <Download className="mr-1 h-4 w-4" />
                                            Download
                                        </Button>
                                    )}
                                </div>

                                {/* Payment Proof Tahap 2 */}
                                {(application.payment_proof_documents_stage_2 ||
                                    application.status === 'pembayaran-tahap-2' ||
                                    application.payment_verified_at_stage_2) && (
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-red-100 p-2">
                                                <CreditCard className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Bukti Pembayaran Tahap 2</p>
                                                <p className="text-sm text-gray-500">
                                                    {application.payment_proof_documents_stage_2
                                                        ? 'Bukti pembayaran tahap 2 telah diupload'
                                                        : 'Belum ada bukti pembayaran tahap 2'}
                                                </p>
                                            </div>
                                        </div>
                                        {application.payment_proof_documents_stage_2 && (
                                            <Button variant="outline" size="sm" onClick={() => downloadFile('payment_proof', '2')}>
                                                <Download className="mr-1 h-4 w-4" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                )}

                                {/* Payment Documents Tahap 1 */}
                                {application.payment_documents && application.payment_documents.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-purple-100 p-2">
                                                <FileText className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Dokumen Pembayaran Tahap 1</p>
                                                <p className="text-sm text-gray-500">
                                                    {application.payment_documents.length} dokumen diupload pada{' '}
                                                    {application.payment_documents_uploaded_at
                                                        ? format(new Date(application.payment_documents_uploaded_at), 'dd MMMM yyyy', { locale: id })
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        {application.payment_documents.map((doc, index) => (
                                            <div
                                                key={index}
                                                className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">Dokumen {index + 1}</span>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => downloadPaymentDocument(index, '1')}>
                                                    <Download className="mr-1 h-3 w-3" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Payment Documents Tahap 2 */}
                                {application.payment_documents_stage_2 && application.payment_documents_stage_2.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-red-100 p-2">
                                                <FileText className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Dokumen Pembayaran Tahap 2</p>
                                                <p className="text-sm text-gray-500">
                                                    {application.payment_documents_stage_2.length} dokumen diupload pada{' '}
                                                    {application.payment_documents_uploaded_at_stage_2
                                                        ? format(new Date(application.payment_documents_uploaded_at_stage_2), 'dd MMMM yyyy', {
                                                              locale: id,
                                                          })
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        {application.payment_documents_stage_2.map((doc, index) => (
                                            <div
                                                key={index}
                                                className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">Dokumen {index + 1}</span>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => downloadPaymentDocument(index, '2')}>
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
                                                <p className="text-sm text-gray-500">Sertifikat Single IIN/Blockholder</p>
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
                                                                : log.status_to === 'pembayaran' || log.status_to === 'pembayaran-tahap-2'
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
                                                                    : log.status_to === 'pembayaran' || log.status_to === 'pembayaran-tahap-2'
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
                                                            ) : log.status_to === 'pembayaran' || log.status_to === 'pembayaran-tahap-2' ? (
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
                                                            <span className="text-sm text-gray-500">
                                                                {format(new Date(log.created_at), 'dd MMMM yyyy', { locale: id })}
                                                            </span>
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

                    {canUploadPaymentDocuments && (
                        <TabsContent value="upload-payment-documents">
                            <Card className="border-blue-200 bg-white/95 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-blue-800">
                                        Upload Dokumen Pembayaran {application.status === 'pembayaran-tahap-2' ? 'Tahap 2' : 'Tahap 1'}
                                    </CardTitle>
                                    <CardDescription>
                                        Upload dokumen pembayaran {application.status === 'pembayaran-tahap-2' ? 'tahap 2' : 'tahap 1'} untuk aplikasi
                                        yang telah melewati verifikasi lapangan
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <Alert className="border-blue-200 bg-blue-50">
                                        <Upload className="h-4 w-4 text-blue-600" />
                                        <AlertTitle className="text-blue-800">
                                            Upload Dokumen Pembayaran {application.status === 'pembayaran-tahap-2' ? 'Tahap 2' : 'Tahap 1'}
                                        </AlertTitle>
                                        <AlertDescription className="text-blue-700">
                                            Silakan upload dokumen pembayaran {application.status === 'pembayaran-tahap-2' ? 'tahap 2' : 'tahap 1'}{' '}
                                            yang diperlukan. File yang didukung: PDF, JPG, PNG.
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="payment_documents" className="text-sm font-medium text-gray-700">
                                                File Dokumen Pembayaran <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="payment_documents"
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                multiple
                                                onChange={addPaymentDocument}
                                                className="mt-1"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">
                                                Format yang didukung: PDF, JPG, PNG. Maksimal 10MB per file. Anda dapat memilih beberapa file
                                                sekaligus.
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
                                                            <span className="text-sm font-medium text-gray-800">{file.name}</span>
                                                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removePaymentDocument(index)}
                                                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Already Uploaded Documents */}
                                        {((application.status === 'pembayaran' &&
                                            application.payment_documents &&
                                            application.payment_documents.length > 0) ||
                                            (application.status === 'pembayaran-tahap-2' &&
                                                application.payment_documents_stage_2 &&
                                                application.payment_documents_stage_2.length > 0)) && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">
                                                    Dokumen yang Sudah Diupload{' '}
                                                    {application.status === 'pembayaran-tahap-2' ? '(Tahap 2)' : '(Tahap 1)'}:
                                                </Label>
                                                {(application.status === 'pembayaran-tahap-2'
                                                    ? application.payment_documents_stage_2
                                                    : application.payment_documents
                                                )?.map((doc, index) => (
                                                    <div key={index} className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-green-600" />
                                                            <span className="text-sm font-medium text-gray-800">Dokumen {index + 1}</span>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                downloadPaymentDocument(
                                                                    index,
                                                                    application.status === 'pembayaran-tahap-2' ? '2' : '1',
                                                                )
                                                            }
                                                            className="h-8"
                                                        >
                                                            <Download className="mr-1 h-3 w-3" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button
                                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                                    disabled={paymentDocuments.length === 0 || uploadingPaymentDocuments}
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload Dokumen Pembayaran
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Konfirmasi Upload Dokumen Pembayaran</DialogTitle>
                                                    <DialogDescription>
                                                        Apakah Anda yakin ingin mengupload {paymentDocuments.length} dokumen pembayaran untuk aplikasi
                                                        ini?
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button variant="outline">Batal</Button>
                                                    </DialogClose>
                                                    <DialogClose asChild>
                                                        <Button
                                                            onClick={handlePaymentDocumentsUpload}
                                                            className="bg-blue-600 text-white hover:bg-blue-700"
                                                            disabled={uploadingPaymentDocuments}
                                                        >
                                                            {uploadingPaymentDocuments ? 'Mengupload...' : 'Ya, Upload Dokumen'}
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

                    {canIssueIIN && (
                        <TabsContent value="issue">
                            <Card className="border-green-200 bg-white/95 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-green-800">Terbitkan Single IIN/Blockholder</CardTitle>
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
                                            <Label htmlFor="certificate_file_issue" className="text-sm font-medium text-gray-700">
                                                File Sertifikat IIN <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="certificate_file_issue"
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

                                        <div>
                                            <Label htmlFor="additional_documents" className="text-sm font-medium text-gray-700">
                                                Dokumen Tambahan (Opsional)
                                            </Label>
                                            <Input
                                                id="additional_documents"
                                                type="file"
                                                accept=".pdf"
                                                multiple
                                                onChange={(e) => {
                                                    const files = Array.from(e.target.files || []);
                                                    setAdditionalDocuments(files);
                                                }}
                                                className="mt-1"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Format yang didukung: PDF. Maksimal 5MB per file.</p>
                                        </div>

                                        {additionalDocuments.length > 0 && (
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium text-gray-700">File Dokumen Tambahan:</Label>
                                                {additionalDocuments.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-gray-600" />
                                                            <span className="text-sm font-medium text-gray-800">{file.name}</span>
                                                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const newFiles = additionalDocuments.filter((_, i) => i !== index);
                                                                setAdditionalDocuments(newFiles);
                                                            }}
                                                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

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
                                                <Button
                                                    className="w-full bg-green-600 hover:bg-green-700"
                                                    disabled={!iinNumber.trim() || !certificateFile || loading}
                                                >
                                                    <Award className="mr-2 h-4 w-4" />
                                                    Terbitkan Single IIN/Blockholder
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Konfirmasi Penerbitan IIN</DialogTitle>
                                                    <DialogDescription>
                                                        Apakah Anda yakin ingin menerbitkan IIN dengan nomor <strong>{iinNumber}</strong> dan
                                                        mengupload sertifikat <strong>{certificateFile?.name}</strong> untuk aplikasi ini? Tindakan
                                                        ini tidak dapat dibatalkan.
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
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
