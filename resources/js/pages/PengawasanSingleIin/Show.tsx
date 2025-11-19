import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, CheckCircle, Clock, CreditCard, User } from 'lucide-react';
import { useState } from 'react';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import SurveyModal from '@/components/SurveyModal';
import StatusTab from './components/StatusTab';
import { PengawasanSingleIinApplication, StatusLog } from '@/types';
import DetailTab from './components/DetailTab';
import DocumentTab from './components/DocumentTab';
import PaymentTab from './components/PaymentTab';

interface Props {
    application: PengawasanSingleIinApplication;
    statusLogs: StatusLog[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
}

export default function PengawasanSingleIinShow({ application, statusLogs, auth }: Props) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [selectedApplication, setSelectedApplication] = useState<PengawasanSingleIinApplication | null>(null);
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        payment_proof: [] as File[],
    });

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

    const handleUploadPaymentProof = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.payment_proof.length === 0) {
            showErrorToast('Silahkan pilih file bukti pembayaran terlebih dahulu');
            return;
        }

        setUploading(true);

        const data = new FormData();
        formData.payment_proof.forEach((file, index) => {
            data.append(`payment_proof[${index}]`, file);
        });

        // Tentukan stage berdasarkan status aplikasi
        const stage = application.status === 'pembayaran-tahap-2' ? 2 : 1;
        data.append('stage', stage.toString());

        router.post(route('pengawasan-single-iin.upload-payment-proof', application.id), data, {
            onProgress: (progress) => {
                setUploadProgress(progress?.percentage || 0);
            },
            onSuccess: () => {
                setUploading(false);
                setUploadProgress(0);
                setFormData({ payment_proof: [] });
                const stageText = stage === 2 ? 'Tahap 2' : 'Tahap 1';
                showSuccessToast(`Bukti pembayaran ${stageText} berhasil diunggah`);
            },
            onError: (errors) => {
                setUploading(false);
                setUploadProgress(0);
                const errorMessage = (Object.values(errors)[0] as string) || 'Gagal mengunggah bukti pembayaran';
                showErrorToast(errorMessage);
            },
        });
    };

    // Status utility functions are imported from @/utils/statusUtils

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`Pemantauan Single IIN - ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                        <Link href={route('pengawasan-single-iin.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pemantauan Single IIN</h1>
                            <p className="text-gray-600">{application.application_number}</p>
                        </div>
                    </div>
                    <div
                        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${getStatusBadgeClass(application.status, { detailed: false })}`}
                    >
                        {getStatusLabel(application.status, { detailed: false })}
                    </div>
                </div>

                {/* Status Alert */}
                {application.status === 'submitted' && (
                    <Alert>
                        <Clock className="w-4 h-4" />
                        <AlertTitle>Aplikasi Sedang Diproses</AlertTitle>
                        <AlertDescription>
                            Aplikasi pengawasan Anda sedang dalam tahap review. Kami akan menghubungi Anda jika diperlukan informasi tambahan.
                        </AlertDescription>
                    </Alert>
                )}

                {application.status === 'payment_verified' && application.can_upload_payment_proof && (
                    <Alert>
                        <CreditCard className="w-4 h-4" />
                        <AlertTitle>Upload Bukti Pembayaran</AlertTitle>
                        <AlertDescription>Silakan upload bukti pembayaran untuk melanjutkan proses pengawasan.</AlertDescription>
                    </Alert>
                )}

                {application.status === 'field_verification' && (
                    <Alert>
                        <User className="w-4 h-4" />
                        <AlertTitle>Verifikasi Lapangan</AlertTitle>
                        <AlertDescription>
                            Tim verifikasi akan melakukan kunjungan lapangan. Pastikan dokumen dan fasilitas siap untuk diperiksa.
                        </AlertDescription>
                    </Alert>
                )}

                {application.status === 'issued' && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <AlertTitle className="text-green-800">Pemantauan Selesai</AlertTitle>
                        <AlertDescription className="text-green-700">
                            Proses pemantauan telah selesai. Dokumen hasil pemantauan dapat diunduh di bawah ini.
                        </AlertDescription>
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
                        route('pengawasan-single-iin.download-issuance-document', [application.id, 0]),
                        '_blank',
                    )
                }}
                certificateType="Pemberitahuan Pemantauan Single IIN"
            />
        </DashboardLayout>
    );
}
