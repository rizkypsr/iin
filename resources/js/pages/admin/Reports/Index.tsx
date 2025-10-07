import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Head, router } from '@inertiajs/react';
import { Download, FileSpreadsheet, Filter } from 'lucide-react';
import { useState } from 'react';

interface Report {
    company_name: string;
    created_at: string;
    service_type: string;
    payment_proof_uploaded_at: string | null;
    nominal_pembayaran: number;
    issued_at: string | null;
    service_days: number | null;
    iin_number: string | null;
    pic_name: string;
    company_phone: string | null;
    email: string;
}

interface Props {
    reports: Report[];
    currentType: string;
}

export default function Index({ reports, currentType }: Props) {
    const [selectedType, setSelectedType] = useState(currentType);

    const handleFilterChange = (type: string) => {
        setSelectedType(type);
        router.get(
            route('admin.reports.index'),
            { type },
            {
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    const handleExport = () => {
        window.location.href = route('admin.reports.export', { type: selectedType });
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID');
    };

    const getServiceTypeBadge = (serviceType: string) => {
        const variants: Record<string, string> = {
            'IIN Nasional': 'bg-blue-100 text-blue-800',
            'Single IIN Blockholder': 'bg-green-100 text-green-800',
            'Pengawasan IIN Nasional': 'bg-purple-100 text-purple-800',
            'Pengawasan Single IIN': 'bg-orange-100 text-orange-800',
        };

        return <Badge className={variants[serviceType] || 'bg-gray-100 text-gray-800'}>{serviceType}</Badge>;
    };

    return (
        <DashboardLayout title="Laporan" user={undefined}>
            <Head title="Laporan" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
                        <p className="text-muted-foreground">Kelola dan ekspor laporan aplikasi IIN</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5" />
                            Data Laporan
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Filter className="h-4 w-4" />
                                    <span className="text-sm font-medium">Filter:</span>
                                </div>
                                <Select value={selectedType} onValueChange={handleFilterChange}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Pilih jenis layanan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="iin_nasional">IIN Nasional</SelectItem>
                                        <SelectItem value="single_iin">Single IIN Blockholder</SelectItem>
                                        <SelectItem value="pengawasan_iin">Pengawasan IIN Nasional</SelectItem>
                                        <SelectItem value="pengawasan_single_iin">Pengawasan Single IIN</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={handleExport} className="flex items-center gap-2">
                                <Download className="h-4 w-4" />
                                Export Excel
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
