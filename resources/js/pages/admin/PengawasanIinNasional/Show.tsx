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
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Award, CheckCircle, Clock, CreditCard, Download, FileText, Shield, User as UserIcon, X } from 'lucide-react';
import React, { useState } from 'react';

interface PaymentDocument {
    original_name: string;
    file_path: string;
}

interface PengawasanIinNasionalApplication {
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
    field_verification_documents?: PaymentDocument[];
    field_verification_documents_uploaded_at?: string;
    issuance_documents?: PaymentDocument[];
    issuance_documents_uploaded_at?: string;
    additional_documents?: string;
    user: {
        id: number;
        name: string;
        email: string;
        company_name?: string;
        company_phone?: string;
        company_email?: string;
    };
    admin?: {
        id: number;
        name: string;
        email: string;
    };
    iin_nasional_profile?: {
        id: number;
        institution_name?: string;
        brand?: string;
        iin_national_assignment?: string;
        assignment_year?: number;
        regional?: string;
        aspi_recommendation_letter?: string;
        usage_purpose?: string;
        address?: string;
        phone_fax?: string;
        email_office?: string;
        contact_person_name?: string;
        contact_person_email?: string;
        contact_person_phone?: string;
        remarks_status?: string;
        card_issued?: boolean;
    };
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
    application: PengawasanIinNasionalApplication;
    statusLogs: StatusLog[];
    application_counts?: {
        pengawasan_iin_nasional?: number;
        pengawasan_single_iin?: number;
    };
}

export default function AdminPengawasanIinNasionalShow({ auth, application, statusLogs }: Props) {
    const [activeTab, setActiveTab] = useState('detail');
    const [loading, setLoading] = useState(false);
    const [paymentDocuments, setPaymentDocuments] = useState<File[]>([]);
    const [fieldVerificationDocuments, setFieldVerificationDocuments] = useState<File[]>([]);
    const [notes, setNotes] = useState('');
    const [verificationCompletionFiles, setVerificationCompletionFiles] = useState<File[]>([]);

    const addPaymentDocument = (file: File) => {
        setPaymentDocuments((prev) => [...prev, file]);
    };

    const downloadPaymentDocument = (index: number) => {
        window.open(
            route('admin.pengawasan-iin-nasional.download-payment-document', {
                pengawasanIinNasional: application.id,
                index: index,
            }),
            '_blank',
        );
    };

    const downloadPaymentProof = (index: number) => {
        window.open(
            route('admin.pengawasan-iin-nasional.download-payment-proof', {
                pengawasanIinNasional: application.id,
                index: index,
            }),
            '_blank',
        );
    };

    const downloadIssuanceDocument = (index: number) => {
        window.open(
            route('pengawasan-iin-nasional.download-issuance-document', {
                pengawasanIinNasional: application.id,
                index: index,
            }),
            '_blank',
        );
    };

    const downloadFieldVerificationDocument = (index: number) => {
        window.open(
            route('admin.pengawasan-iin-nasional.download-field-verification-document', {
                pengawasanIinNasional: application.id,
                index: index,
            }),
            '_blank',
        );
    };

    // Handle payment document upload and status change
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
            formData.append('notes', notes || 'Status diubah ke pembayaran terverifikasi oleh admin');
            formData.append('upload_and_change_status', '1');

            router.post(route('admin.pengawasan-iin-nasional.upload-payment-documents', application.id), formData, {
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
            });
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
                fieldVerificationDocuments.forEach((file, index) => {
                    formData.append(`field_verification_documents[${index}]`, file);
                });
            }

            formData.append('status', 'verifikasi-lapangan');
            formData.append('upload_and_change_status', '1');
            formData.append('notes', notes || 'Status diubah ke verifikasi lapangan oleh admin');

            router.post(route('admin.pengawasan-iin-nasional.upload-field-verification-documents', application.id), formData, {
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

    const downloadFile = (type: string, stage?: string) => {
        const url = route('pengawasan-iin-nasional.download-file', {
            pengawasanIinNasional: application.id,
            type: type,
            ...(stage && { stage }),
        });
        window.open(url, '_blank');
    };

    const handleCompleteFieldVerification = async () => {
        // Validate that at least one file is uploaded
        if (verificationCompletionFiles.length === 0) {
            showErrorToast('Harap upload minimal 1 file dokumen pemantauan');
            return;
        }

        setLoading(true);

        try {
            // Create FormData to handle file uploads
            const formData = new FormData();
            formData.append('notes', 'Dokumen pemantauan telah diupload dan status diubah ke terbit');

            // Append issuance documents (dokumen pemantauan terbit)
            verificationCompletionFiles.forEach((file, index) => {
                formData.append(`issuance_documents[${index}]`, file);
            });

            router.post(route('admin.pengawasan-iin-nasional.upload-issuance-documents', application.id), formData, {
                forceFormData: true,
                onSuccess: () => {
                    showSuccessToast('Dokumen pemantauan berhasil diupload dan status diubah ke terbit');
                    setVerificationCompletionFiles([]);
                },
                onError: (errors) => {
                    console.error('Error uploading issuance documents:', errors);
                    showErrorToast('Gagal mengupload dokumen pemantauan. Silakan coba lagi.');
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            console.error('Error uploading issuance documents:', error);
            showErrorToast('Terjadi kesalahan. Silakan coba lagi.');
            setLoading(false);
        }
    };

    const handleFieldVerificationDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFieldVerificationDocuments(Array.from(e.target.files));
        }
    };

    const removePaymentDocument = (index: number) => {
        setPaymentDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const removeFieldVerificationDocument = (index: number) => {
        setFieldVerificationDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <DashboardLayout user={auth.user} title="Admin - Detail Pemantauan IIN Nasional">
            <Head title={`Admin - Detail Pemantauan IIN Nasional - ${application.application_number}`} />

            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('admin.pengawasan-iin-nasional.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl leading-tight font-semibold text-gray-800">Detail Pemantauan IIN Nasional</h2>
                            <p className="text-sm text-gray-600">{application.application_number}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {application.status == 'pengajuan' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700">
                                        <CreditCard className="mr-2 h-4 w-4" />
                                        Lanjutkan ke Pembayaran
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
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
                                                    accept=".pdf,.doc,.docx"
                                                    max={20 * 1024 * 1024}
                                                    multiple
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        files.forEach((file) => addPaymentDocument(file));
                                                        e.target.value = ''; // Reset input
                                                    }}
                                                    className="mt-1"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Anda dapat memilih beberapa file sekaligus. Format yang didukung: PDF, DOC, DOCX. Maksimal 20MB per file.
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
                                                className="bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                {loading ? 'Memproses...' : 'Upload'}
                                            </Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}

                        {application.status == 'pembayaran' && (
                            <>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className="bg-green-600 text-white hover:bg-green-700">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Proses ke Verifikasi Lapangan
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
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
                                                        accept=".pdf,.doc,.docx"
                                                        max={20 * 1024 * 1024}
                                                        multiple
                                                        onChange={handleFieldVerificationDocumentChange}
                                                        className="mt-1"
                                                    />
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        Anda dapat memilih beberapa file sekaligus. Format yang didukung: PDF, DOC, DOCX. Maksimal 20MB per file.
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

                                                {/* Existing Field Verification Documents */}
                                                {application.field_verification_documents && application.field_verification_documents.length > 0 && (
                                                    <div className="space-y-2">
                                                        <Label className="text-sm font-medium text-gray-700">Dokumen yang Sudah Diupload:</Label>
                                                        {application.field_verification_documents.map((document, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="h-4 w-4 text-gray-600" />
                                                                    <span className="text-sm text-gray-700">{document.original_name}</span>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => downloadFieldVerificationDocument(index)}
                                                                >
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
                                                    className="bg-green-600 text-white hover:bg-green-700"
                                                >
                                                    {loading ? 'Memproses...' : 'Upload dan Lanjutkan'}
                                                </Button>
                                            </DialogClose>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </>
                        )}

                        {application.status == 'verifikasi-lapangan' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700">
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Selesaikan Verifikasi Lapangan
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>Upload Dokumen Pemantauan</DialogTitle>
                                        <DialogDescription>
                                            Upload dokumen pemantauan. Dokumen ini akan tersedia untuk diunduh oleh pemohon.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-6 py-4">
                                        {/* File Upload untuk Dokumen Pemantauan */}
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="verification_files" className="text-sm font-medium text-gray-700">
                                                    Dokumen Pemantauan <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="verification_files"
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.doc,.docx"
                                                    max={20 * 1024 * 1024}
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        setVerificationCompletionFiles(files);
                                                    }}
                                                    className="mt-1"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Anda dapat memilih beberapa file sekaligus. Format yang didukung: PDF, DOC, DOCX. Maksimal 20MB per file.
                                                </p>
                                                {verificationCompletionFiles.length > 0 && (
                                                    <div className="mt-2 space-y-1">
                                                        <p className="text-xs font-medium text-gray-600">
                                                            File yang dipilih ({verificationCompletionFiles.length} file):
                                                        </p>
                                                        {verificationCompletionFiles.map((file, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center justify-between rounded bg-gray-50 p-2 text-xs text-gray-600"
                                                            >
                                                                <span>{file.name}</span>
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const newFiles = verificationCompletionFiles.filter((_, i) => i !== index);
                                                                        setVerificationCompletionFiles(newFiles);
                                                                    }}
                                                                    className="h-4 w-4 p-0 hover:bg-red-100"
                                                                >
                                                                    <X className="h-3 w-3 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter className="flex justify-end gap-3">
                                        <DialogClose asChild>
                                            <Button variant="outline">Batal</Button>
                                        </DialogClose>
                                        <Button
                                            onClick={handleCompleteFieldVerification}
                                            disabled={loading || verificationCompletionFiles.length === 0}
                                            className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Upload Pemberitahuan Pemantauan
                                                </>
                                            )}
                                        </Button>
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Nomor Aplikasi</Label>
                                    <p className="font-mono text-sm">{application.application_number}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                                    <div className="mt-1">
                                        <Badge className={getStatusBadgeClass(application.status)}>{getStatusLabel(application.status)}</Badge>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tanggal Dibuat</Label>
                                    <p className="text-sm">{format(new Date(application.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Terakhir Diperbarui</Label>
                                    <p className="text-sm">{format(new Date(application.updated_at), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                                </div>
                                {application.issued_at && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Tanggal Terbit</Label>
                                        <p className="text-sm">{format(new Date(application.issued_at), 'dd MMMM yyyy', { locale: id })}</p>
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
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Nama</Label>
                                    <p className="text-sm">{application.user.name}</p>
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                                    <p className="text-sm">{application.user.email}</p>
                                </div>
                                {application.user.company_name && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Nama Perusahaan</Label>
                                        <p className="text-sm">{application.user.company_name}</p>
                                    </div>
                                )}
                                {application.user.company_phone && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Telepon Perusahaan</Label>
                                        <p className="text-sm">{application.user.company_phone}</p>
                                    </div>
                                )}
                                {application.user.company_email && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-500">Email Perusahaan</Label>
                                        <p className="text-sm">{application.user.company_email}</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {application.iin_nasional_profile && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Profil IIN Nasional</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    {application.iin_nasional_profile.institution_name && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Nama Institusi</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.institution_name}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.brand && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Brand</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.brand}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.iin_national_assignment && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Penugasan IIN Nasional</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.iin_national_assignment}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.assignment_year && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Tahun Penugasan</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.assignment_year}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.regional && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Provinsi</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.regional}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.usage_purpose && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Tujuan Penggunaan</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.usage_purpose}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.address && (
                                        <div className="md:col-span-2">
                                            <Label className="text-sm font-medium text-gray-500">Alamat</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.address}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.phone_fax && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Telepon/Fax</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.phone_fax}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.email_office && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Email Kantor</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.email_office}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.contact_person_name && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Nama Contact Person</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.contact_person_name}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.contact_person_email && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Email Contact Person</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.contact_person_email}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.contact_person_phone && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Telepon Contact Person</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.contact_person_phone}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.aspi_recommendation_letter && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Surat Rekomendasi ASPI</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.aspi_recommendation_letter}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.remarks_status && (
                                        <div className="md:col-span-2">
                                            <Label className="text-sm font-medium text-gray-500">Status Keterangan</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.remarks_status}</p>
                                        </div>
                                    )}
                                    {application.iin_nasional_profile.card_issued !== undefined && (
                                        <div>
                                            <Label className="text-sm font-medium text-gray-500">Kartu Diterbitkan</Label>
                                            <p className="text-sm">{application.iin_nasional_profile.card_issued ? 'Ya' : 'Tidak'}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {!application.payment_proof_documents?.length &&
                        !application.payment_documents?.length &&
                        !application.field_verification_documents?.length &&
                        !application.issuance_documents?.length && (
                            <div className="py-8 text-center">
                                <FileText className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                <p className="text-lg text-gray-500">Belum Ada Dokumen</p>
                                <p className="mt-2 text-sm text-gray-400">Dokumen yang diupload akan muncul di sini.</p>
                            </div>
                        )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-6">
                    {application.issuance_documents && application.issuance_documents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CheckCircle className="h-5 w-5" />
                                    Dokumen Pemberitahuan Pemantauan
                                </CardTitle>
                                <CardDescription>
                                    Diupload pada:{' '}
                                    {application.issuance_documents_uploaded_at
                                        ? format(new Date(application.issuance_documents_uploaded_at), 'dd MMMM yyyy HH:mm', { locale: id })
                                        : '-'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {application.issuance_documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">{doc.original_name}</span>
                                            </div>
                                            <Button onClick={() => downloadIssuanceDocument(index)}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
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
                                    <div className="flex items-center justify-between rounded-lg border p-3">
                                        <div className="flex items-center gap-3">
                                            <FileText className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm">Surat Pernyataan Penggunaan QRIS</span>
                                        </div>
                                        <Button onClick={() => downloadFile('qris')}>
                                            <Download className="mr-2 h-4 w-4" />
                                            Unduh
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {application.payment_proof_documents && application.payment_proof_documents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Bukti Pembayaran dari User
                                </CardTitle>
                                <CardDescription>
                                    Diupload pada:{' '}
                                    {application.payment_proof_uploaded_at
                                        ? format(new Date(application.payment_proof_uploaded_at), 'dd MMMM yyyy HH:mm', { locale: id })
                                        : '-'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {application.payment_proof_documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">{doc.original_name}</span>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => downloadPaymentProof(index)}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {application.payment_documents && application.payment_documents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Dokumen Pembayaran
                                </CardTitle>
                                <CardDescription>
                                    Diupload pada:{' '}
                                    {application.payment_documents_uploaded_at
                                        ? format(new Date(application.payment_documents_uploaded_at), 'dd MMMM yyyy HH:mm', { locale: id })
                                        : '-'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {application.payment_documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">{doc.original_name}</span>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => downloadPaymentDocument(index)}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {application.field_verification_documents && application.field_verification_documents.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Dokumen Verifikasi Lapangan
                                </CardTitle>
                                <CardDescription>
                                    Diupload pada:{' '}
                                    {application.field_verification_documents_uploaded_at
                                        ? format(new Date(application.field_verification_documents_uploaded_at), 'dd MMMM yyyy HH:mm', { locale: id })
                                        : '-'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {application.field_verification_documents.map((doc, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-gray-500" />
                                                <span className="text-sm">{doc.original_name}</span>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={() => downloadFieldVerificationDocument(index)}>
                                                <Download className="mr-2 h-4 w-4" />
                                                Unduh
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Riwayat Status
                            </CardTitle>
                            <CardDescription>Riwayat perubahan status aplikasi pemantauan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {statusLogs.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <p className="text-lg text-gray-500">Belum Ada Riwayat Status</p>
                                    <p className="mt-2 text-sm text-gray-400">Riwayat perubahan status akan muncul di sini.</p>
                                </div>
                            ) : (
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
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </DashboardLayout>
    );
}
