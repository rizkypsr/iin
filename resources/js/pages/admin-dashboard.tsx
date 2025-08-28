import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { 
    Users, 
    FileText, 
    CheckCircle, 
    Clock, 
    CreditCard,
    MapPin,
    AlertCircle,
    TrendingUp,
    Eye,
    Calendar,
    User
} from 'lucide-react';

interface Application {
    id: number;
    application_number: string;
    status: string;
    status_label?: string;
    created_at: string;
    user: {
        name: string;
        email: string;
    };
    type: 'nasional' | 'single_blockholder';
}

interface AdminDashboardProps extends PageProps {
    stats: {
        total_applications: number;
        pending_review: number;
        approved: number;
        total_users: number;
        awaiting_payment: number;
        field_verification: number;
        awaiting_issuance: number;
        rejected: number;
    };
    recent_applications: Application[];
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pengajuan':
            return <FileText className="w-4 h-4" />;
        case 'perbaikan':
            return <AlertCircle className="w-4 h-4" />;
        case 'pembayaran':
            return <CreditCard className="w-4 h-4" />;
        case 'verifikasi-lapangan':
            return <MapPin className="w-4 h-4" />;
        case 'menunggu-terbit':
            return <Clock className="w-4 h-4" />;
        case 'terbit':
            return <CheckCircle className="w-4 h-4" />;
        case 'ditolak':
            return <AlertCircle className="w-4 h-4" />;
        default:
            return <Clock className="w-4 h-4" />;
    }
};

const getStatusBadgeClass = (status: string) => {
    switch (status) {
        case 'pengajuan':
            return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        case 'perbaikan':
            return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
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

export default function AdminDashboard({ 
    auth, 
    stats, 
    recent_applications = [],
    application_counts
}: AdminDashboardProps) {
    const user = auth.user;

    return (
        <DashboardLayout title="Admin Dashboard" user={user} applicationCounts={application_counts}>
            <div className="space-y-8">
                <div>
                    <h1 className="mb-2 text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Panel administrasi untuk mengelola sistem IIN</p>
                </div>

                {/* Admin Stats */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-1 text-2xl font-bold text-gray-900">
                                            {stats.total_applications}
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Total Permohonan</p>
                                    </div>
                                    <FileText className="w-8 h-8 text-blue-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-1 text-2xl font-bold text-gray-900">
                                            {stats.pending_review}
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Perlu Review</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-amber-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-1 text-2xl font-bold text-gray-900">
                                            {stats.approved}
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Disetujui</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-1 text-2xl font-bold text-gray-900">
                                            {stats.total_users}
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Total User</p>
                                    </div>
                                    <Users className="w-8 h-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Additional Stats Row */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-1 text-2xl font-bold text-gray-900">
                                            {stats.awaiting_payment}
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Menunggu Pembayaran</p>
                                    </div>
                                    <CreditCard className="w-8 h-8 text-purple-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-1 text-2xl font-bold text-gray-900">
                                            {stats.field_verification}
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Verifikasi Lapangan</p>
                                    </div>
                                    <MapPin className="w-8 h-8 text-indigo-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-1 text-2xl font-bold text-gray-900">
                                            {stats.awaiting_issuance}
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Menunggu Terbit</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-cyan-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="mb-1 text-2xl font-bold text-gray-900">
                                            {stats.rejected}
                                        </div>
                                        <p className="text-sm font-medium text-gray-600">Ditolak</p>
                                    </div>
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Recent Applications */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" />
                                Aktivitas Terbaru
                            </CardTitle>
                            <CardDescription>
                                Permohonan terbaru yang masuk ke sistem
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {recent_applications.length > 0 ? (
                                <div className="space-y-4">
                                    {recent_applications.map((application) => (
                                        <div key={`${application.type}-${application.id}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-4">
                                                {getStatusIcon(application.status)}
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {application.application_number}
                                                    </p>
                                                    <p className="text-sm text-gray-600 flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        {application.user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(application.created_at).toLocaleDateString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={getStatusBadgeClass(application.status)}>
                                                    {application.status_label || application.status}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {application.type === 'nasional' ? 'IIN Nasional' : 'Single Blockholder'}
                                                </Badge>
                                                <Link
                                                    href={application.type === 'nasional' 
                                                        ? route('admin.iin-nasional.show', application.id)
                                                        : route('admin.iin-single-blockholder.show', application.id)
                                                    }
                                                >
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="w-4 h-4 mr-2" />
                                                        Lihat
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Belum Ada Aktivitas
                                    </h3>
                                    <p className="text-gray-600">
                                        Belum ada permohonan yang masuk ke sistem.
                                    </p>
                                </div>
                            )}
                            

                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
