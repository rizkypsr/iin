import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, Clock, MapPin } from 'lucide-react';

import { User } from '@/types';

interface VerifikasiLapanganProps {
    auth: {
        user: User;
    };
}

export default function VerifikasiLapangan({ auth }: VerifikasiLapanganProps) {
    // Mocking data - in real implementation this would come from backend
    const fieldVerifications = [
        {
            id: 'IIN-2025-001',
            companyName: 'PT Teknologi Maju Indonesia',
            address: 'Jl. Sudirman No. 123, Jakarta Pusat',
            scheduleDate: '12 Juli 2025',
            status: 'scheduled',
            contactPerson: 'Budi Santoso',
            contactPhone: '081234567890',
            type: 'IIN Nasional',
        },
        {
            id: 'IIN-2025-002',
            companyName: 'CV Solusi Digital',
            address: 'Jl. Thamrin No. 45, Jakarta Selatan',
            scheduleDate: '14 Juli 2025',
            status: 'scheduled',
            contactPerson: 'Andi Wijaya',
            contactPhone: '087654321098',
            type: 'Single IIN',
        },
        {
            id: 'IIN-2025-003',
            companyName: 'PT Fintech Nusantara',
            address: 'Jl. Gatot Subroto No. 87, Jakarta Selatan',
            scheduleDate: '15 Juli 2025',
            status: 'scheduled',
            contactPerson: 'Dewi Putri',
            contactPhone: '089876543210',
            type: 'Blockholder',
        },
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                        <CheckCircle className="mr-1 h-3 w-3" /> Selesai
                    </Badge>
                );
            case 'in_progress':
                return (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        <Clock className="mr-1 h-3 w-3" /> Sedang Berlangsung
                    </Badge>
                );
            case 'scheduled':
                return (
                    <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                        <Calendar className="mr-1 h-3 w-3" /> Dijadwalkan
                    </Badge>
                );
            default:
                return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">{status}</Badge>;
        }
    };

    return (
        <DashboardLayout user={auth.user}>
            <Head title="Verifikasi Lapangan" />

            <div className="space-y-8">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="mb-2 bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-3xl font-bold text-transparent">
                        Verifikasi Lapangan
                    </h1>
                    <p className="text-gray-600">Kelola dan laksanakan tugas verifikasi lapangan untuk pengajuan IIN</p>
                </motion.div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                        <Card className="overflow-hidden rounded-2xl border-purple-200/30 shadow-lg shadow-purple-200/30">
                            <div className="h-2 bg-gradient-to-r from-blue-600 to-blue-800"></div>
                            <CardContent className="p-6">
                                <h2 className="mb-1 text-3xl font-bold text-blue-700">3</h2>
                                <p className="text-sm font-medium text-gray-600">Jadwal Mendatang</p>
                                <p className="mt-1 text-xs text-gray-500">Periode 10-16 Juli 2025</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                        <Card className="overflow-hidden rounded-2xl border-purple-200/30 shadow-lg shadow-purple-200/30">
                            <div className="h-2 bg-gradient-to-r from-green-600 to-green-800"></div>
                            <CardContent className="p-6">
                                <h2 className="mb-1 text-3xl font-bold text-green-700">8</h2>
                                <p className="text-sm font-medium text-gray-600">Verifikasi Selesai</p>
                                <p className="mt-1 text-xs text-gray-500">Bulan Juli 2025</p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                        <Card className="overflow-hidden rounded-2xl border-purple-200/30 shadow-lg shadow-purple-200/30">
                            <div className="h-2 bg-gradient-to-r from-amber-600 to-amber-800"></div>
                            <CardContent className="p-6">
                                <h2 className="mb-1 text-3xl font-bold text-amber-700">0</h2>
                                <p className="text-sm font-medium text-gray-600">Menunggu Laporan</p>
                                <p className="mt-1 text-xs text-gray-500">Perlu segera diselesaikan</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Upcoming Verification Schedule */}
                <Card>
                    <CardHeader className="border-b pb-3">
                        <CardTitle>Jadwal Verifikasi Mendatang</CardTitle>
                        <CardDescription>Daftar kunjungan verifikasi yang telah dijadwalkan</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                        <div className="space-y-5">
                            {fieldVerifications.map((verification) => (
                                <div key={verification.id} className="rounded-lg border p-4 transition-all hover:shadow-md">
                                    <div className="mb-3 flex items-start justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900">{verification.companyName}</h3>
                                            <div className="mt-1 flex items-center text-sm text-gray-600">
                                                <MapPin className="mr-1 h-3.5 w-3.5 text-gray-500" />
                                                {verification.address}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            {getStatusBadge(verification.status)}
                                            <p className="mt-1 text-sm text-gray-600">{verification.id}</p>
                                        </div>
                                    </div>
                                    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Tanggal Kunjungan</p>
                                            <p className="text-sm font-medium">{verification.scheduleDate}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Kontak Person</p>
                                            <p className="text-sm font-medium">{verification.contactPerson}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Jenis Pengajuan</p>
                                            <p className="text-sm font-medium">{verification.type}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <Button variant="outline" size="sm">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Laporkan Hasil
                                        </Button>
                                        <Button variant="outline" size="sm">
                                            Lihat Detail
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
