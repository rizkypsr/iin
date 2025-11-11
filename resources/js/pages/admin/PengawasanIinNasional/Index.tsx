import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/layouts/dashboard-layout';
import { PageProps } from '@/types';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import { Head, Link } from '@inertiajs/react';
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

export default function Index({ auth, applications }: Props) {
    return (
        <DashboardLayout user={auth.user} title="Admin - Pengawasan IIN Nasional">
            <Head title="Admin - Pengawasan IIN Nasional" />

            <div className="mb-8">
                <h2 className="text-xl leading-tight font-semibold text-gray-800">Manajemen Aplikasi Pengawasan IIN Nasional</h2>
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
                                <div className="py-8 text-center">
                                    <Shield className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                                    <p className="text-lg text-gray-500">Belum Ada Aplikasi</p>
                                    <p className="mt-2 text-sm text-gray-400">
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
                                                <TableCell className="font-medium">{application.application_number}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{application.iin_nasional_profile?.institution_name}</p>
                                                        <p className="text-sm text-gray-500">{application.iin_nasional_profile?.brand}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{application.iin_nasional_profile?.contact_person_name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {application.iin_nasional_profile?.contact_person_email}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`${getStatusBadgeClass(application.status, { detailed: true })} ${application.status === 'perbaikan' ? 'flex items-center gap-1' : ''}`}
                                                    >
                                                        {getStatusLabel(application.status, { detailed: true })}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {application.submitted_at ? new Date(application.submitted_at).toLocaleDateString('id-ID') : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={route('admin.pengawasan-iin-nasional.show', application.id)}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="mr-1 h-4 w-4" />
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
