import QrisModal from '@/components/QrisModal';
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
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, Award, Calendar, Clock, CreditCard, Download, Eye, FileText, MapPin, Plus, TriangleAlert, Upload, User } from 'lucide-react';
import { useEffect, useState } from 'react';

interface IinNasionalApplication {
    id: number;
    application_number: string;
    status: string;
    status_label?: string; // Made optional since we're calculating it
    status_color?: string; // Made optional since we're calculating it
    created_at: string;
    submitted_at: string;
    iin_number?: string;
    additional_documents?: string;
    can_upload_payment_proof: boolean;
    can_download_certificate: boolean;
    expense_reim_id?: number;
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
        data: IinNasionalApplication[];
        links: any[];
        meta: any;
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

export default function IinNasionalIndex({ applications, auth }: Props) {
    const { flash } = usePage().props as any;
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [isQrisModalOpen, setIsQrisModalOpen] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState<IinNasionalApplication | null>(null);

    console.log(applications.data);

    const { data, setData, post, processing, errors } = useForm<{
        company_name: string;
        pic_name: string;
        pic_contact: string;
        verification_date: string;
        is_acknowledged: boolean;
        chief_verificator_amount: number;
        member_verificator_amount: number;
        payment_proof_path: File | string;
    }>({
        company_name: '',
        pic_name: '',
        pic_contact: '',
        verification_date: '',
        is_acknowledged: false,
        chief_verificator_amount: 0,
        member_verificator_amount: 0,
        payment_proof_path: '',
    });

    useEffect(() => {
        if (flash.success) {
            showSuccessToast(flash.success);
        }
        if (flash.error) {
            showErrorToast(flash.error);
        }
    }, [flash]);

    const expenseReimSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validate required fields
        if (!data.company_name.trim()) {
            showErrorToast('Nama perusahaan harus diisi');
            return;
        }

        if (!data.pic_name.trim()) {
            showErrorToast('Nama PIC harus diisi');
            return;
        }

        if (!data.pic_contact.trim()) {
            showErrorToast('Kontak PIC harus diisi');
            return;
        }

        if (!data.verification_date) {
            showErrorToast('Tanggal verifikasi harus diisi');
            return;
        }

        if (!data.is_acknowledged) {
            showErrorToast('Persetujuan harus dicentang');
            return;
        }

        if (data.chief_verificator_amount <= 0) {
            showErrorToast('Jumlah verificator utama harus lebih dari 0');
            return;
        }

        if (data.member_verificator_amount <= 0) {
            showErrorToast('Jumlah verificator anggota harus lebih dari 0');
            return;
        }

        if (!data.payment_proof_path) {
            showErrorToast('Bukti pembayaran harus diupload');
            return;
        }

        if (!selectedApplication) {
            showErrorToast('Aplikasi tidak ditemukan');
            return;
        }

        // Submit form using Inertia's useForm
        post(route('iin-nasional.store-expense-reimbursement', selectedApplication.id), {
            onSuccess: () => {
                setData({
                    company_name: '',
                    pic_name: '',
                    pic_contact: '',
                    verification_date: '',
                    is_acknowledged: false,
                    chief_verificator_amount: 0,
                    member_verificator_amount: 0,
                    payment_proof_path: '',
                });
                setSelectedApplication(null);
            },
            onError: (errors) => {
                console.error('Form submission errors:', errors);
                if (typeof errors === 'object' && errors !== null) {
                    // Display first error message
                    const firstError = Object.values(errors)[0];
                    if (typeof firstError === 'string') {
                        showErrorToast(firstError);
                    } else if (Array.isArray(firstError) && firstError.length > 0) {
                        showErrorToast(firstError[0] as string);
                    } else {
                        showErrorToast('Terjadi kesalahan saat menyimpan data');
                    }
                } else {
                    showErrorToast('Terjadi kesalahan saat menyimpan data');
                }
            }
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
            <Head title="Pengajuan IIN Nasional" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengajuan IIN Nasional</h1>
                        <p className="text-gray-600">Kelola pengajuan Issuer Identification Number Nasional</p>
                    </div>
                    {auth.user.role === 'user' && (
                        <Link href={route('iin-nasional.create')}>
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
                                <h3 className="font-semibold text-gray-900">IIN Nasional</h3>
                                <p className="mb-3 text-sm text-gray-600">Permohonan Issuer Identification Number untuk layanan IIN Nasional</p>
                                <Button variant="outline" size="sm" onClick={() => window.open(route('download-form', 'nasional'), '_blank')}>
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
                            <p className="mt-1 text-sm text-gray-600">{applications.data.length} pengajuan IIN Nasional</p>
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
                                        ? 'Anda belum memiliki pengajuan IIN Nasional. Buat pengajuan pertama Anda untuk mendapatkan Issuer Identification Number.'
                                        : 'Tidak ada pengajuan yang perlu diproses saat ini. Pengajuan baru akan muncul di sini ketika ada pemohon yang mengajukan.'}
                                </p>
                                {auth.user.role === 'user' && (
                                    <Link href={route('iin-nasional.create')}>
                                        <Button className="bg-gradient-accent hover:bg-gradient-secondary px-6 text-white">
                                            <Plus className="mr-2 h-4 w-4" />
                                            Buat Pengajuan Baru
                                        </Button>
                                    </Link>
                                )}

                                {auth.user.role === 'user' && (
                                    <div className="mx-auto mt-8 max-w-lg rounded-lg border border-purple-100 bg-purple-50/50 p-4">
                                        <h4 className="mb-2 font-medium text-purple-800">Panduan Pengajuan IIN Nasional</h4>
                                        <ul className="list-inside list-disc space-y-1 text-left text-sm text-gray-600">
                                            <li>Download dan isi formulir aplikasi dengan lengkap</li>
                                            <li>Upload formulir yang telah diisi</li>
                                            <li>Tunggu verifikasi dari admin</li>
                                            <li>Lakukan pembayaran jika aplikasi disetujui</li>
                                            <li>Tunggu proses verifikasi lapangan</li>
                                            <li>Nomor IIN akan diterbitkan jika semua tahapan selesai</li>
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
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{application.application_number}</h3>
                                                    <p className="text-sm text-gray-600">IIN Nasional</p>
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
                                                <div className="flex w-full items-center gap-2">
                                                    <Link href={route('iin-nasional.show', application.id)}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Lihat Detail
                                                        </Button>
                                                    </Link>

                                                    {application.status === 'pengajuan' && auth.user.role === 'user' && (
                                                        <Link href={route('iin-nasional.edit', application.id)}>
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

                                                    {application.status &&
                                                        String(application.status).trim().toLowerCase() === 'perbaikan' &&
                                                        auth.user.role === 'user' && (
                                                            <Link href={route('iin-nasional.edit', application.id)}>
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

                                                    {application.status === 'pembayaran' && auth.user.role === 'user' && (
                                                        <Link href={route('iin-nasional.show', application.id) + '#payment'}>
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
                                                                                value={data.company_name}
                                                                                onChange={(e) => setData('company_name', e.target.value)}
                                                                            />
                                                                            {errors.company_name && (
                                                                                <p className="mt-1 text-xs text-red-600">{errors.company_name}</p>
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
                                                                                value={data.pic_name}
                                                                                onChange={(e) => setData('pic_name', e.target.value)}
                                                                            />
                                                                            {errors.pic_name && (
                                                                                <p className="mt-1 text-xs text-red-600">{errors.pic_name}</p>
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
                                                                                value={data.pic_contact}
                                                                                onChange={(e) => setData('pic_contact', e.target.value)}
                                                                            />
                                                                            {errors.pic_contact && (
                                                                                <p className="mt-1 text-xs text-red-600">{errors.pic_contact}</p>
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
                                                                                value={data.verification_date}
                                                                                onChange={(e) => setData('verification_date', e.target.value)}
                                                                            />
                                                                            {errors.verification_date && (
                                                                                <p className="mt-1 text-xs text-red-600">{errors.verification_date}</p>
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
                                                                                checked={data.is_acknowledged}
                                                                                onCheckedChange={(checked) =>
                                                                                    setData('is_acknowledged', Boolean(checked))
                                                                                }
                                                                            />
                                                                            {errors.is_acknowledged && (
                                                                                <p className="mt-1 text-xs text-red-600">{errors.is_acknowledged}</p>
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
                                                                                value={data.chief_verificator_amount}
                                                                                onChange={(e) =>
                                                                                    setData('chief_verificator_amount', parseInt(e.target.value))
                                                                                }
                                                                            />
                                                                            {errors.chief_verificator_amount && (
                                                                                <p className="mt-1 text-xs text-red-600">{errors.chief_verificator_amount}</p>
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
                                                                                value={data.member_verificator_amount}
                                                                                onChange={(e) =>
                                                                                    setData('member_verificator_amount', parseInt(e.target.value))
                                                                                }
                                                                            />
                                                                            {errors.member_verificator_amount && (
                                                                                <p className="mt-1 text-xs text-red-600">{errors.member_verificator_amount}</p>
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
                                                                                        setData('payment_proof_path', e.target.files[0]);
                                                                                    }
                                                                                }}
                                                                            />
                                                                            {errors.payment_proof_path && (
                                                                                <p className="mt-1 text-xs text-red-600">{errors.payment_proof_path}</p>
                                                                            )}
                                                                        </div>
                                                                    </form>
                                                                </div>
                                                                <DialogFooter>
                                                                    <Button variant="outline" onClick={() => setIsSurveyModalOpen(false)}>
                                                                        Batal
                                                                    </Button>
                                                                    <Button form="expense-reim-form" type="submit">
                                                                        Kirim
                                                                    </Button>
                                                                </DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
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
                        window.open(route('iin-nasional.download-file', [selectedApplication.id, 'certificate']), '_blank');
                    }
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
