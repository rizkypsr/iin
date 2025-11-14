import { Table } from "@tanstack/react-table"
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { router } from "@inertiajs/react"

interface DataTablePaginationProps<TData> {
    table: Table<TData>
    serverMeta?: {
        current_page: number
        last_page: number
        per_page: number
        total: number
        first_page_url?: string
        last_page_url?: string
        next_page_url?: string | null
        prev_page_url?: string | null
        links?: { url: string | null; label: string; active: boolean }[]
    }
}

export function DataTablePagination<TData>({
    table,
    serverMeta,
}: DataTablePaginationProps<TData>) {
    const goToUrl = (url?: string | null) => {
        if (!url) return
        router.get(url, {}, { preserveScroll: true, preserveState: true })
    }

    return (
        <div className="flex justify-end items-center px-2 my-4">
            <div className="flex items-center space-x-6 lg:space-x-8">
                {!serverMeta && (
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${table.getState().pagination.pageSize}`}
                            onValueChange={(value) => {
                                table.setPageSize(Number(value))
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={table.getState().pagination.pageSize} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
                <div className="flex w-[100px] items-center justify-center text-sm font-medium">
                    {serverMeta
                        ? <>Halaman {serverMeta.current_page} of {serverMeta.last_page}</>
                        : <>Halaman {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</>
                    }
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => serverMeta ? goToUrl(serverMeta.first_page_url) : table.setPageIndex(0)}
                        disabled={serverMeta ? serverMeta.current_page <= 1 : !table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to first page</span>
                        <ChevronsLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => serverMeta ? goToUrl(serverMeta.prev_page_url) : table.previousPage()}
                        disabled={serverMeta ? serverMeta.current_page <= 1 : !table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Go to previous page</span>
                        <ChevronLeft />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="size-8"
                        onClick={() => serverMeta ? goToUrl(serverMeta.next_page_url) : table.nextPage()}
                        disabled={serverMeta ? serverMeta.current_page >= serverMeta.last_page : !table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to next page</span>
                        <ChevronRight />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="hidden size-8 lg:flex"
                        onClick={() => serverMeta ? goToUrl(serverMeta.last_page_url) : table.setPageIndex(table.getPageCount() - 1)}
                        disabled={serverMeta ? serverMeta.current_page >= serverMeta.last_page : !table.getCanNextPage()}
                    >
                        <span className="sr-only">Go to last page</span>
                        <ChevronsRight />
                    </Button>
                </div>
                {/* {serverMeta && serverMeta.links && (
                    <div className="flex items-center space-x-2">
                        {serverMeta.links
                            .filter((l) => /^\d+$/.test(l.label))
                            .map((link, idx) => (
                                <Button
                                    key={idx}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => goToUrl(link.url)}
                                    disabled={!link.url}
                                >
                                    {link.label}
                                </Button>
                            ))}
                    </div>
                )} */}
            </div>
        </div>
    )
}
