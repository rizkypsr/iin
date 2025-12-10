import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { PageProps } from '@/types';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface Application {
    id: number;
    type: string;
    application_number: string;
    created_at: string;
    status_label: string;
}

interface Activity {
    id: number;
    message: string;
    type: 'success' | 'warning' | 'info' | 'error';
    created_at: string;
}

interface DashboardStats {
    total_applications: number;
    approved_applications: number;
    pending_applications: number;
}

interface DashboardProps extends PageProps {
    stats: DashboardStats;
    recent_applications: Application[];
    recent_activities: Activity[];
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Approved':
            return 'bg-green-100 text-green-800';
        case 'In Review':
            return 'bg-yellow-100 text-yellow-800';
        case 'Pending':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

export default function Dashboard({ auth, stats, recent_applications, recent_activities, application_counts }: DashboardProps) {
    const user = auth.user;

    const dashboardStats = [
        { label: 'Total Aplikasi', value: stats.total_applications.toString(), change: 'Total permohonan' },
        { label: 'Approved', value: stats.approved_applications.toString(), change: 'Telah disetujui' },
        { label: 'Pending', value: stats.pending_applications.toString(), change: 'Menunggu review' },
    ];

    return (
        <DashboardLayout title="Dashboard" user={user} applicationCounts={application_counts}>
            <div className="space-y-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="mb-2 bg-gradient-to-r from-[#01AEEC] to-[#01AEEC] bg-clip-text text-3xl font-bold text-transparent">Dashboard</h1>
                    <p className="text-gray-600">Selamat datang kembali! Berikut adalah ringkasan aktivitas permohonan layanan Anda.</p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {dashboardStats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 * index }}
                        >
                            <Card
                                className={`${index === 0 ? 'border-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white' : 'border-blue-200/50 bg-white/95 backdrop-blur-sm'} rounded-2xl shadow-lg shadow-blue-200/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-300/40`}
                            >
                                <CardContent className="p-6">
                                    <div className={`mb-1 text-2xl font-bold ${index === 0 ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                                    <p className={`mb-1 text-sm font-medium ${index === 0 ? 'text-white/90' : 'text-gray-600'}`}>{stat.label}</p>
                                    <p className={`text-xs ${index === 0 ? 'text-white/80' : 'text-gray-600'}`}>{stat.change}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Applications */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                    <Card className="rounded-2xl border-blue-200/50 bg-white/95 shadow-lg shadow-blue-200/30 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-300/40">
                        <CardHeader>
                            <CardTitle className="text-gray-900">Aplikasi Terbaru</CardTitle>
                            <CardDescription>Daftar aplikasi IIN yang baru diajukan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recent_applications.length > 0 ? (
                                    recent_applications.map((app, index) => (
                                        <motion.div
                                            key={app.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: 0.3 + 0.1 * index }}
                                            className="flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-50/80 to-blue-100/50 p-4 transition-all duration-200 hover:shadow-md"
                                        >
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {app.type === 'nasional' ? 'IIN Nasional' : 'Single IIN/Blockholder'}
                                                </h4>
                                                <p className="text-sm text-gray-600">No: {app.application_number}</p>
                                                <p className="text-xs text-gray-500">{new Date(app.created_at).toLocaleDateString('id-ID')}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={getStatusColor(app.status_label)}>{app.status_label}</Badge>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="py-8 text-center">
                                        <p className="text-gray-500">Belum ada aplikasi yang diajukan</p>
                                        <Link href="/iin-nasional/create" className="mt-2 inline-block text-sm text-[#01AEEC] hover:text-[#01AEEC]">
                                            Ajukan aplikasi pertama Anda
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
