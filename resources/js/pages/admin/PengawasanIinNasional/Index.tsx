import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { PageProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Shield } from 'lucide-react';

interface PengawasanIinNasionalApplication {
    id: number;
    application_number: string;
    status: string;
    created_at: string;
    submitted_at: string;
    user: {
        name: string;
        email: string;
    };
    admin?: {
        name: string;
    };
    iin_nasional_profile?: {
        id: number;
        institution_name: string;
        brand: string;
        contact_person_name: string;
        contact_person_email: string;
    };
}

interface Props extends PageProps {
    applications: {
        data: PengawasanIinNasionalApplication[];
        links: any[];
        meta: any;
    };
    application_counts?: {
        pengawasan_iin_nasional?: number;
        pengawasan_single_iin?: number;
    };
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pengajuan':
            return <Badge className="bg-blue-500 text-white hover:bg-blue-600">DIAJUKAN</Badge>;
        case 'pembayaran':
            return <Badge className="bg-orange-500 text-white hover:bg-orange-600">PEMBAYARAN</Badge>;
        case 'verifikasi-lapangan':
            return <Badge className="bg-purple-500 text-white hover:bg-purple-600">VERIFIKASI LAPANGAN</Badge>;
        case 'menunggu-terbit':
            return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">MENUNGGU TERBIT</Badge>;
        case 'terbit':
            return <Badge className="bg-green-500 text-white hover:bg-green-600">TERBIT</Badge>;
        default:
            return <Badge className="bg-gray-500 text-white hover:bg-gray-600">{status.toUpperCase()}</Badge>;
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'pengajuan':
            return 'Diajukan';
        case 'pembayaran':
            return 'Pembayaran';
        case 'verifikasi-lapangan':
            return 'Verifikasi Lapangan';
        case 'menunggu-terbit':
            return 'Menunggu Terbit';
        case 'terbit':
            return 'Terbit';
        default:
            return status.toUpperCase();
    }
};



export default function Index({ auth, applications }: Props) {
    return (
        <DashboardLayout
            user={auth.user}
            title="Admin - Pengawasan IIN Nasional"
        >
            <Head title="Admin - Pengawasan IIN Nasional" />

            <div className="mb-8">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Manajemen Aplikasi Pengawasan IIN Nasional
                </h2>
            </div>

            <div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Daftar Pengawasan IIN Nasional
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {applications.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Belum Ada Aplikasi</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Tidak ada aplikasi Pengawasan IIN Nasional yang tersedia untuk ditinjau.
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>No. Aplikasi</TableHead>
                                            <TableHead>Perusahaan</TableHead>
                                            <TableHead>Pemohon</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Tanggal Diajukan</TableHead>
                                            <TableHead>Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {applications.data.map((application) => (
                                            <TableRow key={application.id}>
                                                <TableCell className="font-medium">
                                                    {application.application_number}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{application.iin_nasional_profile?.institution_name}</p>
                                                        <p className="text-sm text-gray-500">{application.iin_nasional_profile?.brand}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{application.iin_nasional_profile?.contact_person_name}</p>
                                                        <p className="text-sm text-gray-500">{application.iin_nasional_profile?.contact_person_email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(application.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {application.submitted_at
                                                        ? new Date(application.submitted_at).toLocaleDateString('id-ID')
                                                        : '-'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={route('admin.pengawasan-iin-nasional.show', application.id)}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Lihat
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}