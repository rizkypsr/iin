import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { IinSingleBlockholderApplication } from "@/types";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export default function DetailTab({ application }: { application: IinSingleBlockholderApplication }) {
    return (
        <Card className="border-purple-100 shadow-md bg-white/95">
            <CardHeader>
                <CardTitle>Informasi Pemohon</CardTitle>
                <CardDescription>Detail lengkap pemohon IIN Nasional</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                        <Label className="text-sm text-gray-500">Nama Pemohon</Label>
                        <p className="font-medium text-gray-800">{application.user.name}</p>
                    </div>
                    <div>
                        <Label className="text-sm text-gray-500">Email</Label>
                        <p className="font-medium text-gray-800">{application.user.email}</p>
                    </div>
                    <div>
                        <Label className="text-sm text-gray-500">Tanggal Pengajuan</Label>
                        <p className="font-medium text-gray-800">
                            {format(new Date(application.created_at), 'dd MMMM yyyy', { locale: id })}
                        </p>
                    </div>
                    <div>
                        <Label className="text-sm text-gray-500">Nomor Aplikasi</Label>
                        <p className="font-medium text-gray-800">{application.application_number}</p>
                    </div>
                    <div>
                        <Label className="text-sm text-gray-500">Nomor IIN</Label>
                        <p className="font-medium text-gray-800">{application.iin_number ? application.iin_number : 'Belum Terbit'}</p>
                    </div>
                </div>

                {/* Verification Info */}
                {application.admin && (
                    <div className="pt-6 mt-6 border-t border-gray-200">
                        <h3 className="mb-3 text-sm font-medium text-gray-700">Informasi Verifikasi</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <Label className="text-xs font-normal text-gray-500">Admin</Label>
                                <p className="font-medium text-gray-800">{application.admin.name}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Notes */}
                {application.notes && (
                    <div className="p-3 mt-4 bg-gray-50 rounded-lg">
                        <Label className="text-sm text-gray-500">Catatan</Label>
                        <p className="mt-1 text-gray-800">{application.notes}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}