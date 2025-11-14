import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { IinNasionalApplication, StatusLog, User } from '@/types';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Download, FileText, Shield, X } from 'lucide-react';
import React, { useState } from 'react';
import DetailTab from './components/DetailTab';
import DocumentTab from './components/DocumentTab';
import StatusTab from './components/StatusTab';

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
    const [loading, setLoading] = useState(false);
    const [paymentDocuments, setPaymentDocuments] = useState<File[]>([]);
    const [fieldVerificationDocuments, setFieldVerificationDocuments] = useState<File[]>([]);
    const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);
    const [uploadingPaymentDocuments, setUploadingPaymentDocuments] = useState(false);
    const [certificateFile, setCertificateFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [verificationNotes, setVerificationNotes] = useState('');
    const [verificationIinNumber, setVerificationIinNumber] = useState('');

    // Status conditions
    const canChangeToPayment = application.status === 'pengajuan';
    const canChangeToFieldVerification = application.status === 'pembayaran';
    const canCompleteFieldVerification = application.status === 'verifikasi-lapangan';

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

    const downloadAdditionalDocument = (index: number) => {
        window.open(
            route('iin-nasional.download-additional-document', {
                iinNasional: application.id,
                index: index,
            }),
            '_blank',
        );
    };

    return (
        <DashboardLayout user={auth.user} applicationCounts={application_counts}>
            <Head title={`Admin - ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <Link href={route('admin.dashboard')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-1 w-4 h-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-purple-900">
                                {application.application_number}
                            </h1>
                            <p className="text-gray-600">Panel Admin - IIN Nasional</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        {!canChangeToPayment && !canChangeToFieldVerification && !canCompleteFieldVerification && (
                            <Badge className={getStatusBadgeClass(application.status)}>{getStatusLabel(application.status)}</Badge>
                        )}
                        {canCompleteFieldVerification && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={loading}>
                                        <CheckCircle className="mr-1 w-4 h-4" />
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
                                        <div className="py-4 space-y-4">
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
                                                    <div className="p-2 mt-2 bg-gray-50 rounded-md">
                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center space-x-2">
                                                                <FileText className="w-4 h-4 text-blue-500" />
                                                                <span className="text-sm text-gray-700">{certificateFile.name}</span>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setCertificateFile(null)}
                                                                className="p-0 w-6 h-6"
                                                            >
                                                                <X className="w-4 h-4" />
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
                                                                <FileText className="w-4 h-4 text-blue-500" />
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
                                                className="text-white bg-green-600 hover:bg-green-700"
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
                                            <ArrowLeft className="mr-1 w-4 h-4" />
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
                                        <div className="py-4 space-y-4">
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
                                                    className="text-white bg-red-600 hover:bg-red-700"
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
                                            <Clock className="mr-1 w-4 h-4" />
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
                                        <div className="py-4 space-y-6">
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
                                                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                                <div className="flex gap-2 items-center">
                                                                    <FileText className="w-4 h-4 text-gray-600" />
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
                                                                className="flex justify-between items-center p-3 rounded-lg border border-gray-200"
                                                            >
                                                                <div className="flex gap-2 items-center">
                                                                    <FileText className="w-4 h-4 text-gray-600" />
                                                                    <span className="text-sm text-gray-700">Dokumen Pembayaran {index + 1}</span>
                                                                </div>
                                                                <Button variant="outline" size="sm" onClick={() => downloadPaymentDocument(index)}>
                                                                    <Download className="mr-1 w-3 h-3" />
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
                                                className="text-white bg-blue-600 hover:bg-blue-700"
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

                        {/* Status Pembayaran - Tombol Proses ke Verifikasi Lapangan */}
                        {canChangeToFieldVerification && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={loading}>
                                        <Shield className="mr-1 w-4 h-4" />
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
                                    <div className="py-4 space-y-6">
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
                                                    Format yang didukung: PDF, DOC, DOCX, JPG, PNG. Maksimal 10MB per file. Anda dapat memilih
                                                    beberapa file sekaligus.
                                                </p>
                                            </div>

                                            {/* Selected Files */}
                                            {fieldVerificationDocuments.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">File yang Dipilih:</Label>
                                                    {fieldVerificationDocuments.map((file, index) => (
                                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                                            <div className="flex gap-2 items-center">
                                                                <FileText className="w-4 h-4 text-gray-600" />
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
                                                onClick={() => handleStatusChangeToFieldVerification()}
                                                className="text-white bg-indigo-600 hover:bg-indigo-700"
                                                disabled={loading || fieldVerificationDocuments.length === 0}
                                            >
                                                {loading ? 'Memproses...' : 'Proses ke Verifikasi Lapangan'}
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <Tabs defaultValue="detail">
                    <div className='flex justify-center'>
                        <TabsList>
                            <TabsTrigger value="detail">Detail</TabsTrigger>
                            <TabsTrigger value="document">Dokumen</TabsTrigger>
                            <TabsTrigger value="status">Status Log</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="detail">
                        <DetailTab application={application} />
                    </TabsContent>
                    <TabsContent value="document">
                        <DocumentTab application={application} />
                    </TabsContent>
                    <TabsContent value="status">
                        <StatusTab statusLogs={statusLogs} />
                    </TabsContent>

                    {/* {canUploadCertificate && (
                        <TabsContent value="upload-certificate">
                            <Card className="border-orange-100 shadow-md bg-white/95">
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
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex gap-2 items-center">
                                                <FileText className="w-4 h-4 text-gray-600" />
                                                <span className="text-sm font-medium text-gray-800">{certificateFile.name}</span>
                                                <span className="text-xs text-gray-500">({(certificateFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                                            </div>
                                        </div>
                                    )}
                                    <Button
                                        onClick={handleUploadCertificate}
                                        className="text-white bg-orange-600 hover:bg-orange-700"
                                        disabled={loading || !certificateFile}
                                    >
                                        {loading ? 'Mengupload...' : 'Upload Sertifikat'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )} */}
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
