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
import { PengawasanSingleIinApplication, StatusLog, User } from '@/types';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, CheckCircle, Clock, CreditCard, Download, FileText, Shield, X } from 'lucide-react';
import React, { useState } from 'react';
import DetailTab from './components/DetailTab';
import DocumentTab from './components/DocumentTab';
import StatusTab from './components/StatusTab';

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
            ...(stage && { stage }),
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

            router.post(route('admin.pengawasan-single-iin.upload-payment-documents', application.id), formData, {
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
            });
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
                onFinish: () => setLoading(false),
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
            },
        });
    };

    // Helper functions for file management
    const addPaymentDocument = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            showErrorToast('Ukuran file tidak boleh lebih dari 10MB');
            return;
        }
        setPaymentDocuments((prev) => [...prev, file]);
    };

    const addFieldVerificationDocument = (file: File) => {
        if (file.size > 10 * 1024 * 1024) {
            showErrorToast('Ukuran file tidak boleh lebih dari 10MB');
            return;
        }
        setFieldVerificationDocuments((prev) => [...prev, file]);
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

            router.post(route('pengawasan-single-iin.upload-payment-documents', application.id), formData, {
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
                fieldVerificationDocuments.forEach((file) => {
                    formData.append('field_verification_documents[]', file);
                });
                formData.append('upload_and_change_status', 'true');
            }

            formData.append('status', 'verifikasi-lapangan');
            formData.append('notes', notes || 'Status diubah ke verifikasi lapangan oleh admin');

            router.post(route('admin.pengawasan-single-iin.upload-field-verification-documents', application.id), formData, {
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

            // Append issuance documents (dokumen pengawasan terbit)
            verificationCompletionFiles.forEach((file, index) => {
                formData.append(`issuance_documents[${index}]`, file);
            });

            router.post(route('admin.pengawasan-single-iin.upload-issuance-documents', application.id), formData, {
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
        setPaymentDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    const removeFieldVerificationDocument = (index: number) => {
        setFieldVerificationDocuments((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <DashboardLayout user={auth.user} title="Admin - Detail Pemantauan Single IIN">
            <Head title={`Admin - Detail Pemantauan Single IIN - ${application.application_number}`} />

            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center mb-4">
                        <Link href={route('admin.pengawasan-single-iin.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h2 className="text-xl font-semibold leading-tight text-gray-800">Detail Pemantauan Single IIN</h2>
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
                                                    accept='.pdf,.doc,.docx'
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
                        )}

                        {/* Dialog untuk Penerbitan Pengawasan */}
                        {application.status === 'verifikasi-lapangan' && (
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
                                        {/* Upload Dokumen Pengawasan */}
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="issuance_documents" className="text-sm font-medium text-gray-700">
                                                    Dokumen Pemantauan <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="issuance_documents"
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    max={20 * 1024 * 1024}
                                                    multiple
                                                    onChange={(e) => {
                                                        const files = Array.from(e.target.files || []);
                                                        setVerificationCompletionFiles((prev) => [...prev, ...files]);
                                                        e.target.value = ''; // Reset input
                                                    }}
                                                    className="mt-1"
                                                />
                                                <p className="mt-1 text-xs text-gray-500">
                                                    Anda dapat memilih beberapa file sekaligus. Format yang didukung: PDF, DOC, DOCX. Maksimal 20MB per file.
                                                </p>
                                            </div>

                                            {/* Selected Files */}
                                            {verificationCompletionFiles.length > 0 && (
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium text-gray-700">File yang Dipilih:</Label>
                                                    {verificationCompletionFiles.map((file, index) => (
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
                                                placeholder="Catatan untuk penerbitan pemantauan..."
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
                                                className="text-white bg-green-600 hover:bg-green-700"
                                                disabled={loading || verificationCompletionFiles.length === 0}
                                            >
                                                {loading ? 'Memproses...' : 'Upload Pemberitahuan Pemantauan'}
                                            </Button>
                                        </DialogClose>
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
