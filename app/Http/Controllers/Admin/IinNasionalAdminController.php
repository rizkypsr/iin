<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\IinNasionalApplication;
use App\Models\IinStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class IinNasionalAdminController extends Controller
{
    public function index()
    {
        $applications = IinNasionalApplication::with(['user', 'admin'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('Admin/IinNasional/Index', [
            'applications' => $applications
        ]);
    }

    public function show(IinNasionalApplication $iinNasional)
    {
        $iinNasional->load(['user', 'admin']);

        // Get status logs using polymorphic relationship
        $statusLogs = IinStatusLog::where('application_type', 'nasional')
            ->where('application_id', $iinNasional->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Admin/IinNasional/Show', [
            'application' => array_merge($iinNasional->toArray(), [
                'can_upload_payment_proof' => false, // Admin doesn't upload payment proof
                'can_download_certificate' => $iinNasional->certificate_path && Storage::disk('public')->exists($iinNasional->certificate_path),
                'can_upload_certificate' => in_array($iinNasional->status, ['verifikasi-lapangan', 'terbit']),
            ]),
            'statusLogs' => $statusLogs
        ]);
    }

    public function updateStatus(Request $request, IinNasionalApplication $iinNasional)
    {
        $request->validate([
            'status' => 'required|in:pengajuan,perbaikan,pembayaran,verifikasi-lapangan,pembayaran-tahap-2,menunggu-terbit,terbit',
            'notes' => 'nullable|string',
            'iin_number' => 'nullable|string|max:20',
            'iin_block_range' => 'nullable|array',
            'field_verification_completed' => 'nullable|boolean',
        ]);

        $oldStatus = $iinNasional->status;
        $newStatus = $request->status;

        // Handle field verification completion
        $fieldVerificationAt = $iinNasional->field_verification_at;
        if ($request->field_verification_completed && $newStatus === 'verifikasi-lapangan') {
            // When admin completes field verification, move to pembayaran-tahap-2
            $newStatus = 'pembayaran-tahap-2';
            $fieldVerificationAt = now();
        } elseif ($newStatus === 'terbit') {
            $fieldVerificationAt = $fieldVerificationAt ?: now();
        }

        // Update application
        $iinNasional->update([
            'status' => $newStatus,
            'notes' => $request->notes,
            'iin_number' => $request->iin_number,
            'iin_block_range' => $request->iin_block_range,
            'admin_id' => in_array($newStatus, ['perbaikan', 'pembayaran', 'verifikasi-lapangan', 'pembayaran-tahap-2', 'menunggu-terbit', 'terbit']) ? Auth::id() : $iinNasional->admin_id,
            'payment_verified_at' => ($oldStatus === 'pembayaran' && $newStatus === 'verifikasi-lapangan') ? now() : $iinNasional->payment_verified_at,
            'payment_verified_at_stage_2' => ($oldStatus === 'pembayaran-tahap-2' && $newStatus === 'menunggu-terbit') ? now() : $iinNasional->payment_verified_at_stage_2,
            'field_verification_at' => $fieldVerificationAt,
            'issued_at' => $newStatus === 'terbit' ? now() : $iinNasional->issued_at,
        ]);

        // Log status change
        IinStatusLog::create([
            'application_type' => 'nasional',
            'application_id' => $iinNasional->id,
            'user_id' => Auth::id(),
            'status_from' => $oldStatus,
            'status_to' => $newStatus,
            'notes' => $request->notes
        ]);

        return back()->with('success', 'Status aplikasi berhasil diperbarui');
    }

    public function uploadCertificate(Request $request, IinNasionalApplication $iinNasional)
    {
        $request->validate([
            'certificate' => 'required|file|mimes:pdf|max:10240',
            'notes' => 'nullable|string'
        ]);

        $oldStatus = $iinNasional->status;

        if ($request->hasFile('certificate')) {
            // Delete old certificate if exists
            if ($iinNasional->certificate_path && Storage::disk('public')->exists($iinNasional->certificate_path)) {
                Storage::disk('public')->delete($iinNasional->certificate_path);
            }

            $file = $request->file('certificate');
            $filename = $iinNasional->application_number . '_' . time() . '_certificate.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('iin-nasional/certificates', $filename, 'public');
            
            // Update application with certificate and change status to 'terbit'
            $iinNasional->update([
                'certificate_path' => $path,
                'certificate_uploaded_at' => now(),
                'status' => 'terbit',
                'field_verification_at' => $iinNasional->field_verification_at ?: now(),
                'issued_at' => now(),
                'admin_id' => Auth::id()
            ]);

            // Log status change
            IinStatusLog::create([
                'application_type' => 'nasional',
                'application_id' => $iinNasional->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => 'terbit',
                'notes' => $request->notes ?: 'IIN diterbitkan dengan upload sertifikat'
            ]);
        }

        return back()->with('success', 'IIN berhasil diterbitkan dan sertifikat diupload');
    }

    public function uploadPaymentDocuments(Request $request, IinNasionalApplication $iinNasional)
    {
        $request->validate([
            'payment_documents.*' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $uploadedFiles = [];
        $existingDocuments = $iinNasional->payment_documents ?? [];

        if ($request->hasFile('payment_documents')) {
            foreach ($request->file('payment_documents') as $file) {
                $filename = $iinNasional->application_number . '_' . time() . '_' . uniqid() . '_payment_doc.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('iin-nasional/payment-documents', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString()
                ];
            }
        }

        // Merge with existing documents
        $allDocuments = array_merge($existingDocuments, $uploadedFiles);
        
        $iinNasional->update([
            'payment_documents' => $allDocuments
        ]);

        // Log activity
        IinStatusLog::create([
            'application_type' => 'nasional',
            'application_id' => $iinNasional->id,
            'user_id' => Auth::id(),
            'status_from' => null,
            'status_to' => null,
            'notes' => 'Admin mengupload dokumen pembayaran (' . count($uploadedFiles) . ' file)'
        ]);

        return back()->with('success', count($uploadedFiles) . ' dokumen pembayaran berhasil diupload');
    }

    public function uploadFieldVerificationDocuments(Request $request, IinNasionalApplication $iinNasional)
    {
        $request->validate([
            'field_verification_documents.*' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'certificate' => 'nullable|file|mimes:pdf|max:10240',
            'notes' => 'nullable|string',
            'complete_verification' => 'nullable|boolean'
        ]);

        $uploadedFiles = [];
        $existingDocuments = $iinNasional->field_verification_documents ?? [];
        $oldStatus = $iinNasional->status;

        if ($request->hasFile('field_verification_documents')) {
            foreach ($request->file('field_verification_documents') as $file) {
                $filename = $iinNasional->application_number . '_' . time() . '_' . uniqid() . '_field_verification.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('iin-nasional/field-verification', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString()
                ];
            }
        }

        // Merge with existing documents
        $allDocuments = array_merge($existingDocuments, $uploadedFiles);
        
        $updateData = [
            'field_verification_documents' => $allDocuments
        ];

        // If completing verification with certificate upload
        if ($request->complete_verification && $request->hasFile('certificate')) {
            // Delete old certificate if exists
            if ($iinNasional->certificate_path && Storage::disk('public')->exists($iinNasional->certificate_path)) {
                Storage::disk('public')->delete($iinNasional->certificate_path);
            }

            $certificateFile = $request->file('certificate');
            $certificateFilename = $iinNasional->application_number . '_' . time() . '_certificate.' . $certificateFile->getClientOriginalExtension();
            $certificatePath = $certificateFile->storeAs('iin-nasional/certificates', $certificateFilename, 'public');
            
            $updateData = array_merge($updateData, [
                'certificate_path' => $certificatePath,
                'certificate_uploaded_at' => now(),
                'status' => 'terbit',
                'field_verification_at' => now(),
                'issued_at' => now(),
                'admin_id' => Auth::id()
            ]);
        }
        
        $iinNasional->update($updateData);

        // Log field verification documents upload
        if (count($uploadedFiles) > 0) {
            IinStatusLog::create([
                'application_type' => 'nasional',
                'application_id' => $iinNasional->id,
                'user_id' => Auth::id(),
                'status_from' => null,
                'status_to' => null,
                'notes' => 'Admin mengupload dokumen verifikasi lapangan (' . count($uploadedFiles) . ' file)'
            ]);
        }

        // Log status change if verification completed with certificate
        if ($request->complete_verification && $request->hasFile('certificate')) {
            IinStatusLog::create([
                'application_type' => 'nasional',
                'application_id' => $iinNasional->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => 'terbit',
                'notes' => $request->notes ?: 'Verifikasi lapangan selesai dan IIN diterbitkan dengan upload sertifikat'
            ]);
        }

        $message = count($uploadedFiles) . ' dokumen verifikasi lapangan berhasil diupload';
        if ($request->complete_verification && $request->hasFile('certificate')) {
            $message .= ' dan IIN berhasil diterbitkan';
        }

        return back()->with('success', $message);
    }

    public function downloadFile(IinNasionalApplication $iinNasional, string $type)
    {
        $path = match ($type) {
            'application_form' => $iinNasional->application_form_path,
            'requirements_archive' => $iinNasional->requirements_archive_path,
            'certificate' => $iinNasional->certificate_path,
            default => null
        };

        if (!$path || !Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan');
        }

        return Storage::disk('public')->download($path);
    }

    public function downloadPaymentDocument(IinNasionalApplication $iinNasional, int $index)
    {
        $documents = $iinNasional->payment_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'payment_document.pdf'
        );
    }

    public function downloadPaymentProof(IinNasionalApplication $iinNasional, int $index)
    {
        $proofs = $iinNasional->payment_proof_documents ?? [];
        
        if (!isset($proofs[$index]) || !Storage::disk('public')->exists($proofs[$index]['path'])) {
            abort(404, 'Bukti pembayaran tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $proofs[$index]['path'],
            $proofs[$index]['original_name'] ?? 'payment_proof.pdf'
        );
    }

    public function downloadFieldVerificationDocument(IinNasionalApplication $iinNasional, int $index)
    {
        $documents = $iinNasional->field_verification_documents ?? [];
        
        if (!isset($documents[$index]) || !Storage::disk('public')->exists($documents[$index]['path'])) {
            abort(404, 'Dokumen verifikasi lapangan tidak ditemukan');
        }

        return Storage::disk('public')->download(
            $documents[$index]['path'],
            $documents[$index]['original_name'] ?? 'field_verification_document.pdf'
        );
    }
}