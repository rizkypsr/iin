import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
    ArrowLeft,
    FileText,
    Download,
    Clock,
    CreditCard,
    Shield,
    CheckCircle,
    AlertCircle,
    X,
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/lib/toast-helper';
import { User } from '@/types';

interface PaymentDocument {
    original_name: string;
    file_path: string;
}

interface PengawasanSingleIinApplication {
    id: number;
    application_number: string;
    status: string;
    issued_at?: string;
    created_at: string;
    updated_at: string;
    payment_proof_path?: string;
    payment_proof_documents?: PaymentDocument[];
    payment_proof_uploaded_at?: string;
    payment_documents?: PaymentDocument[];
    payment_documents_uploaded_at?: string;
    payment_proof_documents_stage_2?: PaymentDocument[];
    payment_proof_uploaded_at_stage_2?: string;
    payment_documents_stage_2?: PaymentDocument[];
    payment_documents_uploaded_at_stage_2?: string;
    field_verification_documents?: PaymentDocument[];
    field_verification_documents_uploaded_at?: string;
    issuance_documents?: PaymentDocument[];
    issuance_documents_uploaded_at?: string;
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
    single_iin_profile: {
        id: number;
        user_id: number;
        institution_name: string;
        institution_type: string;
        year: number;
        iin_assignment: string;
        assignment_date: string;
        regional: string;
        usage_purpose: string;
        address: string;
        address_updated: string;
        phone_fax: string;
        phone_fax_updated: string;
        email: string;
        contact_person: string;
        remarks_status: string;
        card_specimen: string;
        previous_name: string;
    }
}

interface StatusLog {
    id: number;
    status_from?: string;
    status_to: string;
    notes?: string;
    created_at: string;
    changed_by: {
        id: number;
        name: string;
        email: string;
    };
}

interface Props {
    auth: {
        user: User;
    };
    application: PengawasanSingleIinApplication;
    statusLogs: StatusLog[];
    application_counts?: {
        pengawasan_iin_nasional?: number;
        pengawasan_single_iin?: number;
    };
}

export default function AdminPengawasanSingleIinShow({ auth, application, statusLogs }: Props) {
    const [activeTab, setActiveTab] = useState('detail');
    const [loading, setLoading] = useState(false);
    const [notes, setNotes] = useState('');
    const [paymentDocuments, setPaymentDocuments] = useState<File[]>([]);
    const [fieldVerificationDocuments, setFieldVerificationDocuments] = useState<File[]>([]);
    const [verificationNotes, setVerificationNotes] = useState('');
    const [verificationCompletionFiles, setVerificationCompletionFiles] = useState<File[]>([]);

    const downloadFile = (type: string, stage?: string) => {
        const url = route('pengawasan-single-iin.download-file', {
            pengawasanSingleIin: application.id,
            type: type,
            ...(stage && { stage })
        });
        window.open(url, '_blank');
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

            router.post(
                route('admin.pengawasan-single-iin.upload-payment-documents', application.id),
                formData,
                {
                    onSuccess: () => {
                        showSuccessToast('Dokumen pembayaran berhasil diupload dan status diubah ke pembayaran');
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
    };

    const handleStatusChangeToSecondPayment = async () => {
        if (paymentDocuments.length === 0) {
            showErrorToast('Silakan pilih dokumen pembayaran terlebih dahulu');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('notes', notes);

            paymentDocuments.forEach((file) => {
                formData.append('payment_documents[]', file);
            });

            router.post(route('admin.pengawasan-single-iin.upload-payment-documents-stage2', application.id), formData, {
                onSuccess: () => {
                    showSuccessToast('Dokumen pembayaran tahap 2 berhasil diupload dan status berhasil diubah');
                    setPaymentDocuments([]);
                    setNotes('');
                },
                onError: (errors) => {
                    console.error('Error:', errors);
                    showErrorToast('Gagal mengupload dokumen pembayaran tahap 2');
                },
                onFinish: () => setLoading(false)
            });
        } catch (error) {
            console.error('Error:', error);
            showErrorToast('Terjadi kesalahan saat mengubah status');
            setLoading(false);
        }
    };

    const handleProcessToSecondPayment = async () => {
        if (paymentDocuments.length === 0) return;

        setLoading(true);

        const formData = new FormData();
        paymentDocuments.forEach((file) => {
            formData.append('payment_documents[]', file);
        });
        formData.append('status', 'pembayaran-tahap-2');
        formData.append('notes', notes || 'Status diubah ke pembayaran tahap 2 oleh admin');

        router.post(route('admin.pengawasan-single-iin.upload-payment-documents', application.id), formData, {
            forceFormData: true,
            onSuccess: () => {
                setPaymentDocuments([]);
                setNotes('');
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
    };

    // Helper functions for file management
    const addPaymentDocument = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            showErrorToast('Ukuran file tidak boleh lebih dari 10MB');
            return;
        }
        setPaymentDocuments(prev => [...prev, file]);
    };

    const addFieldVerificationDocument = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            showErrorToast('Ukuran file tidak boleh lebih dari 10MB');
            return;
        }
        setFieldVerificationDocuments(prev => [...prev, file]);
    };

    // Status conditions
    const canChangeToPayment = application.status === 'pengajuan';
    const canChangeToFieldVerification = application.status === 'pembayaran';
    const canChangeToSecondPayment = application.status === 'verifikasi_lapangan';
    const canIssuePengawasan = application.status === 'pembayaran-tahap-2';

    console.log(application.issuance_documents);

    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'pengajuan': 'Diajukan',
            'pembayaran': 'Pembayaran',
            'verifikasi-lapangan': 'Verifikasi Lapangan',
            'pembayaran-tahap-2': 'Pembayaran Tahap 2',
            'terbit': 'Terbit',
        };
        return statusMap[status] || status;
    };

    const getStatusBadgeClass = (status: string) => {
        const statusClasses: { [key: string]: string } = {
            'pengajuan': 'bg-blue-100 text-blue-800 border-blue-200',
            'pembayaran': 'bg-orange-100 text-orange-800 border-orange-200',
            'verifikasi_lapangan': 'bg-purple-100 text-purple-800 border-purple-200',
            'pembayaran-tahap-2': 'bg-green-100 text-green-800 border-green-200',
            'terbit': 'bg-gray-100 text-gray-800 border-gray-200',
        };
        return statusClasses[status] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const handleStatusChangeToPaymentVerified = async () => {
        setLoading(true);

        try {
            const formData = new FormData();

            if (paymentDocuments.length > 0) {
                paymentDocuments.forEach((file, index) => {
                    formData.append(`payment_documents[${index}]`, file);
                });
            }

            formData.append('status', 'payment_verified');
            formData.append('notes', notes || 'Status diubah ke pembayaran terverifikasi oleh admin');
            formData.append('upload_and_change_status', '1');

            router.post(
                route('pengawasan-single-iin.upload-payment-documents', application.id),
                formData,
                {
                    onSuccess: () => {
                        showSuccessToast('Dokumen berhasil diupload dan status diubah ke pembayaran terverifikasi');
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
    };

    const handleStatusChangeToFieldVerification = async () => {
        setLoading(true);

        try {
            const formData = new FormData();

            if (fieldVerificationDocuments.length > 0) {
                fieldVerificationDocuments.forEach((file) => {
                    formData.append('field_verification_documents[]', file);
                });
                formData.append('upload_and_change_status', 'true');
            }

            formData.append('status', 'verifikasi-lapangan');
            formData.append('notes', notes || 'Status diubah ke verifikasi lapangan oleh admin');

            router.post(
                route('admin.pengawasan-single-iin.upload-field-verification-documents', application.id),
                formData,
                {
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
                },
            );
        } catch (error) {
            console.error('Error in upload and status change:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleCompleteFieldVerification = async () => {
        // Validate that at least one file is uploaded
        if (verificationCompletionFiles.length === 0) {
            showErrorToast('Harap upload minimal 1 file dokumen pengawasan');
            return;
        }

        setLoading(true);

        try {
            // Create FormData to handle file uploads
            const formData = new FormData();
            formData.append('notes', 'Dokumen pengawasan telah diupload dan status diubah ke terbit');

            // Append issuance documents (dokumen pengawasan terbit)
            verificationCompletionFiles.forEach((file, index) => {
                formData.append(`issuance_documents[${index}]`, file);
            });

            router.post(
                route('admin.pengawasan-single-iin.upload-issuance-documents', application.id),
                formData,
                {
                    forceFormData: true,
                    onSuccess: () => {
                        showSuccessToast('Dokumen pengawasan berhasil diupload dan status diubah ke terbit');
                        setVerificationCompletionFiles([]);
                    },
                    onError: (errors) => {
                        console.error('Error uploading issuance documents:', errors);
                        showErrorToast('Gagal mengupload dokumen pengawasan. Silakan coba lagi.');
                    },
                    onFinish: () => {
                        setLoading(false);
                    },
                },
            );
        } catch (error) {
            console.error('Error uploading issuance documents:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handlePaymentDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setPaymentDocuments(Array.from(e.target.files));
        }
    };

    const handleFieldVerificationDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFieldVerificationDocuments(Array.from(e.target.files));
        }
    };

    const removePaymentDocument = (index: number) => {
        setPaymentDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const removeFieldVerificationDocument = (index: number) => {
        setFieldVerificationDocuments(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <DashboardLayout
            user={auth.user}
            title="Admin - Detail Pengawasan Single IIN"
        >
            <Head title={`Admin - Detail Pengawasan Single IIN - ${application.application_number}`} />

            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 mb-4">
                        <Link href={route('admin.pengawasan-single-iin.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                Detail Pengawasan Single IIN
                            </h2>
                            <p className="text-gray-600 text-sm">
                                {application.application_number}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {application.status == 'pengajuan' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Lanjutkan ke Pembayaran
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Upload Dokumen Pembayaran</DialogTitle>
                                        <DialogDescription>
                                            Upload dokumen pembayaran. Dokumen ini akan tersedia untuk diunduh oleh pemohon.
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
                                                placeholder="Tambahkan catatan untuk perubahan status ini..."
                                                className="mt-1"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={loading}>
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button
                                                onClick={handleStatusChangeToPayment}
                                                disabled={loading || paymentDocuments.length === 0}
                                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                            >
                                                {loading ? 'Memproses...' : 'Upload'}
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {application.status == 'pembayaran' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Proses ke Verifikasi Lapangan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Upload Dokumen Verifikasi Lapangan</DialogTitle>
                                        <DialogDescription>
                                            Upload dokumen verifikasi lapangan. Dokumen ini akan tersedia untuk diunduh oleh pemohon.
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
                                                    onChange={handleFieldVerificationDocumentChange}
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
                                                                <X className="h-4 w-4" />
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
                                                placeholder="Tambahkan catatan untuk perubahan status ini..."
                                                className="mt-1"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="outline" disabled={loading}>
                                                Batal
                                            </Button>
                                        </DialogClose>
                                        <DialogClose asChild>
                                            <Button
                                                onClick={handleStatusChangeToFieldVerification}
                                                disabled={loading || fieldVerificationDocuments.length === 0}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {loading ? 'Memproses...' : 'Upload dan Lanjutkan'}
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
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
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
                                                onClick={handleProcessToSecondPayment}
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

                        {/* Dialog untuk Penerbitan Pengawasan */}
                        {canIssuePengawasan && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Terbitkan Pengawasan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Terbitkan Dokumen Pengawasan</DialogTitle>
                                        <DialogDescription>
                                            Upload dokumen pengawasan untuk menyelesaikan proses verifikasi lapangan.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        {/* Upload Dokumen Pengawasan */}
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="issuance_documents" className="text-sm font-medium text-gray-700">
                                                    Dokumen Pengawasan <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="issuance_documents"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    multiple
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        setVerificationCompletionFiles(prev => [...prev, ...files]);
                                                        e.target.value = ''; // Reset input
                                                    }}
                                                    className="mt-1"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Format yang didukung: PDF, DOC, DOCX, JPG, PNG. Maksimal 10MB per file. Anda dapat memilih beberapa file sekaligus.
                                                </p>
                                            </div>

                                            {/* Selected Files */}
                                            {verificationCompletionFiles.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">File yang Dipilih:</Label>
                                                    {verificationCompletionFiles.map((file, index) => (
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
                                                                    const newFiles = verificationCompletionFiles.filter((_, i) => i !== index);
                                                                    setVerificationCompletionFiles(newFiles);
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
                                            <Label htmlFor="issuance_notes" className="text-sm font-medium text-gray-700">
                                                Catatan (Opsional)
                                            </Label>
                                            <Textarea
                                                id="issuance_notes"
                                                value={verificationNotes}
                                                onChange={(e) => setVerificationNotes(e.target.value)}
                                                placeholder="Catatan untuk penerbitan pengawasan..."
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
                                                onClick={handleCompleteFieldVerification}
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                                disabled={loading || verificationCompletionFiles.length === 0}
                                            >
                                                {loading ? 'Memproses...' : 'Terbitkan Pengawasan'}
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="detail">Detail Aplikasi</TabsTrigger>
                    <TabsTrigger value="documents">Dokumen</TabsTrigger>
                    <TabsTrigger value="history">Riwayat Status</TabsTrigger>
                </TabsList>

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
                                    <p className="text-sm font-mono">{application.application_number}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                                    <div className="mt-1">
                                        <Badge className={getStatusBadgeClass(application.status)}>
                                            {getStatusLabel(application.status)}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tanggal Dibuat</Label>
                                    <p className="text-sm">
                                        {format(new Date(application.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Terakhir Diperbarui</Label>
                                    <p className="text-sm">
                                        {format(new Date(application.updated_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                                    </p>
                                </div>
                                {application.issued_at && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Tanggal Terbit</Label>
                                        <p className="text-sm">
                                            {format(new Date(application.issued_at), 'dd MMMM yyyy', { locale: id })}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Pemohon</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Nama</Label>
                                    <p className="text-sm">{application.user.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                                    <p className="text-sm">{application.user.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Profil Single IIN</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Nama Perusahaan</Label>
                                    <p className="text-sm">{application.single_iin_profile.contact_person}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Alamat Perusahaan</Label>
                                    <p className="text-sm">{application.single_iin_profile.address}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Nomor Telepon</Label>
                                    <p className="text-sm">{application.single_iin_profile.phone_fax}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                                    <p className="text-sm">{application.single_iin_profile.email}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Pemohon</Label>
                                    <p className="text-sm">{application.user.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Nama Instansi</Label>
                                    <p className="text-sm">{application.single_iin_profile.institution_name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tipe Instansi</Label>
                                    <p className="text-sm">{application.single_iin_profile.institution_type}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tahun</Label>
                                    <p className="text-sm">{application.single_iin_profile.year}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Pembagian IIN</Label>
                                    <p className="text-sm">{application.single_iin_profile.iin_assignment}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tanggal Pembagian</Label>
                                    <p className="text-sm">{application.single_iin_profile.assignment_date}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Regional</Label>
                                    <p className="text-sm">{application.single_iin_profile.regional}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tujuan Penggunaan</Label>
                                    <p className="text-sm">{application.single_iin_profile.usage_purpose}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Kartu Spesimen</Label>
                                    <p className="text-sm">{application.single_iin_profile.card_specimen}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Nama sebelumnya</Label>
                                    <p className="text-sm">{application.single_iin_profile.previous_name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Status Remarks</Label>
                                    <p className="text-sm">{application.single_iin_profile.remarks_status}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {application.field_verification_documents && application.field_verification_documents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Dokumen Verifikasi Lapangan
                                </CardTitle>
                                <CardDescription>
                                    Diupload pada: {application.field_verification_documents_uploaded_at
                                        ? format(new Date(application.field_verification_documents_uploaded_at), 'dd MMMM yyyy HH:mm', { locale: id })
                                        : '-'
                                    }
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {application.field_verification_documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">{doc.original_name}</span>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(route('admin.pengawasan-single-iin.download-field-verification-document', [application.id, index]), '_blank')}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                    {/* Dokumen Pengawasan Terbit */}
                    {application.status === 'terbit' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="h-5 w-5" />
                                    Dokumen Pengawasan Terbit
                                </CardTitle>
                                <CardDescription>
                                    Dokumen yang diterbitkan setelah proses pengawasan selesai
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {application.issuance_documents && application.issuance_documents.length > 0 ? (
                                    <div className="space-y-2">
                                        {application.issuance_documents.map((document, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-4 w-4 text-gray-500" />
                                                    <span className="text-sm">{document.original_name}</span>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(route('admin.pengawasan-single-iin.download-issuance-document', [application.id, index]), '_blank')}
                                                >
                                                    <Download className="h-4 w-4 mr-2" />
                                                    Unduh
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">Dokumen Belum Tersedia</p>
                                        <p className="text-gray-400 text-sm mt-2">
                                            Dokumen akan tersedia setelah proses pengawasan selesai.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {application.issuance_documents && application.issuance_documents.length > 0 && application.additional_documents && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Dokumen Tambahan
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm">Surat Pernyataan Penggunaan QRIS</span>
                                        </div>
                                        <Button onClick={() => downloadFile('qris')}>
                                            <Download className="h-4 w-4 mr-2" />
                                            Unduh
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Bukti Pembayaran dari User */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Bukti Pembayaran dari User
                            </CardTitle>
                            <CardDescription>
                                Dokumen bukti pembayaran yang diupload oleh user
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {application.payment_proof_documents && application.payment_proof_documents.length > 0 ? (
                                <div className="space-y-2">
                                    {application.payment_proof_documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <span className="text-sm font-medium">{doc.original_name}</span>
                                                    <p className="text-xs text-gray-500">
                                                        Diupload pada{' '}
                                                        {application.payment_proof_uploaded_at
                                                            ? format(new Date(application.payment_proof_uploaded_at), 'dd MMMM yyyy', { locale: id })
                                                            : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(route('admin.pengawasan-single-iin.download-payment-proof', [application.id, index]), '_blank')}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Belum Ada Bukti Pembayaran</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Bukti pembayaran akan muncul setelah diupload oleh user.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dokumen Pembayaran */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Dokumen Pembayaran
                            </CardTitle>
                            <CardDescription>
                                Dokumen pembayaran resmi dari sistem
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {application.payment_documents && application.payment_documents.length > 0 ? (
                                <div className="space-y-2">
                                    {application.payment_documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <span className="text-sm font-medium">{doc.original_name}</span>
                                                    <p className="text-xs text-gray-500">
                                                        Diupload pada{' '}
                                                        {application.payment_documents_uploaded_at
                                                            ? format(new Date(application.payment_documents_uploaded_at), 'dd MMMM yyyy', { locale: id })
                                                            : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(route('admin.pengawasan-single-iin.download-payment-document', [application.id, index]), '_blank')}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Belum Ada Dokumen Pembayaran</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Dokumen pembayaran akan muncul setelah diupload.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Bukti Pembayaran Tahap 2 dari User */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Bukti Pembayaran Tahap 2 dari User
                            </CardTitle>
                            <CardDescription>
                                Dokumen bukti pembayaran tahap 2 yang diupload oleh user
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {application.payment_proof_documents_stage_2 && application.payment_proof_documents_stage_2.length > 0 ? (
                                <div className="space-y-2">
                                    {application.payment_proof_documents_stage_2.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <CreditCard className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <span className="text-sm font-medium">{doc.original_name}</span>
                                                    <p className="text-xs text-gray-500">
                                                        Diupload pada{' '}
                                                        {application.payment_proof_uploaded_at_stage_2
                                                            ? format(new Date(application.payment_proof_uploaded_at_stage_2), 'dd MMMM yyyy', { locale: id })
                                                            : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(route('admin.pengawasan-single-iin.download-payment-proof-stage-2', [application.id, index]), '_blank')}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Belum Ada Bukti Pembayaran Tahap 2</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Bukti pembayaran tahap 2 akan muncul setelah diupload oleh user.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dokumen Pembayaran Tahap 2 */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Dokumen Pembayaran Tahap 2
                            </CardTitle>
                            <CardDescription>
                                Dokumen pembayaran tahap 2 resmi dari sistem
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {application.payment_documents_stage_2 && application.payment_documents_stage_2.length > 0 ? (
                                <div className="space-y-2">
                                    {application.payment_documents_stage_2.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <span className="text-sm font-medium">{doc.original_name}</span>
                                                    <p className="text-xs text-gray-500">
                                                        Diupload pada{' '}
                                                        {application.payment_documents_uploaded_at_stage_2
                                                            ? format(new Date(application.payment_documents_uploaded_at_stage_2), 'dd MMMM yyyy', { locale: id })
                                                            : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(route('admin.pengawasan-single-iin.download-payment-document-stage-2', [application.id, index]), '_blank')}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Belum Ada Dokumen Pembayaran Tahap 2</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Dokumen pembayaran tahap 2 akan muncul setelah diupload.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Dokumen Verifikasi Lapangan */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Dokumen Verifikasi Lapangan
                            </CardTitle>
                            <CardDescription>
                                Dokumen hasil verifikasi lapangan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {application.field_verification_documents && application.field_verification_documents.length > 0 ? (
                                <div className="space-y-2">
                                    {application.field_verification_documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Shield className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <span className="text-sm font-medium">{doc.original_name}</span>
                                                    <p className="text-xs text-gray-500">
                                                        Diupload pada{' '}
                                                        {application.field_verification_documents_uploaded_at
                                                            ? format(new Date(application.field_verification_documents_uploaded_at), 'dd MMMM yyyy', { locale: id })
                                                            : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(route('admin.pengawasan-single-iin.download-field-verification-document', [application.id, index]), '_blank')}
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Belum Ada Dokumen Verifikasi</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Dokumen verifikasi lapangan akan muncul setelah diupload.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Riwayat Status
                            </CardTitle>
                            <CardDescription>
                                Riwayat perubahan status aplikasi pengawasan
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {statusLogs.length === 0 ? (
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Belum Ada Riwayat Status</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Riwayat perubahan status akan muncul di sini.
                                    </p>
                                </div>
                            ) : (
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
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}