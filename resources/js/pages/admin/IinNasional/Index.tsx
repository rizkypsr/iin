import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardLayout from '@/layouts/dashboard-layout';
import { IinNasionalApplication, PageProps } from '@/types';
import { getStatusBadgeClass, getStatusLabel } from '@/utils/statusUtils';
import { Head, Link } from '@inertiajs/react';
import { Eye, FileText } from 'lucide-react';
import { columns } from './components/Columns';
import { DataTable } from '../../../components/DataTable';
import { DataTablePagination } from '@/components/ui/data-table-pagination';

interface Props extends PageProps {
    applications: {
        data: IinNasionalApplication[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        first_page_url?: string;
        last_page_url?: string;
        next_page_url?: string | null;
        prev_page_url?: string | null;
        links?: { url: string | null; label: string; active: boolean }[];
    };
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

export default function Index({ auth, applications, application_counts }: Props) {
    console.log(applications);
    
    return (
        <DashboardLayout user={auth.user} title="Admin - IIN Nasional" applicationCounts={application_counts}>
            <Head title="Admin - IIN Nasional" />

            <div className="mb-8">
                <h2 className="text-xl font-semibold leading-tight text-gray-800">Manajemen Aplikasi IIN Nasional</h2>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <FileText className="w-5 h-5" />
                        Daftar Aplikasi IIN Nasional
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {applications.data.length === 0 ? (
                        <div className="py-8 text-center">
                            <FileText className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                            <p className="text-lg text-gray-500">Belum Ada Aplikasi</p>
                            <p className="mt-2 text-sm text-gray-400">Tidak ada aplikasi IIN Nasional yang tersedia untuk ditinjau.</p>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={applications.data}
                            serverMeta={{
                                current_page: applications.current_page ?? 1,
                                last_page: applications.last_page ?? 1,
                                per_page: applications.per_page ?? 10,
                                total: applications.total ?? applications.data.length,
                                first_page_url: applications.first_page_url,
                                last_page_url: applications.last_page_url,
                                next_page_url: applications.next_page_url,
                                prev_page_url: applications.prev_page_url,
                                links: applications.links,
                            }}
                        />
                    )}
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
