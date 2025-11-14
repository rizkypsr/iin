import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusLog } from "@/types";
import { getStatusLabel } from "@/utils/statusUtils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Clock, FileText } from "lucide-react";

export default function StatusTab({ statusLogs }: { statusLogs: StatusLog[] }) {
    console.log(statusLogs);
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex gap-2 items-center">
                    <Clock className="w-5 h-5" />
                    Riwayat Status
                </CardTitle>
                <CardDescription>Riwayat perubahan status aplikasi IIN Nasional</CardDescription>
            </CardHeader>
            <CardContent>
                {statusLogs.length === 0 ? (
                    <div className="py-8 text-center">
                        <Clock className="mx-auto mb-4 w-12 h-12 text-gray-400" />
                        <p className="text-lg text-gray-500">Belum Ada Riwayat Status</p>
                        <p className="mt-2 text-sm text-gray-400">Riwayat perubahan status akan muncul di sini.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {statusLogs.map((log, index) => (
                            <div key={log.id} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className={`flex justify-center items-center w-8 h-8 rounded-full`}>
                                        <FileText className="w-4 h-4" />
                                    </div>
                                    {index < statusLogs.length - 1 && <div className="mt-2 w-px h-8 bg-gray-200" />}
                                </div>
                                <div className="flex-1 pb-4">
                                    <div className="flex gap-2 items-center">
                                        <p className="font-medium text-gray-900">
                                            {log.status_from === log.status_to ? `Status ${getStatusLabel(log.status_to)}` : `Status Diubah ke: ${getStatusLabel(log.status_to)}`}
                                        </p>
                                        <span className="text-sm text-gray-500">oleh {log.changed_by.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {format(new Date(log.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}
                                    </p>
                                    {log.notes && <p className="mt-1 text-sm text-gray-700">{log.notes}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}