import { GradientInfoSection } from '@/components/gradient-info-section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

const steps = [
    {
        number: 1,
        title: 'Registrasi Akun',
        description: 'Daftar akun baru atau login dengan akun yang sudah ada',
        details: 'Siapkan email aktif dan dokumen identitas untuk proses verifikasi',
    },
    {
        number: 2,
        title: 'Pilih Jenis Layanan',
        description: 'Tentukan jenis layanan IIN yang sesuai dengan kebutuhan investasi',
        details: 'Tersedia IIN Nasional, Single IIN, Blockholder, dan Pemantauan',
    },
    {
        number: 3,
        title: 'Lengkapi Dokumen',
        description: 'Upload dokumen yang diperlukan sesuai jenis layanan yang dipilih',
        details: 'Pastikan semua dokumen dalam format yang benar dan terbaca dengan jelas',
    },
    {
        number: 4,
        title: 'Verifikasi & Review',
        description: 'Tim verifikator akan memeriksa kelengkapan dan keabsahan dokumen',
        details: 'Proses verifikasi memakan waktu 3-5 hari kerja',
    },
    {
        number: 5,
        title: 'Persetujuan',
        description: 'Dapatkan sertifikat IIN setelah semua persyaratan terpenuhi',
        details: 'Sertifikat dapat diunduh langsung dari dashboard akun Anda',
    },
];

export default function AlurPendaftaran() {
    return (
        <PublicLayout>
            <Head title="Alur Pendaftaran" />

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
                    <h1 className="mb-6 text-6xl font-bold tracking-tight text-white drop-shadow-lg">Alur Pendaftaran IIN</h1>
                    <p className="mx-auto max-w-3xl text-xl leading-relaxed text-white/90">
                        Ikuti langkah-langkah berikut untuk mendapatkan Identitas Investasi Nasional (IIN)
                    </p>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
                {/* Steps Process */}
                <div className="space-y-8">
                    {steps.map((step, index) => (
                        <div key={step.number} className="relative">
                            {/* Connection line to next step */}
                            {index < steps.length - 1 && (
                                <div className="absolute top-20 left-8 z-0 h-16 w-0.5 bg-gradient-to-b from-blue-400 to-blue-600"></div>
                            )}

                            <Card variant={index % 2 === 0 ? 'default' : 'gradient'} className="relative z-10">
                                <CardHeader variant={index % 2 === 0 ? 'default' : 'gradient'}>
                                    <div className="flex items-start space-x-4">
                                        {/* Step number circle */}
                                        <div
                                            className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-xl font-bold ${
                                                index % 2 === 0 ? 'bg-gradient-accent text-white' : 'bg-white text-[#01AEEC]'
                                            }`}
                                        >
                                            {step.number}
                                        </div>
                                        <div className="flex-1">
                                            <CardTitle variant={index % 2 === 0 ? 'default' : 'gradient'} className="mb-2 text-2xl">
                                                {step.title}
                                            </CardTitle>
                                            <CardDescription variant={index % 2 === 0 ? 'default' : 'gradient'} className="text-lg">
                                                {step.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="ml-20">
                                        <p className={`text-sm leading-relaxed ${index % 2 === 0 ? 'text-gray-600' : 'text-white/80'}`}>
                                            {step.details}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call to Action Section */}
            <GradientInfoSection
                title="Siap Memulai Pendaftaran?"
                subtitle="Dapatkan IIN Anda dalam 5 langkah mudah"
                description="Tim profesional kami siap membantu Anda dalam setiap tahap proses pendaftaran. Mulai sekarang dan rasakan kemudahan layanan digital terpadu."
                buttonText="Mulai Pendaftaran"
                onButtonClick={() => (window.location.href = '/register')}
            />
        </PublicLayout>
    );
}
