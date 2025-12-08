import SurveyModal from '@/components/SurveyModal';
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
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, Award, Calendar, Download, Eye, FileText, Plus, TriangleAlert, Upload, User } from 'lucide-react';
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

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Pengajuan Single IIN/Blockholder" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengajuan Single IIN/Blockholder</h1>
                        <p className="text-gray-600">Kelola pengajuan Single IIN/Blockholder</p>
                    </div>
                    {auth.user.role === 'user' && (
                        <Link href={route('iin-single-blockholder.create')}>
                            <Button className="text-white bg-gradient-accent hover:bg-gradient-secondary">
                                <Plus className="mr-2 w-4 h-4" />
                                Buat Pengajuan Baru
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Download Form Section */}
                {auth.user.role === 'user' && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex gap-2 items-center">
                                <Download className="w-5 h-5" />
                                Download Form Aplikasi
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="p-4 rounded-lg border transition-colors hover:border-purple-300">
                                <h3 className="font-semibold text-gray-900">Single IIN/Blockholder</h3>
                                <p className="mb-3 text-sm text-gray-600">Permohonan Single IIN/Blockholder</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(route('download-form', 'single-blockholder'), '_blank')}
                                >
                                    <Download className="mr-2 w-4 h-4" />
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
                                <div className="flex justify-center items-center mx-auto mb-4 w-24 h-24 bg-purple-50 rounded-full">
                                    <FileText className="w-12 h-12 text-purple-400" />
                                </div>
                                <h3 className="mb-2 text-xl font-semibold text-gray-900">Belum Ada Pengajuan</h3>
                                <p className="mx-auto mb-6 max-w-md text-gray-600">
                                    {auth.user.role === 'user'
                                        ? 'Anda belum memiliki pengajuan Single IIN/Blockholder. Buat pengajuan pertama Anda untuk mendapatkan Single IIN/Blockholder.'
                                        : 'Tidak ada pengajuan yang perlu diproses saat ini. Pengajuan baru akan muncul di sini ketika ada pemohon yang mengajukan.'}
                                </p>
                                {auth.user.role === 'user' && (
                                    <Link href={route('iin-single-blockholder.create')}>
                                        <Button className="px-6 text-white bg-gradient-accent hover:bg-gradient-secondary">
                                            <Plus className="mr-2 w-4 h-4" />
                                            Buat Pengajuan Baru
                                        </Button>
                                    </Link>
                                )}

                                {auth.user.role === 'user' && (
                                    <div className="p-4 mx-auto mt-8 max-w-lg rounded-lg border border-purple-100 bg-purple-50/50">
                                        <h4 className="mb-2 font-medium text-purple-800">Panduan Pengajuan Single IIN/Blockholder</h4>
                                        <ul className="space-y-1 text-sm list-disc list-inside text-left text-gray-600">
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
                                        <div className="flex justify-between items-start mb-3">
                                            {' '}
                                            <div className="flex gap-3 items-center">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{application.application_number}</h3>
                                                    <p className="text-sm text-gray-600">Single IIN/Blockholder</p>
                                                </div>
                                            </div>
                                            <Badge
                                                className={`${getStatusBadgeClass(application.status)} ${application.status === 'perbaikan' ? 'flex items-center gap-1' : ''}`}
                                            >
                                                {application.status === 'perbaikan' && <AlertCircle className="mr-1 w-3 h-3" />}
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

                                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm md:grid-cols-3">
                                            <div className="flex gap-2 items-center">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <span className="text-gray-600">
                                                        {new Date(application.created_at).toLocaleDateString('id-ID')}
                                                    </span>
                                                    <p className="text-xs text-gray-500">Tanggal Pengajuan</p>
                                                </div>
                                            </div>
                                            {application.iin_number && (
                                                <div className="flex gap-2 items-center">
                                                    <Award className="w-4 h-4 text-green-500" />
                                                    <div>
                                                        <span className="font-medium text-gray-700">{application.iin_number}</span>
                                                        <p className="text-xs text-gray-500">Nomor IIN</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-2 items-center">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <span className="text-gray-600">{application.user.name}</span>
                                                    <p className="text-xs text-gray-500">Pemohon</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-3 mt-2 border-t">
                                            <div className="flex flex-wrap gap-2 justify-between items-center">
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <Link href={route('iin-single-blockholder.show', application.id)}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="mr-2 w-4 h-4" />
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
                                                                    className="px-4 font-semibold text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                                                                >
                                                                    <AlertCircle className="mr-2 w-4 h-4" />
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
                                                                    className="text-orange-600 border-orange-200 hover:bg-orange-50"
                                                                >
                                                                    <Upload className="mr-2 w-4 h-4" />
                                                                    Upload Bukti Pembayaran
                                                                </Button>
                                                            </Link>
                                                        )}

                                                    {application.status === 'terbit' &&
                                                        application.iin_number && application.expense_reim_id != null && (
                                                            // <Button
                                                            //     variant="outline"
                                                            //     size="sm"
                                                            //     className="text-green-600 border-green-200 hover:bg-green-50"
                                                            //     onClick={() => {
                                                            //         setSelectedApplication(application);
                                                            //         setIsSurveyModalOpen(true);
                                                            //     }}
                                                            // >
                                                            //     <Download className="mr-2 w-4 h-4" />
                                                            //     Download Sertifikat
                                                            // </Button>

                                                            <Link href={route('iin-single-blockholder.show', application.id)}>
                                                                <Button variant="outline" size="sm" className='text-green-600 border-green-200 hover:bg-green-50'>
                                                                    <Download className="mr-2 w-4 h-4 " />
                                                                    Download Sertifikat
                                                                </Button>
                                                            </Link>
                                                        )}

                                                    {/* Expense Reimbursement Button */}
                                                    {(application.status === 'verifikasi-lapangan' || application.status === 'terbit') && application.expense_reim_id == null && (
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 hover:text-red-500"
                                                                    onClick={() => setSelectedApplication(application)}
                                                                >
                                                                    <TriangleAlert className="mr-2 w-4 h-4 text-red-500" />
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
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        {/* Pagination */}
                        {applications.data.length > 0 && applications.meta?.links && (
                            <div className="flex gap-2 justify-end items-center mt-6">
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
        </DashboardLayout>
    );
}
