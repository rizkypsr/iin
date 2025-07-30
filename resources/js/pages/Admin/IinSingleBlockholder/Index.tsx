import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { PageProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, FileText } from 'lucide-react';

interface IinSingleBlockholderApplication {
    id: number;
    application_number: string;
    status: string;
    created_at: string;
    submitted_at: string;
    iin_number?: string;
    company_name: string;
    company_address: string;
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

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'pengajuan':
            return <Badge className="bg-blue-500 text-white hover:bg-blue-600">PENGAJUAN</Badge>;
        case 'perbaikan':
            return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">PERBAIKAN</Badge>;
        case 'pembayaran':
            return <Badge className="bg-orange-500 text-white hover:bg-orange-600">PEMBAYARAN</Badge>;
        case 'verifikasi-lapangan':
            return <Badge className="bg-purple-500 text-white hover:bg-purple-600">VERIFIKASI LAPANGAN</Badge>;
        case 'pembayaran-tahap-2':
            return <Badge className="bg-red-500 text-white hover:bg-red-600">PEMBAYARAN TAHAP 2</Badge>;
        case 'menunggu-terbit':
            return <Badge className="bg-cyan-500 text-white hover:bg-cyan-600">MENUNGGU TERBIT</Badge>;
        case 'terbit':
            return <Badge className="bg-green-500 text-white hover:bg-green-600">TERBIT</Badge>;
        default:
            return <Badge className="bg-gray-500 text-white hover:bg-gray-600">{status.toUpperCase()}</Badge>;
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
        case 'pembayaran-tahap-2':
            return 'Pembayaran Tahap 2';
        case 'menunggu-terbit':
            return 'Menunggu Terbit';
        case 'terbit':
            return 'Terbit';
        default:
            return status;
    }
};

export default function Index({ auth, applications }: Props) {
    return (
        <DashboardLayout
            user={auth.user}
            title="Admin - IIN Single Blockholder"
        >
            <Head title="Admin - IIN Single Blockholder" />

            <div className="mb-8">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Manajemen Aplikasi IIN Single Blockholder
                </h2>
            </div>

            <div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Daftar Aplikasi IIN Single Blockholder
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {applications.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Belum Ada Aplikasi</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Tidak ada aplikasi IIN Single Blockholder yang tersedia untuk ditinjau.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>No. Aplikasi</TableHead>
                                                <TableHead>Pemohon</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Tanggal Pengajuan</TableHead>
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
                                                            <div className="font-medium">{application.user?.name}</div>
                                                            <div className="text-sm text-gray-500">{application.user?.email}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getStatusBadge(application.status)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {new Date(application.created_at).toLocaleDateString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric'
                                                        })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <Link href={route('admin.iin-single-blockholder.show', application.id)}>
                                                                    <Eye className="h-4 w-4 mr-1" />
                                                                    Detail
                                                                </Link>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}