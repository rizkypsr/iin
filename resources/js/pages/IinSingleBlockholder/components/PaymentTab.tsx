import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { showErrorToast, showSuccessToast } from "@/lib/toast-helper";
import { IinSingleBlockholderApplication, PaymentDocument } from "@/types";
import { router } from "@inertiajs/react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { AlertCircle, CheckCircle, Clock, CreditCard, Download, FileText, Upload } from "lucide-react";
import { useState } from "react";

export default function PaymentTab({ application }: { application: IinSingleBlockholderApplication }) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [formData, setFormData] = useState({
        payment_proof: [] as File[],
    });

    const uploadPaymentProof = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.payment_proof.length === 0) {
            showErrorToast('Silahkan pilih file bukti pembayaran terlebih dahulu');
            return;
        }

        setUploading(true);

        const data = new FormData();
        formData.payment_proof.forEach((file, index) => {
            data.append(`payment_proof[${index}]`, file);
        });

        // Tentukan stage berdasarkan status aplikasi
        const stage = application.status === 'pembayaran-tahap-2' ? 2 : 1;
        data.append('stage', stage.toString());

        router.post(route('iin-single-blockholder.upload-payment-proof', application.id), data, {
            onProgress: (progress) => {
                setUploadProgress(progress?.percentage || 0);
            },
            onSuccess: () => {
                setUploading(false);
                setUploadProgress(0);
                setFormData({ payment_proof: [] });
                const stageText = stage === 2 ? 'Tahap 2' : 'Tahap 1';
                showSuccessToast(`Bukti pembayaran ${stageText} berhasil diunggah`);
            },
            onError: (errors) => {
                setUploading(false);
                setUploadProgress(0);
                const errorMessage = (Object.values(errors)[0] as string) || 'Gagal mengunggah bukti pembayaran';
                showErrorToast(errorMessage);
            },
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setFormData({
                ...formData,
                payment_proof: [...formData.payment_proof, ...filesArray],
            });
        }
    };

    const removeFile = (index: number) => {
        const updatedFiles = formData.payment_proof.filter((_, i) => i !== index);
        setFormData({
            ...formData,
            payment_proof: updatedFiles,
        });
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return '-';
        return format(new Date(dateString), 'dd MMMM yyyy', { locale: id });
    };

    return (
        <Card>
            <CardContent className="space-y-6">
                {application.status === 'pembayaran' && (
                    <div className="space-y-4">
                        {application.payment_documents && application.payment_documents.length > 0 ? (
                            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-lg border border-green-200">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-white rounded-full shadow-sm">
                                        <FileText className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 font-semibold text-gray-900">Dokumen Pembayaran dari Admin</h3>
                                        <p className="mb-4 text-sm text-gray-700">
                                            Admin telah mengunggah dokumen pembayaran untuk aplikasi Anda. Silakan unduh dan isi
                                            dokumen tersebut sebagai bukti pembayaran.
                                        </p>
                                        <div className="space-y-3">
                                            {application.payment_documents.map((document: PaymentDocument, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center p-4 rounded-lg border backdrop-blur-sm border-white/40 bg-white/60"
                                                >
                                                    <div className="flex gap-3 items-center">
                                                        <FileText className="w-5 h-5 text-green-600" />
                                                        <div>
                                                            <div className="font-medium text-gray-900">{document.original_name}</div>
                                                            <div className="text-sm text-gray-600">
                                                                Diunggah pada{' '}

                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            window.open(
                                                                route('iin-single-blockholder.download-payment-document', [
                                                                    application.id,
                                                                    index,
                                                                ]),
                                                                '_blank',
                                                            )
                                                        }
                                                        className="bg-white hover:bg-green-50"
                                                    >
                                                        <Download className="mr-2 w-4 h-4" />
                                                        Download
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 mt-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex gap-2 items-start">
                                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                                <div className="text-sm text-blue-800">
                                                    <div className="mb-1 font-medium">Petunjuk:</div>
                                                    <ul className="space-y-1 list-disc list-inside text-blue-700">
                                                        <li>Unduh dokumen pembayaran yang telah disediakan admin</li>
                                                        <li>Isi dokumen tersebut dengan lengkap dan benar</li>
                                                        <li>Unggah kembali dokumen yang telah diisi sebagai bukti pembayaran</li>
                                                        <li>Pastikan semua informasi yang diisi sudah sesuai</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg border border-amber-200">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-white rounded-full shadow-sm">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 font-semibold text-gray-900">Menunggu Dokumen Pembayaran</h3>
                                        <p className="text-sm text-gray-700">
                                            Admin sedang memproses dokumen pembayaran untuk aplikasi Anda. Silakan tunggu hingga admin
                                            mengunggah dokumen pembayaran.
                                        </p>
                                        <div className="p-3 mt-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex gap-2 items-start">
                                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                                <div className="text-sm text-blue-800">
                                                    <div className="mb-1 font-medium">Informasi:</div>
                                                    <ul className="space-y-1 list-disc list-inside text-blue-700">
                                                        <li>Dokumen pembayaran akan dikirim oleh admin dalam 1-2 hari kerja</li>
                                                        <li>Anda akan mendapat notifikasi ketika dokumen sudah tersedia</li>
                                                        <li>
                                                            Setelah dokumen tersedia, Anda dapat mengunduh dan mengisi dokumen
                                                            tersebut
                                                        </li>
                                                        <li>
                                                            Kemudian unggah kembali dokumen yang telah diisi sebagai bukti pembayaran
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Dokumen Pembayaran Tahap 2 dari Admin */}
                {application.status === 'pembayaran-tahap-2' && (
                    <div className="space-y-4">
                        {application.payment_documents_stage_2 && application.payment_documents_stage_2.length > 0 ? (
                            <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-lg border border-indigo-200">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-white rounded-full shadow-sm">
                                        <FileText className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 font-semibold text-gray-900">Dokumen Pembayaran Tahap 2 dari Admin</h3>
                                        <p className="mb-4 text-sm text-gray-700">
                                            Admin telah mengunggah dokumen pembayaran tahap 2 untuk aplikasi Anda. Silakan unduh dan
                                            isi dokumen tersebut sebagai bukti pembayaran tahap 2.
                                        </p>
                                        <div className="space-y-3">
                                            {application.payment_documents_stage_2.map((document: PaymentDocument, index: number) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center p-4 rounded-lg border backdrop-blur-sm border-white/40 bg-white/60"
                                                >
                                                    <div className="flex gap-3 items-center">
                                                        <FileText className="w-5 h-5 text-indigo-600" />
                                                        <div>
                                                            <div className="font-medium text-gray-900">{document.original_name}</div>
                                                            <div className="text-sm text-gray-600">
                                                                Diunggah pada{' '}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            window.open(
                                                                route('iin-single-blockholder.download-payment-document-stage-2', [
                                                                    application.id,
                                                                    index,
                                                                ]),
                                                                '_blank',
                                                            )
                                                        }
                                                        className="bg-white hover:bg-indigo-50"
                                                    >
                                                        <Download className="mr-2 w-4 h-4" />
                                                        Download
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="p-3 mt-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex gap-2 items-start">
                                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                                <div className="text-sm text-blue-800">
                                                    <div className="mb-1 font-medium">Petunjuk:</div>
                                                    <ul className="space-y-1 list-disc list-inside text-blue-700">
                                                        <li>Unduh dokumen pembayaran tahap 2 yang telah disediakan admin</li>
                                                        <li>Isi dokumen tersebut dengan lengkap dan benar</li>
                                                        <li>
                                                            Unggah kembali dokumen yang telah diisi sebagai bukti pembayaran tahap 2
                                                        </li>
                                                        <li>Pastikan semua informasi yang diisi sudah sesuai</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-100 rounded-lg border border-amber-200">
                                <div className="flex gap-4 items-start">
                                    <div className="p-3 bg-white rounded-full shadow-sm">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="mb-2 font-semibold text-gray-900">Menunggu Dokumen Pembayaran Tahap 2</h3>
                                        <p className="text-sm text-gray-700">
                                            Admin sedang memproses dokumen pembayaran tahap 2 untuk aplikasi Anda. Silakan tunggu
                                            hingga admin mengunggah dokumen pembayaran tahap 2.
                                        </p>
                                        <div className="p-3 mt-4 bg-blue-50 rounded-lg border border-blue-200">
                                            <div className="flex gap-2 items-start">
                                                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                                                <div className="text-sm text-blue-800">
                                                    <div className="mb-1 font-medium">Informasi:</div>
                                                    <ul className="space-y-1 list-disc list-inside text-blue-700">
                                                        <li>
                                                            Dokumen pembayaran tahap 2 akan dikirim oleh admin dalam 1-2 hari kerja
                                                        </li>
                                                        <li>Anda akan mendapat notifikasi ketika dokumen sudah tersedia</li>
                                                        <li>
                                                            Setelah dokumen tersedia, Anda dapat mengunduh dan mengisi dokumen
                                                            tersebut
                                                        </li>
                                                        <li>
                                                            Kemudian unggah kembali dokumen yang telah diisi sebagai bukti pembayaran
                                                            tahap 2
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bukti Pembayaran Tahap 1 */}
                {(application.payment_proof_path ||
                    (application.payment_proof_documents && application.payment_proof_documents.length > 0)) && (
                        <div className="space-y-4">
                            <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border">
                                <h3 className="mb-2 font-medium text-gray-800">Bukti Pembayaran Tahap 1</h3>
                                {application.payment_proof_documents && application.payment_proof_documents.length > 0 ? (
                                    <div className="space-y-3">
                                        {application.payment_proof_documents.map((document: PaymentDocument, index: number) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                                            >
                                                <div className="flex gap-3 items-center">
                                                    <FileText className="w-5 h-5 text-purple-500" />
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-700">{document.original_name}</p>
                                                        <p className="text-xs text-gray-500">
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        window.open(
                                                            route('iin-single-blockholder.download-payment-proof', [
                                                                application.id,
                                                                index,
                                                                1,
                                                            ]),
                                                            '_blank',
                                                        )
                                                    }
                                                >
                                                    <Download className="mr-2 w-4 h-4" />
                                                    Download
                                                </Button>
                                            </div>
                                        ))}
                                        {application.payment_verified_at ? (
                                            <p className="flex gap-1 items-center mt-2 text-sm font-medium text-green-600">
                                                <CheckCircle className="h-3.5 w-3.5" />
                                                Terverifikasi pada {formatDate(application.payment_verified_at)}
                                            </p>
                                        ) : (
                                            <p className="flex gap-1 items-center mt-2 text-sm text-amber-600">
                                                <Clock className="h-3.5 w-3.5" />
                                                Menunggu verifikasi
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-3 items-center">
                                            <FileText className="w-6 h-6 text-purple-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">
                                                    Bukti pembayaran tahap 1 telah diunggah
                                                </p>
                                                {application.payment_verified_at ? (
                                                    <p className="flex gap-1 items-center mt-1 text-sm font-medium text-green-600">
                                                        <CheckCircle className="h-3.5 w-3.5" />
                                                        Terverifikasi pada {formatDate(application.payment_verified_at)}
                                                    </p>
                                                ) : (
                                                    <p className="flex gap-1 items-center mt-1 text-sm text-amber-600">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Menunggu verifikasi
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                window.open(
                                                    route('iin-single-blockholder.download-file', [application.id, 'payment_proof']),
                                                    '_blank',
                                                )
                                            }
                                        >
                                            <Download className="mr-2 w-4 h-4" />
                                            Download
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                {/* Bukti Pembayaran Tahap 2 */}
                {application.payment_proof_documents_stage_2 && application.payment_proof_documents_stage_2.length > 0 && (
                    <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border">
                            <h3 className="mb-2 font-medium text-gray-800">Bukti Pembayaran Tahap 2</h3>
                            <div className="space-y-3">
                                {application.payment_proof_documents_stage_2.map((document: PaymentDocument, index: number) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                                    >
                                        <div className="flex gap-3 items-center">
                                            <FileText className="w-5 h-5 text-indigo-500" />
                                            <div>
                                                <p className="text-sm font-medium text-gray-700">{document.original_name}</p>
                                                <p className="text-xs text-gray-500">
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                window.open(
                                                    route('iin-single-blockholder.download-payment-proof', [
                                                        application.id,
                                                        index,
                                                        2,
                                                    ]),
                                                    '_blank',
                                                )
                                            }
                                        >
                                            <Download className="mr-2 w-4 h-4" />
                                            Download
                                        </Button>
                                    </div>
                                ))}
                                {application.payment_verified_at_stage_2 ? (
                                    <p className="flex gap-1 items-center mt-2 text-sm font-medium text-green-600">
                                        <CheckCircle className="h-3.5 w-3.5" />
                                        Terverifikasi pada {formatDate(application.payment_verified_at_stage_2)}
                                    </p>
                                ) : (
                                    <p className="flex gap-1 items-center mt-2 text-sm text-amber-600">
                                        <Clock className="h-3.5 w-3.5" />
                                        Menunggu verifikasi
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Upload Payment DOcument proof */}
                {(['pembayaran', 'pembayaran-tahap-2'].includes(application.status)) ? (
                    <form onSubmit={uploadPaymentProof} className="space-y-4">
                        <Alert className="text-blue-800 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            <AlertDescription className="text-blue-700">
                                Silakan unggah bukti pembayaran {application.status === 'pembayaran-tahap-2' ? 'tahap 2' : 'tahap 1'}{' '}
                                untuk melanjutkan proses aplikasi Anda.
                            </AlertDescription>
                        </Alert>

                        <div className="p-4 rounded-lg border">
                            <h3 className="mb-2 font-medium text-gray-800">
                                Unggah Bukti Pembayaran {application.status === 'pembayaran-tahap-2' ? 'Tahap 2' : 'Tahap 1'}
                            </h3>
                            <p className="mb-4 text-sm text-gray-600">
                                Silakan unggah bukti transfer atau pembayaran{' '}
                                {application.status === 'pembayaran-tahap-2' ? 'tahap 2' : 'tahap 1'} dalam format PDF, JPG, atau PNG.
                                Anda dapat mengunggah beberapa file sekaligus.
                            </p>

                            {/* Selected Files Display */}
                            {formData.payment_proof.length > 0 && (
                                <div className="mb-4 space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">File yang dipilih:</h4>
                                    {formData.payment_proof.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex gap-2 items-center">
                                                <FileText className="w-4 h-4 text-purple-500" />
                                                <span className="text-sm text-gray-700">{file.name}</span>
                                                <span className="text-xs text-gray-500">
                                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => removeFile(index)}
                                                className="p-0 w-8 h-8"
                                            >
                                                ×
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="relative p-6 mb-4 text-center rounded-lg border-2 border-gray-300 border-dashed transition-colors hover:border-purple-300">
                                <div className="flex flex-col gap-2 items-center">
                                    <Upload className="mb-1 w-8 h-8 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-900">
                                        Klik untuk memilih file bukti pembayaran
                                    </span>
                                    <span className="text-xs text-gray-500">Format: PDF, JPG, JPEG, PNG (Maks. 5MB per file)</span>
                                </div>
                                <label htmlFor="payment_proof_new" className="absolute inset-0 cursor-pointer">
                                    <span className="sr-only">Pilih file</span>
                                </label>
                                <input
                                    id="payment_proof_new"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    multiple
                                />
                            </div>

                            {uploadProgress > 0 && (
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Mengunggah...</span>
                                        <span>{uploadProgress}%</span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-gray-200">
                                        <div
                                            className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-purple-700 transition-all duration-300"
                                            style={{ width: `${uploadProgress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={uploading || formData.payment_proof.length === 0}
                            className="w-full text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800"
                        >
                            {uploading ? (
                                <span className="flex gap-2 items-center">
                                    <svg
                                        className="mr-2 -ml-1 w-4 h-4 text-white animate-spin"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Sedang Mengunggah...
                                </span>
                            ) : (
                                <span className="flex gap-2 items-center">
                                    <Upload className="w-4 h-4" />
                                    Unggah Bukti Pembayaran
                                </span>
                            )}
                        </Button>
                    </form>
                ) : (
                    <div className="p-8 text-center">
                        <CreditCard className="mx-auto mb-3 w-12 h-12 text-gray-300" />
                        <h3 className="mb-1 text-lg font-medium text-gray-700">Belum Ada Informasi Pembayaran</h3>
                        <p className="text-gray-500">
                            {application.status === 'pengajuan' || application.status === 'perbaikan'
                                ? 'Aplikasi masih dalam tahap pengajuan. Informasi pembayaran akan tersedia setelah aplikasi diverifikasi.'
                                : 'Tidak ada informasi pembayaran yang tersedia saat ini.'}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}