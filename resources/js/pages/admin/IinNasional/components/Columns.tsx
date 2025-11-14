import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IinNasionalApplication } from "@/types"
import { getStatusBadgeClass, getStatusLabel } from "@/utils/statusUtils"
import { Link } from "@inertiajs/react"
import { ColumnDef } from "@tanstack/react-table"
import { Eye } from "lucide-react"

export const columns: ColumnDef<IinNasionalApplication>[] = [
    {
        header: "No.",
        cell(props) {
            const offset = (props.table.options.meta as any)?.rowOffset ?? 0
            return offset + props.row.index + 1
        },
    },
    {
        accessorKey: "application_number",
        header: "No.Aplikasi",
    },
    {
        accessorKey: "user.name",
        header: "Pemohon",
    },
    {
        accessorKey: "status",
        header: "Status",
        cell(props) {
            return (
                <Badge className={getStatusBadgeClass(props.row.original.status)}>
                    {getStatusLabel(props.row.original.status)}
                </Badge>
            )
        },
    },
    {
        header: "Tanggal Pengajuan",
        cell(props) {
            return new Date(props.row.original.created_at).toLocaleDateString('id-ID', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
        },
    },
    {
        header: "Aksi",
        cell(props) {
            return (
                <div className="flex gap-2 items-center">
                    <Button variant="outline" size="sm" asChild>
                        <Link href={route('admin.iin-nasional.show', props.row.original.id)}>
                            <Eye className="mr-1 w-4 h-4" />
                            Detail
                        </Link>
                    </Button>
                </div>
            )
        },
    },
]