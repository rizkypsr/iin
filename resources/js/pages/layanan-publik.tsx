import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

export default function LayananPublik() {
    return (
        <PublicLayout>
            <Head title="Layanan Publik" />

            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900">Layanan Publik IIN</h1>
                    <p className="text-xl leading-relaxed text-gray-600">Akses berbagai layanan publik untuk mendukung kebutuhan investasi Anda</p>
                </div>
            </div>
        </PublicLayout>
    );
}
