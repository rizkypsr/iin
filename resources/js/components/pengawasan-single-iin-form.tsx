import { Building2, Calendar, FileText, Mail, MapPin, Phone, User, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

interface PengawasanSingleIinData {
    company_name?: string;
    company_address?: string;
    company_phone?: string;
    company_email?: string;
    contact_person_name?: string;
    contact_person_position?: string;
    contact_person_phone?: string;
    contact_person_email?: string;
    iin_number?: string;
    iin_issued_date?: string;
    institution_type?: string;
    supervision_type?: string;
    supervision_scope?: string;
    supervision_period_start?: string;
    supervision_period_end?: string;
    supervision_purpose?: string;
    previous_supervision?: string;
    previous_supervision_date?: string;
    compliance_issues?: string;
    additional_notes?: string;
}

interface PengawasanSingleIinFormProps {
    data: PengawasanSingleIinData;
    setData: (key: keyof PengawasanSingleIinData, value: any) => void;
    errors: Record<string, string>;
    processing?: boolean;
}

export default function PengawasanSingleIinForm({ data, setData, errors, processing }: PengawasanSingleIinFormProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="rounded-2xl border border-purple-200/50 bg-white/95 p-8 shadow-lg shadow-purple-200/30 backdrop-blur-sm"
        >
            <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Formulir Pengawasan Single IIN</h2>
                </div>

                {/* Company Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-purple-600" />
                        Informasi Perusahaan
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Company Name */}
                        <div className="space-y-2">
                            <Label htmlFor="company_name" className="text-sm font-medium text-gray-700">
                                Nama Perusahaan <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="company_name"
                                type="text"
                                value={data.company_name || ''}
                                onChange={(e) => setData('company_name', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan nama perusahaan"
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.company_name} className="text-xs" />
                        </div>

                        {/* Company Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="company_phone" className="text-sm font-medium text-gray-700">
                                <Phone className="inline h-4 w-4 mr-1" />
                                Telepon Perusahaan <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="company_phone"
                                type="text"
                                value={data.company_phone || ''}
                                onChange={(e) => setData('company_phone', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan nomor telepon perusahaan"
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.company_phone} className="text-xs" />
                        </div>

                        {/* Company Email */}
                        <div className="space-y-2">
                            <Label htmlFor="company_email" className="text-sm font-medium text-gray-700">
                                <Mail className="inline h-4 w-4 mr-1" />
                                Email Perusahaan <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="company_email"
                                type="email"
                                value={data.company_email || ''}
                                onChange={(e) => setData('company_email', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan email perusahaan"
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.company_email} className="text-xs" />
                        </div>
                    </div>

                    {/* Company Address */}
                    <div className="space-y-2">
                        <Label htmlFor="company_address" className="text-sm font-medium text-gray-700">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            Alamat Perusahaan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="company_address"
                            value={data.company_address || ''}
                            onChange={(e) => setData('company_address', e.target.value)}
                            disabled={processing}
                            placeholder="Masukkan alamat lengkap perusahaan"
                            className="min-h-[80px] transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        />
                        <InputError message={errors.company_address} className="text-xs" />
                    </div>
                </div>

                {/* Contact Person Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                        <User className="h-4 w-4 text-purple-600" />
                        Informasi Penanggung Jawab
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Contact Person Name */}
                        <div className="space-y-2">
                            <Label htmlFor="contact_person_name" className="text-sm font-medium text-gray-700">
                                Nama Penanggung Jawab <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="contact_person_name"
                                type="text"
                                value={data.contact_person_name || ''}
                                onChange={(e) => setData('contact_person_name', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan nama penanggung jawab"
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.contact_person_name} className="text-xs" />
                        </div>

                        {/* Contact Person Position */}
                        <div className="space-y-2">
                            <Label htmlFor="contact_person_position" className="text-sm font-medium text-gray-700">
                                Jabatan <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="contact_person_position"
                                type="text"
                                value={data.contact_person_position || ''}
                                onChange={(e) => setData('contact_person_position', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan jabatan penanggung jawab"
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.contact_person_position} className="text-xs" />
                        </div>

                        {/* Contact Person Phone */}
                        <div className="space-y-2">
                            <Label htmlFor="contact_person_phone" className="text-sm font-medium text-gray-700">
                                <Phone className="inline h-4 w-4 mr-1" />
                                Telepon Penanggung Jawab <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="contact_person_phone"
                                type="text"
                                value={data.contact_person_phone || ''}
                                onChange={(e) => setData('contact_person_phone', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan nomor telepon penanggung jawab"
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.contact_person_phone} className="text-xs" />
                        </div>

                        {/* Contact Person Email */}
                        <div className="space-y-2">
                            <Label htmlFor="contact_person_email" className="text-sm font-medium text-gray-700">
                                <Mail className="inline h-4 w-4 mr-1" />
                                Email Penanggung Jawab <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="contact_person_email"
                                type="email"
                                value={data.contact_person_email || ''}
                                onChange={(e) => setData('contact_person_email', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan email penanggung jawab"
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.contact_person_email} className="text-xs" />
                        </div>
                    </div>
                </div>

                {/* IIN Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-purple-600" />
                        Informasi IIN
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* IIN Number */}
                        <div className="space-y-2">
                            <Label htmlFor="iin_number" className="text-sm font-medium text-gray-700">
                                Nomor IIN <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="iin_number"
                                type="text"
                                value={data.iin_number || ''}
                                onChange={(e) => setData('iin_number', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan nomor IIN"
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.iin_number} className="text-xs" />
                        </div>

                        {/* IIN Issued Date */}
                        <div className="space-y-2">
                            <Label htmlFor="iin_issued_date" className="text-sm font-medium text-gray-700">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Tanggal Terbit IIN <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="iin_issued_date"
                                type="date"
                                value={data.iin_issued_date || ''}
                                onChange={(e) => setData('iin_issued_date', e.target.value)}
                                disabled={processing}
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.iin_issued_date} className="text-xs" />
                        </div>

                        {/* Institution Type */}
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="institution_type" className="text-sm font-medium text-gray-700">
                                Jenis Lembaga <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={data.institution_type || ''} 
                                onValueChange={(value) => setData('institution_type', value)}
                            >
                                <SelectTrigger className="h-11 w-full border-gray-300 bg-white transition-all duration-200 hover:border-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                                    <SelectValue placeholder="Pilih jenis lembaga" />
                                </SelectTrigger>
                                <SelectContent className="border border-gray-200 bg-white shadow-lg">
                                    <SelectItem value="bank">Bank</SelectItem>
                                    <SelectItem value="asuransi">Asuransi</SelectItem>
                                    <SelectItem value="dana_pensiun">Dana Pensiun</SelectItem>
                                    <SelectItem value="sekuritas">Sekuritas</SelectItem>
                                    <SelectItem value="reksadana">Reksadana</SelectItem>
                                    <SelectItem value="fintech">Fintech</SelectItem>
                                    <SelectItem value="lainnya">Lainnya</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.institution_type} className="text-xs" />
                        </div>
                    </div>
                </div>

                {/* Supervision Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-600" />
                        Informasi Pengawasan
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Supervision Type */}
                        <div className="space-y-2">
                            <Label htmlFor="supervision_type" className="text-sm font-medium text-gray-700">
                                Jenis Pengawasan <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={data.supervision_type || ''} 
                                onValueChange={(value) => setData('supervision_type', value)}
                            >
                                <SelectTrigger className="h-11 w-full border-gray-300 bg-white transition-all duration-200 hover:border-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                                    <SelectValue placeholder="Pilih jenis pengawasan" />
                                </SelectTrigger>
                                <SelectContent className="border border-gray-200 bg-white shadow-lg">
                                    <SelectItem value="rutin">Pengawasan Rutin</SelectItem>
                                    <SelectItem value="khusus">Pengawasan Khusus</SelectItem>
                                    <SelectItem value="tematik">Pengawasan Tematik</SelectItem>
                                    <SelectItem value="investigasi">Investigasi</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.supervision_type} className="text-xs" />
                        </div>

                        {/* Supervision Scope */}
                        <div className="space-y-2">
                            <Label htmlFor="supervision_scope" className="text-sm font-medium text-gray-700">
                                Ruang Lingkup Pengawasan <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={data.supervision_scope || ''} 
                                onValueChange={(value) => setData('supervision_scope', value)}
                            >
                                <SelectTrigger className="h-11 w-full border-gray-300 bg-white transition-all duration-200 hover:border-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20">
                                    <SelectValue placeholder="Pilih ruang lingkup pengawasan" />
                                </SelectTrigger>
                                <SelectContent className="border border-gray-200 bg-white shadow-lg">
                                    <SelectItem value="operasional">Operasional</SelectItem>
                                    <SelectItem value="kepatuhan">Kepatuhan</SelectItem>
                                    <SelectItem value="risiko">Manajemen Risiko</SelectItem>
                                    <SelectItem value="teknologi">Teknologi Informasi</SelectItem>
                                    <SelectItem value="keuangan">Keuangan</SelectItem>
                                    <SelectItem value="menyeluruh">Menyeluruh</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.supervision_scope} className="text-xs" />
                        </div>

                        {/* Supervision Period Start */}
                        <div className="space-y-2">
                            <Label htmlFor="supervision_period_start" className="text-sm font-medium text-gray-700">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Periode Pengawasan Mulai <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="supervision_period_start"
                                type="date"
                                value={data.supervision_period_start || ''}
                                onChange={(e) => setData('supervision_period_start', e.target.value)}
                                disabled={processing}
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.supervision_period_start} className="text-xs" />
                        </div>

                        {/* Supervision Period End */}
                        <div className="space-y-2">
                            <Label htmlFor="supervision_period_end" className="text-sm font-medium text-gray-700">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Periode Pengawasan Selesai <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="supervision_period_end"
                                type="date"
                                value={data.supervision_period_end || ''}
                                onChange={(e) => setData('supervision_period_end', e.target.value)}
                                disabled={processing}
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.supervision_period_end} className="text-xs" />
                        </div>
                    </div>

                    {/* Supervision Purpose */}
                    <div className="space-y-2">
                        <Label htmlFor="supervision_purpose" className="text-sm font-medium text-gray-700">
                            Tujuan Pengawasan <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="supervision_purpose"
                            value={data.supervision_purpose || ''}
                            onChange={(e) => setData('supervision_purpose', e.target.value)}
                            disabled={processing}
                            placeholder="Jelaskan tujuan pengawasan yang akan dilakukan"
                            className="min-h-[80px] transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        />
                        <InputError message={errors.supervision_purpose} className="text-xs" />
                    </div>
                </div>

                {/* Previous Supervision Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Pengawasan Sebelumnya (Opsional)</h3>
                    
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Previous Supervision */}
                        <div className="space-y-2">
                            <Label htmlFor="previous_supervision" className="text-sm font-medium text-gray-700">
                                Jenis Pengawasan Sebelumnya
                            </Label>
                            <Input
                                id="previous_supervision"
                                type="text"
                                value={data.previous_supervision || ''}
                                onChange={(e) => setData('previous_supervision', e.target.value)}
                                disabled={processing}
                                placeholder="Masukkan jenis pengawasan sebelumnya (jika ada)"
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.previous_supervision} className="text-xs" />
                        </div>

                        {/* Previous Supervision Date */}
                        <div className="space-y-2">
                            <Label htmlFor="previous_supervision_date" className="text-sm font-medium text-gray-700">
                                <Calendar className="inline h-4 w-4 mr-1" />
                                Tanggal Pengawasan Sebelumnya
                            </Label>
                            <Input
                                id="previous_supervision_date"
                                type="date"
                                value={data.previous_supervision_date || ''}
                                onChange={(e) => setData('previous_supervision_date', e.target.value)}
                                disabled={processing}
                                className="h-11 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                            <InputError message={errors.previous_supervision_date} className="text-xs" />
                        </div>
                    </div>
                </div>

                {/* Additional Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800">Informasi Tambahan</h3>
                    
                    {/* Compliance Issues */}
                    <div className="space-y-2">
                        <Label htmlFor="compliance_issues" className="text-sm font-medium text-gray-700">
                            Isu Kepatuhan yang Diketahui
                        </Label>
                        <Textarea
                            id="compliance_issues"
                            value={data.compliance_issues || ''}
                            onChange={(e) => setData('compliance_issues', e.target.value)}
                            disabled={processing}
                            placeholder="Jelaskan isu kepatuhan yang diketahui (jika ada)"
                            className="min-h-[80px] transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        />
                        <InputError message={errors.compliance_issues} className="text-xs" />
                    </div>

                    {/* Additional Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="additional_notes" className="text-sm font-medium text-gray-700">
                            Catatan Tambahan
                        </Label>
                        <Textarea
                            id="additional_notes"
                            value={data.additional_notes || ''}
                            onChange={(e) => setData('additional_notes', e.target.value)}
                            disabled={processing}
                            placeholder="Tambahkan catatan atau informasi lain yang relevan"
                            className="min-h-[80px] transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        />
                        <InputError message={errors.additional_notes} className="text-xs" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
}