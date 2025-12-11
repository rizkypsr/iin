import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, FileDown } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SurveyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onDownload: () => void;
    certificateType?: string;
    applicationType?: string; // 'iin_nasional', 'single_iin', 'pengawasan_iin_nasional', 'pengawasan_single_iin'
    applicationId?: number;
}

const SurveyModal: React.FC<SurveyModalProps> = ({ 
    isOpen, 
    onClose, 
    onDownload, 
    certificateType = 'sertifikat',
    applicationType,
    applicationId 
}) => {
    const [isDownloadEnabled, setIsDownloadEnabled] = useState(false);
    const [hasVisitedSurvey, setHasVisitedSurvey] = useState(false);
    const [hasCompletedSurvey, setHasCompletedSurvey] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);

    // Check if user has already completed survey when modal opens
    useEffect(() => {
        if (isOpen && applicationType && applicationId) {
            setIsCheckingStatus(true);
            axios.get(route('survey.check', { applicationType, applicationId }))
                .then((response) => {
                    if (response.data.has_completed) {
                        setHasCompletedSurvey(true);
                        setIsDownloadEnabled(true);
                    }
                })
                .catch((error) => {
                    console.error('Error checking survey status:', error);
                })
                .finally(() => {
                    setIsCheckingStatus(false);
                });
        }
    }, [isOpen, applicationType, applicationId]);

    useEffect(() => {
        if (isOpen && !hasCompletedSurvey) {
            setIsDownloadEnabled(false);
            setHasVisitedSurvey(false);

            // Enable download button after 10 seconds without showing timer
            const timer = setTimeout(() => {
                setIsDownloadEnabled(true);
            }, 10000);

            return () => clearTimeout(timer);
        }
    }, [isOpen, hasCompletedSurvey]);

    const handleSurveyClick = () => {
        setHasVisitedSurvey(true);
        window.open('https://s.id/SurveiPersepsiLayananIIN', '_blank');
    };

    const handleDownload = async () => {
        // Record survey completion when downloading
        if (applicationType && applicationId && !hasCompletedSurvey) {
            try {
                await axios.post(route('survey.complete', { applicationType, applicationId }), {
                    certificate_type: certificateType,
                });
                setHasCompletedSurvey(true);
            } catch (error) {
                console.error('Error recording survey completion:', error);
            }
        }
        
        onDownload();
        onClose();
    };

    // If user has already completed survey, show simplified modal
    if (hasCompletedSurvey && !isCheckingStatus) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileDown className="h-5 w-5" />
                            Unduh {certificateType}
                        </DialogTitle>
                        <DialogDescription>
                            Anda sudah pernah mengisi survei untuk aplikasi ini. Silakan unduh dokumen Anda.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                        <p className="text-sm text-green-700">✓ Survei sudah pernah diisi sebelumnya</p>
                    </div>

                    <DialogFooter className="flex gap-2">
                        <Button variant="outline" onClick={onClose}>
                            Batal
                        </Button>
                        <Button
                            onClick={handleDownload}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <FileDown className="mr-2 h-4 w-4" />
                            Unduh Dokumen
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileDown className="h-5 w-5" />
                        Unduh {certificateType}
                    </DialogTitle>
                    <DialogDescription>Sebelum mengunduh {certificateType}, mohon isi survei persepsi layanan IIN terlebih dahulu.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-2 font-medium text-blue-900">Survei Persepsi Layanan IIN</h4>
                        <p className="mb-3 text-sm text-blue-700">
                            Bantuan Anda dalam mengisi survei ini sangat berharga untuk meningkatkan kualitas layanan kami.
                        </p>
                        <Button
                            onClick={handleSurveyClick}
                            variant="outline"
                            size="sm"
                            className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Isi Survei Sekarang
                        </Button>
                    </div>

                    {hasVisitedSurvey && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                            <p className="text-sm text-green-700">✓ Terima kasih telah mengunjungi halaman survei!</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Batal
                    </Button>
                    <Button
                        onClick={handleDownload}
                        disabled={!isDownloadEnabled || isCheckingStatus}
                        className={`${isDownloadEnabled && !isCheckingStatus ? 'bg-blue-600 hover:bg-blue-700' : 'cursor-not-allowed bg-gray-300'}`}
                    >
                        <FileDown className="mr-2 h-4 w-4" />
                        {isCheckingStatus ? 'Memeriksa...' : (isDownloadEnabled ? 'Unduh Dokumen' : 'Isi Survei Terlebih Dahulu')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default SurveyModal;
