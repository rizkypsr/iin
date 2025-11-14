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
import { PengawasanIinNasionalApplication, StatusLog, User } from '@/types';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Award, CheckCircle, Clock, CreditCard, Download, FileText, Shield, User as UserIcon, X } from 'lucide-react';
import React, { useState } from 'react';
import DetailTab from './components/DetailTab';
import DocumentTab from './components/DocumentTab';
import StatusTab from './components/StatusTab';

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
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <Link href={route('admin.pengawasan-iin-nasional.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Pemantauan IIN Nasional</h2>
                            <p className="text-sm text-gray-600">{application.application_number}</p>
                        </div>
                    </div>
                    <div className="flex gap-3 items-center">
                        {application.status == 'pengajuan' && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                                        <CreditCard className="mr-2 w-4 h-4" />
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
                                                className="text-white bg-blue-600 hover:bg-blue-700"
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
                                        <Button className="text-white bg-green-600 hover:bg-green-700">
                                            <CheckCircle className="mr-2 w-4 h-4" />
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
                                                                    onClick={() => removeFieldVerificationDocument(index)}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <X className="w-4 h-4" />
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
                                                                className="flex justify-between items-center p-3 rounded-lg border border-gray-200"
                                                            >
                                                                <div className="flex gap-2 items-center">
                                                                    <FileText className="w-4 h-4 text-gray-600" />
                                                                    <span className="text-sm text-gray-700">{document.original_name}</span>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => downloadFieldVerificationDocument(index)}
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
                                                    className="text-white bg-green-600 hover:bg-green-700"
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
                                    <Button className="text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                                        <CheckCircle className="mr-2 w-4 h-4" />
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
                                    <div className="py-4 space-y-6">
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
                                                                className="flex justify-between items-center p-2 text-xs text-gray-600 bg-gray-50 rounded"
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
                                                                    className="p-0 w-4 h-4 hover:bg-red-100"
                                                                >
                                                                    <X className="w-3 h-3 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <DialogFooter className="flex gap-3 justify-end">
                                        <DialogClose asChild>
                                            <Button variant="outline">Batal</Button>
                                        </DialogClose>
                                        <Button
                                            onClick={handleCompleteFieldVerification}
                                            disabled={loading || verificationCompletionFiles.length === 0}
                                            className="text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="mr-2 w-4 h-4 rounded-full border-b-2 border-white animate-spin"></div>
                                                    Memproses...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="mr-2 w-4 h-4" />
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
            </Tabs>
        </DashboardLayout>
    );
}
