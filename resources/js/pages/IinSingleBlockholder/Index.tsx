import QrisModal from '@/components/QrisModal';
import SurveyModal from '@/components/SurveyModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, Award, Calendar, CheckCircle, Clock, CreditCard, Download, Eye, FileText, MapPin, Plus, TriangleAlert, Upload, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface IinSingleBlockholderApplication {
    id: number;
    application_number: string;
    status: string;
    status_label?: string; // Made optional since we're calculating it
    status_color?: string; // Made optional since we're calculating it
    created_at: string;
    submitted_at: string;
    iin_number?: string;
    additional_documents?: string;
    expense_reim_id?: number | null;
    can_upload_payment_proof: boolean;
    can_download_certificate: boolean;
    user: {
        name: string;
        email: string;
    };

    admin?: {
        name: string;
    };
}

interface Props extends PageProps {
    applications: {
        data: IinSingleBlockholderApplication[];
        links: any[];
        meta: any;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pengajuan':
            return <FileText className="h-4 w-4" />;
        case 'perbaikan':
            return <AlertCircle className="h-4 w-4" />;
        case 'pembayaran':
            return <CreditCard className="h-4 w-4" />;
        case 'verifikasi-lapangan':
            return <MapPin className="h-4 w-4" />;
        case 'pembayaran-tahap-2':
            return <CreditCard className="h-4 w-4" />;
        case 'terbit':
            return <Award className="h-4 w-4" />;
        default:
            return <Clock className="h-4 w-4" />;
    }
};

const getStatusBadgeClass = (status: string) => {
    // Normalize status to handle potential whitespace or case issues
    const normalizedStatus = String(status).trim().toLowerCase();

    switch (normalizedStatus) {
        case 'pengajuan':
            return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        case 'perbaikan':
            return 'bg-gradient-to-r from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 border-amber-400 font-medium animate-pulse';
        case 'pembayaran':
            return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
        case 'verifikasi-lapangan':
            return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
        case 'pembayaran-tahap-2':
            return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
        case 'terbit':
            return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'perbaikan':
            return 'bg-red-100 text-red-800 hover:bg-red-200';
        default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
};

const getStatusLabel = (status: string) => {
    // Normalize status to handle potential whitespace or case issues
    const normalizedStatus = String(status).trim().toLowerCase();

    switch (normalizedStatus) {
        case 'pengajuan':
            return 'Sedang Diajukan';
        case 'perbaikan':
            return 'Perlu Perbaikan';
        case 'pembayaran':
            return 'Pembayaran Tahap 1';
        case 'verifikasi-lapangan':
            return 'Verifikasi Lapangan';
        case 'pembayaran-tahap-2':
            return 'Pembayaran Tahap 2';
        case 'terbit':
            return 'Sudah Terbit';
        case 'perbaikan':
            return 'Perbaikan';
        default:
            return 'Tidak Diketahui';
    }
};

const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const containerAnimation = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export default function IinSingleBlockholderIndex({ applications, auth, flash }: Props) {
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<IinSingleBlockholderApplication | null>(null);

    // Expense reimbursement form
    const { data: expenseReimData, setData: setExpenseReimData, post: postExpenseReim, processing: expenseReimProcessing, errors: expenseReimErrors, reset: resetExpenseReim } = useForm({
        company_name: '',
        pic_name: '',
        pic_contact: '',
        verification_date: '',
        is_acknowledged: false as boolean,
        chief_verificator_amount: '',
        member_verificator_amount: '',
        payment_proof_path: null as File | null,
    });

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            showSuccessToast(flash.success);
        }
        if (flash?.error) {
            showErrorToast(flash.error);
        }
    }, [flash]);

    const expenseReimSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedApplication) {
            showErrorToast('Aplikasi tidak ditemukan');
            return;
        }

        // Validate required fields
        if (!expenseReimData.company_name.trim()) {
            showErrorToast('Nama perusahaan harus diisi');
            return;
        }
        if (!expenseReimData.pic_name.trim()) {
            showErrorToast('Nama PIC harus diisi');
            return;
        }
        if (!expenseReimData.pic_contact.trim()) {
            showErrorToast('Kontak PIC harus diisi');
            return;
        }
        if (!expenseReimData.verification_date) {
            showErrorToast('Tanggal verifikasi harus diisi');
            return;
        }
        if (!expenseReimData.is_acknowledged) {
            showErrorToast('Pernyataan harus disetujui');
            return;
        }
        if (!expenseReimData.chief_verificator_amount.trim()) {
            showErrorToast('Jumlah ketua verifikator harus diisi');
            return;
        }
        if (!expenseReimData.member_verificator_amount.trim()) {
            showErrorToast('Jumlah anggota verifikator harus diisi');
            return;
        }
        if (!expenseReimData.payment_proof_path) {
            showErrorToast('Bukti pembayaran harus diupload');
            return;
        }

        const formData = new FormData();
        formData.append('company_name', expenseReimData.company_name);
        formData.append('pic_name', expenseReimData.pic_name);
        formData.append('pic_contact', expenseReimData.pic_contact);
        formData.append('verification_date', expenseReimData.verification_date);
        formData.append('is_acknowledged', expenseReimData.is_acknowledged ? '1' : '0');
        formData.append('chief_verificator_amount', expenseReimData.chief_verificator_amount);
        formData.append('member_verificator_amount', expenseReimData.member_verificator_amount);
        if (expenseReimData.payment_proof_path) {
            formData.append('payment_proof_path', expenseReimData.payment_proof_path);
        }

        postExpenseReim(route('iin-single-blockholder.store-expense-reimbursement', selectedApplication.id), {
            forceFormData: true,
            onSuccess: () => {
                resetExpenseReim();
            },
            onError: (errors) => {
                const firstError = Object.values(errors);
                if (firstError.length > 0) {
                    showErrorToast((firstError[0] as string));
                } else {
                    showErrorToast('Terjadi kesalahan saat mengajukan form penggantian');
                }
            },
        });
    };

    const handleExpenseReimFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setExpenseReimData('payment_proof_path', file);
        }
    };

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
            <Head title="Pengajuan Single IIN/Blockholder" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengajuan Single IIN/Blockholder</h1>
                        <p className="text-gray-600">Kelola pengajuan Single IIN/Blockholder</p>
                    </div>
                    {auth.user.role === 'user' && (
                        <Link href={route('iin-single-blockholder.create')}>
                            <Button className="bg-gradient-accent hover:bg-gradient-secondary text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Buat Pengajuan Baru
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Download Form Section */}
                {auth.user.role === 'user' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5" />
                                Download Form Aplikasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-lg border p-4 transition-colors hover:border-purple-300">
                                <h3 className="font-semibold text-gray-900">Single IIN/Blockholder</h3>
                                <p className="mb-3 text-sm text-gray-600">Permohonan Single IIN/Blockholder</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(route('download-form', 'single-blockholder'), '_blank')}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download File
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Applications List */}
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle>Daftar Pengajuan</CardTitle>
                            <p className="mt-1 text-sm text-gray-600">{applications.data.length} pengajuan Single IIN/Blockholder</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {applications.data.length === 0 ? (
                            <motion.div
                                className="py-12 text-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-purple-50">
                                    <FileText className="h-12 w-12 text-purple-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900">Belum Ada Pengajuan</h3>
                                <p className="mx-auto mb-6 max-w-md text-gray-600">
                                    {auth.user.role === 'user'
                                        ? 'Anda belum memiliki pengajuan Single IIN/Blockholder. Buat pengajuan pertama Anda untuk mendapatkan Single IIN/Blockholder.'
                                        : 'Tidak ada pengajuan yang perlu diproses saat ini. Pengajuan baru akan muncul di sini ketika ada pemohon yang mengajukan.'}
                                </p>
                                {auth.user.role === 'user' && (
                                    <Link href={route('iin-single-blockholder.create')}>
                                        <Button className="bg-gradient-accent hover:bg-gradient-secondary px-6 text-white">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Buat Pengajuan Baru
                                        </Button>
                                    </Link>
                                )}

                                {auth.user.role === 'user' && (
                                    <div className="mx-auto mt-8 max-w-lg rounded-lg border border-purple-100 bg-purple-50/50 p-4">
                                        <h4 className="mb-2 font-medium text-purple-800">Panduan Pengajuan Single IIN/Blockholder</h4>
                                        <ul className="list-inside list-disc space-y-1 text-left text-sm text-gray-600">
                                            <li>Download dan isi formulir aplikasi dengan lengkap</li>
                                            <li>Upload formulir yang telah diisi</li>
                                            <li>Tunggu verifikasi dari admin</li>
                                            <li>Lakukan Pembayaran jika aplikasi disetujui</li>
                                            <li>Tunggu proses Verifikasi Lapangan</li>
                                            <li>Lakukan Pembayaran Tahap 2 jika Verifikasi Lapangan selesai</li>
                                            <li>Single IIN akan diterbitkan jika semua tahapan selesai</li>
                                        </ul>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div className="space-y-4" variants={containerAnimation} initial="hidden" animate="visible">
                                {applications.data.map((application) => (
                                    <motion.div
                                        key={application.id}
                                        className={`rounded-lg border p-4 transition-shadow hover:shadow-md ${application.status === 'perbaikan' && auth.user.role === 'user'
                                                ? 'border-amber-300 bg-gradient-to-r from-amber-50 to-white'
                                                : ''
                                            }`}
                                        variants={itemAnimation}
                                    >
                                        {/* Alert notification removed as requested */}
                                        <div className="mb-3 flex items-start justify-between">
                                            {' '}
                                            <div className="flex items-center gap-3">
                                                <div className="bg-gradient-accent flex h-10 w-10 items-center justify-center rounded-lg text-white">
                                                    {getStatusIcon(application.status)}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{application.application_number}</h3>
                                                    <p className="text-sm text-gray-600">Single IIN/Blockholder</p>
                                                </div>
                                            </div>
                                            <Badge
                                                className={`${getStatusBadgeClass(application.status)} ${application.status === 'perbaikan' ? 'flex items-center gap-1' : ''}`}
                                            >
                                                {application.status === 'perbaikan' && <AlertCircle className="mr-1 h-3 w-3" />}
                                                {getStatusLabel(application.status)}
                                            </Badge>
                                        </div>

                                        {/* Status progress indicator */}
                                        <div className="mb-4">
                                            <div className="mb-2 h-1.5 w-full rounded-full bg-gray-100">
                                                <div
                                                    className="bg-gradient-accent h-1.5 rounded-full"
                                                    style={{
                                                        width:
                                                            application.status === 'pengajuan'
                                                                ? '33%' // Pengajuan means user is in Verifikasi Dokumen phase
                                                                : application.status === 'perbaikan'
                                                                    ? '33%' // Perbaikan also means user is in Verifikasi Dokumen phase
                                                                    : application.status === 'pembayaran'
                                                                        ? '50%'
                                                                        : application.status === 'verifikasi-lapangan'
                                                                            ? '67%'
                                                                            : application.status === 'pembayaran-tahap-2'
                                                                                ? '83%'
                                                                                : application.status === 'terbit'
                                                                                    ? '100%'
                                                                                    : '0%',
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Pengajuan</span>
                                                <span>Verifikasi Dokumen</span>
                                                <span>Pembayaran 1</span>
                                                <span>Verifikasi Lapangan</span>
                                                <span>Pembayaran 2</span>
                                                <span>Terbit</span>
                                            </div>
                                        </div>

                                        <div className="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <span className="text-gray-600">
                                                        {new Date(application.created_at).toLocaleDateString('id-ID')}
                                                    </span>
                                                    <p className="text-xs text-gray-500">Tanggal Pengajuan</p>
                                                </div>
                                            </div>
                                            {application.iin_number && (
                                                <div className="flex items-center gap-2">
                                                    <Award className="h-4 w-4 text-green-500" />
                                                    <div>
                                                        <span className="font-medium text-gray-700">{application.iin_number}</span>
                                                        <p className="text-xs text-gray-500">Nomor IIN</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-400" />
                                                <div>
                                                    <span className="text-gray-600">{application.user.name}</span>
                                                    <p className="text-xs text-gray-500">Pemohon</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-2 border-t pt-3">
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Link href={route('iin-single-blockholder.show', application.id)}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Lihat Detail
                                                        </Button>
                                                    </Link>

                                                    {application.status &&
                                                        String(application.status).trim().toLowerCase() === 'perbaikan' &&
                                                        auth.user.role === 'user' && (
                                                            <Link href={route('iin-single-blockholder.edit', application.id)}>
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 font-semibold text-white hover:from-amber-600 hover:to-amber-700"
                                                                >
                                                                    <AlertCircle className="mr-2 h-4 w-4" />
                                                                    Perbaiki Sekarang
                                                                </Button>
                                                            </Link>
                                                        )}

                                                    {(application.status === 'pembayaran' || application.status === 'pembayaran-tahap-2') &&
                                                        auth.user.role === 'user' && (
                                                            <Link href={route('iin-single-blockholder.show', application.id) + '#payment'}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                                                                >
                                                                    <Upload className="mr-2 h-4 w-4" />
                                                                    Upload Bukti Pembayaran
                                                                </Button>
                                                            </Link>
                                                        )}

                                                    {application.status === 'terbit' && !application.additional_documents && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-yellow-200 text-yellow-600 hover:bg-yellow-50"
                                                            onClick={() => {
                                                                setSelectedApplication(application);
                                                                setIsQrisModalOpen(true);
                                                            }}
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Upload Dokumen Pendukung
                                                        </Button>
                                                    )}

                                                    {application.status === 'terbit' &&
                                                        application.iin_number &&
                                                        application.additional_documents && application.expense_reim_id != null && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-green-200 text-green-600 hover:bg-green-50"
                                                                onClick={() => {
                                                                    setSelectedApplication(application);
                                                                    setIsSurveyModalOpen(true);
                                                                }}
                                                            >
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download Sertifikat
                                                            </Button>
                                                        )}

                                                    {/* Expense Reimbursement Button */}
                                                    {(application.status === 'verifikasi-lapangan' || application.status === 'terbit') && application.expense_reim_id == null && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                                                                    onClick={() => setSelectedApplication(application)}
                                                                >
                                                                    <TriangleAlert className="mr-2 h-4 w-4 text-red-500" />
                                                                    Silahkan isi Form Bukti Penggantian Transport dan Uang Harian
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent className="max-h-[90vh] max-w-2xl">
                                                                <DialogHeader>
                                                                    <DialogTitle>Form Bukti Penggantian Transport dan Uang Harian</DialogTitle>
                                                                    <DialogDescription>
                                                                        Silahkan isi form berikut untuk mengajukan penggantian transport dan uang
                                                                        harian.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <div className="max-h-[60vh] overflow-y-auto pr-2">
                                                                    <form
                                                                        id="expense-reim-form"
                                                                        className="flex flex-col gap-4"
                                                                        onSubmit={expenseReimSubmit}
                                                                    >
                                                                        <div>
                                                                            <Label
                                                                                htmlFor="company_name"
                                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                                            >
                                                                                Nama Perusahaan
                                                                            </Label>
                                                                            <Input
                                                                                required
                                                                                type="text"
                                                                                placeholder="Nama Perusahaan"
                                                                                value={expenseReimData.company_name}
                                                                                onChange={(e) => setExpenseReimData('company_name', e.target.value)}
                                                                            />
                                                                            {expenseReimErrors.company_name && (
                                                                                <p className="mt-1 text-xs text-red-600">{expenseReimErrors.company_name}</p>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <Label htmlFor="pic_name" className="mb-1 text-sm font-medium text-gray-700">
                                                                                Nama PIC
                                                                            </Label>
                                                                            <Input
                                                                                required
                                                                                type="text"
                                                                                placeholder="Nama PIC"
                                                                                value={expenseReimData.pic_name}
                                                                                onChange={(e) => setExpenseReimData('pic_name', e.target.value)}
                                                                            />
                                                                            {expenseReimErrors.pic_name && (
                                                                                <p className="mt-1 text-xs text-red-600">{expenseReimErrors.pic_name}</p>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <Label
                                                                                htmlFor="pic_contact"
                                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                                            >
                                                                                Kontak PIC
                                                                            </Label>
                                                                            <Input
                                                                                required
                                                                                type="text"
                                                                                placeholder="Kontak PIC"
                                                                                value={expenseReimData.pic_contact}
                                                                                onChange={(e) => setExpenseReimData('pic_contact', e.target.value)}
                                                                            />
                                                                            {expenseReimErrors.pic_contact && (
                                                                                <p className="mt-1 text-xs text-red-600">{expenseReimErrors.pic_contact}</p>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <Label
                                                                                htmlFor="verification_date"
                                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                                            >
                                                                                Tanggal Verifikasi
                                                                            </Label>
                                                                            <Input
                                                                                required
                                                                                type="date"
                                                                                placeholder="Tanggal Verifikasi"
                                                                                value={expenseReimData.verification_date}
                                                                                onChange={(e) => setExpenseReimData('verification_date', e.target.value)}
                                                                            />
                                                                            {expenseReimErrors.verification_date && (
                                                                                <p className="mt-1 text-xs text-red-600">{expenseReimErrors.verification_date}</p>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <Label
                                                                                htmlFor="is_acknowledged"
                                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                                            >
                                                                                Dengan ini saya menyatakan bahwa penggantian transport dan uang harian
                                                                                yang diberikan kepada tim verifikator sudah sesuai dengan ketentuan surat
                                                                                informasi pembebanan biaya dari sekretariat Layanan Otoritas Sponsor
                                                                            </Label>
                                                                            <Checkbox
                                                                                checked={expenseReimData.is_acknowledged}
                                                                                onCheckedChange={(checked) =>
                                                                                    setExpenseReimData('is_acknowledged', Boolean(checked))
                                                                                }
                                                                            />
                                                                            {expenseReimErrors.is_acknowledged && (
                                                                                <p className="mt-1 text-xs text-red-600">{expenseReimErrors.is_acknowledged}</p>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <Label
                                                                                htmlFor="chief_verificator_amount"
                                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                                            >
                                                                                Nominal yang di berikan kepada Verifikator Kepala
                                                                            </Label>
                                                                            <Input
                                                                                required
                                                                                type="number"
                                                                                placeholder="Nominal yang di berikan kepada Verifikator Kepala"
                                                                                value={expenseReimData.chief_verificator_amount}
                                                                                onChange={(e) =>
                                                                                    setExpenseReimData('chief_verificator_amount', e.target.value)
                                                                                }
                                                                            />
                                                                            {expenseReimErrors.chief_verificator_amount && (
                                                                                <p className="mt-1 text-xs text-red-600">{expenseReimErrors.chief_verificator_amount}</p>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <Label
                                                                                htmlFor="member_verificator_amount"
                                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                                            >
                                                                                Nominal yang diberikan kepada Verifikator Anggota
                                                                            </Label>
                                                                            <Input
                                                                                required
                                                                                type="number"
                                                                                placeholder="Nominal yang diberikan kepada Verifikator Anggota"
                                                                                value={expenseReimData.member_verificator_amount}
                                                                                onChange={(e) =>
                                                                                    setExpenseReimData('member_verificator_amount', e.target.value)
                                                                                }
                                                                            />
                                                                            {expenseReimErrors.member_verificator_amount && (
                                                                                <p className="mt-1 text-xs text-red-600">{expenseReimErrors.member_verificator_amount}</p>
                                                                            )}
                                                                        </div>

                                                                        <div>
                                                                            <Label
                                                                                htmlFor="payment_proof_path"
                                                                                className="mb-1 text-sm font-medium text-gray-700"
                                                                            >
                                                                                Upload bukti transfer penggantian transport dan uang harian tim
                                                                                verifikator
                                                                            </Label>
                                                                            <Input
                                                                                required
                                                                                type="file"
                                                                                accept=".jpg,.jpeg,.png,.pdf"
                                                                                onChange={(e) => {
                                                                                    if (e.target.files && e.target.files.length > 0) {
                                                                                        setExpenseReimData('payment_proof_path', e.target.files[0]);
                                                                                    }
                                                                                }}
                                                                            />
                                                                            {expenseReimErrors.payment_proof_path && (
                                                                                <p className="mt-1 text-xs text-red-600">{expenseReimErrors.payment_proof_path}</p>
                                                                            )}
                                                                        </div>
                                                                    </form>
                                                                </div>
                                                                <DialogFooter>
                                                                    <DialogTrigger asChild>
                                                                        <Button variant="outline">
                                                                            Batal
                                                                        </Button>
                                                                    </DialogTrigger>
                                                                    <Button 
                                                                        type="button" 
                                                                        onClick={expenseReimSubmit}
                                                                        disabled={expenseReimProcessing}
                                                                    >
                                                                        {expenseReimProcessing ? 'Mengirim...' : 'Kirim'}
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                </div>

                                                <div className="flex items-center text-sm text-gray-500">
                                                    {application.status === 'pembayaran' && (
                                                        <div className="flex items-center text-purple-500">
                                                            <CreditCard className="mr-1 h-4 w-4" />
                                                            <span>Menunggu Pembayaran Tahap 1</span>
                                                        </div>
                                                    )}
                                                    {application.status === 'pembayaran-tahap-2' && (
                                                        <div className="flex items-center text-orange-500">
                                                            <CreditCard className="mr-1 h-4 w-4" />
                                                            <span>Menunggu Pembayaran Tahap 2</span>
                                                        </div>
                                                    )}
                                                    {application.status === 'verifikasi-lapangan' && (
                                                        <div className="flex items-center text-indigo-500">
                                                            <MapPin className="mr-1 h-4 w-4" />
                                                            <span>Sedang Verifikasi Lapangan</span>
                                                        </div>
                                                    )}
                                                    {application.status === 'terbit' && (
                                                        <div className="flex items-center text-green-500">
                                                            <CheckCircle className="mr-1 h-4 w-4" />
                                                            <span>Telah terbit</span>
                                                        </div>
                                                    )}
                                                    {application.status === 'pengajuan' && (
                                                        <div className="flex items-center text-gray-500">
                                                            <Clock className="mr-1 h-4 w-4" />
                                                            <span>Sedang diproses</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Pagination */}
                        {applications.data.length > 0 && applications.meta?.links && (
                            <div className="mt-6 flex items-center justify-end gap-2">
                                {applications.meta.links.map((link: any, index: number) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`rounded px-3 py-1 ${link.active
                                                ? 'bg-blue-100 text-blue-700'
                                                : link.url
                                                    ? 'text-gray-600 hover:bg-gray-100'
                                                    : 'cursor-not-allowed text-gray-300'
                                            }`}
                                        disabled={!link.url}
                                    >
                                        {link.label.replace('&laquo;', '«').replace('&raquo;', '»')}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <SurveyModal
                isOpen={isSurveyModalOpen}
                onClose={() => setIsSurveyModalOpen(false)}
                onDownload={() => {
                    if (selectedApplication) {
                        window.open(route('iin-single-blockholder.download-file', [selectedApplication.id, 'certificate']), '_blank');
                    }
                }}
                certificateType="IIN Single Blockholder"
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
