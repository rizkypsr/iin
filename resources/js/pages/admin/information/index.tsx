import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, ChevronLeft, ChevronRight, Edit, Info, Plus, Trash2 } from 'lucide-react';

interface InformationData {
    id: number;
    title: string;
    content: string;
    excerpt: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedData {
    data: InformationData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: PaginationLink[];
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    informations: PaginatedData;
    flash?: {
        success?: string;
        error?: string;
    };
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

export default function InformationIndex({ informations, flash, application_counts }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus informasi ini?')) {
            router.delete(route('admin.information.destroy', id));
        }
    };

    return (
        <DashboardLayout title="Information - Layanan Publik" applicationCounts={application_counts}>
            <Head title="Information - Layanan Publik" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <Info className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Information</h1>
                            <p className="text-gray-600">Kelola konten informasi yang ditampilkan di halaman Layanan Publik</p>
                        </div>
                    </div>
                    <Link href={route('admin.information.create')}>
                        <Button className="bg-blue-600 text-white hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Tambah Informasi
                        </Button>
                    </Link>
                </div>

                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                    </Alert>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Daftar Informasi</CardTitle>
                        <CardDescription>
                            Menampilkan {informations.data.length} dari {informations.total} informasi
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {informations.data.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                Belum ada informasi. Klik tombol "Tambah Informasi" untuk membuat informasi baru.
                            </div>
                        ) : (
                            <>
                                <div className="space-y-4">
                                    {informations.data.map((info) => (
                                        <div
                                            key={info.id}
                                            className="flex items-start justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
                                        >
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <h3 className="font-semibold text-gray-900">{info.title}</h3>
                                                    <Badge variant={info.is_active ? 'default' : 'secondary'}>
                                                        {info.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </Badge>
                                                </div>
                                                <p className="mb-2 text-sm text-gray-600">{info.excerpt}</p>
                                                <p className="text-xs text-gray-400">
                                                    Dibuat:{' '}
                                                    {new Date(info.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </p>
                                            </div>
                                            <div className="ml-4 flex items-center gap-2">
                                                <Link href={route('admin.information.edit', info.id)}>
                                                    <Button variant="outline" size="sm">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => handleDelete(info.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Pagination */}
                                {informations.last_page > 1 && (
                                    <div className="mt-6 flex items-center justify-between border-t pt-4">
                                        <p className="text-sm text-gray-500">
                                            Halaman {informations.current_page} dari {informations.last_page}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={informations.prev_page_url || '#'}
                                                preserveScroll
                                                className={!informations.prev_page_url ? 'pointer-events-none' : ''}
                                            >
                                                <Button variant="outline" size="sm" disabled={!informations.prev_page_url}>
                                                    <ChevronLeft className="mr-1 h-4 w-4" />
                                                    Sebelumnya
                                                </Button>
                                            </Link>
                                            <Link
                                                href={informations.next_page_url || '#'}
                                                preserveScroll
                                                className={!informations.next_page_url ? 'pointer-events-none' : ''}
                                            >
                                                <Button variant="outline" size="sm" disabled={!informations.next_page_url}>
                                                    Selanjutnya
                                                    <ChevronRight className="ml-1 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
