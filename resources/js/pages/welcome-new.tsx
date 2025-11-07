import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';

export default function Welcome() {
    return (
        <PublicLayout>
            <Head title="Beranda">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />
            </Head>

            <div className="space-y-12">
                {/* Hero Section */}
                <div className="py-12 text-center">
                    <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900">Selamat datang di Portal Layanan Otoritas Sponsor</h1>
                    <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
                        Layanan Otoritas Sponsor diselenggarakan BSN untuk menerbitkan Identification Issuer Number (IIN) yaitu nomor identifikasi yang diperlukan untuk keperluan transaksi data secara elektronik dalam lingkungan interchange internasional dan/atau antar-industry. Perkembangan teknologi memungkinkan IIN digunakan pada virtual card. IIN juga dikenal sebagai Bank Identification Number (BIN)
                        BSN sebagai anggota ISO merupakan NSB (National Standard Body) di Indonesia yang bertindak sebagai otoritas sponsor/sponsoring authority (SA) yang bertanggung jawab untuk menerima, memproses dan meninjau/menyetujui permohonan untuk IIN (SNI ISO/IEC 7812-2:2017 Pasal 7.1) ."
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link href={route('jenis-layanan')}>
                            <Button size="lg">Mulai Sekarang</Button>
                        </Link>
                        <Link href={route('alur-pendaftaran')}>
                            <Button variant="outline" size="lg">
                                Pelajari Lebih Lanjut
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <CardTitle>Proses Mudah</CardTitle>
                            <CardDescription>Pendaftaran IIN dapat dilakukan secara online dengan proses yang sederhana dan cepat</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                    />
                                </svg>
                            </div>
                            <CardTitle>Aman & Terpercaya</CardTitle>
                            <CardDescription>Data investasi Anda dijamin aman dengan sistem keamanan berlapis dan terintegrasi</CardDescription>
                        </CardHeader>
                    </Card>

                    <Card className="text-center">
                        <CardHeader>
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <CardTitle>Real-time Monitoring</CardTitle>
                            <CardDescription>Pantau status investasi dan aplikasi IIN Anda secara real-time kapan saja</CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                {/* Services Overview */}
                <div className="rounded-2xl bg-gray-50 p-8">
                    <div className="mb-8 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-gray-900">Layanan Kami</h2>
                        <p className="text-gray-600">Berbagai jenis layanan IIN untuk kebutuhan investasi Anda</p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h3 className="mb-2 font-semibold text-gray-900">IIN Nasional</h3>
                            <p className="text-sm text-gray-600">Untuk perusahaan domestik</p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h3 className="mb-2 font-semibold text-gray-900">Single IIN</h3>
                            <p className="text-sm text-gray-600">Untuk proyek investasi tunggal</p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h3 className="mb-2 font-semibold text-gray-900">Blockholder</h3>
                            <p className="text-sm text-gray-600">Untuk pemegang saham mayoritas</p>
                        </div>
                        <div className="rounded-lg bg-white p-6 shadow-sm">
                            <h3 className="mb-2 font-semibold text-gray-900">Pengawasan</h3>
                            <p className="text-sm text-gray-600">Monitoring berkelanjutan</p>
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="rounded-2xl bg-blue-600 p-8 text-center text-white">
                    <h2 className="mb-4 text-3xl font-bold">Siap Memulai Investasi Anda?</h2>
                    <p className="mx-auto mb-6 max-w-2xl text-blue-100">
                        Bergabunglah dengan ribuan investor yang telah mempercayai layanan IIN kami untuk mengelola investasi mereka dengan lebih
                        baik.
                    </p>
                    <Link href={route('register')}>
                        <Button variant="secondary" size="lg">
                            Daftar Sekarang
                        </Button>
                    </Link>
                </div>
            </div>
        </PublicLayout>
    );
}
