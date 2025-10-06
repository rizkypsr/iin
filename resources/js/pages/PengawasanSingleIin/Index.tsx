import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { PageProps } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, Award, Calendar, CheckCircle, Clock, CreditCard, Download, Eye, File, FileText, MapPin, Plus, Shield, Upload, User } from 'lucide-react';
import { showErrorToast, showSuccessToast } from '@/lib/toast-helper';
import { useEffect, useState } from 'react';

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

export default function PengawasanSingleIinIndex({ applications, auth, errors }: Props) {
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
            <Head title="Pengawasan Single IIN" />

            <motion.div
                className="space-y-6"
                initial="hidden"
                animate="visible"
                variants={containerAnimation}
            >
                {/* Header */}
                <motion.div variants={itemAnimation} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pengawasan Single IIN</h1>
                        <p className="text-gray-600">Kelola aplikasi pengawasan Single IIN Anda</p>
                    </div>
                    {auth.user.role === 'user' && (
                        <Link href={route('pengawasan-single-iin.create')}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                <Plus className="mr-2 h-4 w-4" />
                                Ajukan Pengawasan
                            </Button>
                        </Link>
                    )}
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
                                                    <div className="bg-gradient-accent flex h-10 w-10 items-center justify-center rounded-lg text-white">
                                                        {getStatusIcon(application.status)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{application.application_number}</h3>
                                                        <p className="text-sm text-gray-600">Pengawasan Single IIN</p>
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
                                                                    ? '20%'
                                                                    : application.status === 'perbaikan'
                                                                      ? '20%'
                                                                      : application.status === 'pembayaran'
                                                                        ? '40%'
                                                                        : application.status === 'verifikasi-lapangan'
                                                                          ? '60%'
                                                                          : application.status === 'pembayaran-tahap-2'
                                                                            ? '80%'
                                                                            : application.status === 'terbit'
                                                                              ? '100%'
                                                                              : '0%',
                                                        }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Pengajuan</span>
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

                                                        {(application.status === 'pembayaran' || application.status === 'pembayaran-tahap-2') && auth.user.role === 'user' && (
                                                            <Link href={route('pengawasan-single-iin.show', application.id) + '#payment'}>
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

                                                        {application.can_download_certificate && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-purple-200 text-purple-600 hover:bg-purple-50"
                                                                onClick={() => window.open(route('pengawasan-single-iin.download-certificate', application.id), '_blank')}
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
                                    className={`px-3 py-2 text-sm rounded-md ${link.active
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