import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { Calendar, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';

interface InformationData {
    id: number;
    title: string;
    image: string | null;
    excerpt: string;
    created_at: string;
}

interface PaginatedData {
    data: InformationData[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface Props {
    informations: PaginatedData;
}

export default function LayananPublik({ informations }: Props) {
    return (
        <PublicLayout>
            <Head title="Layanan Publik" />

            <div className="min-h-[60vh] py-12 pt-32">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="mb-10 text-center">
                        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                            Informasi Layanan Publik
                        </h1>
                        <p className="text-lg text-gray-600">
                            Kegiatan, regulasi dan informasi publik Layanan Otoritas Sponsor (IIN)
                        </p>
                    </div>

                    {informations.data.length === 0 ? (
                        <div className="py-16 text-center">
                            <p className="text-gray-500">Belum ada informasi yang tersedia.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {informations.data.map((info) => (
                                    <Link
                                        key={info.id}
                                        href={route('layanan-publik.show', info.id)}
                                        className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:border-blue-300 hover:shadow-lg"
                                    >
                                        <div className="aspect-video w-full overflow-hidden bg-gray-100">
                                            {info.image ? (
                                                <img
                                                    src={info.image}
                                                    alt={info.title}
                                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                                    <ImageIcon className="h-12 w-12 text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h2 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                                {info.title}
                                            </h2>
                                            <p className="mb-3 line-clamp-2 text-sm text-gray-600">{info.excerpt}</p>
                                            <div className="flex items-center text-xs text-gray-400">
                                                <Calendar className="mr-1 h-3 w-3" />
                                                {new Date(info.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Pagination */}
                            {informations.last_page > 1 && (
                                <div className="mt-10 flex items-center justify-center gap-4">
                                    <Link
                                        href={informations.prev_page_url || '#'}
                                        preserveScroll
                                        className={!informations.prev_page_url ? 'pointer-events-none' : ''}
                                    >
                                        <Button variant="outline" disabled={!informations.prev_page_url}>
                                            <ChevronLeft className="mr-1 h-4 w-4" />
                                            Sebelumnya
                                        </Button>
                                    </Link>
                                    <span className="text-sm text-gray-500">
                                        Halaman {informations.current_page} dari {informations.last_page}
                                    </span>
                                    <Link
                                        href={informations.next_page_url || '#'}
                                        preserveScroll
                                        className={!informations.next_page_url ? 'pointer-events-none' : ''}
                                    >
                                        <Button variant="outline" disabled={!informations.next_page_url}>
                                            Selanjutnya
                                            <ChevronRight className="ml-1 h-4 w-4" />
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
