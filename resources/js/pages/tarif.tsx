import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

export default function Tarif() {
    return (
        <PublicLayout>
            <Head title="Tarif" />

            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900">Tarif Layanan IIN</h1>
                    <p className="text-xl leading-relaxed text-gray-600">
                        Informasi lengkap mengenai biaya dan tarif layanan Identitas Investasi Nasional
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
