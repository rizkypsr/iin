import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

const pengaduanTerkini = [
    {
        id: 'PGD001',
        judul: 'Proses IIN terlalu lama',
        kategori: 'Proses',
        status: 'Ditangani',
        tanggal: '20 Jan 2025',
    },
    {
        id: 'PGD002',
        judul: 'Kesulitan upload dokumen',
        kategori: 'Teknis',
        status: 'Selesai',
        tanggal: '18 Jan 2025',
    },
    {
        id: 'PGD003',
        judul: 'Informasi tarif tidak jelas',
        kategori: 'Informasi',
        status: 'Ditangani',
        tanggal: '15 Jan 2025',
    },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Selesai':
            return 'bg-green-100 text-green-800';
        case 'Ditangani':
            return 'bg-yellow-100 text-yellow-800';
        case 'Menunggu':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const pengaduanStats = [
    { label: 'Total Pengaduan', value: '1,247', change: '+12%' },
    { label: 'Selesai Bulan Ini', value: '89', change: '+8%' },
    { label: 'Rata-rata Penyelesaian', value: '3.2 hari', change: '-15%' },
    { label: 'Tingkat Kepuasan', value: '94%', change: '+2%' },
];

export default function Pengaduan() {
    return (
        <PublicLayout>
            <Head title="Pengaduan" />

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-12 py-8">
                    {/* Header Section */}
                    <div className="space-y-4 text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Layanan Pengaduan</h1>
                        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-gray-600">
                            Sampaikan keluhan, saran, atau masukan Anda. Kami berkomitmen untuk memberikan pelayanan terbaik
                        </p>
                    </div>

                    {/* Stats Section */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {pengaduanStats.map((stat, index) => (
                            <Card key={index} className="transition-shadow hover:shadow-md">
                                <CardContent className="p-8 text-center">
                                    <div className="mb-2 text-3xl font-bold text-gray-900">{stat.value}</div>
                                    <p className="mb-2 text-sm text-gray-600">{stat.label}</p>
                                    <p className="text-xs text-green-600">{stat.change} dari bulan lalu</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-8 lg:gap-12 xl:grid-cols-3">
                        {/* Form Pengaduan - Takes 2 columns */}
                        <div className="xl:col-span-2">
                            <Card className="border-0 bg-white/80 shadow-sm backdrop-blur-sm">
                                <CardHeader className="pb-8">
                                    <CardTitle className="text-2xl">Ajukan Pengaduan</CardTitle>
                                    <CardDescription className="text-base leading-relaxed">
                                        Silahkan isi form berikut untuk mengajukan pengaduan Anda
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="nama" className="text-sm font-medium">
                                                Nama Lengkap
                                            </Label>
                                            <Input id="nama" placeholder="Masukkan nama lengkap" className="h-12" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="email" className="text-sm font-medium">
                                                Email
                                            </Label>
                                            <Input id="email" type="email" placeholder="email@example.com" className="h-12" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <div className="space-y-3">
                                            <Label htmlFor="telepon" className="text-sm font-medium">
                                                Nomor Telepon
                                            </Label>
                                            <Input id="telepon" placeholder="08xxxxxxxxxx" className="h-12" />
                                        </div>
                                        <div className="space-y-3">
                                            <Label htmlFor="kategori" className="text-sm font-medium">
                                                Kategori Pengaduan
                                            </Label>
                                            <Select>
                                                <SelectTrigger className="h-12">
                                                    <SelectValue placeholder="Pilih kategori" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="proses">Proses Layanan</SelectItem>
                                                    <SelectItem value="teknis">Masalah Teknis</SelectItem>
                                                    <SelectItem value="informasi">Informasi</SelectItem>
                                                    <SelectItem value="tarif">Tarif & Pembayaran</SelectItem>
                                                    <SelectItem value="lainnya">Lainnya</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="subjek" className="text-sm font-medium">
                                            Subjek Pengaduan
                                        </Label>
                                        <Input id="subjek" placeholder="Ringkasan masalah Anda" className="h-12" />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="deskripsi" className="text-sm font-medium">
                                            Deskripsi Detail
                                        </Label>
                                        <Textarea
                                            id="deskripsi"
                                            placeholder="Jelaskan masalah Anda secara detail..."
                                            className="min-h-[150px] resize-none"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label htmlFor="file" className="text-sm font-medium">
                                            Lampiran (Opsional)
                                        </Label>
                                        <Input id="file" type="file" multiple className="h-12" />
                                        <p className="mt-2 text-xs text-gray-500">Format yang didukung: PDF, JPG, PNG (Max 5MB)</p>
                                    </div>

                                    <div className="pt-4">
                                        <Button className="bg-gradient-accent hover:bg-gradient-secondary h-12 w-full text-base transition-all duration-200">
                                            Kirim Pengaduan
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Info & Recent Complaints - Takes 1 column */}
                        <div className="space-y-8">
                            {/* Contact Info */}
                            <Card className="border-0 bg-white/80 shadow-sm backdrop-blur-sm">
                                <CardHeader className="pb-6">
                                    <CardTitle className="text-xl">Kontak Langsung</CardTitle>
                                    <CardDescription className="text-base">Anda juga dapat menghubungi kami melalui:</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                                            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Telepon</p>
                                            <p className="text-sm text-gray-600">021-1234-5678</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                                            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">WhatsApp</p>
                                            <p className="text-sm text-gray-600">0812-3456-7890</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                                            <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Email</p>
                                            <p className="text-sm text-gray-600">pengaduan@iin.go.id</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-4">
                                        <p className="text-sm leading-relaxed text-gray-600">
                                            <strong className="text-gray-900">Jam Operasional:</strong>
                                            <br />
                                            Senin - Jumat: 08:00 - 17:00 WIB
                                            <br />
                                            Sabtu: 08:00 - 12:00 WIB
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Recent Complaints */}
                            <Card className="border-0 bg-white/80 shadow-sm backdrop-blur-sm">
                                <CardHeader className="pb-6">
                                    <CardTitle className="text-xl">Pengaduan Terkini</CardTitle>
                                    <CardDescription className="text-base">Status pengaduan yang sedang ditangani</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {pengaduanTerkini.map((pengaduan) => (
                                            <div key={pengaduan.id} className="rounded-xl border border-gray-100 bg-gray-50/80 p-5">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <h4 className="mb-2 font-semibold text-gray-900">{pengaduan.judul}</h4>
                                                        <p className="mb-1 text-sm text-gray-600">ID: {pengaduan.id}</p>
                                                        <p className="text-xs text-gray-500">{pengaduan.tanggal}</p>
                                                    </div>
                                                    <div className="space-y-2 text-right">
                                                        <Badge variant="outline" className="text-xs">
                                                            {pengaduan.kategori}
                                                        </Badge>
                                                        <br />
                                                        <Badge className={getStatusColor(pengaduan.status)}>{pengaduan.status}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-16">
                        <Card className="border-0 bg-white/80 shadow-sm backdrop-blur-sm">
                            <CardHeader className="pb-8 text-center">
                                <CardTitle className="text-2xl">Sebelum Mengajukan Pengaduan</CardTitle>
                                <CardDescription className="mx-auto max-w-2xl text-base">
                                    Pastikan masalah Anda belum tercakup dalam pertanyaan berikut
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                    <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-6">
                                        <h4 className="mb-3 font-semibold text-blue-900">Berapa lama proses pengaduan?</h4>
                                        <p className="text-sm leading-relaxed text-blue-800">
                                            Pengaduan akan ditanggapi maksimal 1x24 jam dan diselesaikan dalam 3-7 hari kerja.
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-green-100 bg-green-50/80 p-6">
                                        <h4 className="mb-3 font-semibold text-green-900">Bagaimana cara tracking pengaduan?</h4>
                                        <p className="text-sm leading-relaxed text-green-800">
                                            Anda akan mendapat nomor tiket dan dapat melakukan tracking melalui email atau WhatsApp.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
