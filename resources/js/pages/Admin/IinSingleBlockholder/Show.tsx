import React, { useState, useEffect } from 'react';
import { Head, router, Link, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
    ArrowLeft,
    FileText,
    Download,
    Upload,
    Clock,
    Shield,
    Award,
    AlertCircle,
    CheckCircle,
    CreditCard,
    X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from '@/components/ui/dialog';
import DashboardLayout from '@/layouts/dashboard-layout';
import { User } from '@/types';
import { showSuccessToast, showErrorToast } from '@/lib/toast-helper';
import { route } from 'ziggy-js';

interface PaymentDocument {
    id: number;
    file_path: string;
    file_name: string;
    uploaded_at: string;
}

interface IinSingleBlockholderApplication {
    id: number;
    application_number: string;
    status: string;
    created_at: string;
    updated_at: string;
    notes?: string;
    iin_number?: string;
    issued_at?: string;
    payment_verified_at?: string;
    payment_verified_at_stage_2?: string;
    field_verification_completed_at?: string;
    application_form_path?: string;
    requirements_archive_path?: string;
    payment_proof_path?: string;
    payment_proof_documents?: string[];
    payment_proof_documents_stage_2?: string[];
    payment_documents?: string[];
    payment_documents_stage_2?: string[];
    payment_documents_uploaded_at?: string;
    payment_documents_uploaded_at_stage_2?: string;
    field_verification_documents?: string[];
    field_verification_documents_uploaded_at?: string;
    can_download_certificate?: boolean;
    user: {
        id: number;
        name: string;
        email: string;
    };
    admin?: {
        id: number;
        name: string;
        email: string;
    };
}

interface StatusLog {
    id: number;
    status_from: string | null;
    status_to: string;
    notes?: string;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    application: IinSingleBlockholderApplication;
    statusLogs: StatusLog[];
    auth: {
        user: User;
    };
}

export default function AdminIinSingleBlockholderShow({ application, statusLogs, auth }: Props) {
    const [activeTab, setActiveTab] = useState('detail');
    const [loading, setLoading] = useState(false);
    const [paymentDocuments, setPaymentDocuments] = useState<File[]>([]);
    const [fieldVerificationDocuments, setFieldVerificationDocuments] = useState<File[]>([]);
    const [uploadingPaymentDocuments, setUploadingPaymentDocuments] = useState(false);
    const [statusNotes, setStatusNotes] = useState('');

    // Form untuk terbitkan IIN menggunakan useForm
    const { data, setData, post, processing, progress } = useForm({
        certificate: null as File | null,
        notes: ''
    });

    // Check if admin can issue IIN
    const canIssueIIN = application.status === 'menunggu-terbit' && !application.iin_number;

    // Check if admin can upload payment documents
    const canUploadPaymentDocuments = application.status === 'pembayaran-tahap-2';

    // Check if admin can change to field verification
    const canChangeToFieldVerification = application.status === 'pembayaran' &&
        application.payment_documents &&
        application.payment_documents.length > 0;

    // Check if admin can complete field verification
    const canCompleteFieldVerification = application.status === 'verifikasi-lapangan';

    // Check if admin can change to waiting for issuance
    const canChangeToWaitingForIssuance = application.status === 'pembayaran-tahap-2' &&
        application.payment_documents_stage_2 &&
        application.payment_documents_stage_2.length > 0;

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'pengajuan':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'perbaikan':
                return 'bg-amber-100 text-amber-800 border-amber-200';
            case 'pembayaran':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'verifikasi-lapangan':
                return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'pembayaran-tahap-2':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'menunggu-terbit':
                return 'bg-cyan-100 text-cyan-800 border-cyan-200';
            case 'terbit':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pengajuan':
                return 'Pengajuan';
            case 'perbaikan':
                return 'Perbaikan';
            case 'pembayaran':
                return 'Pembayaran Tahap 1';
            case 'verifikasi-lapangan':
                return 'Verifikasi Lapangan';
            case 'pembayaran-tahap-2':
                return 'Pembayaran Tahap 2';
            case 'menunggu-terbit':
                return 'Menunggu Terbit';
            case 'terbit':
                return 'Terbit';
            default:
                return status;
        }
    };

    const handleStatusUpdate = async (newStatus: string, notes?: string) => {
        setLoading(true);
        try {
            await router.post(route('admin.iin-single-blockholder.update-status', application.id), {
                status: newStatus,
                notes: notes || null,
            });
            showSuccessToast('Status berhasil diperbarui');
        } catch (error) {
            console.error('Error updating status:', error);
            showErrorToast('Gagal memperbarui status');
        } finally {
            setLoading(false);
            setStatusNotes('');
        }
    };

    const handleIssueIIN = (e: React.FormEvent) => {
        e.preventDefault();
        if (!data.certificate) return;

        post(route('admin.iin-single-blockholder.upload-certificate', application.id), {
            onSuccess: () => {
                showSuccessToast('IIN berhasil diterbitkan');
                setData({
                    certificate: null,
                    notes: ''
                });
            },
            onError: () => {
                showErrorToast('Gagal menerbitkan IIN');
            }
        });
    };

    const downloadFile = (type: string, stage?: string) => {
        const url = route('iin-single-blockholder.download-file', {
            iinSingleBlockholder: application.id,
            type: type,
            ...(stage && { stage })
        });
        window.open(url, '_blank');
    };

    const downloadPaymentDocument = (index: number, stage: string) => {
        const url = route('iin-single-blockholder.download-payment-document', {
            iinSingleBlockholder: application.id,
            index: index
        });
        window.open(url, '_blank');
    };

    const downloadPaymentProof = (index: number) => {
        const url = route('iin-single-blockholder.download-payment-proof', {
            iinSingleBlockholder: application.id,
            index: index
        });
        window.open(url, '_blank');
    };

    return (
        <DashboardLayout user={auth.user} title="Admin - Detail IIN Single Blockholder">
            <Head title={`Aplikasi ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.iin-single-blockholder.index')}>
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
                                            Proses ke Pembayaran Tahap 1
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
                                                            setPaymentDocuments(files);
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
                                                                    onClick={() => {
                                                                        const newFiles = paymentDocuments.filter((_, i) => i !== index);
                                                                        setPaymentDocuments(newFiles);
                                                                    }}
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
                                                                <Button variant="outline" size="sm" onClick={() => downloadPaymentDocument(index, 'stage1')}>
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
                                                        formData.append('notes', statusNotes || 'Status diubah ke pembayaran oleh admin');
                                                        formData.append('upload_and_change_status', '1');

                                                        // Kirim request untuk upload dokumen dan ubah status bersamaan
                                                        router.post(route('admin.iin-single-blockholder.upload-payment-documents', application.id), formData, {
                                                            forceFormData: true,
                                                            onSuccess: () => {
                                                                showSuccessToast('Dokumen berhasil diupload dan status diubah ke pembayaran');
                                                                setPaymentDocuments([]);
                                                                setStatusNotes('');
                                                                setLoading(false);
                                                                // Refresh halaman untuk menampilkan status terbaru
                                                                router.reload();
                                                            },
                                                            onError: (errors) => {
                                                                console.error('Error uploading documents and changing status:', errors);
                                                                showErrorToast('Gagal mengupload dokumen atau mengubah status. Silakan coba lagi.');
                                                                setLoading(false);
                                                            }
                                                        });
                                                    } catch (error) {
                                                        console.error('Error uploading documents and changing status:', error);
                                                        showErrorToast('Gagal mengupload dokumen atau mengubah status. Silakan coba lagi.');
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                                disabled={loading || (paymentDocuments.length === 0 && (!application.payment_documents || application.payment_documents.length === 0))}
                                            >
                                                {loading ? 'Memproses...' : 'Upload & Ubah Status'}
                                            </Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}

                        {/* Status Pembayaran - Tombol Proses ke Verifikasi Lapangan */}
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
                                                        setFieldVerificationDocuments(files);
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
                                                                onClick={() => {
                                                                    const newFiles = fieldVerificationDocuments.filter((_, i) => i !== index);
                                                                    setFieldVerificationDocuments(newFiles);
                                                                }}
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
                                                onClick={() => {
                                                    if (fieldVerificationDocuments.length === 0) return;

                                                    setLoading(true);
                                                    const formData = new FormData();
                                                    fieldVerificationDocuments.forEach((file) => {
                                                        formData.append('field_verification_documents[]', file);
                                                    });
                                                    formData.append('status', 'verifikasi-lapangan');
                                                    formData.append('upload_and_change_status', '1');
                                                    formData.append('notes', statusNotes || 'Dokumen verifikasi lapangan diupload oleh admin');

                                                    router.post(route('admin.iin-single-blockholder.upload-field-verification-documents', application.id), formData, {
                                                        forceFormData: true,
                                                        onSuccess: () => {
                                                            setFieldVerificationDocuments([]);
                                                            setStatusNotes('');
                                                            setLoading(false);
                                                            showSuccessToast('Dokumen verifikasi lapangan berhasil diupload dan status berubah ke verifikasi lapangan');
                                                            window.location.reload();
                                                        },
                                                        onError: (error) => {
                                                            console.error('Error uploading field verification documents:', error);
                                                            showErrorToast('Gagal mengupload dokumen verifikasi lapangan');
                                                            setLoading(false);
                                                        }
                                                    });
                                                }}
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

                        {/* Status Verifikasi Lapangan - Tombol Proses ke Pembayaran Tahap 2 */}
                        {application.status === 'verifikasi-lapangan' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={loading}>
                                        <CheckCircle className="mr-1 h-4 w-4" />
                                        Proses ke Pembayaran Tahap 2
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        setPaymentDocuments(files);
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
                                                                onClick={() => {
                                                                    const newFiles = paymentDocuments.filter((_, i) => i !== index);
                                                                    setPaymentDocuments(newFiles);
                                                                }}
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
                                                onClick={async () => {
                                                    if (paymentDocuments.length === 0) return;

                                                    setLoading(true);

                                                    const formData = new FormData();
                                                    paymentDocuments.forEach((file) => {
                                                        formData.append('payment_documents[]', file);
                                                    });
                                                    formData.append('status', 'pembayaran-tahap-2');
                                                    formData.append('upload_and_change_status', 'true');
                                                    formData.append('notes', statusNotes || 'Status diubah ke pembayaran tahap 2 oleh admin');

                                                    router.post(route('admin.iin-single-blockholder.upload-payment-documents', application.id), formData, {
                                                        forceFormData: true,
                                                        onSuccess: () => {
                                                            setPaymentDocuments([]);
                                                            setStatusNotes('');
                                                            showSuccessToast('Dokumen pembayaran tahap 2 berhasil diupload');
                                                            router.reload();
                                                            setLoading(false);
                                                        },
                                                        onError: (errors) => {
                                                            console.error('Error uploading payment documents stage 2:', errors);
                                                            showErrorToast('Gagal mengupload dokumen pembayaran tahap 2');
                                                            setLoading(false);
                                                        }
                                                    });
                                                }}
                                                className="bg-green-600 hover:bg-green-700 text-white"
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
                        {application.status === 'pembayaran-tahap-2' && application.payment_proof_documents_stage_2 && application.payment_proof_documents_stage_2.length > 0 && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={loading}>
                                        <CheckCircle className="mr-1 h-4 w-4" />
                                        Terbitkan IIN
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Terbitkan IIN</DialogTitle>
                                        <DialogDescription>
                                            Terbitkan IIN dan unggah sertifikat IIN.
                                            Status aplikasi akan langsung diubah menjadi <strong>terbit</strong>.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleIssueIIN}>
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label htmlFor="certificate" className="text-sm font-medium text-gray-700">
                                                    Sertifikat IIN <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="certificate"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => setData('certificate', e.target.files?.[0] || null)}
                                                    className="mt-1"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="issuance_notes" className="text-sm font-medium text-gray-700">
                                                    Catatan (Opsional)
                                                </Label>
                                                <Textarea
                                                    id="issuance_notes"
                                                    value={data.notes}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    placeholder="Catatan untuk penerbitan IIN..."
                                                    rows={3}
                                                    className="mt-1"
                                                />
                                            </div>
                                            {progress && (
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                                                        style={{ width: `${progress.percentage}%` }}
                                                    ></div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        Uploading: {progress.percentage}%
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </form>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline">Batal</Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button
                                                onClick={handleIssueIIN}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                disabled={processing || !data.certificate}
                                            >
                                                {processing ? 'Memproses...' : 'Terbitkan IIN'}
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3 rounded-lg bg-gray-100/80 p-1">
                        <TabsTrigger value="detail">
                            <FileText className="mr-1 h-4 w-4" />
                            Detail
                        </TabsTrigger>
                        <TabsTrigger value="documents">
                            <FileText className="mr-1 h-4 w-4" />
                            Dokumen
                        </TabsTrigger>
                        <TabsTrigger value="status">
                            <Clock className="mr-1 h-4 w-4" />
                            Status
                        </TabsTrigger>
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
                                {application.payment_proof_documents && application.payment_proof_documents.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-green-100 p-2">
                                                <CreditCard className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Bukti Pembayaran Tahap 1</p>
                                                <p className="text-sm text-gray-500">
                                                    {application.payment_proof_documents.length} dokumen diupload
                                                </p>
                                            </div>
                                        </div>
                                        {application.payment_proof_documents.map((doc, index) => (
                                            <div key={index} className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">Bukti Pembayaran {index + 1}</span>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => downloadPaymentProof(index)}>
                                                    <Download className="mr-1 h-3 w-3" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {application.payment_proof_path && (!application.payment_proof_documents || application.payment_proof_documents.length === 0) && (
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-green-100 p-2">
                                                <CreditCard className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Bukti Pembayaran Tahap 1</p>
                                                <p className="text-sm text-gray-500">
                                                    Bukti pembayaran tahap 1 telah diupload
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => downloadFile('payment_proof', '1')}>
                                            <Download className="mr-1 h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                )}

                                {/* Payment Proof Tahap 2 */}
                                {application.payment_proof_documents_stage_2 && application.payment_proof_documents_stage_2.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-green-100 p-2">
                                                <CreditCard className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Bukti Pembayaran Tahap 2</p>
                                                <p className="text-sm text-gray-500">
                                                    {application.payment_proof_documents_stage_2.length} dokumen diupload
                                                </p>
                                            </div>
                                        </div>
                                        {application.payment_proof_documents_stage_2.map((doc, index) => (
                                            <div key={index} className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">Bukti Pembayaran {index + 1}</span>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => downloadPaymentProof(index)}>
                                                    <Download className="mr-1 h-3 w-3" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {/* {(application.payment_proof_documents_stage_2 || application.status === 'pembayaran-tahap-2' || application.payment_verified_at_stage_2) && (
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-red-100 p-2">
                                                <CreditCard className="h-5 w-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Bukti Pembayaran Tahap 2</p>
                                                <p className="text-sm text-gray-500">
                                                    {application.payment_proof_documents_stage_2 ? 'Bukti pembayaran tahap 2 telah diupload' : 'Belum ada bukti pembayaran tahap 2'}
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
                                )} */}

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
                                            <div key={index} className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2">
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
                                                        ? format(new Date(application.payment_documents_uploaded_at_stage_2), 'dd MMMM yyyy', { locale: id })
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        {application.payment_documents_stage_2.map((doc, index) => (
                                            <div key={index} className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2">
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
                                        {application.field_verification_documents.map((doc, index) => (
                                            <div key={index} className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">Dokumen {index + 1}</span>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => downloadFile('field_verification_document', index.toString())}>
                                                    <Download className="mr-1 h-3 w-3" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Certificate */}
                                {application.status === 'terbit' && application.can_download_certificate && (
                                    <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                                        <div className="flex items-center gap-3">
                                            <div className="rounded-lg bg-green-100 p-2">
                                                <Award className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Sertifikat IIN</p>
                                                <p className="text-sm text-gray-500">Sertifikat IIN Single Blockholder</p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => downloadFile('certificate')}>
                                            <Download className="mr-1 h-4 w-4" />
                                            Download
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="status">
                        <Card className="border-purple-100 bg-white/95 shadow-md">
                            <CardHeader>
                                <CardTitle>Riwayat Status</CardTitle>
                                <CardDescription>Timeline perubahan status aplikasi</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {statusLogs.map((log, index) => (
                                        <div key={log.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                                                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                                                </div>
                                                {index < statusLogs.length - 1 && (
                                                    <div className="mt-2 h-8 w-px bg-gray-200" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${getStatusBadgeClass(log.status_to)} px-2 py-1 text-xs`}>
                                                        {getStatusLabel(log.status_to)}
                                                    </Badge>
                                                    <span className="text-sm text-gray-500">
                                                        {format(new Date(log.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                                                    </span>
                                                </div>
                                                <p className="mt-1 text-sm text-gray-600">
                                                    Diubah oleh: {log.user.name}
                                                </p>
                                                {log.notes && (
                                                    <p className="mt-2 text-sm text-gray-700">
                                                        Catatan: {log.notes}
                                                    </p>
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