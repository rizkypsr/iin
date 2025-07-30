import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

const layananList = [
    {
        id: 1,
        name: 'IIN Nasional',
        description: 'Layanan identifikasi investasi nasional untuk perusahaan domestik',
        features: ['Registrasi perusahaan', 'Validasi investasi', 'Sertifikat IIN'],
    },
    {
        id: 2,
        name: 'Single IIN',
        description: 'Layanan IIN untuk investasi tunggal atau proyek spesifik',
        features: ['Satu proyek investasi', 'Proses cepat', 'Dokumentasi lengkap'],
    },
    {
        id: 3,
        name: 'Blockholder',
        description: 'Layanan untuk pemegang saham mayoritas dalam investasi',
        features: ['Manajemen kepemilikan', 'Kontrol investasi', 'Laporan berkala'],
    },
    {
        id: 4,
        name: 'Pengawasan',
        description: 'Layanan pengawasan dan monitoring investasi berkelanjutan',
        features: ['Monitoring real-time', 'Audit berkala', 'Compliance checking'],
    },
];

export default function JenisLayanan() {
    return (
        <PublicLayout>
            <Head title="Jenis Layanan" />

            {/* Hero Section with Primary Gradient */}
            <div className="bg-gradient-primary relative overflow-hidden py-20">
                {/* Subtle line pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                            linear-gradient(0deg, rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                            backgroundSize: '50px 50px',
                        }}
                    ></div>
                </div>

                <div className="relative z-10 mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
                    <h1 className="mb-6 text-6xl font-bold tracking-tight text-white drop-shadow-lg">Jenis Layanan IIN</h1>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/90">
                        Kami menyediakan berbagai jenis layanan IIN untuk memenuhi kebutuhan investasi Anda
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Services Grid with Gradient Cards */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    {layananList.map((layanan, index) => (
                        <Card key={layanan.id} variant={index % 2 === 0 ? 'gradient' : 'default'} className="h-full">
                            <CardHeader variant={index % 2 === 0 ? 'gradient' : 'default'}>
                                <div className="flex items-center justify-between">
                                    <CardTitle variant={index % 2 === 0 ? 'gradient' : 'default'} className="text-xl">
                                        {layanan.name}
                                    </CardTitle>
                                    <Badge variant={index % 2 === 0 ? 'secondary' : 'accent'}>Layanan #{layanan.id}</Badge>
                                </div>
                                <CardDescription variant={index % 2 === 0 ? 'gradient' : 'default'}>{layanan.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <h4 className={`font-medium ${index % 2 === 0 ? 'text-white' : 'text-gray-900'}`}>Fitur Layanan:</h4>
                                    <ul className="space-y-2">
                                        {layanan.features.map((feature, featureIndex) => (
                                            <li
                                                key={featureIndex}
                                                className={`flex items-center space-x-3 ${index % 2 === 0 ? 'text-white/90' : 'text-gray-700'}`}
                                            >
                                                <div className={`h-1.5 w-1.5 ${index % 2 === 0 ? 'bg-white' : 'bg-purple-500'}`}></div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="pt-4">
                                        <Button
                                            variant={index % 2 === 0 ? 'outline' : 'accent'}
                                            className={
                                                index % 2 === 0 ? 'border-white bg-white/10 text-white hover:bg-white hover:text-purple-700' : ''
                                            }
                                        >
                                            Pelajari Lebih Lanjut
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </PublicLayout>
    );
}
