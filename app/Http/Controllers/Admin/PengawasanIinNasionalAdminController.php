<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PengawasanIinNasional;
use App\Models\PengawasanIinNasionalStatusLog;
use App\Services\ApplicationCountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PengawasanIinNasionalAdminController extends Controller
{
    public function index()
    {
        $applications = PengawasanIinNasional::with(['user', 'admin', 'iinNasionalProfile'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/PengawasanIinNasional/Index', [
            'applications' => $applications,
            'application_counts' => $applicationCounts
        ]);
    }

    public function show(PengawasanIinNasional $pengawasanIinNasional)
    {
        $pengawasanIinNasional->load(['user', 'admin', 'iinNasionalProfile']);

        // Get status logs using the new dedicated status log model
        $statusLogs = PengawasanIinNasionalStatusLog::where('pengawasan_iin_nasional_id', $pengawasanIinNasional->id)
            ->with('changedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('admin/PengawasanIinNasional/Show', [
            'application' => $pengawasanIinNasional,
            'statusLogs' => $statusLogs
        ]);
    }

    public function updateStatus(Request $request, PengawasanIinNasional $pengawasanIinNasional)
    {
        $request->validate([
            'status' => 'required|in:pengajuan,pembayaran,verifikasi-lapangan,menunggu-terbit,terbit',
            'notes' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $pengawasanIinNasional) {
            $oldStatus = $pengawasanIinNasional->status;
            $newStatus = $request->status;

            // Update application
            $pengawasanIinNasional->update([
                'status' => $newStatus,
                'notes' => $request->notes,
                'admin_id' => in_array($newStatus, ['pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit']) ? Auth::id() : $pengawasanIinNasional->admin_id,
                'payment_verified_at' => ($oldStatus === 'pembayaran' && $newStatus === 'verifikasi-lapangan') ? now() : $pengawasanIinNasional->payment_verified_at,
                'field_verification_at' => ($oldStatus === 'verifikasi-lapangan' && $newStatus === 'menunggu-terbit') ? now() : $pengawasanIinNasional->field_verification_at,
                'issued_at' => $newStatus === 'terbit' ? now() : $pengawasanIinNasional->issued_at,
            ]);

            // Log status change
            PengawasanIinNasionalStatusLog::create([
                'pengawasan_iin_nasional_id' => $pengawasanIinNasional->id,
                'status_from' => $oldStatus,
                'status_to' => $newStatus,
                'notes' => $request->notes,
                'changed_by' => Auth::id(),
            ]);

            return back()->with('success', 'Status aplikasi berhasil diperbarui');
        });
    }

    public function uploadPaymentDocuments(Request $request, PengawasanIinNasional $pengawasanIinNasional)
    {
        $request->validate([
            'payment_documents.*' => 'required|file|max:10240',
            'upload_and_change_status' => 'nullable|boolean',
            'status' => 'nullable|in:pembayaran',
        ]);

        if (!$request->hasFile('payment_documents')) {
            return back()->withErrors(['payment_documents' => 'Silakan pilih file dokumen pembayaran']);
        }

        return DB::transaction(function () use ($request, $pengawasanIinNasional) {
            $oldStatus = $pengawasanIinNasional->status;
            $uploadedFiles = [];

            foreach ($request->file('payment_documents') as $file) {
                $filename = $pengawasanIinNasional->application_number . '_' . time() . '_payment_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('pengawasan-iin-nasional/payment', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }

            // Get existing documents and merge with new ones
            $existingDocuments = $pengawasanIinNasional->payment_documents ?? [];
            $allDocuments = array_merge($existingDocuments, $uploadedFiles);

            $updateData = [
                'payment_documents' => $allDocuments,
                'payment_documents_uploaded_at' => now()
            ];

            // Change status if requested
            if ($request->upload_and_change_status && $request->status) {
                $updateData['status'] = $request->status;
                $updateData['admin_id'] = Auth::id();
            }

            $pengawasanIinNasional->update($updateData);

            // Log activity
            $logNotes = 'Admin mengupload dokumen pembayaran (' . count($uploadedFiles) . ' file)';
            if ($request->upload_and_change_status && $request->status) {
                $logNotes .= ' dan mengubah status ke ' . $request->status;
            }

            PengawasanIinNasionalStatusLog::create([
                'pengawasan_iin_nasional_id' => $pengawasanIinNasional->id,
                'status_from' => $oldStatus,
                'status_to' => $request->upload_and_change_status && $request->status ? $request->status : $oldStatus,
                'notes' => $logNotes,
                'changed_by' => Auth::id(),
            ]);

            return back()->with('success', count($uploadedFiles) . ' dokumen pembayaran berhasil diupload' . 
                ($request->upload_and_change_status && $request->status ? ' dan status diubah ke ' . $request->status : ''));
        });
    }

    public function uploadFieldVerificationDocuments(Request $request, PengawasanIinNasional $pengawasanIinNasional)
    {
        $request->validate([
            'field_verification_documents.*' => 'required|file|max:10240',
        ]);

        if (!$request->hasFile('field_verification_documents')) {
            return back()->withErrors(['field_verification_documents' => 'Silakan pilih file dokumen verifikasi lapangan']);
        }

        return DB::transaction(function () use ($request, $pengawasanIinNasional) {
            $oldStatus = $pengawasanIinNasional->status;
            $uploadedFiles = [];

            foreach ($request->file('field_verification_documents') as $file) {
                $filename = $pengawasanIinNasional->application_number . '_' . time() . '_field_verification_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('pengawasan-iin-nasional/field-verification', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }

            // Get existing documents and merge with new ones
            $existingDocuments = $pengawasanIinNasional->field_verification_documents ?? [];
            $allDocuments = array_merge($existingDocuments, $uploadedFiles);

            $pengawasanIinNasional->update([
                'field_verification_documents' => $allDocuments,
                'status' => 'verifikasi-lapangan',
                'field_verification_documents_uploaded_at' => now()
            ]);

            // Log activity
            PengawasanIinNasionalStatusLog::create([
                'pengawasan_iin_nasional_id' => $pengawasanIinNasional->id,
                'status_from' => $oldStatus,
                'status_to' => 'verifikasi-lapangan',
                'notes' => 'Admin mengupload dokumen verifikasi lapangan (' . count($uploadedFiles) . ' file) dan mengubah status ke verifikasi lapangan',
                'changed_by' => Auth::id(),
            ]);

            return back()->with('success', count($uploadedFiles) . ' dokumen verifikasi lapangan berhasil diupload');
        });
    }

    public function uploadIssuanceDocuments(Request $request, PengawasanIinNasional $pengawasanIinNasional)
    {
        $request->validate([
            'issuance_documents.*' => 'required|file|max:10240',
            'notes' => 'nullable|string|max:1000',
        ]);

        if (!$request->hasFile('issuance_documents')) {
            return back()->withErrors(['issuance_documents' => 'Silakan pilih file dokumen penerbitan']);
        }

        return DB::transaction(function () use ($request, $pengawasanIinNasional) {
            $uploadedFiles = [];

            foreach ($request->file('issuance_documents') as $file) {
                $filename = $pengawasanIinNasional->application_number . '_' . time() . '_issuance_' . uniqid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('pengawasan-iin-nasional/issuance', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }

            // Update application with issuance documents and status
            $pengawasanIinNasional->update([
                'issuance_documents' => $uploadedFiles,
                'issuance_documents_uploaded_at' => now(),
                'status' => 'terbit',
                'issued_at' => now(),
                'notes' => $request->notes
            ]);

            // Log status change
            PengawasanIinNasionalStatusLog::create([
                'pengawasan_iin_nasional_id' => $pengawasanIinNasional->id,
                'status_from' => 'menunggu-terbit',
                'status_to' => 'terbit',
                'notes' => $request->notes ?: 'Dokumen penerbitan berhasil diupload',
                'changed_by' => Auth::id(),
            ]);

            return back()->with('success', 'Dokumen penerbitan berhasil diupload');
        });
    }

    public function downloadFile(PengawasanIinNasional $pengawasanIinNasional, string $type)
    {
        $path = match ($type) {
            'agreement' => $pengawasanIinNasional->agreement_path,
            'qris' => $pengawasanIinNasional->additional_documents,
            default => null
        };

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan');
        }

        return Storage::disk('public')->download($path);
    }

    public function downloadPaymentDocument(PengawasanIinNasional $pengawasanIinNasional, int $index)
    {
        $documents = $pengawasanIinNasional->payment_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'payment_document.pdf'
        );
    }

    public function downloadPaymentProofDocument(PengawasanIinNasional $pengawasanIinNasional, int $index)
    {
        $documents = $pengawasanIinNasional->payment_proof_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'payment_proof_document.pdf'
        );
    }

    public function downloadPaymentProof(PengawasanIinNasional $pengawasanIinNasional, int $index)
    {
        $proofs = $pengawasanIinNasional->payment_proof_documents ?? [];
        
        if (!isset($proofs[$index]) || !Storage::disk('public')->exists($proofs[$index]['path'])) {
            abort(404, 'Bukti pembayaran tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $proofs[$index]['path'],
            $proofs[$index]['original_name'] ?? 'payment_proof.pdf'
        );
    }

    public function downloadFieldVerificationDocument(PengawasanIinNasional $pengawasanIinNasional, int $index)
    {
        $documents = $pengawasanIinNasional->field_verification_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'field_verification_document.pdf'
        );
    }

    public function downloadIssuanceDocument(PengawasanIinNasional $pengawasanIinNasional, int $index)
    {
        $documents = $pengawasanIinNasional->issuance_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'issuance_document.pdf'
        );
    }
}