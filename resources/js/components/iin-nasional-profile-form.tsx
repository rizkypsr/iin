import { motion } from 'framer-motion';
import { Building2, Calendar, FileText, Mail, MapPin, Phone, User } from 'lucide-react';

import InputError from '@/components/input-error';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface IinNasionalProfileData {
    details?: string;
    institution_name?: string;
    brand?: string;
    iin_national_assignment?: string;
    assignment_year?: number;
    regional?: string;
    aspi_recommendation_letter?: string;
    usage_purpose?: string;
    address?: string;
    phone_fax?: string;
    email_office?: string;
    contact_person_name?: string;
    contact_person_email?: string;
    contact_person_phone?: string;
    remarks_status?: string;
    card_issued?: boolean;
}

interface IinNasionalProfileFormProps {
    data: IinNasionalProfileData;
    setData: (key: keyof IinNasionalProfileData, value: any) => void;
    errors: Record<string, string>;
    processing?: boolean;
}

export default function IinNasionalProfileForm({ data, setData, errors, processing }: IinNasionalProfileFormProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-blue-200/50 bg-white/95 p-8 shadow-lg shadow-blue-200/30 backdrop-blur-sm"
        >
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">IIN Nasional Profile</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Institution Name */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_institution_name" className="text-sm font-medium text-gray-700">
                            Nama Institusi <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_institution_name"
                            type="text"
                            value={data.institution_name || ''}
                            onChange={(e) => setData('institution_name', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan nama institusi"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.institution_name']} className="text-xs" />
                    </div>

                    {/* Brand */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_brand" className="text-sm font-medium text-gray-700">
                            Brand <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_brand"
                            type="text"
                            value={data.brand || ''}
                            onChange={(e) => setData('brand', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan brand"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.brand']} className="text-xs" />
                    </div>

                    {/* IIN National Assignment */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_national_assignment" className="text-sm font-medium text-gray-700">
                            IIN National Assignment <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_national_assignment"
                            type="text"
                            value={data.iin_national_assignment || ''}
                            onChange={(e) => setData('iin_national_assignment', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan IIN National Assignment"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.iin_national_assignment']} className="text-xs" />
                    </div>

                    {/* Assignment Year */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_assignment_year" className="text-sm font-medium text-gray-700">
                            <Calendar className="mr-1 inline h-4 w-4" />
                            Tahun Assignment <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_assignment_year"
                            type="number"
                            value={data.assignment_year || ''}
                            onChange={(e) => setData('assignment_year', parseInt(e.target.value) || undefined)}
                            disabled={processing}
                            placeholder="2024"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.assignment_year']} className="text-xs" />
                    </div>

                    {/* Regional */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_regional" className="text-sm font-medium text-gray-700">
                            <MapPin className="mr-1 inline h-4 w-4" />
                            Regional <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_regional"
                            type="text"
                            value={data.regional || ''}
                            onChange={(e) => setData('regional', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan regional"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.regional']} className="text-xs" />
                    </div>

                    {/* ASPI Recommendation Letter */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_aspi_recommendation_letter" className="text-sm font-medium text-gray-700">
                            <FileText className="mr-1 inline h-4 w-4" />
                            ASPI Recommendation Letter <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_aspi_recommendation_letter"
                            type="text"
                            value={data.aspi_recommendation_letter || ''}
                            onChange={(e) => setData('aspi_recommendation_letter', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan ASPI recommendation letter"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.aspi_recommendation_letter']} className="text-xs" />
                    </div>

                    {/* Phone/Fax */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_phone_fax" className="text-sm font-medium text-gray-700">
                            <Phone className="mr-1 inline h-4 w-4" />
                            Telepon/Fax <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_phone_fax"
                            type="text"
                            value={data.phone_fax || ''}
                            onChange={(e) => setData('phone_fax', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan nomor telepon/fax"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.phone_fax']} className="text-xs" />
                    </div>

                    {/* Email Office */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_email_office" className="text-sm font-medium text-gray-700">
                            <Mail className="mr-1 inline h-4 w-4" />
                            Email Kantor <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_email_office"
                            type="email"
                            value={data.email_office || ''}
                            onChange={(e) => setData('email_office', e.target.value)}
                            disabled={processing}
                            placeholder="office@example.com"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.email_office']} className="text-xs" />
                    </div>

                    {/* Contact Person Name */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_contact_person_name" className="text-sm font-medium text-gray-700">
                            <User className="mr-1 inline h-4 w-4" />
                            Nama Contact Person <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_contact_person_name"
                            type="text"
                            value={data.contact_person_name || ''}
                            onChange={(e) => setData('contact_person_name', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan nama contact person"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.contact_person_name']} className="text-xs" />
                    </div>

                    {/* Contact Person Email */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_contact_person_email" className="text-sm font-medium text-gray-700">
                            <Mail className="mr-1 inline h-4 w-4" />
                            Email Contact Person <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_contact_person_email"
                            type="email"
                            value={data.contact_person_email || ''}
                            onChange={(e) => setData('contact_person_email', e.target.value)}
                            disabled={processing}
                            placeholder="contact@example.com"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.contact_person_email']} className="text-xs" />
                    </div>

                    {/* Contact Person Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_contact_person_phone" className="text-sm font-medium text-gray-700">
                            <Phone className="mr-1 inline h-4 w-4" />
                            Telepon Contact Person <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_contact_person_phone"
                            type="text"
                            value={data.contact_person_phone || ''}
                            onChange={(e) => setData('contact_person_phone', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan nomor telepon contact person"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.contact_person_phone']} className="text-xs" />
                    </div>

                    {/* Remarks Status */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_remarks_status" className="text-sm font-medium text-gray-700">
                            Status Remarks <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="iin_remarks_status"
                            type="text"
                            value={data.remarks_status || ''}
                            onChange={(e) => setData('remarks_status', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan status remarks"
                            className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.remarks_status']} className="text-xs" />
                    </div>
                </div>

                {/* Full width fields */}
                <div className="space-y-6">
                    {/* Details */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_details" className="text-sm font-medium text-gray-700">
                            Detail <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="iin_details"
                            value={data.details || ''}
                            onChange={(e) => setData('details', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan detail informasi"
                            className="min-h-[100px] transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.details']} className="text-xs" />
                    </div>

                    {/* Usage Purpose */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_usage_purpose" className="text-sm font-medium text-gray-700">
                            Tujuan Penggunaan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="iin_usage_purpose"
                            value={data.usage_purpose || ''}
                            onChange={(e) => setData('usage_purpose', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan tujuan penggunaan"
                            className="min-h-[80px] transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.usage_purpose']} className="text-xs" />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="iin_address" className="text-sm font-medium text-gray-700">
                            <MapPin className="mr-1 inline h-4 w-4" />
                            Alamat <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="iin_address"
                            value={data.address || ''}
                            onChange={(e) => setData('address', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan alamat lengkap"
                            className="min-h-[80px] transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                        />
                        <InputError message={errors['iin_nasional_profile.address']} className="text-xs" />
                    </div>

                    {/* Card Issued */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="iin_card_issued"
                            checked={data.card_issued || false}
                            onCheckedChange={(checked) => setData('card_issued', checked)}
                            disabled={processing}
                        />
                        <Label htmlFor="iin_card_issued" className="text-sm font-medium text-gray-700">
                            Kartu Sudah Diterbitkan <span className="text-red-500">*</span>
                        </Label>
                        <InputError message={errors['iin_nasional_profile.card_issued']} className="text-xs" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
