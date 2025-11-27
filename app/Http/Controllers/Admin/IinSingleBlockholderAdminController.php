<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IinSingleBlockholderApplication;
use App\Models\IinStatusLog;
use App\Services\ApplicationCountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class IinSingleBlockholderAdminController extends Controller
{
    public function index()
    {
        $applications = IinSingleBlockholderApplication::with(['user', 'admin'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/IinSingleBlockholder/Index', [
            'applications' => $applications,
            'application_counts' => $applicationCounts
        ]);
    }

    public function show(IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $iinSingleBlockholder->load(['user', 'admin', 'expenseReimbursement']);

        // Get status logs using polymorphic relationship
        $statusLogs = IinStatusLog::where('application_type', 'single_blockholder')
            ->where('application_id', $iinSingleBlockholder->id)
            ->with('changedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/IinSingleBlockholder/Show', [
            'application' => array_merge($iinSingleBlockholder->toArray(), [
                'can_upload_payment_proof' => false, // Admin doesn't upload payment proof
                'can_download_certificate' => $iinSingleBlockholder->certificate_path && Storage::disk('public')->exists($iinSingleBlockholder->certificate_path),
                'can_upload_certificate' => in_array($iinSingleBlockholder->status, ['menunggu-terbit', 'terbit']),
            ]),
            'statusLogs' => $statusLogs,
            'application_counts' => $applicationCounts
        ]);
    }

    public function updateStatus(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $request->validate([
            'status' => 'required|in:pengajuan,perbaikan,pembayaran,verifikasi-lapangan,pembayaran-tahap-2,menunggu-terbit,terbit',
            'notes' => 'nullable|string',
            'iin_number' => 'required_if:status,terbit|string|max:20',
            'iin_block_range' => 'nullable|array',
            'field_verification_completed' => 'nullable|boolean',
        ]);

        return DB::transaction(function () use ($request, $iinSingleBlockholder) {
            $oldStatus = $iinSingleBlockholder->status;
            $newStatus = $request->status;

            // Handle field verification completion
            $fieldVerificationAt = $iinSingleBlockholder->field_verification_at;
            if ($request->field_verification_completed && $newStatus === 'verifikasi-lapangan') {
                // When admin completes field verification, move to pembayaran-tahap-2
                $newStatus = 'pembayaran-tahap-2';
                $fieldVerificationAt = now();
            } elseif ($newStatus === 'terbit') {
                $fieldVerificationAt = $fieldVerificationAt ?: now();
            }

            // Update application
            $iinSingleBlockholder->update([
                'status' => $newStatus,
                'notes' => $request->notes,
                'iin_number' => $request->iin_number,
                'iin_block_range' => $request->iin_block_range,
                'admin_id' => in_array($newStatus, ['perbaikan', 'pembayaran', 'verifikasi-lapangan', 'pembayaran-tahap-2', 'menunggu-terbit', 'terbit']) ? Auth::id() : $iinSingleBlockholder->admin_id,
                'payment_verified_at' => ($oldStatus === 'pembayaran' && $newStatus === 'verifikasi-lapangan') ? now() : $iinSingleBlockholder->payment_verified_at,
                'payment_verified_at_stage_2' => ($oldStatus === 'pembayaran-tahap-2' && $newStatus === 'menunggu-terbit') ? now() : $iinSingleBlockholder->payment_verified_at_stage_2,
                'field_verification_at' => $fieldVerificationAt,
                'issued_at' => $newStatus === 'terbit' ? now() : $iinSingleBlockholder->issued_at,
            ]);

            // Log status change
            IinStatusLog::create([
                'application_type' => 'single_blockholder',
                'application_id' => $iinSingleBlockholder->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => $newStatus,
                'notes' => $request->notes
            ]);

            return back()->with('success', 'Status aplikasi berhasil diperbarui');
        });
    }

    public function uploadCertificate(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $request->validate([
            'certificates' => 'required|array|min:1',
            'certificates.*' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'iin_number' => 'required|string|max:20',
            'notes' => 'nullable|string|max:1000',
        ]);

        return DB::transaction(function () use ($request, $iinSingleBlockholder) {
            $updateData = [
                'iin_number' => $request->iin_number,
                'status' => 'terbit',
                'issued_at' => now(),
                'notes' => $request->notes,
                'admin_id' => Auth::id(),
            ];

            $uploadedFiles = [];

            if ($request->hasFile('certificates')) {
                if ($iinSingleBlockholder->certificate_path && Storage::disk('public')->exists($iinSingleBlockholder->certificate_path)) {
                    Storage::disk('public')->delete($iinSingleBlockholder->certificate_path);
                }

                foreach ($request->file('certificates') as $index => $file) {
                    $filename = $iinSingleBlockholder->application_number . '_' . time() . '_certificate_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('iin-single-blockholder/certificates', $filename, 'public');

                    if ($index === 0) {
                        $updateData['certificate_path'] = $path;
                    }

                    $uploadedFiles[] = [
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'uploaded_at' => now()->toISOString(),
                    ];
                }

                $existingAdditional = $iinSingleBlockholder->additional_documents ?? [];
                $updateData['additional_documents'] = array_merge($existingAdditional, $uploadedFiles);
            }

            $oldStatus = $iinSingleBlockholder->status;

            $iinSingleBlockholder->update($updateData);

            IinStatusLog::create([
                'application_type' => 'single_blockholder',
                'application_id' => $iinSingleBlockholder->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => 'terbit',
                'notes' => $request->notes ?: 'IIN berhasil diterbitkan dengan nomor: ' . $request->iin_number
            ]);

            $message = 'IIN berhasil diterbitkan';
            if (!empty($uploadedFiles)) {
                $message .= ' dan ' . count($uploadedFiles) . ' sertifikat diupload';
            }

            return back()->with('success', $message);
        });
    }

    public function uploadPaymentDocuments(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $request->validate([
            'payment_documents.*' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
            'upload_and_change_status' => 'nullable|string',
        ]);

        $uploadedFiles = [];
        
        // Determine if this is stage 2 based on the status
        $isStage2 = $request->status === 'pembayaran-tahap-2';
        $existingDocuments = $isStage2 
            ? ($iinSingleBlockholder->payment_documents_stage_2 ?? []) 
            : ($iinSingleBlockholder->payment_documents ?? []);

        if ($request->hasFile('payment_documents')) {
            foreach ($request->file('payment_documents') as $file) {
                $stagePrefix = $isStage2 ? 'stage2_' : '';
                $filename = $iinSingleBlockholder->application_number . '_' . time() . '_' . uniqid() . '_' . $stagePrefix . 'payment_doc.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('iin-single-blockholder/payment-documents', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString()
                ];
            }
        }

        // Merge with existing documents
        $allDocuments = array_merge($existingDocuments, $uploadedFiles);
        
        $oldStatus = $iinSingleBlockholder->status;
        
        // Determine which field to update based on stage
        if ($isStage2) {
            $updateData = [
                'payment_documents_stage_2' => $allDocuments,
                'payment_documents_uploaded_at_stage_2' => now()
            ];
        } else {
            $updateData = [
                'payment_documents' => $allDocuments,
                'payment_documents_uploaded_at' => now()
            ];
        }

        // Handle status change if upload_and_change_status is set
        if ($request->upload_and_change_status && $request->status) {
            $updateData['status'] = $request->status;
            if ($isStage2) {
                $updateData['payment_verified_at_stage_2'] = now();
            } else {
                $updateData['payment_verified_at'] = now();
            }
        }

        return DB::transaction(function () use ($iinSingleBlockholder, $updateData, $uploadedFiles, $oldStatus, $request, $isStage2) {
            $iinSingleBlockholder->update($updateData);

            // Log activity
            $stageText = $isStage2 ? ' tahap 2' : '';
            $logNotes = 'Admin mengupload dokumen pembayaran' . $stageText . ' (' . count($uploadedFiles) . ' file)';
            if ($request->upload_and_change_status && $request->status) {
                $logNotes .= ' dan mengubah status ke ' . $request->status;
                if ($request->notes) {
                    $logNotes .= '. ' . $request->notes;
                }
            }

            IinStatusLog::create([
                'application_type' => 'single_blockholder',
                'application_id' => $iinSingleBlockholder->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => $request->upload_and_change_status && $request->status ? $request->status : $oldStatus,
                'notes' => $logNotes
            ]);

            // Refresh the model to get updated data
            $iinSingleBlockholder->refresh();

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => count($uploadedFiles) . ' dokumen pembayaran' . $stageText . ' berhasil diupload' . 
                        ($request->upload_and_change_status && $request->status ? ' dan status diubah ke ' . $request->status : ''),
                    'application' => $iinSingleBlockholder
                ]);
            }

            return back()->with('success', count($uploadedFiles) . ' dokumen pembayaran' . $stageText . ' berhasil diupload' . 
                ($request->upload_and_change_status && $request->status ? ' dan status diubah ke ' . $request->status : ''));
        });
    }

    public function uploadFieldVerificationDocuments(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $request->validate([
            'field_verification_documents.*' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        return DB::transaction(function () use ($request, $iinSingleBlockholder) {
            $uploadedFiles = [];
            $existingDocuments = $iinSingleBlockholder->field_verification_documents ?? [];

            if ($request->hasFile('field_verification_documents')) {
                foreach ($request->file('field_verification_documents') as $file) {
                    $filename = $iinSingleBlockholder->application_number . '_' . time() . '_' . uniqid() . '_field_verification.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('iin-single-blockholder/field-verification', $filename, 'public');
                    
                    $uploadedFiles[] = [
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'uploaded_at' => now()->toISOString()
                    ];
                }
            }

            // Merge with existing documents
            $allDocuments = array_merge($existingDocuments, $uploadedFiles);
            
            $oldStatus = $iinSingleBlockholder->status;
            
            $iinSingleBlockholder->update([
                'field_verification_documents' => $allDocuments,
                'status' => 'verifikasi-lapangan',
                'field_verification_documents_uploaded_at' => now()
            ]);

            // Log activity
            IinStatusLog::create([
                'application_type' => 'single_blockholder',
                'application_id' => $iinSingleBlockholder->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => 'verifikasi-lapangan',
                'notes' => 'Admin mengupload dokumen verifikasi lapangan (' . count($uploadedFiles) . ' file) dan mengubah status ke verifikasi lapangan'
            ]);

            return back()->with('success', count($uploadedFiles) . ' dokumen verifikasi lapangan berhasil diupload');
        });
    }

    public function downloadFile(IinSingleBlockholderApplication $iinSingleBlockholder, string $type)
    {
        $path = match ($type) {
            'application_form' => $iinSingleBlockholder->application_form_path,
            'requirements_archive' => $iinSingleBlockholder->requirements_archive_path,
            'certificate' => $iinSingleBlockholder->certificate_path,
            'qris' => $iinSingleBlockholder->additional_documents,
            default => null
        };

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan');
        }

        return Storage::disk('public')->download($path);
    }

    public function downloadPaymentDocument(IinSingleBlockholderApplication $iinSingleBlockholder, int $index)
    {
        $documents = $iinSingleBlockholder->payment_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'payment_document.pdf'
        );
    }

    public function downloadPaymentProof(IinSingleBlockholderApplication $iinSingleBlockholder, int $index)
    {
        $proofs = $iinSingleBlockholder->payment_proof_documents ?? [];
        
        if (!isset($proofs[$index]) || !Storage::disk('public')->exists($proofs[$index]['path'])) {
            abort(404, 'Bukti pembayaran tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $proofs[$index]['path'],
            $proofs[$index]['original_name'] ?? 'payment_proof.pdf'
        );
    }

    public function downloadFieldVerificationDocument(IinSingleBlockholderApplication $iinSingleBlockholder, int $index)
    {
        $documents = $iinSingleBlockholder->field_verification_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen verifikasi lapangan tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'field_verification_document.pdf'
        );
    }

    public function downloadAdditionalDocument(IinSingleBlockholderApplication $iinSingleBlockholder, int $index)
    {
        $documents = $iinSingleBlockholder->additional_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tambahan tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'additional_document.pdf'
        );
    }
}
