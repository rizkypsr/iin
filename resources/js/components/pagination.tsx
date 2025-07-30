import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface PaginationProps {
    data: PaginationData;
    className?: string;
}

export default function Pagination({ data, className = '' }: PaginationProps) {
    if (data.last_page <= 1) {
        return null;
    }

    const getPageNumbers = () => {
        const pages = [];
        const { current_page, last_page } = data;
        const delta = 2; // Number of pages to show on each side of current page

        // Always show first page
        if (current_page > delta + 1) {
            pages.push(1);
            if (current_page > delta + 2) {
                pages.push('...');
            }
        }

        // Show pages around current page
        for (let i = Math.max(1, current_page - delta); i <= Math.min(last_page, current_page + delta); i++) {
            pages.push(i);
        }

        // Always show last page
        if (current_page < last_page - delta) {
            if (current_page < last_page - delta - 1) {
                pages.push('...');
            }
            pages.push(last_page);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`rounded-2xl border border-purple-200/50 bg-white/95 p-6 shadow-lg shadow-purple-200/30 backdrop-blur-sm ${className}`}
        >
            <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Showing <span className="font-medium">{data.from}</span> to <span className="font-medium">{data.to}</span> of{' '}
                    <span className="font-medium">{data.total}</span> results
                </div>

                <nav className="flex items-center space-x-1">
                    {/* Previous Button */}
                    {data.links[0]?.url ? (
                        <Link
                            href={data.links[0].url!}
                            className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous</span>
                        </Link>
                    ) : (
                        <span className="relative inline-flex cursor-not-allowed items-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-300">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous</span>
                        </span>
                    )}

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                        {pageNumbers.map((pageNumber, index) => {
                            if (pageNumber === '...') {
                                return (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500"
                                    >
                                        <MoreHorizontal className="h-4 w-4" />
                                    </span>
                                );
                            }

                            const isActive = pageNumber === data.current_page;
                            const pageUrl = data.links.find((link) => link.label === pageNumber.toString())?.url;

                            if (!pageUrl && !isActive) {
                                return null;
                            }

                            return isActive ? (
                                <span
                                    key={pageNumber}
                                    className="relative inline-flex items-center rounded-lg border border-purple-300 bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm"
                                >
                                    {pageNumber}
                                </span>
                            ) : (
                                <Link
                                    key={pageNumber}
                                    href={pageUrl!}
                                    className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-purple-600"
                                >
                                    {pageNumber}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Next Button */}
                    {data.links[data.links.length - 1]?.url ? (
                        <Link
                            href={data.links[data.links.length - 1].url!}
                            className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next</span>
                        </Link>
                    ) : (
                        <span className="relative inline-flex cursor-not-allowed items-center rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-medium text-gray-300">
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next</span>
                        </span>
                    )}
                </nav>
            </div>
        </motion.div>
    );
}
