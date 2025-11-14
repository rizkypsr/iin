import SurveyModal from '@/components/SurveyModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { PengawasanIinNasionalApplication, StatusLog, User } from '@/types';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, Clock, CreditCard, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import StatusTab from './components/StatusTab';
import PaymentTab from './components/PaymentTab';
import DocumentTab from './components/DocumentTab';
import DetailTab from './components/DetailTab';

interface Props {
    application: PengawasanIinNasionalApplication;
    statusLogs: StatusLog[];
    auth: {
        user: User;
    };
    attachmentBaseUrl: string;
}

export default function PengawasanIinNasionalShow({ application, statusLogs, auth, attachmentBaseUrl }: Props) {
    const [activeTab, setActiveTab] = useState('detail');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        payment_proof: [] as File[],
    });
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setFormData({
                ...formData,
                payment_proof: [...formData.payment_proof, ...newFiles],
            });
        }
    };

    const removeFile = (index: number) => {
        const newFiles = formData.payment_proof.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            payment_proof: newFiles,
        });
    };

    const handleUploadPaymentProof = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.payment_proof.length === 0) {
            showErrorToast('Pilih file bukti pembayaran terlebih dahulu');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const formDataToSend = new FormData();
        formData.payment_proof.forEach((file, index) => {
            formDataToSend.append(`payment_proof_documents[${index}]`, file);
        });

        try {
            router.post(route('pengawasan-iin-nasional.upload-payment-proof', application.id), formDataToSend, {
                onProgress: (progress) => {
                    setUploadProgress((progress as any)?.percentage || 0);
                },
                onSuccess: () => {
                    showSuccessToast('Bukti pembayaran berhasil diupload');
                    setFormData({ payment_proof: [] });
                    setUploading(false);
                    setUploadProgress(0);
                },
                onError: (errors) => {
                    const errorMessage = (Object.values(errors)[0] as string) || 'Terjadi kesalahan saat mengupload bukti pembayaran';
                    showErrorToast(errorMessage);
                    setUploading(false);
                    setUploadProgress(0);
                },
            });
        } catch (error) {
            showErrorToast('Terjadi kesalahan saat mengupload bukti pembayaran');
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Pemantauan IIN Nasional - ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <Link href={route('pengawasan-iin-nasional.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pemantauan IIN Nasional</h1>
                            <p className="text-gray-600">{application.application_number}</p>
                        </div>
                    </div>
                    <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(application.status)}`}
                    >
                        {getStatusLabel(application.status)}
                    </div>
                </div>

                {/* Status Alert */}
                {application.status === 'pengajuan' && (
                    <Alert>
                        <Clock className="w-4 h-4" />
                        <AlertTitle>Aplikasi Sedang Diproses</AlertTitle>
                        <AlertDescription>
                            Aplikasi Pemantauan Anda sedang dalam tahap review. Kami akan menghubungi Anda jika diperlukan informasi tambahan.
                        </AlertDescription>
                    </Alert>
                )}

                {application.status === 'pembayaran' && (
                    <Alert>
                        <CreditCard className="w-4 h-4" />
                        <AlertTitle>Upload Bukti Pembayaran</AlertTitle>
                        <AlertDescription>Silakan upload bukti pembayaran untuk melanjutkan proses pemantauan.</AlertDescription>
                    </Alert>
                )}

                {application.status === 'verifikasi-lapangan' && (
                    <Alert>
                        <UserIcon className="w-4 h-4" />
                        <AlertTitle>Verifikasi Lapangan</AlertTitle>
                        <AlertDescription>Tim verifikasi akan melakukan kunjungan lapangan.</AlertDescription>
                    </Alert>
                )}

                {application.status === 'terbit' && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <AlertTitle className="text-green-800">Pemantauan Selesai</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Proses pemantauan telah selesai. Dokumen hasil pemantauan dapat diunduh di tab Dokumen.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Main Content */}
                <Tabs defaultValue="detail">
                    <div className='flex justify-center'>
                        <TabsList>
                            <TabsTrigger value="detail">Detail</TabsTrigger>
                            <TabsTrigger value="document">Dokumen</TabsTrigger>
                            <TabsTrigger value="payment">Pembayaran</TabsTrigger>
                            <TabsTrigger value="status">Status Log</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="detail">
                        <DetailTab application={application} />
                    </TabsContent>
                    <TabsContent value="document">
                        <DocumentTab application={application} />
                    </TabsContent>
                    <TabsContent value="payment">
                        <PaymentTab application={application} />
                    </TabsContent>
                    <TabsContent value="status">
                        <StatusTab statusLogs={statusLogs} />
                    </TabsContent>
                </Tabs>
            </div>

            <SurveyModal
                isOpen={isSurveyModalOpen}
                onClose={() => setIsSurveyModalOpen(false)}
                onDownload={() => {
                    window.open(
                        route('pengawasan-iin-nasional.download-issuance-document', {
                            pengawasanIinNasional: application.id,
                            index: 0,
                        }),
                        '_blank',
                    )
                }}
                certificateType="Pemberitahuan Pemantauan IIN Nasional"
            />
        </DashboardLayout>
    );
}
