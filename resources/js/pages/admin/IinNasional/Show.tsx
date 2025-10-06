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
import { User } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, ArrowLeft, Award, CheckCircle, Clock, CreditCard, Download, FileText, Shield, Upload, X } from 'lucide-react';
import React, { useState } from 'react';

interface PaymentDocument {
    original_name: string;
    file_path: string;
}

interface IinNasionalApplication {
    id: number;
    application_number: string;
    status: string;
    notes?: string;
    iin_number?: string;
    issued_at?: string;
    created_at: string;
    updated_at: string;
    application_form_path?: string;
    requirements_archive_path?: string;
    payment_proof_path?: string;
    payment_proof_documents?: PaymentDocument[];
    payment_proof_uploaded_at?: string;
    payment_documents?: PaymentDocument[];
    payment_documents_uploaded_at?: string;
    field_verification_documents?: PaymentDocument[];
    field_verification_documents_uploaded_at?: string;
    additional_documents?: PaymentDocument[];
    additional_documents_uploaded_at?: string;
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
    status_from: string;
    status_to: string;
    notes?: string;
    created_at: string;
    admin?: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    auth: {
        user: User;
    };
    application: IinNasionalApplication;
    statusLogs: StatusLog[];
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

export default function AdminIinNasionalShow({ auth, application, statusLogs, application_counts }: Props) {
    const [activeTab, setActiveTab] = useState('detail');
    const [loading, setLoading] = useState(false);
    const [paymentDocuments, setPaymentDocuments] = useState<File[]>([]);
    const [fieldVerificationDocuments, setFieldVerificationDocuments] = useState<File[]>([]);
    const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);
    const [uploadingPaymentDocuments, setUploadingPaymentDocuments] = useState(false);
    const [statusNotes, setStatusNotes] = useState('');
    const [iinNumber, setIinNumber] = useState('');
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [verificationNotes, setVerificationNotes] = useState('');
    const [verificationIinNumber, setVerificationIinNumber] = useState('');

    // Status conditions
    const canChangeToPayment = application.status === 'pengajuan';
    const canChangeToFieldVerification = application.status === 'pembayaran';
    const canCompleteFieldVerification = application.status === 'verifikasi-lapangan';
    const canIssueIIN = application.status === 'verifikasi-lapangan';
    const canUploadCertificate = application.status === 'terbit' && !application.can_download_certificate && !application.iin_number;

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            pengajuan: 'Pengajuan',
            perbaikan: 'Perbaikan',
            pembayaran: 'Pembayaran',
            'verifikasi-lapangan': 'Verifikasi Lapangan',
            'menunggu-terbit': 'Menunggu Terbit',
            terbit: 'Terbit',
        };
        return statusMap[status] || status;
    };

    const getStatusBadgeClass = (status: string) => {
        const statusClasses: { [key: string]: string } = {
            pengajuan: 'bg-blue-100 text-blue-800 border-blue-200',
            perbaikan: 'bg-amber-100 text-amber-800 border-amber-200',
            pembayaran: 'bg-purple-100 text-purple-800 border-purple-200',
            'verifikasi-lapangan': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'menunggu-terbit': 'bg-orange-100 text-orange-800 border-orange-200',
            terbit: 'bg-green-100 text-green-800 border-green-200',
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const handleStatusChangeToPayment = async () => {
        setLoading(true);

        try {
            const formData = new FormData();

            if (paymentDocuments.length > 0) {
                paymentDocuments.forEach((file, index) => {
                    formData.append(`payment_documents[${index}]`, file);
                });
            }

            formData.append('status', 'pembayaran');
            formData.append('notes', notes || 'Status diubah ke pembayaran oleh admin');
            formData.append('upload_and_change_status', '1');

            router.post(route('iin-nasional.upload-payment-documents', application.id), formData, {
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
            });
        } catch (error) {
            console.error('Error in upload and status change:', error);
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
                    notes: notes || 'Dikembalikan untuk perbaikan oleh admin',
                },
                {
                    onSuccess: () => {
                        showSuccessToast('Status berhasil diubah ke perbaikan');
                        setNotes('');
                    },
                    onError: (errors) => {
                        console.error('Error updating status:', errors);
                        showErrorToast('Gagal mengubah status. Silakan coba lagi.');
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error updating status:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleStatusChangeToFieldVerification = async () => {
        setLoading(true);

        try {
            const formData = new FormData();

            if (fieldVerificationDocuments.length > 0) {
                fieldVerificationDocuments.forEach((file, index) => {
                    formData.append(`field_verification_documents[${index}]`, file);
                });
            }

            formData.append('status', 'verifikasi-lapangan');
            formData.append('upload_and_change_status', '1');
            formData.append('notes', notes || 'Status diubah ke verifikasi lapangan oleh admin');

            router.post(route('iin-nasional.upload-field-verification-documents', application.id), formData, {
                onSuccess: () => {
                    showSuccessToast('Dokumen berhasil diupload dan status diubah ke verifikasi lapangan');
                    setFieldVerificationDocuments([]);
                    setNotes('');
                },
                onError: (errors) => {
                    console.error('Error uploading documents and changing status:', errors);
                    showErrorToast('Gagal mengupload dokumen atau mengubah status. Silakan coba lagi.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error in upload and status change:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleCompleteFieldVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!certificateFile) {
            showErrorToast('Silakan pilih file sertifikat IIN');
            return;
        }
        if (!verificationIinNumber.trim()) {
            showErrorToast('Silakan masukkan nomor IIN');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('certificate', certificateFile);
            formData.append('iin_number', verificationIinNumber);
            formData.append('notes', verificationNotes || 'Verifikasi lapangan selesai dan IIN diterbitkan');

            // Add additional documents if any
            if (additionalDocuments.length > 0) {
                additionalDocuments.forEach((file, index) => {
                    formData.append(`additional_documents[${index}]`, file);
                });
            }

            router.post(route('admin.iin-nasional.upload-certificate', application.id), formData, {
                forceFormData: true,
                onSuccess: () => {
                    showSuccessToast('Verifikasi lapangan selesai dan IIN berhasil diterbitkan');
                    setCertificateFile(null);
                    setVerificationNotes('');
                    setVerificationIinNumber('');
                    setAdditionalDocuments([]);
                },
                onError: (errors) => {
                    console.error('Error completing field verification:', errors);
                    showErrorToast('Gagal menyelesaikan verifikasi lapangan. Silakan coba lagi.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error completing field verification:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleIssueIIN = async () => {
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('iin_number', iinNumber);
            formData.append('notes', 'IIN berhasil diterbitkan');

            if (certificateFile) {
                formData.append('certificate_file', certificateFile);
            }

            router.post(route('iin-nasional.issue-iin', application.id), formData, {
                onSuccess: () => {
                    showSuccessToast('IIN berhasil diterbitkan dan sertifikat telah diupload');
                    setIinNumber('');
                    setCertificateFile(null);
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

    const handleUploadCertificate = async () => {
        if (!certificateFile) {
            showErrorToast('Silakan pilih file sertifikat terlebih dahulu');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('certificate', certificateFile);

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
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error uploading certificate:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const addPaymentDocument = (file: File) => {
        setPaymentDocuments((prev) => [...prev, file]);
    };

    const removePaymentDocument = (index: number) => {
        setPaymentDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const addFieldVerificationDocument = (file: File) => {
        setFieldVerificationDocuments((prev) => [...prev, file]);
    };

    const removeFieldVerificationDocument = (index: number) => {
        setFieldVerificationDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const removeAdditionalDocument = (index: number) => {
        setAdditionalDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUploadAdditionalDocuments = async () => {
        if (additionalDocuments.length === 0) {
            showErrorToast('Silakan pilih dokumen tambahan terlebih dahulu');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            additionalDocuments.forEach((file, index) => {
                formData.append(`additional_documents[${index}]`, file);
            });

            router.post(route('iin-nasional.upload-additional-documents', application.id), formData, {
                forceFormData: true,
                onSuccess: () => {
                    showSuccessToast('Dokumen tambahan berhasil diupload');
                    setAdditionalDocuments([]);
                },
                onError: (errors) => {
                    console.error('Error uploading additional documents:', errors);
                    showErrorToast('Gagal mengupload dokumen tambahan. Silakan coba lagi.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error uploading additional documents:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const deleteAdditionalDocument = async (index: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
            return;
        }

        setLoading(true);

        try {
            router.delete(route('admin.iin-nasional.delete-additional-document', [application.id, index]), {
                onSuccess: () => {
                    showSuccessToast('Dokumen tambahan berhasil dihapus');
                },
                onError: (errors) => {
                    console.error('Error deleting additional document:', errors);
                    showErrorToast('Gagal menghapus dokumen tambahan. Silakan coba lagi.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error deleting additional document:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
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

    const downloadAdditionalDocument = (index: number) => {
        window.open(
            route('iin-nasional.download-additional-document', {
                iinNasional: application.id,
                index: index,
            }),
            '_blank',
        );
    }

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
        <DashboardLayout user={auth.user} applicationCounts={application_counts}>
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
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Selesaikan Verifikasi Lapangan & Terbitkan IIN</DialogTitle>
                                        <DialogDescription>
                                            Upload sertifikat IIN untuk menyelesaikan verifikasi lapangan. Status aplikasi akan langsung berubah
                                            menjadi <strong>terbit</strong>.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCompleteFieldVerification}>
                                        <div className="space-y-4 py-4">
                                            <div>
                                                <Label htmlFor="iin_number" className="text-sm font-medium text-gray-700">
                                                    Nomor IIN <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="iin_number"
                                                    type="text"
                                                    value={verificationIinNumber}
                                                    onChange={(e) => setVerificationIinNumber(e.target.value)}
                                                    placeholder="Masukkan nomor IIN"
                                                    className="mt-1"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="certificate" className="text-sm font-medium text-gray-700">
                                                    Sertifikat IIN <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="certificate"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                                                    className="mt-1"
                                                    required
                                                />
                                                {certificateFile && (
                                                    <div className="mt-2 rounded-md bg-gray-50 p-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-2">
                                                                <FileText className="h-4 w-4 text-blue-500" />
                                                                <span className="text-sm text-gray-700">{certificateFile.name}</span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setCertificateFile(null)}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Additional Documents Section */}
                                            <div>
                                                <Label className="text-sm font-medium text-gray-700">Dokumen Tambahan (Opsional)</Label>
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    multiple
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        setAdditionalDocuments(files);
                                                    }}
                                                    className="mt-2"
                                                />
                                                {additionalDocuments.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-sm text-gray-600">{additionalDocuments.length} file dipilih:</p>
                                                        {additionalDocuments.map((file, index) => (
                                                            <div key={index} className="flex items-center space-x-2 text-sm text-gray-700">
                                                                <FileText className="h-4 w-4 text-blue-500" />
                                                                <span>{file.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <Label htmlFor="verification_notes" className="text-sm font-medium text-gray-700">
                                                    Catatan (Opsional)
                                                </Label>
                                                <Textarea
                                                    id="verification_notes"
                                                    value={verificationNotes}
                                                    onChange={(e) => setVerificationNotes(e.target.value)}
                                                    placeholder="Catatan untuk penyelesaian verifikasi lapangan..."
                                                    rows={3}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild>
                                                <Button variant="outline" type="button">
                                                    Batal
                                                </Button>
                                            </DialogClose>
                                            <Button
                                                type="submit"
                                                className="bg-green-600 text-white hover:bg-green-700"
                                                disabled={loading || !certificateFile || !verificationIinNumber.trim()}
                                            >
                                                {loading ? 'Memproses...' : 'Selesaikan & Terbitkan IIN'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
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
                                                    className="bg-red-600 text-white hover:bg-red-700"
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
                                                            files.forEach((file) => addPaymentDocument(file));
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
                                                onClick={handleStatusChangeToPayment}
                                                className="bg-blue-600 text-white hover:bg-blue-700"
                                                disabled={
                                                    loading ||
                                                    uploadingPaymentDocuments ||
                                                    (paymentDocuments.length === 0 &&
                                                        (!application.payment_documents || application.payment_documents.length === 0))
                                                }
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

                        {false && (
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
                                            <div
                                                key={index}
                                                className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2"
                                            >
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
                                {!application.payment_proof_path &&
                                    (!application.payment_proof_documents || application.payment_proof_documents.length === 0) && (
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
                                            <div
                                                key={index}
                                                className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2"
                                            >
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
                                                        ? format(new Date(application.field_verification_documents_uploaded_at), 'dd MMMM yyyy', {
                                                            locale: id,
                                                        })
                                                        : '-'}
                                                </p>
                                            </div>
                                        </div>
                                        {application.field_verification_documents.map((document: PaymentDocument, index: number) => (
                                            <div
                                                key={index}
                                                className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2"
                                            >
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

                                {/* Additional Documents */}
                                {application.additional_documents && application.additional_documents.length > 0 && (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <div className="rounded-lg bg-yellow-100 p-2">
                                                <FileText className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">Dokumen Tambahan</p>
                                            </div>
                                        </div>
                                        {application.additional_documents.map((document: PaymentDocument, index: number) => (
                                            <div
                                                key={index}
                                                className="ml-12 flex items-center justify-between rounded-lg border border-gray-200 p-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                    <span className="text-sm text-gray-700">{document.original_name}</span>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => downloadAdditionalDocument(index)}>
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
                                                            ) : (
                                                                <Award className="h-4 w-4" />
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium text-gray-900">
                                                                Status diubah ke {getStatusLabel(log.status_to)}
                                                            </h4>
                                                            <time className="text-sm text-gray-500">
                                                                {format(new Date(log.created_at), 'dd MMM yyyy, HH:mm', { locale: id })}
                                                            </time>
                                                        </div>
                                                        {log.admin && <p className="text-sm text-gray-600">oleh {log.admin.name}</p>}
                                                        {log.notes && <p className="mt-1 text-sm text-gray-700">{log.notes}</p>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center">
                                            <Clock className="mx-auto h-12 w-12 text-gray-400" />
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">Belum ada riwayat status</h3>
                                            <p className="mt-1 text-sm text-gray-500">Riwayat perubahan status akan muncul di sini.</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {canUploadCertificate && (
                        <TabsContent value="upload-certificate">
                            <Card className="border-orange-100 bg-white/95 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-orange-800">Upload Sertifikat</CardTitle>
                                    <CardDescription>Upload file sertifikat IIN untuk pemohon</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="certificate_file" className="text-sm font-medium text-gray-700">
                                            File Sertifikat <span className="text-red-500">*</span>
                                        </Label>
                                        <Input
                                            id="certificate_file"
                                            type="file"
                                            accept=".pdf"
                                            onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                                            className="mt-1"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Format yang didukung: PDF. Maksimal 10MB.</p>
                                    </div>
                                    {certificateFile && (
                                        <div className="rounded-lg bg-gray-50 p-3">
                                            <div className="flex items-center gap-2">
                                                <FileText className="h-4 w-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-800">{certificateFile.name}</span>
                                                <span className="text-xs text-gray-500">({(certificateFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            </div>
                                        </div>
                                    )}
                                    <Button
                                        onClick={handleUploadCertificate}
                                        className="bg-orange-600 text-white hover:bg-orange-700"
                                        disabled={loading || !certificateFile}
                                    >
                                        {loading ? 'Mengupload...' : 'Upload Sertifikat'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
