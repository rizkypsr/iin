import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

export default function Pengaduan() {
    return (
        <PublicLayout>
            <Head title="Pengaduan" />

            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900">Layanan Pengaduan</h1>
                    <p className="text-xl leading-relaxed text-gray-600">
                        Sampaikan keluhan, saran, atau masukan Anda untuk pelayanan yang lebih baik
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
