import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { File, FileDown, Upload } from 'lucide-react';
import React, { useState } from 'react';
import { Input } from './ui/input';

interface QrisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTemplateDownload: () => void;
    onFileUpload: (file: File) => void;
}

const QrisModal: React.FC<QrisModalProps> = ({ isOpen, onClose, onTemplateDownload, onFileUpload }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
    };

    const handleUpload = () => {
        if (selectedFile) {
            onFileUpload(selectedFile);
            setSelectedFile(null);
            onClose();
        }
    };

    const handleTemplateDownload = () => {
        onTemplateDownload();

        window.open(route('download-form', 'qris'), '_blank');
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="">Surat Pernyataan Penggunaan Sistem Pembayaran Nasional Berbasis QRIS</DialogTitle>
                    <DialogDescription>Unduh template terlebih dahulu, kemudian upload file yang telah diisi.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Template Download Section */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-2 font-medium text-blue-900">Langkah 1: Unduh Template</h4>
                        <p className="mb-3 text-sm text-blue-700">Download template file terlebih dahulu dan isi sesuai data yang diperlukan.</p>
                        <Button
                            onClick={handleTemplateDownload}
                            variant="outline"
                            size="sm"
                            className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                            <FileDown className="mr-2 h-4 w-4" />
                            Unduh Template
                        </Button>
                    </div>

                    {/* File Upload Section */}
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <h4 className="mb-2 font-medium text-gray-900">Langkah 2: Upload File</h4>
                        <p className="mb-3 text-sm text-gray-600">Upload file template yang telah diisi</p>

                        <form>
                            <Input required type="file" accept=".pdf,.doc,.docx" onChange={handleFileSelect} />
                        </form>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile}
                        className={`${selectedFile ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-gray-300'}`}
                    >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default QrisModal;
