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
import { IinSingleBlockholderApplication, StatusLog, User } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, Download, FileText, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';
import DetailTab from './components/DetailTab';
import DocumentTab from './components/DocumentTab';
import StatusTab from './components/StatusTab';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';

interface Props {
    application: IinSingleBlockholderApplication;
    statusLogs: StatusLog[];
    auth: {
        user: User;
    };
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

export default function AdminIinSingleBlockholderShow({ application, statusLogs, auth, application_counts }: Props) {
    const [loading, setLoading] = useState(false);
    const [paymentDocuments, setPaymentDocuments] = useState<File[]>([]);
    const [fieldVerificationDocuments, setFieldVerificationDocuments] = useState<File[]>([]);
    const [additionalDocuments, setAdditionalDocuments] = useState<File[]>([]);
    const [statusNotes, setStatusNotes] = useState('');

    // Form untuk terbitkan IIN menggunakan useForm
    const { data, setData, post, processing, progress } = useForm({
        certificate: null as File | null,
        iin_number: '',
        notes: '',
    });

    // Check if admin can change to field verification
    const canChangeToFieldVerification =
        application.status === 'pembayaran' && application.payment_documents && application.payment_documents.length > 0;

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
                    iin_number: '',
                    notes: '',
                });
            },
            onError: () => {
                showErrorToast('Gagal menerbitkan IIN');
            },
        });
    };

    const downloadFile = (type: string, stage?: string) => {
        const url = route('iin-single-blockholder.download-file', {
            iinSingleBlockholder: application.id,
            type: type,
            ...(stage && { stage }),
        });
        window.open(url, '_blank');
    };

    const downloadPaymentDocument = (index: number, stage: string) => {
        const url = route('iin-single-blockholder.download-payment-document', {
            iinSingleBlockholder: application.id,
            index: index,
        });
        window.open(url, '_blank');
    };

    const downloadPaymentProof = (index: number) => {
        const url = route('iin-single-blockholder.download-payment-proof', {
            iinSingleBlockholder: application.id,
            index: index,
        });
        window.open(url, '_blank');
    };

    const handleUploadAdditionalDocuments = async () => {
        if (additionalDocuments.length === 0) {
            showErrorToast('Pilih dokumen tambahan terlebih dahulu');
            return;
        }

        const formData = new FormData();
        additionalDocuments.forEach((file, index) => {
            formData.append(`additional_documents[${index}]`, file);
        });

        try {
            await router.post(route('admin.iin-single-blockholder.upload-additional-documents', application.id), formData, {
                onSuccess: () => {
                    showSuccessToast('Dokumen tambahan berhasil diunggah');
                    setAdditionalDocuments([]);
                },
                onError: (errors) => {
                    console.error('Upload error:', errors);
                    showErrorToast('Gagal mengunggah dokumen tambahan');
                },
            });
        } catch (error) {
            console.error('Upload error:', error);
            showErrorToast('Gagal mengunggah dokumen tambahan');
        }
    };

    return (
        <DashboardLayout user={auth.user} title="Admin - Detail IIN Single Blockholder" applicationCounts={application_counts}>
            <Head title={`Aplikasi ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <Link href={route('admin.iin-single-blockholder.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-1 w-4 h-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-purple-900">
                                {application.application_number}
                            </h1>
                            <p className="text-gray-600">Panel Admin - Single IIN/Blockholder</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        {/* Show status badge only when no action buttons are displayed */}
                        {application.status !== 'pengajuan' &&
                            application.status !== 'pembayaran' &&
                            application.status !== 'verifikasi-lapangan' &&
                            application.status !== 'pembayaran-tahap-2' && (
                                <Badge className={getStatusBadgeClass(application.status)}>{getStatusLabel(application.status)}</Badge>
                            )}

                        {/* Status Pengajuan - Tombol Perbaikan dan Proses ke Pembayaran Tahap 1 */}
                        {application.status === 'pengajuan' && (
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
                                                            setPaymentDocuments(files);
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
                                                            <div
                                                                key={index}
                                                                className="flex justify-between items-center p-3 rounded-lg border border-gray-200"
                                                            >
                                                                <div className="flex gap-2 items-center">
                                                                    <FileText className="w-4 h-4 text-gray-600" />
                                                                    <span className="text-sm text-gray-700">Dokumen Pembayaran {index + 1}</span>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => downloadPaymentDocument(index, 'stage1')}
                                                                >
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
                                                        router.post(
                                                            route('admin.iin-single-blockholder.upload-payment-documents', application.id),
                                                            formData,
                                                            {
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
                                                                    showErrorToast(
                                                                        'Gagal mengupload dokumen atau mengubah status. Silakan coba lagi.',
                                                                    );
                                                                    setLoading(false);
                                                                },
                                                            },
                                                        );
                                                    } catch (error) {
                                                        console.error('Error uploading documents and changing status:', error);
                                                        showErrorToast('Gagal mengupload dokumen atau mengubah status. Silakan coba lagi.');
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="text-white bg-blue-600 hover:bg-blue-700"
                                                disabled={
                                                    loading ||
                                                    (paymentDocuments.length === 0 &&
                                                        (!application.payment_documents || application.payment_documents.length === 0))
                                                }
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

                                                    router.post(
                                                        route('admin.iin-single-blockholder.upload-field-verification-documents', application.id),
                                                        formData,
                                                        {
                                                            forceFormData: true,
                                                            onSuccess: () => {
                                                                setFieldVerificationDocuments([]);
                                                                setStatusNotes('');
                                                                setLoading(false);
                                                                showSuccessToast(
                                                                    'Dokumen verifikasi lapangan berhasil diupload dan status berubah ke verifikasi lapangan',
                                                                );
                                                                window.location.reload();
                                                            },
                                                            onError: (error) => {
                                                                console.error('Error uploading field verification documents:', error);
                                                                showErrorToast('Gagal mengupload dokumen verifikasi lapangan');
                                                                setLoading(false);
                                                            },
                                                        },
                                                    );
                                                }}
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

                        {/* Status Verifikasi Lapangan - Tombol Proses ke Pembayaran Tahap 2 */}
                        {application.status === 'verifikasi-lapangan' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" disabled={loading}>
                                        <CheckCircle className="mr-1 w-4 h-4" />
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
                                    <div className="py-4 space-y-6">
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

                                                    router.post(
                                                        route('admin.iin-single-blockholder.upload-payment-documents', application.id),
                                                        formData,
                                                        {
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
                                                            },
                                                        },
                                                    );
                                                }}
                                                className="text-white bg-green-600 hover:bg-green-700"
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
                                        <Button variant="outline" size="sm" disabled={loading}>
                                            <CheckCircle className="mr-1 w-4 h-4" />
                                            Terbitkan IIN
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Terbitkan IIN</DialogTitle>
                                            <DialogDescription>
                                                Terbitkan IIN dan unggah sertifikat IIN. Status aplikasi akan langsung diubah menjadi{' '}
                                                <strong>terbit</strong>.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleIssueIIN}>
                                            <div className="py-4 space-y-4">
                                                <div>
                                                    <Label htmlFor="iin_number" className="text-sm font-medium text-gray-700">
                                                        Nomor IIN <span className="text-red-500">*</span>
                                                    </Label>
                                                    <Input
                                                        id="iin_number"
                                                        type="number"
                                                        value={data.iin_number}
                                                        onChange={(e) => setData('iin_number', e.target.value)}
                                                        placeholder="Masukkan nomor IIN..."
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
                                                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                                                        <div
                                                            className="h-2.5 rounded-full bg-green-600 transition-all duration-300"
                                                            style={{ width: `${progress.percentage}%` }}
                                                        ></div>
                                                        <p className="mt-1 text-sm text-gray-600">Uploading: {progress.percentage}%</p>
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
                                                    className="text-white bg-green-600 hover:bg-green-700"
                                                    disabled={processing || !data.certificate || !data.iin_number}
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
