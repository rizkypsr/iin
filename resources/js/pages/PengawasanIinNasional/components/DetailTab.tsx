import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PengawasanIinNasionalApplication } from "@/types";
import { getStatusBadgeClass, getStatusLabel } from "@/utils/statusUtils";
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Shield } from "lucide-react";

export default function DetailTab({ application }: { application: PengawasanIinNasionalApplication }) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex gap-2 items-center">
                        <Shield className="w-5 h-5" />
                        Informasi Aplikasi
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Nomor Aplikasi</Label>
                            <p className="font-mono text-sm">{application.application_number}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Status</Label>
                            <div className="mt-1">
                                <Badge className={getStatusBadgeClass(application.status)}>{getStatusLabel(application.status)}</Badge>
                            </div>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Tanggal Dibuat</Label>
                            <p className="text-sm">{format(new Date(application.created_at), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Terakhir Diperbarui</Label>
                            <p className="text-sm">{format(new Date(application.updated_at), 'dd MMMM yyyy HH:mm', { locale: id })}</p>
                        </div>
                        {application.issued_at && (
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Tanggal Terbit</Label>
                                <p className="text-sm">{format(new Date(application.issued_at), 'dd MMMM yyyy', { locale: id })}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Pemohon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Nama</Label>
                            <p className="text-sm">{application.user.name}</p>
                        </div>
                        <div>
                            <Label className="text-sm font-medium text-gray-500">Email</Label>
                            <p className="text-sm">{application.user.email}</p>
                        </div>
                        {application.user.company_name && (
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Nama Perusahaan</Label>
                                <p className="text-sm">{application.user.company_name}</p>
                            </div>
                        )}
                        {application.user.company_phone && (
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Telepon Perusahaan</Label>
                                <p className="text-sm">{application.user.company_phone}</p>
                            </div>
                        )}
                        {application.user.company_email && (
                            <div>
                                <Label className="text-sm font-medium text-gray-500">Email Perusahaan</Label>
                                <p className="text-sm">{application.user.company_email}</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {application.iin_nasional_profile && (
                <Card>
                    <CardHeader>
                        <CardTitle>Profil IIN Nasional</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {application.iin_nasional_profile.institution_name && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Nama Institusi</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.institution_name}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.brand && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Brand</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.brand}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.assignment_year && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tahun Penugasan</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.assignment_year}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.regional && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Provinsi</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.regional}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.usage_purpose && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Tujuan Penggunaan</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.usage_purpose}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.address && (
                                <div className="md:col-span-2">
                                    <Label className="text-sm font-medium text-gray-500">Alamat</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.address}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.phone_fax && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Telepon/Fax</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.phone_fax}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.email_office && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Email Kantor</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.email_office}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.contact_person_name && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Nama Contact Person</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.contact_person_name}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.contact_person_email && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Email Contact Person</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.contact_person_email}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.phone_fax && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500">Telepon Contact Person</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.phone_fax}</p>
                                </div>
                            )}
                            {application.iin_nasional_profile.remarks_status && (
                                <div className="md:col-span-2">
                                    <Label className="text-sm font-medium text-gray-500">Status Keterangan</Label>
                                    <p className="text-sm">{application.iin_nasional_profile.remarks_status}</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    )
}