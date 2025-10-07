import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { PageProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Eye, Shield } from 'lucide-react';

interface PengawasanSingleIinApplication {
    id: number;
    application_number: string;
    status: string;
    created_at: string;
    submitted_at: string;
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
    single_iin_profile: {
        id: number;
        user_id: number;
        institution_name: string;
        institution_type: string;
        year: number;
        iin_assignment: string;
        assignment_date: string;
        regional: string;
        usage_purpose: string;
        address: string;
        address_updated: string;
        phone_fax: string;
        phone_fax_updated: string;
        email: string;
        contact_person: string;
        remarks_status: string;
        card_specimen: string;
        previous_name: string;
    }
}

interface Props extends PageProps {
    applications: {
        data: PengawasanSingleIinApplication[];
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
        case 'submitted':
            return <Badge className="bg-blue-500 text-white hover:bg-blue-600">DIAJUKAN</Badge>;
        case 'payment_verified':
            return <Badge className="bg-orange-500 text-white hover:bg-orange-600">PEMBAYARAN TERVERIFIKASI</Badge>;
        case 'field_verification':
            return <Badge className="bg-purple-500 text-white hover:bg-purple-600">VERIFIKASI LAPANGAN</Badge>;
        case 'issued':
            return <Badge className="bg-green-500 text-white hover:bg-green-600">SELESAI</Badge>;
        case 'draft':
            return <Badge className="bg-gray-500 text-white hover:bg-gray-600">DRAFT</Badge>;
        default:
            return <Badge className="bg-gray-500 text-white hover:bg-gray-600">{status.toUpperCase()}</Badge>;
    }
};

const getStatusLabel = (status: string) => {
    switch (status) {
        case 'submitted':
            return 'Diajukan';
        case 'payment_verified':
            return 'Pembayaran Terverifikasi';
        case 'field_verification':
            return 'Verifikasi Lapangan';
        case 'issued':
            return 'Selesai';
        case 'draft':
            return 'Draft';
        default:
            return status;
    }
};

export default function Index({ auth, applications, application_counts }: Props) {
    return (
        <DashboardLayout
            user={auth.user}
            title="Admin - Pengawasan Single IIN"
        >
            <Head title="Admin - Pengawasan Single IIN" />

            <div className="mb-8">
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Manajemen Aplikasi Pengawasan Single IIN
                </h2>
            </div>

            <div>
                <div>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Shield className="h-5 w-5" />
                                Daftar Aplikasi Pengawasan Single IIN
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {applications.data.length === 0 ? (
                                <div className="text-center py-8">
                                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500 text-lg">Belum Ada Aplikasi</p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        Tidak ada aplikasi Pengawasan Single IIN yang tersedia untuk ditinjau.
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
                                                        <p className="font-medium">{application.single_iin_profile.institution_name}</p>
                                                        <p className="text-sm text-gray-500">{application.single_iin_profile.address}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{application.single_iin_profile.contact_person}</p>
                                                        <p className="text-sm text-gray-500">{application.single_iin_profile.email}</p>
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
                                                    <Link href={route('admin.pengawasan-single-iin.show', application.id)}>
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