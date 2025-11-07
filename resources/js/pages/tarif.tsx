import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

export default function Tarif() {
    return (
        <PublicLayout>
            <Head title="Tarif" />

            <div className="pt-40 pb-20">
                <div className="mx-auto max-w-4xl text-center">
                    <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900">Tarif Layanan IIN</h1>
                    <p className="text-xl leading-relaxed text-gray-600">
                        Informasi lengkap mengenai biaya dan tarif layanan Identitas Investasi Nasional
                    </p>
                </div>

                {/* Informasi Tarif Section */}
                <div className="mx-auto max-w-4xl px-4">
                    <div className="mt-8 rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">Informasi tarif dan biaya layanan Identification Issuer Number (IIN)</h2>

                        <ul className="mt-6 space-y-3 text-gray-700">
                            <li className="flex items-center justify-between">
                                <span>Permohonan Layanan Otoritas Sponsor</span>
                                <span className="font-semibold text-gray-900">Rp. 7.500.000/permohonan</span>
                            </li>
                            <li className="flex items-center justify-between">
                                <span>Kunjungan Pengawasan (Pemantauan)</span>
                                <span className="font-semibold text-gray-900">Rp. 6.500.000/permohonan</span>
                            </li>
                        </ul>

                        <div className="mt-8 border-t border-gray-200 pt-6 text-sm text-gray-600">
                            Dasar: PP No. 40 Tahun 2018 tentang Jenis dan Tarif Layanan yang Berlaku pada BSN
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
