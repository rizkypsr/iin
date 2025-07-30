import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

export default function AlurPendaftaran() {
    return (
        <PublicLayout>
            <Head title="Alur Pendaftaran" />

            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900">Alur Pendaftaran IIN</h1>
                    <p className="text-xl leading-relaxed text-gray-600">
                        Ikuti langkah-langkah berikut untuk mendapatkan Identitas Investasi Nasional (IIN)
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
