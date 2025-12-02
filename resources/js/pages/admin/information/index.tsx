import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Head, useForm } from '@inertiajs/react';
import axios from 'axios';
import { CheckCircle, Info } from 'lucide-react';
import React, { useCallback, useMemo, useRef } from 'react';
import ReactQuill from 'react-quill-new';

import 'react-quill-new/dist/quill.snow.css';

interface InformationData {
    id?: number;
    title: string;
    content: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    information: InformationData | null;
    flash?: {
        success?: string;
        error?: string;
    };
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

export default function InformationIndex({ information, flash, application_counts }: Props) {
    const isEditing = !!information?.id;
    const quillRef = useRef<ReactQuill>(null);

    const { data, setData, post, put, processing, errors } = useForm({
        title: information?.title || '',
        content: information?.content || '',
    });

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
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
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
                handlers: {
                    image: imageHandler,
                },
            },
        }),
        [imageHandler],
    );

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'list',
        'bullet',
        'indent',
        'color',
        'background',
        'align',
        'link',
        'image',
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.information.update', information.id), {
                preserveScroll: true,
            });
        } else {
            post(route('admin.information.store'), {
                preserveScroll: true,
            });
        }
    };

    return (
        <DashboardLayout title="Information - Layanan Publik" applicationCounts={application_counts}>
            <Head title="Information - Layanan Publik" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Info className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Information</h1>
                        <p className="text-gray-600">Kelola konten informasi yang ditampilkan di halaman Layanan Publik</p>
                    </div>
                </div>

                {/* Success Alert */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">{flash.success}</AlertDescription>
                    </Alert>
                )}

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Info className="h-5 w-5" />
                            <span>Konten Layanan Publik</span>
                        </CardTitle>
                        <CardDescription>
                            Konten ini akan ditampilkan di halaman Layanan Publik untuk pengunjung website.
                        </CardDescription>
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

                            <div className="flex justify-end">
                                <Button type="submit" disabled={processing} className="bg-blue-600 text-white hover:bg-blue-700">
                                    {processing ? 'Menyimpan...' : isEditing ? 'Perbarui Informasi' : 'Simpan Informasi'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
