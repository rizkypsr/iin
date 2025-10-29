import QrisModal from '@/components/QrisModal';
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
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    Award,
    Calendar,
    CheckCircle,
    Clock,
    CreditCard,
    Download,
    Eye,
    FileText,
    MapPin,
    Plus,
    Shield,
    TriangleAlert,
    Upload,
    User,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PengawasanIinNasionalApplication {
    id: number;
    application_number: string;
    status: string;
    status_label?: string;
    status_color?: string;
    created_at: string;
    submitted_at: string;
    iin_number?: string;
    additional_documents?: string;
    can_upload_payment_proof: boolean;
    can_download_certificate: boolean;
    expense_reim_id?: number | null;
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
        data: PengawasanIinNasionalApplication[];
        links: any[];
        meta: any;
    };
    errors?: {
        profile?: string;
        [key: string]: any;
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
        case 'terbit':
            return <Award className="h-4 w-4" />;
        default:
            return <Clock className="h-4 w-4" />;
    }
};

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'pengajuan':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'perbaikan':
            return 'bg-red-100 text-red-800 border-red-200';
        case 'pembayaran':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'verifikasi-lapangan':
            return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'terbit':
            return 'bg-green-100 text-green-800 border-green-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'pengajuan':
            return 'Pengajuan';
        case 'perbaikan':
            return 'Perbaikan';
        case 'pembayaran':
            return 'Pembayaran';
        case 'verifikasi-lapangan':
            return 'Verifikasi Lapangan';
        case 'terbit':
            return 'Terbit';
        default:
            return 'Unknown';
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

export default function PengawasanIinNasionalIndex({ applications, auth, errors, flash }: Props) {
    const [showSurvey, setShowSurvey] = useState(false);
    const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<PengawasanIinNasionalApplication | null>(null);

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
        if (!expenseReimData.chief_verificator_amount) {
            showErrorToast('Jumlah ketua verifikator harus diisi');
            return;
        }
        if (!expenseReimData.member_verificator_amount) {
            showErrorToast('Jumlah anggota verifikator harus diisi');
            return;
        }
        if (!expenseReimData.payment_proof_path) {
            showErrorToast('Bukti pembayaran harus diupload');
            return;
        }
        if (!expenseReimData.is_acknowledged) {
            showErrorToast('Anda harus menyetujui pernyataan');
            return;
        }

        const formData = new FormData();
        formData.append('company_name', expenseReimData.company_name);
        formData.append('pic_name', expenseReimData.pic_name);
        formData.append('pic_contact', expenseReimData.pic_contact);
        formData.append('verification_date', expenseReimData.verification_date);
        formData.append('chief_verificator_amount', expenseReimData.chief_verificator_amount);
        formData.append('member_verificator_amount', expenseReimData.member_verificator_amount);
        formData.append('is_acknowledged', expenseReimData.is_acknowledged ? '1' : '0');
        if (expenseReimData.payment_proof_path) {
            formData.append('payment_proof_path', expenseReimData.payment_proof_path);
        }

        router.post(route('pengawasan-iin-nasional.store-expense-reimbursement', selectedApplication.id), formData, {
            onSuccess: () => {
                resetExpenseReim();
            },
            onError: (errors) => {
                console.error('Expense reimbursement errors:', errors);
                if (typeof errors === 'object' && errors !== null) {
                    const errorMessages = Object.values(errors).flat();
                    if (errorMessages.length > 0) {
                        showErrorToast(errorMessages[0] as string);
                    } else {
                        showErrorToast('Terjadi kesalahan saat mengirim pengajuan');
                    }
                } else {
                    showErrorToast('Terjadi kesalahan saat mengirim pengajuan');
                }
            },
        });
    };

    const handleExpenseReimFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                showErrorToast('Ukuran file tidak boleh lebih dari 5MB');
                e.target.value = '';
                return;
            }

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(file.type)) {
                showErrorToast('Format file harus PDF, JPG, JPEG, atau PNG');
                e.target.value = '';
                return;
            }

            setExpenseReimData('payment_proof_path', file);
        }
    };

    const handleQrisFileUpload = (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        router.post(route('pengawasan-iin-nasional.upload-additional-documents', selectedApplication?.id), formData, {
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

    useEffect(() => {
        if (flash && typeof flash === 'object' && 'success' in flash && flash.success) {
            showSuccessToast(flash.success as string);
        }
        if (flash && typeof flash === 'object' && 'error' in flash && flash.error) {
            showErrorToast(flash.error as string);
        }

        // Handle validation errors
        if (errors?.profile) {
            showErrorToast(errors.profile);
        }
    }, [flash, errors]);

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Pengawasan IIN Nasional" />

            <motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerAnimation}>
                {/* Header */}
                <motion.div variants={itemAnimation} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengawasan IIN Nasional</h1>
                        <p className="text-gray-600">Kelola aplikasi pengawasan IIN Nasional Anda</p>
                    </div>
                    {auth.user.role === 'user' && (
                        <Link href={route('pengawasan-iin-nasional.create')}>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajukan Pengawasan
                            </Button>
                        </Link>
                    )}
                </motion.div>

                {/* Stats Cards */}
                <motion.div variants={itemAnimation} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="rounded-full bg-blue-100 p-3">
                                    <Shield className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Aplikasi</p>
                                    <p className="text-2xl font-bold text-gray-900">{applications.meta?.total || applications.data.length}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="rounded-full bg-yellow-100 p-3">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Dalam Proses</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {applications.data.filter((app) => !['terbit'].includes(app.status)).length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div className="rounded-full bg-green-100 p-3">
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Selesai</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {applications.data.filter((app) => app.status === 'terbit').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Applications List */}
                <motion.div variants={itemAnimation}>
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle>Daftar Aplikasi Pengawasan</CardTitle>
                                <p className="text-sm text-gray-600">Kelola dan pantau status aplikasi pengawasan IIN Nasional</p>
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
                                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-blue-50">
                                        <Shield className="h-12 w-12 text-blue-400" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900">Belum Ada Aplikasi Pengawasan</h3>
                                    <p className="mx-auto mb-6 max-w-md text-gray-600">
                                        {auth.user.role === 'user'
                                            ? 'Anda belum memiliki aplikasi pengawasan IIN Nasional. Buat aplikasi pengawasan pertama Anda untuk memulai proses pengawasan.'
                                            : 'Tidak ada aplikasi pengawasan yang perlu diproses saat ini. Aplikasi baru akan muncul di sini ketika ada pemohon yang mengajukan.'}
                                    </p>
                                    {auth.user.role === 'user' && (
                                        <Link href={route('pengawasan-iin-nasional.create')}>
                                            <Button className="bg-gradient-accent hover:bg-gradient-secondary px-6 text-white">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Ajukan Pengawasan
                                            </Button>
                                        </Link>
                                    )}

                                    {auth.user.role === 'user' && (
                                        <div className="mx-auto mt-8 max-w-lg rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                                            <h4 className="mb-2 font-medium text-blue-800">Panduan Pengawasan IIN Nasional</h4>
                                            <ul className="list-inside list-disc space-y-1 text-left text-sm text-gray-600">
                                                <li>Ajukan aplikasi pengawasan dengan lengkap</li>
                                                <li>Upload dokumen yang diperlukan</li>
                                                <li>Tunggu verifikasi dari admin</li>
                                                <li>Lakukan pembayaran jika aplikasi disetujui</li>
                                                <li>Tunggu proses verifikasi lapangan</li>
                                                <li>Sertifikat pengawasan akan diterbitkan jika semua tahapan selesai</li>
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
                                            <div className="mb-3 flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-gradient-accent flex h-10 w-10 items-center justify-center rounded-lg text-white">
                                                        {getStatusIcon(application.status)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{application.application_number}</h3>
                                                        <p className="text-sm text-gray-600">Pengawasan IIN Nasional</p>
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
                                                                    ? '40%' // Pengajuan means user is in Verifikasi Dokumen phase
                                                                    : application.status === 'perbaikan'
                                                                        ? '40%' // Perbaikan also means user is in Verifikasi Dokumen phase
                                                                        : application.status === 'pembayaran'
                                                                            ? '60%'
                                                                            : application.status === 'verifikasi-lapangan'
                                                                                ? '80%'
                                                                                : application.status === 'menunggu-terbit'
                                                                                    ? '80%'
                                                                                    : application.status === 'terbit'
                                                                                        ? '100%'
                                                                                        : '0%',
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Pengajuan</span>
                                                    <span>Verifikasi Dokumen</span>
                                                    <span>Pembayaran</span>
                                                    <span>Verifikasi Lapangan</span>
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
                                                        <Link href={route('pengawasan-iin-nasional.show', application.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Lihat Detail
                                                            </Button>
                                                        </Link>

                                                        {application.status === 'pengajuan' && auth.user.role === 'user' && (
                                                            <Link href={route('pengawasan-iin-nasional.edit', application.id)}>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        width="16"
                                                                        height="16"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        stroke="currentColor"
                                                                        strokeWidth="2"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        className="mr-2 h-4 w-4"
                                                                    >
                                                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                                                    </svg>
                                                                    Edit Pengajuan
                                                                </Button>
                                                            </Link>
                                                        )}

                                                        {application.can_download_certificate && !application.additional_documents && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                                                onClick={() => {
                                                                    setSelectedApplication(application);
                                                                    setIsQrisModalOpen(true);
                                                                }}
                                                            >
                                                                <Upload className="mr-2 h-4 w-4" />
                                                                Upload QRIS
                                                            </Button>
                                                        )}

                                                        {application.can_download_certificate && application.additional_documents && application.expense_reim_id != null && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-green-200 text-green-600 hover:bg-green-50"
                                                                onClick={() =>
                                                                    window.open(
                                                                        route('pengawasan-iin-nasional.download-certificate', application.id),
                                                                        '_blank',
                                                                    )
                                                                }
                                                            >
                                                                <Download className="mr-2 h-4 w-4" />
                                                                Download Sertifikat
                                                            </Button>
                                                        )}

                                                        {/* Expense Reimbursement Dialog */}
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
                                                                                    onChange={handleExpenseReimFileUpload}
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
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pagination */}
                {applications.links && applications.links.length > 3 && (
                    <motion.div variants={itemAnimation} className="flex justify-center">
                        <div className="flex gap-2">
                            {applications.links.map((link: any, index: number) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`rounded-md px-3 py-2 text-sm ${link.active ? 'bg-blue-600 text-white' : 'border bg-white text-gray-700 hover:bg-gray-50'
                                        } ${!link.url ? 'cursor-not-allowed opacity-50' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </motion.div>

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
