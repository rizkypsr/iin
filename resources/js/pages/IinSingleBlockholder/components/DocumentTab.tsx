import ReimModal from "@/components/ReimModal";
import SurveyModal from "@/components/SurveyModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IinSingleBlockholderApplication, PaymentDocument } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Award, CreditCard, Download, FileText, Shield } from "lucide-react";
import { useState } from "react";

export default function DocumentTab({ application }: { application: IinSingleBlockholderApplication }) {
    const [selectedApplication, setSelectedApplication] = useState<IinSingleBlockholderApplication | null>(null);
    const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
    const [isReimModalOpen, setIsReimModalOpen] = useState(false);

    const downloadFile = (type: string, index?: number) => {
        window.open(
            route('iin-single-blockholder.download-file', {
                iinSingleBlockholder: application.id,
                type,
                index,
            }),
            '_blank',
        );
    };

    console.log(application);

    return (
        <>
            <Card className="border-purple-100 shadow-md bg-white/95">
                <CardHeader>
                    <CardTitle>Dokumen Aplikasi</CardTitle>
                    <CardDescription>Daftar dokumen yang terkait dengan aplikasi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Certificate */}
                    {application.status === 'terbit' && (
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex gap-3 items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Award className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Sertifikat IIN</p>
                                    <p className="text-sm text-gray-500">Sertifikat IIN Nasional</p>
                                </div>
                            </div>
                            {application.can_download_certificate && (
                                <Button variant="outline" size="sm" onClick={() => {
                                    setSelectedApplication(application);
                                    setIsSurveyModalOpen(true);
                                }}>
                                    <Download className="mr-1 w-4 h-4" />
                                    Download
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Application Form */}
                    <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200">
                        <div className="flex gap-3 items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Formulir Aplikasi</p>
                                <p className="text-sm text-gray-500">Formulir permohonan IIN Nasional</p>
                            </div>
                        </div>
                        {application.application_form_path && (
                            <Button variant="outline" size="sm" onClick={() => downloadFile('application_form')}>
                                <Download className="mr-1 w-4 h-4" />
                                Download
                            </Button>
                        )}
                    </div>

                    {/* Requirements Archive */}
                    <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200">
                        <div className="flex gap-3 items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Dokumen Persyaratan</p>
                                <p className="text-sm text-gray-500">Dokumen persyaratan dalam format ZIP/RAR</p>
                            </div>
                        </div>
                        {application.requirements_archive_path ? (
                            <Button variant="outline" size="sm" onClick={() => downloadFile('requirements_archive')}>
                                <Download className="mr-1 w-4 h-4" />
                                Download
                            </Button>
                        ) : (
                            <span className="text-sm text-gray-400">Tidak ada</span>
                        )}
                    </div>

                    {/* Expense Reimbursement */}
                    <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200">
                        <div className="flex gap-3 items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FileText className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">Bukti Penggantian Transport dan Uang Harian</p>
                            </div>
                        </div>
                        {application.expense_reimbursement ? (
                            <Button variant="outline" size="sm" onClick={() => setIsReimModalOpen(true)}>
                                <Download className="mr-1 w-4 h-4" />
                                Buka
                            </Button>
                        ) : (
                            <span className="text-sm text-gray-400">Tidak ada</span>
                        )}
                    </div>

                    {/* Payment Proof Documents (User Uploaded) */}
                    {application.payment_proof_documents && application.payment_proof_documents.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Bukti Pembayaran Tahap 1 User</p>
                                    <p className="text-sm text-gray-500">
                                        {application.payment_proof_documents.length} file diupload pada{' '}
                                        {application.payment_proof_uploaded_at
                                            ? format(new Date(application.payment_proof_uploaded_at), 'dd MMMM yyyy', { locale: id })
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                            {application.payment_proof_documents?.map((document: PaymentDocument, index: number) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-2 ml-12 rounded-lg border border-gray-200"
                                >
                                    <div className="flex gap-2 items-center">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">{document.original_name}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => downloadFile('payment_proof', index)}>
                                        <Download className="mr-1 w-3 h-3" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Payment Proof Documents Stage 2 (User Uploaded) */}
                    {application.payment_proof_documents_stage_2 && application.payment_proof_documents_stage_2.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Bukti Pembayaran Tahap 2 User</p>
                                    <p className="text-sm text-gray-500">
                                        {application.payment_proof_documents_stage_2.length} file diupload pada{' '}
                                        {application.payment_proof_uploaded_at
                                            ? format(new Date(application.payment_proof_uploaded_at), 'dd MMMM yyyy', { locale: id })
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                            {application.payment_proof_documents?.map((document: PaymentDocument, index: number) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-2 ml-12 rounded-lg border border-gray-200"
                                >
                                    <div className="flex gap-2 items-center">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">{document.original_name}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => downloadFile('payment_proof', index)}>
                                        <Download className="mr-1 w-3 h-3" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* No Payment Proof */}
                    {!application.payment_proof_path &&
                        (!application.payment_proof_documents || application.payment_proof_documents.length === 0) && (
                            <div className="flex justify-between items-center p-3 rounded-lg border border-gray-200">
                                <div className="flex gap-3 items-center">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <CreditCard className="w-5 h-5 text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">Bukti Pembayaran</p>
                                        <p className="text-sm text-gray-500">Belum ada bukti pembayaran</p>
                                    </div>
                                </div>
                            </div>
                        )}

                    {/* Payment Documents */}
                    {application.payment_documents && application.payment_documents.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Dokumen Pembayaran Tahap 1</p>
                                    <p className="text-sm text-gray-500">
                                        {application.payment_documents.length} dokumen diupload pada{' '}
                                        {application.payment_documents_uploaded_at
                                            ? format(new Date(application.payment_documents_uploaded_at), 'dd MMMM yyyy', { locale: id })
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                            {application.payment_documents.map((document: PaymentDocument, index: number) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-2 ml-12 rounded-lg border border-gray-200"
                                >
                                    <div className="flex gap-2 items-center">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">{document.original_name}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => downloadFile('payment_document', index)}>
                                        <Download className="mr-1 w-3 h-3" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Payment Document Stage 2 */}
                    {application.payment_documents_stage_2 && application.payment_documents_stage_2.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Dokumen Pembayaran Tahap 2</p>
                                    <p className="text-sm text-gray-500">
                                        {application.payment_documents_stage_2.length} dokumen diupload pada{' '}
                                        {application.payment_documents_uploaded_at_stage_2
                                            ? format(new Date(application.payment_documents_uploaded_at_stage_2), 'dd MMMM yyyy', { locale: id })
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                            {application.payment_documents_stage_2.map((document: PaymentDocument, index: number) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-2 ml-12 rounded-lg border border-gray-200"
                                >
                                    <div className="flex gap-2 items-center">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">{document.original_name}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => downloadFile('payment_document', index)}>
                                        <Download className="mr-1 w-3 h-3" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Field Verification Documents */}
                    {application.field_verification_documents && application.field_verification_documents.length > 0 && (
                        <div className="space-y-2">
                            <div className="flex gap-2 items-center">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Shield className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800">Dokumen Verifikasi Lapangan</p>
                                    <p className="text-sm text-gray-500">
                                        {application.field_verification_documents.length} dokumen diupload pada{' '}
                                        {application.field_verification_documents_uploaded_at
                                            ? format(new Date(application.field_verification_documents_uploaded_at), 'dd MMMM yyyy', {
                                                locale: id,
                                            })
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                            {application.field_verification_documents.map((document: PaymentDocument, index: number) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center p-2 ml-12 rounded-lg border border-gray-200"
                                >
                                    <div className="flex gap-2 items-center">
                                        <FileText className="w-4 h-4 text-gray-600" />
                                        <span className="text-sm text-gray-700">{document.original_name}</span>
                                    </div>
                                    <Button variant="outline" size="sm" onClick={() => downloadFile('field_verification_document', index)}>
                                        <Download className="mr-1 w-3 h-3" />
                                        Download
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <SurveyModal
                isOpen={isSurveyModalOpen}
                onClose={() => setIsSurveyModalOpen(false)}
                onDownload={() => downloadFile('certificate')}
                certificateType="IIN Single Blockholder"
            />

            <ReimModal
                isOpen={isReimModalOpen}
                onClose={() => setIsReimModalOpen(false)}
                application={application}
                type='single'
            />
        </>
    )
}