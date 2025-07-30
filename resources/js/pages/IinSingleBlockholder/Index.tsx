import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, Award, Calendar, CheckCircle, Clock, CreditCard, Download, Eye, FileText, MapPin, Plus, Upload, User } from 'lucide-react';

interface IinSingleBlockholderApplication {
    id: number;
    application_number: string;
    status: string;
    status_label?: string; // Made optional since we're calculating it
    status_color?: string; // Made optional since we're calculating it
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
        data: IinSingleBlockholderApplication[];
        links: any[];
        meta: any;
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
        case 'menunggu-terbit':
            return <Clock className="h-4 w-4" />;
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
        case 'menunggu-terbit':
            return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
        case 'terbit':
            return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'ditolak':
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
            return 'Menunggu Pembayaran';
        case 'verifikasi-lapangan':
            return 'Verifikasi Lapangan';
        case 'menunggu-terbit':
            return 'Menunggu Terbit';
        case 'terbit':
            return 'Sudah Terbit';
        case 'ditolak':
            return 'Ditolak';
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

export default function IinSingleBlockholderIndex({ applications, auth }: Props) {
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
                                <Button variant="outline" size="sm" onClick={() => window.open(route('download-form', 'single-blockholder'), '_blank')}>
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
                                            <li>Lakukan pembayaran Tahap 1 jika aplikasi disetujui</li>
                                            <li>Tunggu proses verifikasi lapangan</li>
                                            <li>Lakukan pembayaran Tahap 2 jika aplikasi disetujui</li>
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
                                        className={`rounded-lg border p-4 transition-shadow hover:shadow-md ${
                                            application.status === 'perbaikan' && auth.user.role === 'user'
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
                                                                ? '25%'
                                                                : application.status === 'perbaikan'
                                                                  ? '25%'
                                                                  : application.status === 'verifikasi-lapangan'
                                                                    ? '50%'
                                                                    : application.status === 'pembayaran'
                                                                      ? '75%'
                                                                      : application.status === 'menunggu-terbit'
                                                                        ? '75%'
                                                                        : application.status === 'terbit'
                                                                          ? '100%'
                                                                          : '0%',
                                                    }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Pengajuan</span>
                                                <span>Verifikasi</span>
                                                <span>Pembayaran</span>
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

                                                    {application.status === 'pembayaran' && auth.user.role === 'user' && (
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

                                                    {application.status === 'terbit' && application.iin_number && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="border-green-200 text-green-600 hover:bg-green-50"
                                                            onClick={() =>
                                                                window.open(
                                                                    route('iin-single-blockholder.download-file', [application.id, 'certificate']),
                                                                    '_blank',
                                                                )
                                                            }
                                                        >
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Download Sertifikat
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex items-center text-sm text-gray-500">
                                                    {application.status === 'pembayaran' && (
                                                        <div className="flex items-center text-blue-500">
                                                            <CreditCard className="mr-1 h-4 w-4" />
                                                            <span>Menunggu pembayaran</span>
                                                        </div>
                                                    )}
                                                    {application.status === 'verifikasi-lapangan' && (
                                                        <div className="flex items-center text-purple-500">
                                                            <MapPin className="mr-1 h-4 w-4" />
                                                            <span>Sedang verifikasi lapangan</span>
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
                                        className={`rounded px-3 py-1 ${
                                            link.active
                                                ? 'bg-purple-100 text-purple-700'
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
        </DashboardLayout>
    );
}
