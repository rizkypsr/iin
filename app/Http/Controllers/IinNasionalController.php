<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequirement;
use App\Models\IinNasionalApplication;
use App\Models\IinStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class IinNasionalController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        // Only show applications for the current user
        $applications = IinNasionalApplication::with(['user', 'admin'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('IinNasional/Index', [
            'applications' => $applications
        ]);
    }

    public function create()
    {
        $documentRequirements = DocumentRequirement::getIinNasionalRequirements();
        
        return Inertia::render('IinNasional/Create', [
            'documentRequirements' => $documentRequirements,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'application_form' => 'required|file|max:10240',
            'requirements_archive' => 'nullable|file|mimes:zip,rar|max:51200', // 50MB max for ZIP/RAR
        ]);

        $application = new IinNasionalApplication();
        $application->user_id = Auth::id();
        $application->submitted_at = now();
        
        // Save first to generate the application_number
        $application->save();
        
        // Handle file upload after generating application number
        if ($request->hasFile('application_form')) {
            $file = $request->file('application_form');
            $filename = $application->application_number . '_' . time() . '_form.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('iin-nasional', $filename, 'public');
            $application->application_form_path = $path;
        }

        // Handle requirements archive upload
        if ($request->hasFile('requirements_archive')) {
            $file = $request->file('requirements_archive');
            $filename = $application->application_number . '_' . time() . '_requirements.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('iin-nasional', $filename, 'public');
            $application->requirements_archive_path = $path;
        }

        $application->save(); // Save again with the file paths

        // Log status change
        IinStatusLog::create([
            'application_type' => 'nasional',
            'application_id' => $application->id,
            'user_id' => Auth::id(),
            'status_from' => null,
            'status_to' => 'pengajuan',
            'notes' => 'Aplikasi IIN Nasional diajukan'
        ]);

        return to_route('iin-nasional.index')->with('success', 'Aplikasi IIN Nasional berhasil diajukan');
    }

    public function show(IinNasionalApplication $iinNasional)
    {
        $this->authorize('view', $iinNasional);

        $iinNasional->load(['user', 'admin']);

        // Get status logs using polymorphic relationship
        $statusLogs = IinStatusLog::where('application_type', 'nasional')
            ->where('application_id', $iinNasional->id)
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('IinNasional/Show', [
            'application' => array_merge($iinNasional->toArray(), [
                'can_upload_payment_proof' => $iinNasional->status === 'pembayaran' && $iinNasional->user_id === Auth::id(),
                'can_download_certificate' => $iinNasional->certificate_path && Storage::disk('public')->exists($iinNasional->certificate_path),
                'can_upload_certificate' => Auth::user()->hasRole('admin') && in_array($iinNasional->status, ['menunggu-terbit', 'terbit']),
            ]),
            'statusLogs' => $statusLogs
        ]);
    }

    public function updateStatus(Request $request, IinNasionalApplication $iinNasional)
    {
        // Check if user has permission to update status
        $this->authorize('updateStatus', $iinNasional);

        $request->validate([
            'status' => 'required|in:pengajuan,perbaikan,pembayaran,verifikasi-lapangan,menunggu-terbit,terbit',
            'notes' => 'nullable|string',
            'iin_number' => 'nullable|string|max:20',
            'field_verification_completed' => 'nullable|boolean',
        ]);

        $oldStatus = $iinNasional->status;
        $newStatus = $request->status;

        // Validation for new flow requirements
        if ($oldStatus === 'pengajuan' && $newStatus === 'pembayaran') {
            // Admin must upload payment documents before changing to pembayaran
            if (!$iinNasional->payment_documents || count($iinNasional->payment_documents) === 0) {
                return back()->withErrors(['status' => 'Admin harus upload dokumen pembayaran sebelum mengubah status ke pembayaran']);
            }
        }

        if ($oldStatus === 'pembayaran' && $newStatus === 'verifikasi-lapangan') {
            // Admin must upload field verification documents before changing to verifikasi-lapangan
            if (!$iinNasional->field_verification_documents || count($iinNasional->field_verification_documents) === 0) {
                return back()->withErrors(['status' => 'Admin harus upload dokumen pendukung verifikasi lapangan sebelum mengubah status ke verifikasi-lapangan']);
            }
        }

        // Handle field verification completion
        $fieldVerificationAt = $iinNasional->field_verification_at;
        if ($request->field_verification_completed && $newStatus === 'verifikasi-lapangan') {
            // When admin completes field verification, keep status as verifikasi-lapangan
            // Admin will issue IIN directly from this status
            $fieldVerificationAt = now();
        } elseif ($newStatus === 'terbit') {
            $fieldVerificationAt = $fieldVerificationAt ?: now();
        }

        // Update application
        $iinNasional->update([
            'status' => $newStatus,
            'notes' => $request->notes,
            'iin_number' => $request->iin_number,
            'admin_id' => in_array($newStatus, ['perbaikan', 'pembayaran', 'verifikasi-lapangan', 'terbit']) ? Auth::id() : $iinNasional->admin_id,
            'payment_verified_at' => in_array($newStatus, ['verifikasi-lapangan']) ? now() : $iinNasional->payment_verified_at,
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

    public function uploadPaymentProof(Request $request, IinNasionalApplication $iinNasional)
    {
        $this->authorize('uploadPaymentProof', $iinNasional);

        $request->validate([
            'payment_proof.*' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $uploadedFiles = [];
        $existingProofs = $iinNasional->payment_proof_documents ?? [];

        if ($request->hasFile('payment_proof')) {
            foreach ($request->file('payment_proof') as $file) {
                $filename = $iinNasional->application_number . '_' . time() . '_' . uniqid() . '_payment_proof.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('iin-nasional/payment-proofs', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString()
                ];
            }
        }

        // Merge with existing proofs
        $allProofs = array_merge($existingProofs, $uploadedFiles);
        
        $iinNasional->update([
            'payment_proof_documents' => $allProofs,
            'payment_proof_uploaded_at' => now()
        ]);

        // Log activity
        IinStatusLog::create([
            'application_type' => 'nasional',
            'application_id' => $iinNasional->id,
            'user_id' => Auth::id(),
            'status_from' => $iinNasional->status,
            'status_to' => $iinNasional->status,
            'notes' => 'User mengupload bukti pembayaran (' . count($uploadedFiles) . ' file)'
        ]);

        return back()->with('success', count($uploadedFiles) . ' bukti pembayaran berhasil diupload');
    }

    public function uploadPaymentDocuments(Request $request, IinNasionalApplication $iinNasional)
    {
        $this->authorize('uploadPaymentDocuments', $iinNasional);

        // Validasi untuk upload dokumen
        $validationRules = [];
        if ($request->hasFile('payment_documents')) {
            $validationRules['payment_documents.*'] = 'required|file|max:10240';
        }
        
        // Validasi untuk perubahan status jika diminta
        if ($request->has('upload_and_change_status')) {
            $validationRules['status'] = 'required|string|in:pembayaran';
            $validationRules['notes'] = 'nullable|string|max:1000';
        }
        
        $request->validate($validationRules);

        $uploadedFiles = [];
        $existingDocuments = $iinNasional->payment_documents ?? [];
        $oldStatus = $iinNasional->status;

        // Upload dokumen jika ada
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
        
        // Update data aplikasi
        $updateData = [
            'payment_documents' => $allDocuments,
            'payment_documents_uploaded_at' => now()
        ];
        
        // Jika diminta untuk mengubah status bersamaan
        if ($request->has('upload_and_change_status') && $request->status === 'pembayaran') {
            // Validasi bahwa ada dokumen pembayaran (baik yang baru diupload atau yang sudah ada)
            if (empty($allDocuments)) {
                return back()->withErrors([
                    'payment_documents' => 'Dokumen pembayaran harus diupload sebelum mengubah status ke pembayaran.'
                ]);
            }
            
            $updateData['status'] = 'pembayaran';
            $updateData['admin_id'] = Auth::id();
        }
        
        return DB::transaction(function () use ($iinNasional, $updateData, $uploadedFiles, $oldStatus, $request) {
            $iinNasional->update($updateData);

            // Log activity untuk upload dokumen
            if (!empty($uploadedFiles)) {
                IinStatusLog::create([
                    'application_type' => 'nasional',
                    'application_id' => $iinNasional->id,
                    'user_id' => Auth::id(),
                    'status_from' => $oldStatus,
                    'status_to' => $iinNasional->status,
                    'notes' => 'Dokumen pembayaran diupload oleh admin (' . count($uploadedFiles) . ' file)'
                ]);
            }
            
            // Log activity untuk perubahan status jika ada
            if ($request->has('upload_and_change_status') && $oldStatus !== $iinNasional->status) {
                IinStatusLog::create([
                    'application_type' => 'nasional',
                    'application_id' => $iinNasional->id,
                    'user_id' => Auth::id(),
                    'status_from' => $oldStatus,
                    'status_to' => $iinNasional->status,
                    'notes' => $request->notes ?: 'Status diubah ke pembayaran oleh admin'
                ]);
            }

            // Pesan sukses yang sesuai
            if ($request->has('upload_and_change_status')) {
                $message = 'Dokumen berhasil diupload dan status diubah ke pembayaran';
                if (empty($uploadedFiles)) {
                    $message = 'Status berhasil diubah ke pembayaran';
                }
            } else {
                $message = count($uploadedFiles) . ' dokumen pembayaran berhasil diupload';
            }

            return back()->with('success', $message);
        });
    }

    public function uploadFieldVerificationDocuments(Request $request, IinNasionalApplication $iinNasional)
    {
        $this->authorize('uploadFieldVerificationDocuments', $iinNasional);

        $request->validate([
            'field_verification_documents.*' => 'required|file|max:10240',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);



        $uploadedFiles = [];
        $existingDocuments = $iinNasional->field_verification_documents ?? [];
        $oldStatus = $iinNasional->status;

        if ($request->hasFile('field_verification_documents')) {
            foreach ($request->file('field_verification_documents') as $file) {
                $filename = $iinNasional->application_number . '_' . time() . '_' . uniqid() . '_field_verification.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('iin-nasional/field-verification-documents', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString()
                ];
            }
        }

        // Merge with existing documents
        $allDocuments = array_merge($existingDocuments, $uploadedFiles);
        
        // Update data aplikasi
        $updateData = [
            'field_verification_documents' => $allDocuments,
            'field_verification_documents_uploaded_at' => now()
        ];
        
        // Jika diminta untuk mengubah status bersamaan
        if ($request->has('upload_and_change_status') && $request->status === 'verifikasi-lapangan') {
            // Validasi bahwa ada dokumen verifikasi lapangan (baik yang baru diupload atau yang sudah ada)
            if (empty($allDocuments)) {

                return back()->withErrors([
                    'field_verification_documents' => 'Dokumen verifikasi lapangan harus diupload sebelum mengubah status ke verifikasi lapangan.'
                ]);
            }
            
            $updateData['status'] = 'verifikasi-lapangan';
            $updateData['admin_id'] = Auth::id();
            

        }
        
        $iinNasional->update($updateData);

        // Log activity untuk upload dokumen
        if (!empty($uploadedFiles)) {
            IinStatusLog::create([
                'application_type' => 'nasional',
                'application_id' => $iinNasional->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => $iinNasional->status,
                'notes' => 'Dokumen pendukung verifikasi lapangan diupload oleh admin (' . count($uploadedFiles) . ' file)'
            ]);
        }
        
        // Log activity untuk perubahan status jika ada
        if ($request->has('upload_and_change_status') && $request->status === 'verifikasi-lapangan' && $oldStatus !== 'verifikasi-lapangan') {
            IinStatusLog::create([
                'application_type' => 'nasional',
                'application_id' => $iinNasional->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => 'verifikasi-lapangan',
                'notes' => $request->notes ?? 'Status diubah ke verifikasi lapangan oleh admin'
            ]);
        }

        // Tentukan pesan sukses
        if ($request->has('upload_and_change_status') && $request->status === 'verifikasi-lapangan') {
            $message = 'Dokumen berhasil diupload dan status diubah ke verifikasi lapangan';
            if (empty($uploadedFiles)) {
                $message = 'Status berhasil diubah ke verifikasi lapangan';
            }
        } else {
            $message = count($uploadedFiles) . ' dokumen pendukung verifikasi lapangan berhasil diupload';
        }

        return back()->with('success', $message);
    }

    public function downloadFile(IinNasionalApplication $iinNasional, string $type)
    {
        $this->authorize('downloadFile', $iinNasional);

        $path = match ($type) {
            'application_form' => $iinNasional->application_form_path,
            'requirements_archive' => $iinNasional->requirements_archive_path,
            'payment_proof' => $iinNasional->payment_proof_path,
            'certificate' => $iinNasional->certificate_path,
            default => null
        };

        if (!$path) {
            Log::error('File path not found', ['type' => $type]);
            abort(404, 'File path tidak ditemukan untuk tipe: ' . $type);
        }

        if (!Storage::disk('public')->exists($path)) {
            Log::error('File does not exist in storage', ['path' => $path]);
            abort(404, 'File tidak ditemukan di storage: ' . $path);
        }

        $fullPath = Storage::disk('public')->path($path);
        
        // Get original filename with proper extension
        $originalFilename = match ($type) {
            'application_form' => $iinNasional->application_number . '_formulir_aplikasi.' . pathinfo($path, PATHINFO_EXTENSION),
            'requirements_archive' => $iinNasional->application_number . '_persyaratan.' . pathinfo($path, PATHINFO_EXTENSION),
            'payment_proof' => $iinNasional->application_number . '_bukti_pembayaran.' . pathinfo($path, PATHINFO_EXTENSION),
            'certificate' => $iinNasional->application_number . '_sertifikat_iin.' . pathinfo($path, PATHINFO_EXTENSION),
            default => basename($path)
        };

        return response()->download($fullPath, $originalFilename);
    }

    public function downloadPaymentDocument(IinNasionalApplication $iinNasional, int $index)
    {
        $this->authorize('downloadFile', $iinNasional);

        $paymentDocuments = $iinNasional->payment_documents ?? [];
        
        if (!isset($paymentDocuments[$index])) {
            abort(404, 'Dokumen pembayaran tidak ditemukan');
        }

        $document = $paymentDocuments[$index];
        $path = $document['path'];

        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fullPath = Storage::disk('public')->path($path);
        $originalName = $document['original_name'] ?? basename($path);
        
        return response()->download($fullPath, $originalName);
    }

    public function downloadAdditionalDocument(IinNasionalApplication $iinNasional, int $index)
    {
        $this->authorize('downloadFile', $iinNasional);

        $additionalDocuments = $iinNasional->additional_documents ?? [];
        
        if (!isset($additionalDocuments[$index])) {
            abort(404, 'Dokumen tambahan tidak ditemukan');
        }

        $document = $additionalDocuments[$index];
        $path = $document['path'];

        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fullPath = Storage::disk('public')->path($path);
        $originalName = $document['original_name'] ?? basename($path);
        
        return response()->download($fullPath, $originalName);
    }

    public function downloadPaymentProof(IinNasionalApplication $iinNasional, int $index)
    {
        $this->authorize('downloadFile', $iinNasional);

        $paymentProofs = $iinNasional->payment_proof_documents ?? [];
        
        if (!isset($paymentProofs[$index])) {
            abort(404, 'Bukti pembayaran tidak ditemukan');
        }

        $document = $paymentProofs[$index];
        $path = $document['path'];

        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fullPath = Storage::disk('public')->path($path);
        $originalName = $document['original_name'] ?? basename($path);
        
        return response()->download($fullPath, $originalName);
    }

    public function downloadFieldVerificationDocument(IinNasionalApplication $iinNasional, int $index)
    {
        $this->authorize('downloadFile', $iinNasional);

        $fieldVerificationDocuments = $iinNasional->field_verification_documents ?? [];
        
        if (!isset($fieldVerificationDocuments[$index])) {
            abort(404, 'Dokumen verifikasi lapangan tidak ditemukan');
        }

        $document = $fieldVerificationDocuments[$index];
        $path = $document['path'];

        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fullPath = Storage::disk('public')->path($path);
        $originalName = $document['original_name'] ?? basename($path);
        
        return response()->download($fullPath, $originalName);
    }

    public function uploadCertificate(Request $request, IinNasionalApplication $iinNasional)
    {
        $this->authorize('uploadCertificate', $iinNasional);

        $request->validate([
            'certificate' => 'required|file|max:10240',
        ]);

        if ($request->hasFile('certificate')) {
            // Delete old file if exists
            if ($iinNasional->certificate_path) {
                Storage::disk('public')->delete($iinNasional->certificate_path);
            }

            $file = $request->file('certificate');
            $filename = $iinNasional->application_number . '_' . time() . '_certificate.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('iin-nasional', $filename, 'public');
            
            $oldStatus = $iinNasional->status;
            
            // Update certificate path and change status to 'terbit' if currently 'verifikasi-lapangan'
            $updateData = ['certificate_path' => $path];
            if ($oldStatus === 'verifikasi-lapangan') {
                $updateData['status'] = 'terbit';
                $updateData['admin_id'] = Auth::id();
                $updateData['issued_at'] = now();
            }
            
            $iinNasional->update($updateData);

            // Log activity
            IinStatusLog::create([
                'application_type' => 'nasional',
                'application_id' => $iinNasional->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => ($oldStatus === 'verifikasi-lapangan') ? 'terbit' : $oldStatus,
                'notes' => ($oldStatus === 'verifikasi-lapangan') 
                    ? 'Sertifikat IIN diupload dan IIN diterbitkan'
                    : 'Sertifikat IIN diupload'
            ]);
        }

        $message = $iinNasional->status === 'terbit' 
            ? 'Sertifikat berhasil diupload dan IIN telah diterbitkan'
            : 'Sertifikat berhasil diupload';

        return back()->with('success', $message);
    }

    public function edit(IinNasionalApplication $iinNasional)
    {
        $this->authorize('update', $iinNasional);
        
        return Inertia::render('IinNasional/Edit', [
            'application' => $iinNasional
        ]);
    }

    public function update(Request $request, IinNasionalApplication $iinNasional)
    {
        $this->authorize('update', $iinNasional);
        
        $request->validate([
            'application_form' => 'nullable|file|max:10240',
            'requirements_archive' => 'nullable|file|mimes:zip,rar|max:51200', // 50MB max for ZIP/RAR
        ]);

        return DB::transaction(function () use ($request, $iinNasional) {
            $originalStatus = $iinNasional->status;
            $newStatus = $originalStatus;
            $hasFileUploaded = false;
            $updateData = [];
            
            // Handle application form upload if provided
            if ($request->hasFile('application_form')) {
                // Delete old file if exists
                if ($iinNasional->application_form_path) {
                    Storage::disk('public')->delete($iinNasional->application_form_path);
                }

                $file = $request->file('application_form');
                $filename = $iinNasional->application_number . '_' . time() . '_form.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('iin-nasional', $filename, 'public');
                $updateData['application_form_path'] = $path;
                $hasFileUploaded = true;
            }

            // Handle requirements archive upload if provided
            if ($request->hasFile('requirements_archive')) {
                // Delete old file if exists
                if ($iinNasional->requirements_archive_path) {
                    Storage::disk('public')->delete($iinNasional->requirements_archive_path);
                }

                $file = $request->file('requirements_archive');
                $filename = $iinNasional->application_number . '_' . time() . '_requirements.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('iin-nasional', $filename, 'public');
                $updateData['requirements_archive_path'] = $path;
                $hasFileUploaded = true;
            }

            // If uploading any new document during 'perbaikan', change status to 'pengajuan'
            if ($hasFileUploaded && $originalStatus === 'perbaikan') {
                $newStatus = 'pengajuan';
                $updateData['status'] = $newStatus;
                $updateData['notes'] = null; // Clear admin notes
                $updateData['admin_id'] = null; // Clear admin assignment
            }

            // Update application if there are changes
            if (!empty($updateData)) {
                $iinNasional->update($updateData);
            }

            // Log the update
            if ($newStatus !== $originalStatus) {
                // Log the status change
                IinStatusLog::create([
                    'application_type' => 'nasional',
                    'application_id' => $iinNasional->id,
                    'user_id' => Auth::id(),
                    'status_from' => $originalStatus,
                    'status_to' => $newStatus,
                    'notes' => 'Dokumen baru diunggah, status dikembalikan ke pengajuan untuk ditinjau ulang'
                ]);
            } elseif ($hasFileUploaded) {
                // Log file update without status change
                IinStatusLog::create([
                    'application_type' => 'nasional',
                    'application_id' => $iinNasional->id,
                    'user_id' => Auth::id(),
                    'status_from' => $originalStatus,
                    'status_to' => $originalStatus,
                    'notes' => 'Dokumen aplikasi diperbarui'
                ]);
            }

            $successMessage = $originalStatus === 'perbaikan' && $newStatus === 'pengajuan'
                ? 'Aplikasi berhasil diperbarui dan status dikembalikan ke tahap pengajuan untuk ditinjau ulang'
                : ($hasFileUploaded ? 'Aplikasi berhasil diperbarui' : 'Tidak ada perubahan yang dilakukan');

            return to_route('iin-nasional.show', $iinNasional->id)
                ->with('success', $successMessage);
        });
    }

    public function issueIIN(Request $request, IinNasionalApplication $iinNasional)
    {
        $this->authorize('issueIIN', $iinNasional);

        $request->validate([
            'iin_number' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'certificate_file' => 'nullable|file|max:10240',
        ]);

        $oldStatus = $iinNasional->status;
        
        $updateData = [
            'iin_number' => $request->iin_number,
            'status' => 'terbit',
            'admin_id' => Auth::id(),
            'issued_at' => now(),
        ];
        
        // Handle certificate upload if provided
        if ($request->hasFile('certificate_file')) {
            // Delete old file if exists
            if ($iinNasional->certificate_path) {
                Storage::disk('public')->delete($iinNasional->certificate_path);
            }

            $file = $request->file('certificate_file');
            $filename = $iinNasional->application_number . '_' . time() . '_certificate.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('iin-nasional', $filename, 'public');
            
            $updateData['certificate_path'] = $path;
        }
        
        $iinNasional->update($updateData);

        // Log activity
        IinStatusLog::create([
            'application_type' => 'nasional',
            'application_id' => $iinNasional->id,
            'user_id' => Auth::id(),
            'status_from' => $oldStatus,
            'status_to' => 'terbit',
            'notes' => $request->notes ?? 'IIN berhasil diterbitkan'
        ]);

        $message = $request->hasFile('certificate_file') 
            ? 'IIN berhasil diterbitkan dan sertifikat telah diupload'
            : 'IIN berhasil diterbitkan';

        return back()->with('success', $message);
    }

    public function destroy(IinNasionalApplication $iinNasional)
    {
        $this->authorize('delete', $iinNasional);

        // Delete all associated files
        $filePaths = [
            $iinNasional->application_form_path,
            $iinNasional->payment_proof_path,
            $iinNasional->certificate_path
        ];

        foreach ($filePaths as $path) {
            if ($path) {
                Storage::disk('public')->delete($path);
            }
        }

        // Delete the application
        $iinNasional->delete();

        return to_route('iin-nasional.index')
            ->with('success', 'Aplikasi berhasil dihapus');
    }
}
