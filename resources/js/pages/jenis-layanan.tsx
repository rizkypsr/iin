import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

const layananList = [
    {
        id: 1,
        name: 'IIN Nasional',
        description: 'Nomor yang diterbitkan oleh BSN selaku otoritas sponsor/sponsoring authority (SA). IIN Nasional menjadi milik pemohon, berlaku selama institusi pemohon berdiri dan memiliki status hukum dan berlaku hanya di Indonesia (selama cross border antar negara lain belum dibuka).',
        features: ['Penjelasan dan Kriteria layanan', 'Persyaratan Pemohon', 'Formulir Permohonan'],
    },
    {
        id: 2,
        name: 'Single IIN',
        description: 'Nomor*) yang diterbitkan oleh American Bankers Association (ABA) sebagai Registration Authority (RA) dengan pengesahan dari BSN sebagai otoritas sponsor/sponsoring authority (SA) di Indonesia. IIN menjadi milik penerbit kartu dan berlaku selama institusi penerbit kartu berdiri dan memiliki status hukum.',
        features: ['Penjelasan dan Kriteria layanan', 'Persyaratan Pemohon', 'Formulir Permohonan'],
    },
    {
        id: 3,
        name: 'Blockholder',
        description: 'Serangkaian nomor yang diterbitkan oleh American Bankers Association (ABBA) sebagai Registration Authority yang ditunjuk ISO kepada sebuah institusi, umumnya lembaga switching/ sejenisnya yang memiliki kewenangan untuk mempergunakan nomor tersebut untuk mengidentifikasi anggota yang tergabung dalam jaringannya. Status nomor bukan merupakan milik penerbit kartu, namun milik institusi pemegang blockholder.',
        features: ['Penjelasan dan Kriteria layanan', 'Persyaratan Pemohon', 'Formulir Permohonan'],
    },
    {
        id: 4,
        name: 'Pemantauan',
        description: 'Pemutakhiran dan pemastian penggunaan IIN sesuai SNI ISO/IEC 7812 series oleh entitas yang berhak. Status entitas dan pemanfaatan IIN dapat berimpplikasi pada kepemilikan IIN.',
        features: ['Penjelasan dan Kriteria layanan', 'Persyaratan Pemohon', 'Formulir Permohonan'],
    },
];

export default function JenisLayanan() {
    return (
        <PublicLayout>
            <Head title="Jenis Layanan" />

            {/* Hero Section with Primary Gradient */}
            <div className="bg-gradient-primary relative overflow-hidden pt-40 pb-20">
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
                    <h1 className="mb-6 text-6xl font-bold tracking-tight text-white drop-shadow-lg">Jenis Layanan Otoritas</h1>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/90">
                        Layanan Otoritas Sponsor dibedakan menjadi Penerbitan Nomor Identifikasi, dan Pemantauan Pemanfaatan Nomor Identifikasi.
                        Nomor Identifikasi yang diterbitkan dibedakan menjadi beberapa jenis yaitu IIN Nasional, Single IIN dan Block Holder
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
                                                <div className={`h-1.5 w-1.5 ${index % 2 === 0 ? 'bg-white' : 'bg-[#01AEEC]'}`}></div>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </PublicLayout>
    );
}
