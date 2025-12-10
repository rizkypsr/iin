import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { PageProps } from '@/types';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight, FileText } from 'lucide-react';

interface Application {
    id: number;
    type: string;
    application_number: string;
    created_at: string;
    status_label: string;
    status: string;
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

export default function Dashboard({ auth, stats, recent_applications, recent_activities, application_counts }: DashboardProps) {
    const user = auth.user;

    const dashboardStats = [
        { label: 'Total Aplikasi', value: stats.total_applications.toString(), change: 'Total permohonan' },
        { label: 'Approved', value: stats.approved_applications.toString(), change: 'Telah disetujui' },
        { label: 'Pending', value: stats.pending_applications.toString(), change: 'Menunggu review' },
    ];

    const getApplicationUrl = (app: Application) => {
        if (app.type === 'nasional') {
            return route('iin-nasional.show', app.id);
        }
        return route('iin-single-blockholder.show', app.id);
    };

    // Only show first 5 applications
    const displayedApplications = recent_applications.slice(0, 5);

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
                                className={`${index === 0 ? 'border-0 bg-gradient-primary text-white' : 'bg-white/95'} rounded-2xl shadow-lg`}
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
                    <Card className="rounded-2xl bg-white/95 shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-gray-900">Aplikasi Terbaru</CardTitle>
                            <CardDescription>Daftar 5 aplikasi IIN terakhir yang diajukan</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {displayedApplications.length > 0 ? (
                                <div className="divide-y divide-gray-100">
                                    {displayedApplications.map((app, index) => (
                                        <Link
                                            key={app.id}
                                            href={getApplicationUrl(app)}
                                            className="block"
                                        >
                                            <motion.div
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ duration: 0.3, delay: 0.1 * index }}
                                                className="group flex items-center justify-between py-4 transition-colors hover:bg-gray-50 px-2 -mx-2 rounded-lg"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900 group-hover:text-blue-600">
                                                            {app.type === 'nasional' ? 'IIN Nasional' : 'Single IIN/Blockholder'}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{app.application_number}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <Badge className={getStatusBadgeClass(app.status)}>
                                                            {getStatusLabel(app.status)}
                                                        </Badge>
                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {new Date(app.created_at).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric',
                                                            })}
                                                        </p>
                                                    </div>
                                                    <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500" />
                                                </div>
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                        <FileText className="h-6 w-6 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">Belum ada aplikasi yang diajukan</p>
                                    <Link href="/iin-nasional/create" className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700">
                                        Ajukan aplikasi pertama Anda →
                                    </Link>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
