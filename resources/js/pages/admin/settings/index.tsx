import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import DashboardLayout from '@/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, FileText, Settings } from 'lucide-react';
import ReactQuill from 'react-quill-new';

import 'react-quill-new/dist/quill.snow.css';

interface DocumentRequirement {
    id?: number;
    type: string;
    content: string;
    created_at?: string;
    updated_at?: string;
}

interface Props {
    documentRequirements: {
        iin_nasional: DocumentRequirement | null;
        iin_single_blockholder: DocumentRequirement | null;
    };
    flash?: {
        success?: string;
        error?: string;
    };
    application_counts: {
        iin_nasional: number;
        iin_single_blockholder: number;
    };
}

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['link', 'image'],
        ['clean']
    ],
};

const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'indent',
    'color', 'background', 'align',
    'link', 'image'
];

export default function SettingsIndex({ documentRequirements, flash, application_counts }: Props) {
    const [activeTab, setActiveTab] = useState('iin_nasional');

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'iin_nasional',
        content: documentRequirements.iin_nasional?.content || '',
    });

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        const requirement = value === 'iin_nasional'
            ? documentRequirements.iin_nasional
            : documentRequirements.iin_single_blockholder;

        setData({
            type: value,
            content: requirement?.content || '',
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.settings.update-document-requirements'), {
            preserveScroll: true,
            onSuccess: () => {
                // Data will be automatically updated from the server response
            },
        });
    };

    const handleContentChange = (content: string) => {
        setData('content', content);
    };

    return (
        <DashboardLayout title="Settings - Document Requirements" applicationCounts={application_counts}>
            <Head title="Settings - Document Requirements" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                        <Settings className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                        <p className="text-gray-600">Manage document requirements for IIN applications</p>
                    </div>
                </div>

                {/* Success Alert */}
                {flash?.success && (
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>Document Requirements</span>
                        </CardTitle>
                        <CardDescription>
                            Configure the document requirements that will be displayed to users when creating IIN applications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={handleTabChange}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="iin_nasional">IIN Nasional</TabsTrigger>
                                <TabsTrigger value="iin_single_blockholder">Single IIN/Blockholder</TabsTrigger>
                            </TabsList>

                            <TabsContent value="iin_nasional" className="mt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Document Requirements for IIN Nasional
                                        </label>
                                        <div className="border border-gray-300 rounded-md">
                                            <ReactQuill
                                                value={data.content}
                                                theme='snow'
                                                onChange={handleContentChange}
                                                placeholder="Enter document requirements for IIN Nasional applications..."
                                            />
                                        </div>
                                        {errors.content && (
                                            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            {processing ? 'Saving...' : 'Save Requirements'}
                                        </Button>
                                    </div>
                                </form>
                            </TabsContent>

                            <TabsContent value="iin_single_blockholder" className="mt-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Document Requirements for Single IIN/Blockholder
                                        </label>
                                        <div className="border border-gray-300 rounded-md">
                                            <ReactQuill
                                                value={data.content}
                                                theme='snow'
                                                onChange={handleContentChange}
                                                placeholder="Enter document requirements for Single IIN/Blockholder applications..."
                                            />
                                        </div>
                                        {errors.content && (
                                            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processing ? 'Saving...' : 'Save Requirements'}
                                        </Button>
                                    </div>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}