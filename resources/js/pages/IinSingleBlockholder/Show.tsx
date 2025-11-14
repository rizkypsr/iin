import QrisModal from '@/components/QrisModal';
import SurveyModal from '@/components/SurveyModal';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { IinSingleBlockholderApplication, PageProps, PaymentDocument, StatusLog } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { AlertCircle, ArrowLeft, Award, CheckCircle, Clock, CreditCard, Download, FileText, Upload, User } from 'lucide-react';
import { useState } from 'react';
import DetailTab from './components/DetailTab';
import PaymentTab from './components/PaymentTab';
import StatusTab from './components/StatusTab';
import DocumentTab from './components/DocumentTab';


interface Props extends PageProps {
    application: IinSingleBlockholderApplication;
    statusLogs: StatusLog[];
}

export default function IinSingleBlockholderShow({ application, statusLogs, auth, attachmentBaseUrl }: Props) {
    const [activeTab, setActiveTab] = useState('detail');

    const [selectedApplication, setSelectedApplication] = useState<IinSingleBlockholderApplication | null>(null);
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        payment_proof: [] as File[],
    });

    const handleQrisFileUpload = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        router.post(route('iin-single-blockholder.upload-additional-documents', selectedApplication?.id), formData, {
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
            <Head title={`Single IIN/Blockholder - ${application.application_number}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                        <Link href={route('iin-single-blockholder.index')}>
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="mr-2 w-4 h-4" />
                                Kembali
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{application.application_number}</h1>
                            <div className="flex gap-2 items-center">
                                <p className="text-gray-600">Single IIN/Blockholder</p>
                            </div>
                        </div>
                    </div>

                    {application.status === 'perbaikan' && auth.user.role === 'user' && (
                        <Link href={route('iin-single-blockholder.edit', application.id)}>
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
                    <TabsContent value="payment">
                        <PaymentTab application={application} />
                    </TabsContent>
                    <TabsContent value="document">
                        <DocumentTab application={application} />
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
                    window.open(route('iin-single-blockholder.download-file', [application.id, 'certificate']), '_blank');
                }}
                certificateType="Sertifikat Single IIN/Blockholder"
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
