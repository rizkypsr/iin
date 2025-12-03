import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar } from 'lucide-react';

interface InformationData {
    id: number;
    title: string;
    image: string | null;
    content: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    information: InformationData;
}

export default function LayananPublikDetail({ information }: Props) {
    return (
        <PublicLayout>
            <Head title={information.title} />

            <div className="min-h-[60vh] py-12">
                <div className="mx-auto max-w-4xl px-4">
                    <Link
                        href={route('layanan-publik')}
                        className="mb-6 inline-flex items-center text-sm text-gray-600 transition-colors hover:text-blue-600"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Kembali ke Daftar Informasi
                    </Link>

                    <article className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                        {information.image && (
                            <div className="aspect-video w-full overflow-hidden">
                                <img
                                    src={information.image}
                                    alt={information.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        )}

                        <div className="p-8">
                            <header className="mb-6 border-b border-gray-100 pb-6">
                                <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
                                    {information.title}
                                </h1>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Calendar className="mr-1 h-4 w-4" />
                                    <span>
                                        Dipublikasikan pada{' '}
                                        {new Date(information.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </header>

                            <div
                                className="prose prose-lg max-w-none text-gray-700"
                                dangerouslySetInnerHTML={{ __html: information.content }}
                            />
                        </div>
                    </article>
                </div>
            </div>
        </PublicLayout>
    );
}
