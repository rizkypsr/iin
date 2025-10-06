<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PengawasanSingleIin;
use App\Models\PengawasanSingleIinStatusLog;
use App\Models\IinStatusLog;
use App\Services\ApplicationCountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PengawasanSingleIinAdminController extends Controller
{
    public function index()
    {
        $applications = PengawasanSingleIin::with(['user', 'admin', 'singleIinProfile'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();


        return Inertia::render('admin/PengawasanSingleIin/Index', [
            'applications' => $applications,
            'application_counts' => $applicationCounts
        ]);
    }

    public function show(PengawasanSingleIin $pengawasanSingleIin)
    {
        $pengawasanSingleIin->load(['user', 'admin', 'singleIinProfile']);

        // Get status logs
        $statusLogs = PengawasanSingleIinStatusLog::where('pengawasan_single_iin_id', $pengawasanSingleIin->id)
            ->with('changedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/PengawasanSingleIin/Show', [
            'application' => $pengawasanSingleIin,
            'statusLogs' => $statusLogs
        ]);
    }

    public function updateStatus(Request $request, PengawasanSingleIin $pengawasanSingleIin)
    {
        $request->validate([
            'status' => 'required|in:pengajuan,pembayaran,verifikasi-lapangan,menunggu-terbit,terbit',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $pengawasanSingleIin) {
            $oldStatus = $pengawasanSingleIin->status;
            $newStatus = $request->status;

            // Update application
            $pengawasanSingleIin->update([
                'status' => $newStatus,
                'notes' => $request->notes,
                'admin_id' => in_array($newStatus, ['pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit']) ? Auth::id() : $pengawasanSingleIin->admin_id,
                'payment_verified_at' => ($oldStatus === 'pembayaran' && $newStatus === 'verifikasi-lapangan') ? now() : $pengawasanSingleIin->payment_verified_at,
                'field_verification_at' => ($oldStatus === 'verifikasi-lapangan' && $newStatus === 'menunggu-terbit') ? now() : $pengawasanSingleIin->field_verification_at,
                'issued_at' => $newStatus === 'terbit' ? now() : $pengawasanSingleIin->issued_at,
            ]);

            // Log status change using new status log system
            $this->logStatusChange($pengawasanSingleIin, $oldStatus, $newStatus, $request->notes);

            return back()->with('success', 'Status aplikasi berhasil diperbarui');
        });
    }

    public function uploadPaymentDocuments(Request $request, PengawasanSingleIin $pengawasanSingleIin)
    {
        $request->validate([
            'payment_documents.*' => 'required|file|max:10240',
            'status' => 'nullable|in:pembayaran,pembayaran-tahap-2',
        ]);

        if (!$request->hasFile('payment_documents')) {
            return back()->withErrors(['payment_documents' => 'Silakan pilih file dokumen pembayaran']);
        }

        return DB::transaction(function () use ($request, $pengawasanSingleIin) {
            $oldStatus = $pengawasanSingleIin->status;
            $uploadedFiles = [];
            $isStage2 = $request->status === 'pembayaran-tahap-2';

            foreach ($request->file('payment_documents') as $file) {
                $stagePrefix = $isStage2 ? 'payment_stage2_' : 'payment_';
                $filename = $pengawasanSingleIin->application_number . '_' . time() . '_' . $stagePrefix . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('pengawasan-single-iin/payment', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }

            // Determine which fields to update based on stage
            if ($isStage2) {
                // Get existing stage 2 documents and merge with new ones
                $existingDocuments = $pengawasanSingleIin->payment_documents_stage_2 ?? [];
                $allDocuments = array_merge($existingDocuments, $uploadedFiles);

                $updateData = [
                    'payment_documents_stage_2' => $allDocuments,
                    'payment_documents_uploaded_at_stage_2' => now()
                ];
            } else {
                // Get existing stage 1 documents and merge with new ones
                $existingDocuments = $pengawasanSingleIin->payment_documents ?? [];
                $allDocuments = array_merge($existingDocuments, $uploadedFiles);

                $updateData = [
                    'payment_documents' => $allDocuments,
                    'payment_documents_uploaded_at' => now()
                ];
            }

            $updateData['status'] = $request->status;
            $updateData['admin_id'] = Auth::id();

            $pengawasanSingleIin->update($updateData);

            // Log activity
            $stageText = $isStage2 ? ' tahap 2' : '';
            $logNotes = 'Admin mengupload dokumen pembayaran' . $stageText . ' (' . count($uploadedFiles) . ' file)';
            if ($request->status) {
                $logNotes .= ' dan mengubah status ke ' . $request->status;
            }

            // Log activity using new status log system
            $this->logStatusChange(
                $pengawasanSingleIin, 
                $oldStatus, 
                $request->status ? $request->status : $oldStatus, 
                $logNotes
            );

            $successMessage = count($uploadedFiles) . ' dokumen pembayaran' . $stageText . ' berhasil diupload';
            if ($request->status) {
                $successMessage .= ' dan status diubah ke ' . $request->status;
            }

            return back()->with('success', $successMessage);
        });
    }

    public function uploadFieldVerificationDocuments(Request $request, PengawasanSingleIin $pengawasanSingleIin)
    {
        $request->validate([
            'field_verification_documents.*' => 'required|file|max:10240',
            'status' => 'nullable|in:verifikasi-lapangan',
            'notes' => 'nullable|string',
        ]);

        if (!$request->hasFile('field_verification_documents')) {
            return back()->withErrors(['field_verification_documents' => 'Silakan pilih file dokumen verifikasi lapangan']);
        }

        return DB::transaction(function () use ($request, $pengawasanSingleIin) {
            $oldStatus = $pengawasanSingleIin->status;
            $uploadedFiles = [];

            foreach ($request->file('field_verification_documents') as $file) {
                $filename = $pengawasanSingleIin->application_number . '_' . time() . '_field_verification_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('pengawasan-single-iin/field-verification', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }

            // Get existing documents and merge with new ones
            $existingDocuments = $pengawasanSingleIin->field_verification_documents ?? [];
            $allDocuments = array_merge($existingDocuments, $uploadedFiles);

            $updateData = [
                'field_verification_documents' => $allDocuments,
                'field_verification_documents_uploaded_at' => now()
            ];

            // Change status if requested
            $updateData['status'] = $request->status;
            $updateData['admin_id'] = Auth::id();
            $updateData['payment_verified_at'] = now();

            $pengawasanSingleIin->update($updateData);

            // Log activity
            $logNotes = 'Admin mengupload dokumen verifikasi lapangan (' . count($uploadedFiles) . ' file)';
            if ($request->upload_and_change_status && $request->status) {
                $logNotes .= ' dan mengubah status ke ' . $request->status;
            }
            if ($request->notes) {
                $logNotes .= '. Catatan: ' . $request->notes;
            }

            // Log activity using new status log system
            $this->logStatusChange(
                $pengawasanSingleIin, 
                $oldStatus, 
                $request->upload_and_change_status && $request->status ? $request->status : $oldStatus, 
                $logNotes
            );

            return back()->with('success', count($uploadedFiles) . ' dokumen verifikasi lapangan berhasil diupload' . 
                ($request->upload_and_change_status && $request->status ? ' dan status diubah ke ' . $request->status : ''));
        });
    }

    public function completeFieldVerification(Request $request, PengawasanSingleIin $pengawasanSingleIin)
    {
        $request->validate([
            'field_verification_documents.*' => 'nullable|file|max:10240',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $pengawasanSingleIin) {
            $oldStatus = $pengawasanSingleIin->status;
            $uploadedFiles = [];

            // Handle file uploads if provided
            if ($request->hasFile('field_verification_documents')) {
                foreach ($request->file('field_verification_documents') as $file) {
                    $filename = $pengawasanSingleIin->application_number . '_' . time() . '_field_verification_complete_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    $path = $file->storeAs('pengawasan-single-iin/field-verification', $filename, 'public');
                    
                    $uploadedFiles[] = [
                        'path' => $path,
                        'original_name' => $file->getClientOriginalName(),
                        'uploaded_at' => now()->toISOString(),
                    ];
                }

                // Get existing documents and merge with new ones
                $existingDocuments = $pengawasanSingleIin->field_verification_documents ?? [];
                $allDocuments = array_merge($existingDocuments, $uploadedFiles);
            } else {
                $allDocuments = $pengawasanSingleIin->field_verification_documents ?? [];
            }

            // Update application status to 'menunggu-terbit'
            $pengawasanSingleIin->update([
                'field_verification_documents' => $allDocuments,
                'status' => 'menunggu-terbit',
                'admin_id' => Auth::id(),
                'field_verification_at' => now(),
                'field_verification_documents_uploaded_at' => count($uploadedFiles) > 0 ? now() : $pengawasanSingleIin->field_verification_documents_uploaded_at,
            ]);

            // Log activity
            $logNotes = 'Admin menyelesaikan verifikasi lapangan';
            if (count($uploadedFiles) > 0) {
                $logNotes .= ' dan mengupload dokumen tambahan (' . count($uploadedFiles) . ' file)';
            }
            if ($request->notes) {
                $logNotes .= '. Catatan: ' . $request->notes;
            }

            // Log activity using new status log system
            $this->logStatusChange(
                $pengawasanSingleIin, 
                $oldStatus, 
                'menunggu-terbit', 
                $logNotes
            );

            $message = 'Verifikasi lapangan berhasil diselesaikan';
            if (count($uploadedFiles) > 0) {
                $message .= ' dengan ' . count($uploadedFiles) . ' dokumen tambahan';
            }

            return back()->with('success', $message);
        });
    }

    public function uploadPaymentDocumentsStage2(Request $request, PengawasanSingleIin $pengawasanSingleIin)
    {
        $request->validate([
            'payment_documents.*' => 'required|file|max:10240',
            'notes' => 'nullable|string',
        ]);

        if (!$request->hasFile('payment_documents')) {
            return back()->withErrors(['payment_documents' => 'Silakan pilih file dokumen pembayaran tahap 2']);
        }

        return DB::transaction(function () use ($request, $pengawasanSingleIin) {
            $oldStatus = $pengawasanSingleIin->status;
            $uploadedFiles = [];

            foreach ($request->file('payment_documents') as $file) {
                $filename = $pengawasanSingleIin->application_number . '_' . time() . '_payment_stage2_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('pengawasan-single-iin/payment-stage2', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }

            // Get existing stage 2 documents and merge with new ones
            $existingDocuments = $pengawasanSingleIin->payment_documents_stage_2 ?? [];
            $allDocuments = array_merge($existingDocuments, $uploadedFiles);

            // Update application with stage 2 payment documents and change status
            $pengawasanSingleIin->update([
                'payment_documents_stage_2' => $allDocuments,
                'payment_documents_uploaded_at_stage_2' => now(),
                'status' => 'pembayaran-tahap-2',
                'admin_id' => Auth::id(),
            ]);

            // Log activity
            $logNotes = 'Admin mengupload dokumen pembayaran tahap 2 (' . count($uploadedFiles) . ' file) dan mengubah status ke pembayaran tahap 2';
            if ($request->notes) {
                $logNotes .= '. Catatan: ' . $request->notes;
            }

            // Log activity using new status log system
            $this->logStatusChange(
                $pengawasanSingleIin, 
                $oldStatus, 
                'pembayaran-tahap-2', 
                $logNotes
            );

            return back()->with('success', count($uploadedFiles) . ' dokumen pembayaran tahap 2 berhasil diupload dan status diubah ke pembayaran tahap 2');
        });
    }

    public function uploadIssuanceDocuments(Request $request, PengawasanSingleIin $pengawasanSingleIin)
    {
        $request->validate([
            'issuance_documents.*' => 'required|file|max:10240',
            'notes' => 'nullable|string|max:1000',
        ]);

        if (!$request->hasFile('issuance_documents')) {
            return back()->withErrors(['issuance_documents' => 'Silakan pilih file dokumen penerbitan']);
        }

        return DB::transaction(function () use ($request, $pengawasanSingleIin) {
            $uploadedFiles = [];

            foreach ($request->file('issuance_documents') as $file) {
                $filename = $pengawasanSingleIin->application_number . '_' . time() . '_issuance_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('pengawasan-single-iin/issuance', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }

            // Update application with issuance documents and status
            $pengawasanSingleIin->update([
                'issuance_documents' => $uploadedFiles,
                'issuance_documents_uploaded_at' => now(),
                'status' => 'terbit',
                'issued_at' => now(),
                'notes' => $request->notes,
                'payment_verified_at_stage_2' => now(),
            ]);

            // Log status change using new status log system
            $this->logStatusChange(
                $pengawasanSingleIin, 
                'pembayaran-tahap-2', 
                'terbit', 
                $request->notes ?: 'Dokumen penerbitan berhasil diupload'
            );

            return back()->with('success', 'Dokumen penerbitan berhasil diupload');
        });
    }

    public function downloadFile(PengawasanSingleIin $pengawasanSingleIin, string $type)
    {
        $path = match ($type) {
            'agreement' => $pengawasanSingleIin->agreement_path,
            default => null
        };

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan');
        }

        return Storage::disk('public')->download($path);
    }

    public function downloadPaymentDocument(PengawasanSingleIin $pengawasanSingleIin, int $index)
    {
        $documents = $pengawasanSingleIin->payment_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'payment_document.pdf'
        );
    }

    public function downloadPaymentDocumentStage2(PengawasanSingleIin $pengawasanSingleIin, int $index)
    {
        $documents = $pengawasanSingleIin->payment_documents_stage_2 ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'payment_document_stage_2.pdf'
        );
    }

    public function downloadPaymentProofDocument(PengawasanSingleIin $pengawasanSingleIin, int $index)
    {
        $documents = $pengawasanSingleIin->payment_proof_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'payment_proof_document.pdf'
        );
    }

    public function downloadPaymentProof(PengawasanSingleIin $pengawasanSingleIin, int $index)
    {
        $documents = $pengawasanSingleIin->payment_proof_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'payment_proof_document.pdf'
        );
    }

    public function downloadPaymentProofDocumentStage2(PengawasanSingleIin $pengawasanSingleIin, int $index)
    {
        $documents = $pengawasanSingleIin->payment_proof_documents_stage_2 ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'payment_proof_document_stage_2.pdf'
        );
    }

    public function downloadPaymentProofStage2(PengawasanSingleIin $pengawasanSingleIin, int $index)
    {
        $documents = $pengawasanSingleIin->payment_proof_documents_stage_2 ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'payment_proof_document_stage_2.pdf'
        );
    }

    public function downloadFieldVerificationDocument(PengawasanSingleIin $pengawasanSingleIin, int $index)
    {
        $documents = $pengawasanSingleIin->field_verification_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'field_verification_document.pdf'
        );
    }

    public function downloadIssuanceDocument(PengawasanSingleIin $pengawasanSingleIin, int $index)
    {
        $documents = $pengawasanSingleIin->issuance_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'issuance_document.pdf'
        );
    }

    /**
     * Log status changes for pengawasan single IIN applications
     */
    private function logStatusChange(PengawasanSingleIin $pengawasan, ?string $statusFrom, ?string $statusTo, ?string $notes): void
    {
        PengawasanSingleIinStatusLog::create([
            'pengawasan_single_iin_id' => $pengawasan->id,
            'status_from' => $statusFrom,
            'status_to' => $statusTo,
            'notes' => $notes,
            'changed_by' => Auth::id(),
        ]);
    }
}