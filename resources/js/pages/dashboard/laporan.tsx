import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { User } from '@/types';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BarChart3, Calendar, TrendingUp } from 'lucide-react';

interface LaporanProps {
    auth: {
        user: User;
    };
}

export default function Laporan({ auth }: LaporanProps) {
    // Mocking data - in real implementation this would come from backend
    const verificationStats = [
        {
            label: 'Total Verifikasi',
            value: '42',
            change: '+12% dari bulan lalu',
            trend: 'up',
        },
        {
            label: 'Rata-rata Waktu',
            value: '2.4 jam',
            change: '-15 menit dari rata-rata',
            trend: 'up',
        },
        {
            label: 'Tingkat Kelulusan',
            value: '84%',
            change: '+2% dari standar',
            trend: 'up',
        },
        {
            label: 'Pending Verifikasi',
            value: '7',
            change: '+3 minggu ini',
            trend: 'down',
        },
    ];

    const recentReports = [
        {
            id: 'RPT-2025-001',
            companyName: 'PT Teknologi Maju Indonesia',
            date: '05 Juli 2025',
            status: 'approved',
            type: 'IIN Nasional',
            notes: 'Semua persyaratan terpenuhi dengan baik.',
        },
        {
            id: 'RPT-2025-002',
            companyName: 'CV Solusi Digital',
            date: '03 Juli 2025',
            status: 'rejected',
            type: 'Single IIN',
            notes: 'Infrastruktur keamanan belum memenuhi standar.',
        },
        {
            id: 'RPT-2025-003',
            companyName: 'PT Fintech Nusantara',
            date: '30 Juni 2025',
            status: 'approved',
            type: 'Blockholder',
            notes: 'Semua persyaratan terpenuhi, dengan catatan minor.',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Disetujui</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Ditolak</Badge>;
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">Menunggu</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Laporan Verifikasi" />

            <div className="space-y-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="mb-2 bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-3xl font-bold text-transparent">
                        Laporan Verifikasi
                    </h1>
                    <p className="text-gray-600">Pantau dan kelola laporan hasil verifikasi lapangan</p>
                </motion.div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                    {verificationStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="rounded-2xl border-purple-200/30 shadow-lg shadow-purple-200/30">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="mb-1 text-sm font-medium text-gray-600">{stat.label}</p>
                                            <h2 className="text-2xl font-bold text-gray-900">{stat.value}</h2>
                                        </div>
                                        <div
                                            className={`flex h-8 w-8 items-center justify-center rounded-full ${stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}
                                        >
                                            {stat.trend === 'up' ? (
                                                <TrendingUp className="h-4 w-4" />
                                            ) : (
                                                <ArrowUpRight className="h-4 w-4 rotate-90 transform" />
                                            )}
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">{stat.change}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Recent Reports */}
                <Card>
                    <CardHeader className="border-b pb-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Laporan Terbaru</CardTitle>
                                <CardDescription>Laporan hasil verifikasi lapangan terbaru</CardDescription>
                            </div>
                            <Button variant="outline" size="sm">
                                Lihat Semua
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-5">
                            {recentReports.map((report) => (
                                <div key={report.id} className="rounded-lg border p-4 transition-all hover:shadow-md">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{report.companyName}</h3>
                                            <div className="mt-1 flex items-center text-sm text-gray-600">
                                                <Calendar className="mr-1 h-3.5 w-3.5 text-gray-500" />
                                                {report.date}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {getStatusBadge(report.status)}
                                            <p className="mt-1 text-sm text-gray-600">{report.id}</p>
                                        </div>
                                    </div>
                                    <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        <div>
                                            <p className="text-xs text-gray-500">Jenis Pengajuan</p>
                                            <p className="text-sm font-medium">{report.type}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Catatan</p>
                                            <p className="text-sm">{report.notes}</p>
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <Button variant="outline" size="sm">
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            Lihat Detail Laporan
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Chart - Placeholder for Chart Component */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performa Verifikasi</CardTitle>
                        <CardDescription>Grafik performa verifikasi per bulan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center rounded-lg border bg-gray-50 p-16 text-gray-500">
                            <BarChart3 className="mr-2 h-8 w-8" />
                            <span>Chart visualization would appear here</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
