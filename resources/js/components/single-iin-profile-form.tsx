import { Building2, Calendar, CreditCard, FileText, Mail, MapPin, Phone, User } from 'lucide-react';
import { motion } from 'framer-motion';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

interface SingleIinProfileData {
    institution_name?: string;
    institution_type?: string;
    year?: number;
    iin_assignment?: string;
    assignment_date?: string;
    regional?: string;
    usage_purpose?: string;
    address?: string;
    address_updated?: string;
    phone_fax?: string;
    phone_fax_updated?: string;
    email?: string;
    contact_person?: string;
    remarks_status?: string;
    card_specimen?: string;
    previous_name?: string;
}

interface SingleIinProfileFormProps {
    data: SingleIinProfileData;
    setData: (key: keyof SingleIinProfileData, value: any) => void;
    errors: Record<string, string>;
    processing?: boolean;
}

export default function SingleIinProfileForm({ data, setData, errors, processing }: SingleIinProfileFormProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="rounded-2xl border border-green-200/50 bg-white/95 p-8 shadow-lg shadow-green-200/30 backdrop-blur-sm"
        >
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                    <CreditCard className="h-5 w-5 text-green-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Single IIN Profile</h2>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Institution Name */}
                    <div className="space-y-2">
                        <Label htmlFor="single_institution_name" className="text-sm font-medium text-gray-700">
                            <Building2 className="inline h-4 w-4 mr-1" />
                            Nama Institusi <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_institution_name"
                            type="text"
                            value={data.institution_name || ''}
                            onChange={(e) => setData('institution_name', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan nama institusi"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.institution_name']} className="text-xs" />
                    </div>

                    {/* Institution Type */}
                    <div className="space-y-2">
                        <Label htmlFor="single_institution_type" className="text-sm font-medium text-gray-700">
                            Tipe Institusi <span className="text-red-500">*</span>
                        </Label>
                        <Select 
                            value={data.institution_type || ''} 
                            onValueChange={(value) => setData('institution_type', value)}
                        >
                            <SelectTrigger className="h-11 w-full border-gray-300 bg-white transition-all duration-200 hover:border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20">
                                <SelectValue placeholder="Pilih tipe institusi" />
                            </SelectTrigger>
                            <SelectContent className="border border-gray-200 bg-white shadow-lg">
                                <SelectItem value="bank">Bank</SelectItem>
                                <SelectItem value="fintech">Fintech</SelectItem>
                                <SelectItem value="payment_gateway">Payment Gateway</SelectItem>
                                <SelectItem value="e_money">E-Money</SelectItem>
                                <SelectItem value="other">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                        <InputError message={errors['single_iin_profile.institution_type']} className="text-xs" />
                    </div>

                    {/* Year */}
                    <div className="space-y-2">
                        <Label htmlFor="single_year" className="text-sm font-medium text-gray-700">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Tahun <span className="text-red-500">*</span>
                        </Label>

                        <Input
                            id="single_year"
                            type="number"
                            value={data.year || ''}
                            onChange={(e) => setData('year', parseInt(e.target.value) || undefined)}
                            disabled={processing}
                            placeholder="2024"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.year']} className="text-xs" />
                    </div>

                    {/* IIN Assignment */}
                    <div className="space-y-2">
                        <Label htmlFor="single_iin_assignment" className="text-sm font-medium text-gray-700">
                            IIN Assignment <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_iin_assignment"
                            type="text"
                            value={data.iin_assignment || ''}
                            onChange={(e) => setData('iin_assignment', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan IIN Assignment"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.iin_assignment']} className="text-xs" />
                    </div>

                    {/* Assignment Date */}
                    <div className="space-y-2">
                        <Label htmlFor="single_assignment_date" className="text-sm font-medium text-gray-700">
                            <Calendar className="inline h-4 w-4 mr-1" />
                            Tanggal Assignment <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_assignment_date"
                            type="date"
                            value={data.assignment_date || ''}
                            onChange={(e) => setData('assignment_date', e.target.value)}
                            disabled={processing}
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.assignment_date']} className="text-xs" />
                    </div>

                    {/* Regional */}
                    <div className="space-y-2">
                        <Label htmlFor="single_regional" className="text-sm font-medium text-gray-700">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            Regional <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_regional"
                            type="text"
                            value={data.regional || ''}
                            onChange={(e) => setData('regional', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan regional"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.regional']} className="text-xs" />
                    </div>

                    {/* Phone/Fax */}
                    <div className="space-y-2">
                        <Label htmlFor="single_phone_fax" className="text-sm font-medium text-gray-700">
                            <Phone className="inline h-4 w-4 mr-1" />
                            Telepon/Fax <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_phone_fax"
                            type="text"
                            value={data.phone_fax || ''}
                            onChange={(e) => setData('phone_fax', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan nomor telepon/fax"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.phone_fax']} className="text-xs" />
                    </div>

                    {/* Phone/Fax Updated */}
                    <div className="space-y-2">
                        <Label htmlFor="single_phone_fax_updated" className="text-sm font-medium text-gray-700">
                            <Phone className="inline h-4 w-4 mr-1" />
                            Telepon/Fax (Updated) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_phone_fax_updated"
                            type="text"
                            value={data.phone_fax_updated || ''}
                            onChange={(e) => setData('phone_fax_updated', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan nomor telepon/fax terbaru"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.phone_fax_updated']} className="text-xs" />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                        <Label htmlFor="single_email" className="text-sm font-medium text-gray-700">
                            <Mail className="inline h-4 w-4 mr-1" />
                            Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_email"
                            type="email"
                            value={data.email || ''}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="email@example.com"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.email']} className="text-xs" />
                    </div>

                    {/* Contact Person */}
                    <div className="space-y-2">
                        <Label htmlFor="single_contact_person" className="text-sm font-medium text-gray-700">
                            <User className="inline h-4 w-4 mr-1" />
                            Contact Person <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_contact_person"
                            type="text"
                            value={data.contact_person || ''}
                            onChange={(e) => setData('contact_person', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan nama contact person"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.contact_person']} className="text-xs" />
                    </div>

                    {/* Remarks Status */}
                    <div className="space-y-2">
                        <Label htmlFor="single_remarks_status" className="text-sm font-medium text-gray-700">
                            Status Remarks <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_remarks_status"
                            type="text"
                            value={data.remarks_status || ''}
                            onChange={(e) => setData('remarks_status', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan status remarks"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.remarks_status']} className="text-xs" />
                    </div>

                    {/* Card Specimen */}
                    <div className="space-y-2">
                        <Label htmlFor="single_card_specimen" className="text-sm font-medium text-gray-700">
                            <CreditCard className="inline h-4 w-4 mr-1" />
                            Card Specimen <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_card_specimen"
                            type="text"
                            value={data.card_specimen || ''}
                            onChange={(e) => setData('card_specimen', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan card specimen"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.card_specimen']} className="text-xs" />
                    </div>

                    {/* Previous Name */}
                    <div className="space-y-2">
                        <Label htmlFor="single_previous_name" className="text-sm font-medium text-gray-700">
                            Nama Sebelumnya <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="single_previous_name"
                            type="text"
                            value={data.previous_name || ''}
                            onChange={(e) => setData('previous_name', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan nama sebelumnya"
                            className="h-11 transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.previous_name']} className="text-xs" />
                    </div>
                </div>

                {/* Full width fields */}
                <div className="space-y-6">
                    {/* Usage Purpose */}
                    <div className="space-y-2">
                        <Label htmlFor="single_usage_purpose" className="text-sm font-medium text-gray-700">
                            Tujuan Penggunaan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="single_usage_purpose"
                            value={data.usage_purpose || ''}
                            onChange={(e) => setData('usage_purpose', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan tujuan penggunaan"
                            className="min-h-[80px] transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.usage_purpose']} className="text-xs" />
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                        <Label htmlFor="single_address" className="text-sm font-medium text-gray-700">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            Alamat <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="single_address"
                            value={data.address || ''}
                            onChange={(e) => setData('address', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan alamat lengkap"
                            className="min-h-[80px] transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.address']} className="text-xs" />
                    </div>

                    {/* Address Updated */}
                    <div className="space-y-2">
                        <Label htmlFor="single_address_updated" className="text-sm font-medium text-gray-700">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            Alamat (Updated) <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="single_address_updated"
                            value={data.address_updated || ''}
                            onChange={(e) => setData('address_updated', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan alamat terbaru"
                            className="min-h-[80px] transition-all duration-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />
                        <InputError message={errors['single_iin_profile.address_updated']} className="text-xs" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}