import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import { CheckCircle, ExternalLink, Mail, MessageSquare, Phone, Target, Users, X } from 'lucide-react';
import { useState } from 'react';

const laporChannels = [
    {
        name: 'Website',
        url: 'https://www.lapor.go.id',
        icon: ExternalLink,
        description: 'Portal utama pengaduan online',
    },
    {
        name: 'SMS',
        url: 'sms:1708',
        icon: MessageSquare,
        description: '1708 (Telkomsel, Indosat, Three)',
    },
    {
        name: 'Twitter',
        url: 'https://twitter.com/lapor1708',
        icon: ExternalLink,
        description: '@lapor1708',
    },
    {
        name: 'Mobile App',
        url: '#',
        icon: ExternalLink,
        description: 'Android & iOS',
    },
];

const lembagaPengelola = [
    {
        name: 'Kementerian PANRB',
        role: 'Pembina Pelayanan Publik',
        icon: Users,
    },
    {
        name: 'Kantor Staf Presiden (KSP)',
        role: 'Pengawas Program Prioritas Nasional',
        icon: Target,
    },
    {
        name: 'Ombudsman RI',
        role: 'Pengawas Pelayanan Publik',
        icon: CheckCircle,
    },
];

const tujuanSP4N = [
    'Penyelenggara dapat mengelola pengaduan dari masyarakat secara sederhana, cepat, tepat, tuntas, dan terkoordinasi dengan baik',
    'Penyelenggara memberikan akses untuk partisipasi masyarakat dalam menyampaikan pengaduan',
    'Meningkatkan kualitas pelayanan publik',
];

export default function Pengaduan() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <PublicLayout>
            <Head title="Pengaduan - SP4N LAPOR!" />

            {/* Hero Section */}
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
                    <div className="mb-4">
                        <Badge className="border-white/30 bg-white/20 px-4 py-2 text-sm text-white">SP4N - LAPOR!</Badge>
                    </div>
                    <h1 className="mb-6 text-6xl font-bold tracking-tight text-white drop-shadow-lg">
                        Sistem Pengelolaan Pengaduan
                        <br />
                        Pelayanan Publik Nasional
                    </h1>
                    <p className="mx-auto max-w-4xl text-xl leading-relaxed text-white/90">
                        Layanan Aspirasi dan Pengaduan Online Rakyat (LAPOR!) untuk penyampaian semua aspirasi dan pengaduan masyarakat Indonesia
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="space-y-16 py-16">
                    {/* Tentang SP4N-LAPOR! */}
                    <section>
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Tentang SP4N-LAPOR!</h2>
                            <p className="mx-auto max-w-4xl text-xl leading-relaxed text-gray-600">
                                Dalam rangka mengintegrasikan sistem pengelolaan pengaduan pelayanan publik dalam satu pintu, Pemerintah Republik
                                Indonesia membentuk Sistem Pengelolaan Pengaduan Pelayanan Publik Nasional (SP4N)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            <div>
                                <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
                                    <CardContent className="p-8">
                                        <h3 className="mb-6 text-2xl font-bold text-gray-900">Tujuan SP4N</h3>
                                        <div className="space-y-4">
                                            {tujuanSP4N.map((tujuan, index) => (
                                                <div key={index} className="flex items-start space-x-3">
                                                    <CheckCircle className="mt-0.5 h-6 w-6 flex-shrink-0 text-green-600" />
                                                    <p className="leading-relaxed text-gray-700">{tujuan}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <Card className="border-0 bg-white shadow-lg">
                                    <CardContent className="p-8">
                                        <h3 className="mb-6 text-2xl font-bold text-gray-900">Dasar Hukum</h3>
                                        <div className="space-y-4">
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <p className="font-semibold text-gray-900">Peraturan Presiden Nomor 76 Tahun 2013</p>
                                                <p className="mt-1 text-sm text-gray-600">Penetapan SP4N-LAPOR!</p>
                                            </div>
                                            <div className="rounded-lg bg-gray-50 p-4">
                                                <p className="font-semibold text-gray-900">Peraturan Menteri PANRB Nomor 3 Tahun 2015</p>
                                                <p className="mt-1 text-sm text-gray-600">Pedoman pelaksanaan SP4N</p>
                                            </div>
                                        </div>
                                        <div className="mt-6 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4">
                                            <p className="font-medium text-blue-800">"No Wrong Door Policy"</p>
                                            <p className="mt-1 text-sm text-blue-700">
                                                Menjamin hak masyarakat agar pengaduan dari manapun dan jenis apapun akan disalurkan kepada
                                                penyelenggara yang berwenang
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* Lembaga Pengelola */}
                    <section>
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Lembaga Pengelola</h2>
                            <p className="text-xl text-gray-600">SP4N-LAPOR! dikelola oleh tiga lembaga utama pemerintah</p>
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {lembagaPengelola.map((lembaga, index) => {
                                const IconComponent = lembaga.icon;
                                return (
                                    <Card key={index} className="border-0 bg-white shadow-lg transition-shadow hover:shadow-xl">
                                        <CardContent className="p-8 text-center">
                                            <div className="mb-6">
                                                <div className="bg-gradient-primary mx-auto flex h-16 w-16 items-center justify-center rounded-full">
                                                    <IconComponent className="h-8 w-8 text-white" />
                                                </div>
                                            </div>
                                            <h3 className="mb-2 text-xl font-bold text-gray-900">{lembaga.name}</h3>
                                            <p className="text-gray-600">{lembaga.role}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    {/* Kanal Pengaduan */}
                    <section>
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Kanal Pengaduan LAPOR!</h2>
                            <p className="text-xl text-gray-600">Masyarakat dapat menyampaikan pengaduan melalui berbagai kanal berikut</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {laporChannels.map((channel, index) => {
                                const IconComponent = channel.icon;
                                return (
                                    <Card key={index} className="border-0 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl">
                                        <CardContent className="p-6 text-center">
                                            <div className="mb-4">
                                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                                                    <IconComponent className="h-6 w-6 text-blue-600" />
                                                </div>
                                            </div>
                                            <h3 className="mb-2 text-lg font-bold text-gray-900">{channel.name}</h3>
                                            <p className="mb-4 text-sm text-gray-600">{channel.description}</p>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </section>

                    {/* Pengaduan BSN */}
                    <section>
                        <Card className="border-0 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <h2 className="mb-6 text-4xl font-bold text-gray-900">Pengaduan Layanan BSN</h2>
                                <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-700">
                                    Untuk pengaduan layanan BSN, masyarakat dapat melaporkan layanan pada halaman khusus BSN di SP4N-LAPOR!
                                </p>

                                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                    <Button asChild className="bg-gradient-primary hover:bg-gradient-secondary px-8 py-3 text-lg text-white">
                                        <a href="https://bsn.lapor.go.id" target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-5 w-5" />
                                            bsn.lapor.go.id
                                        </a>
                                    </Button>

                                    <span className="text-gray-500">atau</span>

                                    <Button asChild variant="outline" className="border-2 border-gray-300 px-8 py-3 text-lg">
                                        <a href="https://www.lapor.go.id" target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-5 w-5" />
                                            SP4N LAPOR!
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Cara Pelaporan */}
                    <section>
                        <div className="mb-12 text-center">
                            <h2 className="mb-4 text-4xl font-bold text-gray-900">Cara Pelaporan yang Baik</h2>
                            <p className="text-xl text-gray-600">Ikuti panduan berikut untuk membuat laporan yang efektif</p>
                        </div>

                        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
                            <div>
                                <Card className="border-0 bg-white shadow-lg">
                                    <CardContent className="p-8">
                                        <div className="space-y-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                                    1
                                                </div>
                                                <div>
                                                    <h3 className="mb-2 font-bold text-gray-900">Jelaskan Masalah dengan Detail</h3>
                                                    <p className="text-gray-600">Sampaikan kronologi kejadian secara jelas dan lengkap</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-4">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                                    2
                                                </div>
                                                <div>
                                                    <h3 className="mb-2 font-bold text-gray-900">Sertakan Bukti Pendukung</h3>
                                                    <p className="text-gray-600">Lampirkan foto, dokumen, atau bukti lain yang relevan</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-4">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                                    3
                                                </div>
                                                <div>
                                                    <h3 className="mb-2 font-bold text-gray-900">Cantumkan Data Diri</h3>
                                                    <p className="text-gray-600">Isi identitas dengan benar untuk memudahkan tindak lanjut</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-4">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                                                    4
                                                </div>
                                                <div>
                                                    <h3 className="mb-2 font-bold text-gray-900">Gunakan Bahasa yang Sopan</h3>
                                                    <p className="text-gray-600">Sampaikan keluhan dengan bahasa yang baik dan konstruktif</p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div>
                                <Card className="border-0 bg-gray-50 shadow-lg">
                                    <CardContent className="p-8 text-center">
                                        <div className="mb-4 h-64 w-full cursor-pointer overflow-hidden rounded-lg">
                                            <img
                                                src="/alur_sp4n-lapor.jpg"
                                                alt="Alur SP4N-LAPOR! - Panduan Cara Pelaporan"
                                                className="h-full w-full bg-white object-contain transition-transform duration-300 hover:scale-110"
                                                onClick={() => setIsModalOpen(true)}
                                                onMouseEnter={() => setIsModalOpen(true)}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600">Infografis panduan lengkap cara membuat laporan yang efektif</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </section>

                    {/* Contact Info */}
                    <section>
                        <Card className="border-0 bg-gradient-to-br from-gray-50 to-blue-50 shadow-lg">
                            <CardContent className="p-12 text-center">
                                <h2 className="mb-6 text-3xl font-bold text-gray-900">Butuh Bantuan?</h2>
                                <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">Tim kami siap membantu Anda dalam proses pengaduan</p>

                                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="flex items-center justify-center space-x-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                                            <Phone className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900">Telepon</p>
                                            <p className="text-gray-600">1708</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center space-x-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                                            <Mail className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900">Email</p>
                                            <p className="text-gray-600">info@lapor.go.id</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </div>

            {/* Modal for Image Preview */}
            {isModalOpen && (
                <div
                    className="bg-opacity-75 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
                    onClick={() => setIsModalOpen(false)}
                    onMouseLeave={() => setIsModalOpen(false)}
                >
                    <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-white p-4">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-2 right-2 z-10 rounded-full bg-gray-800 p-2 text-white hover:bg-gray-700"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <img src="/alur_sp4n-lapor.jpg" alt="Alur SP4N-LAPOR! - Preview" className="h-full w-full object-contain" />
                    </div>
                </div>
            )}
        </PublicLayout>
    );
}
