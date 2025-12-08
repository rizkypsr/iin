import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { CheckCircle, FileText, Plus, Trash2, Upload } from 'lucide-react';
import React, { useState } from 'react';

interface FormTemplate {
    id: number;
    type: string;
    name: string;
    file_path: string;
    original_name: string;
    order: number;
}

interface Props {
    nasionalForms: FormTemplate[];
    singleBlockholderForms: FormTemplate[];
    flash?: {
        success?: string;
        error?: string;
    };
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

export default function FormTemplatesIndex({ nasionalForms, singleBlockholderForms, flash, application_counts }: Props) {
    const [showAddForm, setShowAddForm] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm<{
        type: string;
        name: string;
        file: File | null;
    }>({
        type: 'nasional',
        name: '',
        file: null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.form-templates.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowAddForm(false);
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus form template ini?')) {
            router.delete(route('admin.form-templates.destroy', id));
        }
    };

    const renderFormList = (forms: FormTemplate[], title: string, type: string) => (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Form yang akan didownload oleh user saat mengajukan {title}</CardDescription>
            </CardHeader>
            <CardContent>
                {forms.length === 0 ? (
                    <p className="text-sm text-gray-500">Belum ada form template. Tambahkan form template baru.</p>
                ) : (
                    <div className="space-y-3">
                        {forms.map((form) => (
                            <div
                                key={form.id}
                                className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900">{form.name}</p>
                                        <p className="text-sm text-gray-500">{form.original_name}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(form.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <DashboardLayout title="Form Templates" applicationCounts={application_counts}>
            <Head title="Form Templates" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                            <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Form Templates</h1>
                            <p className="text-gray-600">Kelola form aplikasi yang dapat didownload user</p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Form
                    </Button>
                </div>

                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                    </Alert>
                )}

                {showAddForm && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Tambah Form Template</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <Label>Tipe Form</Label>
                                        <Select
                                            value={data.type}
                                            onValueChange={(value) => setData('type', value)}
                                        >
                                            <SelectTrigger className="mt-1">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="nasional">IIN Nasional</SelectItem>
                                                <SelectItem value="single-blockholder">Single IIN/Blockholder</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Nama Form</Label>
                                        <Input
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="Contoh: Formulir Permohonan IIN"
                                            className="mt-1"
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                    </div>
                                </div>
                                <div>
                                    <Label>File</Label>
                                    <div className="mt-1">
                                        <label className="flex cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 hover:border-blue-400">
                                            <div className="text-center">
                                                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                                <p className="mt-2 text-sm text-gray-600">
                                                    {data.file ? data.file.name : 'Klik untuk upload file'}
                                                </p>
                                                <p className="text-xs text-gray-400">PDF, DOC, DOCX, JPG, PNG, ZIP, RAR (Max 50MB)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
                                                onChange={(e) => setData('file', e.target.files?.[0] || null)}
                                            />
                                        </label>
                                    </div>
                                    {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700">
                                        {processing ? 'Menyimpan...' : 'Simpan'}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                                        Batal
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                <div className="grid gap-6 lg:grid-cols-2">
                    {renderFormList(nasionalForms, 'IIN Nasional', 'nasional')}
                    {renderFormList(singleBlockholderForms, 'Single IIN/Blockholder', 'single-blockholder')}
                </div>
            </div>
        </DashboardLayout>
    );
}
