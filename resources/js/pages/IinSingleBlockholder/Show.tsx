import SurveyModal from '@/components/SurveyModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { IinSingleBlockholderApplication, PageProps, StatusLog } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import DetailTab from './components/DetailTab';
import PaymentTab from './components/PaymentTab';
import StatusTab from './components/StatusTab';
import DocumentTab from './components/DocumentTab';
import { Alert } from '@/components/ui/alert';


interface Props extends PageProps {
    application: IinSingleBlockholderApplication;
    statusLogs: StatusLog[];
}

export default function IinSingleBlockholderShow({ application, statusLogs, auth, attachmentBaseUrl }: Props) {
    const [activeTab, setActiveTab] = useState('detail');

    const [selectedApplication, setSelectedApplication] = useState<IinSingleBlockholderApplication | null>(null);
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        payment_proof: [] as File[],
    });

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

                {application.status === 'perbaikan' && (
                    <Alert className="text-amber-800 bg-amber-50 border-amber-200">
                        <AlertCircle className="mr-2 w-4 h-4" />
                        Permohonan Single IIN ditolak. Silakan perbaiki aplikasi terlebih dahulu.
                        <br />
                        Catatan: {application.notes || 'Tidak ada catatan'}
                    </Alert>
                )}

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
                applicationType="single_iin"
                applicationId={application.id}
            />
        </DashboardLayout>
    );
}
