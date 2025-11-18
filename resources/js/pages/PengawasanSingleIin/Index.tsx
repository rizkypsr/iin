import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard-layout';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { PageProps } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, Award, Calendar, CheckCircle, Clock, CreditCard, Download, Eye, File, Plus, Shield, TriangleAlert, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';

interface PengawasanSingleIinApplication {
    id: number;
    application_number: string;
    status: string;
    status_label?: string;
    status_color?: string;
    created_at: string;
    submitted_at: string;
    iin_number?: string;
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
        data: PengawasanSingleIinApplication[];
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

// Status utility functions are imported from @/utils/statusUtils

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

export default function PengawasanSingleIinIndex({ applications, auth, errors, flash }: Props) {
    const [showSurvey, setShowSurvey] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApplication, setSelectedApplication] = useState<PengawasanSingleIinApplication | null>(null);

    // Expense reimbursement form
    const { data: expenseReimData, setData: setExpenseReimData, processing: expenseReimProcessing, reset: resetExpenseReim, errors: expenseReimErrors } = useForm({
        company_name: '',
        pic_name: '',
        pic_contact: '',
        verification_date: '',
        chief_verificator_amount: '',
        member_verificator_amount: '',
        payment_proof_path: '',
        is_acknowledged: false as boolean,
    });

    // Handle flash messages
    useEffect(() => {
        if (flash?.success) {
            showSuccessToast(flash.success);
        }
        if (flash?.error) {
            showErrorToast(flash.error);
        }

        // Handle validation errors
        if (errors?.profile) {
            showErrorToast(errors.profile);
        }
    }, [flash, errors]);

    const expenseReimSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!expenseReimData.company_name || !expenseReimData.pic_name || !expenseReimData.pic_contact ||
            !expenseReimData.verification_date || !expenseReimData.chief_verificator_amount ||
            !expenseReimData.member_verificator_amount || !expenseReimData.payment_proof_path) {
            showErrorToast('Semua field wajib diisi');
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
        formData.append('payment_proof_path', expenseReimData.payment_proof_path);
        formData.append('is_acknowledged', expenseReimData.is_acknowledged ? '1' : '0');

        router.post(route('pengawasan-single-iin.expense-reimbursement', selectedApplication?.id), formData, {
            onSuccess: () => {
                resetExpenseReim();
            },
            onError: (errors) => {
                const errorMessage = Object.values(errors).flat().join(', ');
                showErrorToast(errorMessage || 'Terjadi kesalahan saat mengirim pengajuan');
            },
        });
    };

    const handleExpenseReimFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setExpenseReimData('payment_proof_path', file as any);
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Pengawasan Single IIN" />

            <motion.div className="space-y-6" initial="hidden" animate="visible" variants={containerAnimation}>
                {/* Header */}
                <motion.div variants={itemAnimation} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengawasan Single IIN</h1>
                        <p className="text-gray-600">Kelola aplikasi pengawasan Single IIN Anda</p>
                    </div>
                    {auth.user.role === 'user' && (
                        <Link href={route('pengawasan-single-iin.create')}>
                            <Button className="bg-blue-600 text-white hover:bg-blue-700">
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
                                <p className="text-sm text-gray-600">Kelola dan pantau status aplikasi pengawasan Single IIN</p>
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
                                        <File className="h-12 w-12 text-blue-400" />
                                    </div>
                                    <h3 className="mb-2 text-xl font-semibold text-gray-900">Belum Ada Aplikasi Pengawasan</h3>
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
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{application.application_number}</h3>
                                                        <p className="text-sm text-gray-600">Pengawasan Single IIN</p>
                                                    </div>
                                                </div>
                                                <Badge
                                                    className={`${getStatusBadgeClass(application.status, { detailed: true })} ${application.status === 'perbaikan' ? 'flex items-center gap-1' : ''}`}
                                                >
                                                    {getStatusLabel(application.status, { detailed: true })}
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
                                                                    ? '33%'
                                                                    : application.status === 'perbaikan'
                                                                        ? '33%'
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
                                                        <Link href={route('pengawasan-single-iin.show', application.id)}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                Lihat Detail
                                                            </Button>
                                                        </Link>

                                                        {application.status &&
                                                            String(application.status).trim().toLowerCase() === 'perbaikan' &&
                                                            auth.user.role === 'user' && (
                                                                <Link href={route('pengawasan-single-iin.edit', application.id)}>
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
                                                                <Link href={route('pengawasan-single-iin.show', application.id) + '#payment'}>
                                                                    <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">
                                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                                        Bayar Sekarang
                                                                    </Button>
                                                                </Link>
                                                            )}

                                                        {application.can_download_certificate && application.expense_reim_id != null && (
                                                            <Link href={route('pengawasan-single-iin.download-certificate', application.id)}>
                                                                <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                                                                    <Download className="mr-2 h-4 w-4" />
                                                                    Unduh Dokumen Pemantauan
                                                                </Button>
                                                            </Link>
                                                        )}

                                                        {/* Expense Reimbursement Button */}
                                                        {(application.status === 'verifikasi-lapangan' || application.status === 'terbit') && application.expense_reim_id == null && auth.user.role === 'user' && (
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
        </DashboardLayout>
    );
}
