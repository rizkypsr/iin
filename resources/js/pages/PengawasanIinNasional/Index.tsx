import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, Award, Calendar, CheckCircle, Clock, CreditCard, Download, Eye, FileText, MapPin, Plus, Shield, Upload, User } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
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
        data: PengawasanIinNasionalApplication[];
        links: any[];
        meta: any;
    };
    errors?: {
        profile?: string;
        [key: string]: any;
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

export default function PengawasanIinNasionalIndex({ applications, auth, errors }: Props) {
    const [showSurvey, setShowSurvey] = useState(false);
    const { flash } = usePage<PageProps>().props;

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

            <motion.div
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
            >
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
                                        {applications.data.filter(app => !['terbit'].includes(app.status)).length}
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
                                        {applications.data.filter(app => app.status === 'terbit').length}
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
                                                                    ? '25%'
                                                                    : application.status === 'perbaikan'
                                                                        ? '25%'
                                                                        : application.status === 'pembayaran'
                                                                            ? '50%'
                                                                            : application.status === 'verifikasi-lapangan'
                                                                                ? '75%'
                                                                                : application.status === 'terbit'
                                                                                    ? '100%'
                                                                                    : '0%',
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Pengajuan</span>
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

                                                        {application.can_download_certificate && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-green-200 text-green-600 hover:bg-green-50"
                                                                onClick={() => window.open(route('pengawasan-iin-nasional.download-certificate', application.id), '_blank')}
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
                                    className={`px-3 py-2 text-sm rounded-md ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 border hover:bg-gray-50'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
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