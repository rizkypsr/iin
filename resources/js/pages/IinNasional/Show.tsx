import QrisModal from '@/components/QrisModal';
import SurveyModal from '@/components/SurveyModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { IinNasionalApplication, PageProps, StatusLog } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import DetailTab from './components/DetailTab';
import PaymentTab from './components/PaymentTab';
import DocumentTab from './components/DocumentTab';
import StatusTab from './components/StatusTab';

interface Props extends PageProps {
    application: IinNasionalApplication;
    statusLogs: StatusLog[];
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
        };
    };
    attachmentBaseUrl: string;
}

export default function IinNasionalShow({ application, statusLogs, auth }: Props) {
    const [activeTab, setActiveTab] = useState('detail');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        payment_proof: [] as File[],
    });
    const [selectedApplication, setSelectedApplication] = useState<IinNasionalApplication | null>(null);

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
        setFormData({
            ...formData,
            payment_proof: formData.payment_proof.filter((_, i) => i !== index),
        });
    };

    const uploadPaymentProof = (e: React.FormEvent) => {
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

        router.post(route('iin-nasional.upload-payment-proof', application.id), data, {
            onProgress: (progress) => {
                setUploadProgress(progress?.percentage || 0);
            },
            onSuccess: () => {
                setUploading(false);
                setUploadProgress(0);
                setFormData({ payment_proof: [] });
                showSuccessToast(`${formData.payment_proof.length} file bukti pembayaran berhasil diunggah`);
            },
            onError: (errors) => {
                setUploading(false);
                setUploadProgress(0);
                const errorMessage = (Object.values(errors)[0] as string) || 'Gagal mengunggah bukti pembayaran';
                showErrorToast(errorMessage);
            },
        });
    };

    const handleQrisFileUpload = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        router.post(route('iin-nasional.upload-additional-documents', selectedApplication?.id), formData, {
            onSuccess: () => {
                showSuccessToast('File QRIS berhasil diupload!');
                setIsQrisModalOpen(false);
            },
            onError: (errors) => {
                console.error(errors);
                showErrorToast('Gagal mengupload file QRIS');
            },
        });
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title={`IIN Nasional - ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                        <Link href={route('iin-nasional.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{application.application_number}</h1>
                            <div className="flex gap-2 items-center">
                                <p className="text-gray-600">IIN Nasional</p>
                            </div>
                        </div>
                    </div>

                    {application.status === 'perbaikan' && auth.user.role === 'user' && (
                        <Link href={route('iin-nasional.edit', application.id)}>
                            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                                <AlertCircle className="mr-2 w-4 h-4" />
                                Perbaiki Aplikasi
                            </Button>
                        </Link>
                    )}
                </div>

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
                    window.open(route('iin-nasional.download-file', [application.id, 'certificate']), '_blank');
                }}
                certificateType="IIN Nasional"
            />

            <QrisModal
                isOpen={isQrisModalOpen}
                onClose={() => setIsQrisModalOpen(false)}
                onTemplateDownload={() => {
                    // Any additional actions on template download can be handled here
                }}
                onFileUpload={(file: File) => handleQrisFileUpload(file)}
            />
        </DashboardLayout>
    );
}
