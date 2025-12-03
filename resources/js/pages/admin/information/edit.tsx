import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import { ArrowLeft, ImagePlus, Info, X } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';

import 'react-quill-new/dist/quill.snow.css';

interface InformationData {
    id: number;
    title: string;
    image: string | null;
    content: string;
    is_active: boolean;
}

interface Props {
    information: InformationData;
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

export default function InformationEdit({ information, application_counts }: Props) {
    const quillRef = useRef<ReactQuill>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(information.image);

    const { data, setData, post, processing, errors } = useForm<{
        _method: string;
        title: string;
        image: File | null;
        content: string;
        is_active: boolean;
    }>({
        _method: 'PUT',
        title: information.title,
        image: null,
        content: information.content,
        is_active: information.is_active,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setData('image', null);
        setImagePreview(null);
    };

    const imageHandler = useCallback(() => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await axios.post(route('admin.information.upload-image'), formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const quill = quillRef.current?.getEditor();
                if (quill) {
                    const range = quill.getSelection(true);
                    quill.insertEmbed(range.index, 'image', response.data.url);
                    quill.setSelection(range.index + 1);
                }
            } catch (error) {
                console.error('Image upload failed:', error);
                alert('Gagal mengupload gambar. Pastikan ukuran file tidak lebih dari 5MB.');
            }
        };
    }, []);

    const modules = useMemo(
        () => ({
            toolbar: {
                container: [
                    [{ header: [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ list: 'ordered' }, { list: 'bullet' }],
                    [{ indent: '-1' }, { indent: '+1' }],
                    [{ color: [] }, { background: [] }],
                    [{ align: [] }],
                    ['link', 'image'],
                    ['clean'],
                ],
                handlers: { image: imageHandler },
            },
        }),
        [imageHandler],
    );

    const formats = [
        'header', 'bold', 'italic', 'underline', 'strike',
        'list', 'bullet', 'indent', 'color', 'background', 'align', 'link', 'image',
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.information.update', information.id), {
            forceFormData: true,
        });
    };

    return (
        <DashboardLayout title="Edit Informasi" applicationCounts={application_counts}>
            <Head title="Edit Informasi" />

            <div className="space-y-6">
                <div className="flex items-center space-x-3">
                    <Link href={route('admin.information.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali
                        </Button>
                    </Link>
                </div>

                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Informasi</h1>
                        <p className="text-gray-600">Perbarui informasi untuk halaman Layanan Publik</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Detail Informasi</CardTitle>
                        <CardDescription>Perbarui detail informasi</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label htmlFor="title">Judul</Label>
                                <Input
                                    id="title"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="Masukkan judul informasi..."
                                    className="mt-1"
                                />
                                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                            </div>

                            <div>
                                <Label>Gambar Header</Label>
                                <div className="mt-1">
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-48 w-auto rounded-lg border object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                                            <ImagePlus className="mb-2 h-10 w-10 text-gray-400" />
                                            <span className="text-sm text-gray-500">Klik untuk upload gambar</span>
                                            <span className="text-xs text-gray-400">PNG, JPG, GIF hingga 5MB</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                {errors.image && <p className="mt-1 text-sm text-red-600">{errors.image}</p>}
                            </div>

                            <div>
                                <Label>Konten</Label>
                                <div className="mt-1 rounded-md border border-gray-300">
                                    <ReactQuill
                                        ref={quillRef}
                                        value={data.content}
                                        theme="snow"
                                        modules={modules}
                                        formats={formats}
                                        onChange={(content) => setData('content', content)}
                                        placeholder="Masukkan konten informasi..."
                                    />
                                </div>
                                {errors.content && <p className="mt-1 text-sm text-red-600">{errors.content}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                                />
                                <Label htmlFor="is_active">Aktif (tampilkan di halaman publik)</Label>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Link href={route('admin.information.index')}>
                                    <Button type="button" variant="outline">
                                        Batal
                                    </Button>
                                </Link>
                                <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700">
                                    {processing ? 'Menyimpan...' : 'Perbarui Informasi'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
