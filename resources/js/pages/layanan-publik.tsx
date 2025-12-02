import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';

interface InformationData {
    id?: number;
    title: string;
    content: string;
}

interface Props {
    information: InformationData | null;
}

export default function LayananPublik({ information }: Props) {
    return (
        <PublicLayout>
            <Head title="Layanan Publik" />

            <div className="min-h-[60vh] pt-42 pb-12">
                <div className="mx-auto max-w-4xl px-4">
                    {information ? (
                        <div className="space-y-6">
                            <h1 className="text-center text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                                {information.title}
                            </h1>
                            <div
                                className="prose prose-lg mx-auto max-w-none text-gray-600"
                                dangerouslySetInnerHTML={{ __html: information.content }}
                            />
                        </div>
                    ) : (
                        <div className="flex min-h-[40vh] items-center justify-center">
                            <div className="text-center">
                                <h1 className="mb-6 text-6xl font-bold tracking-tight text-gray-900">
                                    Informasi Layanan Otoritas Sponsor (IIN)
                                </h1>
                                <p className="text-xl leading-relaxed text-gray-600">
                                    Kegiatan, regulasi dan informasi publik Layanan Otoritas Sponsor
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
