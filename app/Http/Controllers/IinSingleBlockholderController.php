<?php

namespace App\Http\Controllers;

use App\Models\DocumentRequirement;
use App\Models\IinSingleBlockholderApplication;
use App\Models\IinStatusLog;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class IinSingleBlockholderController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        // Only show applications for the current user
        $applications = IinSingleBlockholderApplication::with(['user', 'admin'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('IinSingleBlockholder/Index', [
            'applications' => $applications,
        ]);
    }

    public function create()
    {
        $documentRequirements = DocumentRequirement::getIinSingleBlockholderRequirements();

        return Inertia::render('IinSingleBlockholder/Create', [
            'documentRequirements' => $documentRequirements,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'application_form' => 'required|file|mimes:pdf|max:10240',
            'requirements_archive' => 'nullable|file|mimes:zip,rar|max:51200', // 50MB max for ZIP/RAR
        ]);

        $application = new IinSingleBlockholderApplication;
        $application->user_id = Auth::id();
        $application->submitted_at = now();

        // Save first to generate the application_number
        $application->save();

        // Handle file upload
        if ($request->hasFile('application_form')) {
            $file = $request->file('application_form');
            $filename = $application->application_number.'_'.time().'_form.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('iin-single-blockholder', $filename, 'public');
            $application->application_form_path = $path;
        }

        // Handle requirements archive upload
        if ($request->hasFile('requirements_archive')) {
            $file = $request->file('requirements_archive');
            $filename = $application->application_number.'_'.time().'_requirements.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('iin-single-blockholder', $filename, 'public');
            $application->requirements_archive_path = $path;
        }

        $application->save();

        // Log status change
        IinStatusLog::create([
            'application_type' => 'single_blockholder',
            'application_id' => $application->id,
            'user_id' => Auth::id(),
            'status_from' => null,
            'status_to' => 'pengajuan',
            'notes' => 'Aplikasi Single IIN/Blockholder diajukan',
        ]);

        return to_route('iin-single-blockholder.index')
            ->with('success', 'Aplikasi Single IIN/Blockholder berhasil diajukan');
    }

    public function show(IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $this->authorize('view', $iinSingleBlockholder);

        $iinSingleBlockholder->load(['user', 'admin']);

        // Get status logs using polymorphic relationship
        $statusLogs = IinStatusLog::where('application_type', 'single_blockholder')
            ->where('application_id', $iinSingleBlockholder->id)
            ->with('changedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('IinSingleBlockholder/Show', [
            'application' => array_merge($iinSingleBlockholder->toArray(), [
                'can_upload_payment_proof' => in_array($iinSingleBlockholder->status, ['pembayaran', 'pembayaran-tahap-2']) && $iinSingleBlockholder->user_id === Auth::id(),
                'can_download_certificate' => $iinSingleBlockholder->certificate_path && Storage::disk('public')->exists($iinSingleBlockholder->certificate_path),
                'can_upload_certificate' => Auth::user()->hasRole('admin') && in_array($iinSingleBlockholder->status, ['menunggu-terbit', 'terbit']),
            ]),
            'statusLogs' => $statusLogs,
        ]);
    }

    public function edit(IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        // Only allow editing if status is 'perbaikan' and user owns the application
        if ($iinSingleBlockholder->status !== 'perbaikan') {
            abort(403, 'Aplikasi tidak dapat diedit pada status ini.');
        }

        $this->authorize('view', $iinSingleBlockholder);

        $iinSingleBlockholder->load(['user', 'admin']);

        return Inertia::render('IinSingleBlockholder/Edit', [
            'application' => $iinSingleBlockholder,
        ]);
    }

    public function update(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        // Only allow updating if status is 'perbaikan' and user owns the application
        if ($iinSingleBlockholder->status !== 'perbaikan') {
            abort(403, 'Aplikasi tidak dapat diedit pada status ini.');
        }

        $this->authorize('view', $iinSingleBlockholder);

        $request->validate([
            'application_form' => 'nullable|file|mimes:pdf|max:10240',
            'requirements_archive' => 'nullable|file|mimes:zip,rar|max:51200', // 50MB max for ZIP/RAR
        ]);

        $updateData = [];

        // Handle application form upload
        if ($request->hasFile('application_form')) {
            // Delete old file if exists
            if ($iinSingleBlockholder->application_form_path && Storage::disk('public')->exists($iinSingleBlockholder->application_form_path)) {
                Storage::disk('public')->delete($iinSingleBlockholder->application_form_path);
            }

            $file = $request->file('application_form');
            $filename = $iinSingleBlockholder->application_number.'_'.time().'_form.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('iin-single-blockholder', $filename, 'public');
            $updateData['application_form_path'] = $path;
        }

        // Handle requirements archive upload
        if ($request->hasFile('requirements_archive')) {
            // Delete old file if exists
            if ($iinSingleBlockholder->requirements_archive_path && Storage::disk('public')->exists($iinSingleBlockholder->requirements_archive_path)) {
                Storage::disk('public')->delete($iinSingleBlockholder->requirements_archive_path);
            }

            $file = $request->file('requirements_archive');
            $filename = $iinSingleBlockholder->application_number.'_'.time().'_requirements.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('iin-single-blockholder', $filename, 'public');
            $updateData['requirements_archive_path'] = $path;
        }

        // Update application if there are changes
        if (! empty($updateData)) {
            return DB::transaction(function () use ($updateData, $iinSingleBlockholder) {
                // Change status back to 'pengajuan' when user updates the application
                $updateData['status'] = 'pengajuan';
                $updateData['notes'] = null; // Clear admin notes
                $updateData['admin_id'] = null; // Clear admin assignment

                $iinSingleBlockholder->update($updateData);

                // Log status change
                IinStatusLog::create([
                    'application_type' => 'single_blockholder',
                    'application_id' => $iinSingleBlockholder->id,
                    'user_id' => Auth::id(),
                    'status_from' => 'perbaikan',
                    'status_to' => 'pengajuan',
                    'notes' => 'User memperbarui aplikasi dan mengirim ulang untuk review',
                ]);

                return redirect()->route('iin-single-blockholder.show', $iinSingleBlockholder)
                    ->with('success', 'Aplikasi berhasil diperbarui dan dikirim ulang untuk review');
            });
        }

        return redirect()->route('iin-single-blockholder.show', $iinSingleBlockholder)
            ->with('info', 'Tidak ada perubahan yang dilakukan');
    }

    public function updateStatus(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $this->authorize('updateStatus', $iinSingleBlockholder);

        $request->validate([
            'status' => 'required|in:pengajuan,perbaikan,pembayaran,verifikasi-lapangan,pembayaran-tahap-2,menunggu-terbit,terbit',
            'notes' => 'nullable|string',
            'iin_number' => 'nullable|string|max:20',
            'iin_block_range' => 'nullable|array',
            'field_verification_completed' => 'nullable|boolean',
        ]);

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
            'notes' => $request->notes,
        ]);

        return back()->with('success', 'Status aplikasi berhasil diperbarui');
    }

    public function uploadPaymentProof(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $this->authorize('uploadPaymentProof', $iinSingleBlockholder);

        $request->validate([
            'payment_proof.*' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $uploadedFiles = [];
        $isStage2 = $iinSingleBlockholder->status === 'pembayaran-tahap-2';

        if ($isStage2) {
            $existingProofs = $iinSingleBlockholder->payment_proof_documents_stage_2 ?? [];
        } else {
            $existingProofs = $iinSingleBlockholder->payment_proof_documents ?? [];
        }

        if ($request->hasFile('payment_proof')) {
            foreach ($request->file('payment_proof') as $file) {
                $stage = $isStage2 ? 'stage2' : 'stage1';
                $filename = $iinSingleBlockholder->application_number.'_'.time().'_'.uniqid().'_payment_proof_'.$stage.'.'.$file->getClientOriginalExtension();
                $path = $file->storeAs('iin-single-blockholder/payment-proofs', $filename, 'public');

                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }
        }

        // Merge with existing proofs
        $allProofs = array_merge($existingProofs, $uploadedFiles);

        return DB::transaction(function () use ($isStage2, $allProofs, $iinSingleBlockholder, $uploadedFiles) {
            if ($isStage2) {
                $iinSingleBlockholder->update([
                    'payment_proof_documents_stage_2' => $allProofs,
                    'payment_proof_uploaded_at_stage_2' => now(),
                ]);
            } else {
                $iinSingleBlockholder->update([
                    'payment_proof_documents' => $allProofs,
                    'payment_proof_uploaded_at' => now(),
                ]);
            }

            // Log activity
            IinStatusLog::create([
                'application_type' => 'single_blockholder',
                'application_id' => $iinSingleBlockholder->id,
                'user_id' => Auth::id(),
                'status_from' => $iinSingleBlockholder->status,
                'status_to' => $iinSingleBlockholder->status,
                'notes' => 'User mengupload bukti pembayaran '.($isStage2 ? 'tahap 2' : 'tahap 1').' ('.count($uploadedFiles).' file)',
            ]);

            return back()->with('success', count($uploadedFiles).' bukti pembayaran berhasil diupload');
        });
    }

    public function uploadPaymentDocuments(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        // Special case: if admin is uploading documents and changing status to 'pembayaran'
        if ($request->has('upload_and_change_status') && $request->upload_and_change_status) {
            $this->authorize('updateStatus', $iinSingleBlockholder);
        } else {
            $this->authorize('uploadPaymentDocuments', $iinSingleBlockholder);
        }

        $request->validate([
            'payment_documents.*' => 'required|file|max:10240',
            'status' => 'nullable|in:pembayaran',
            'notes' => 'nullable|string',
            'upload_and_change_status' => 'nullable|boolean',
            'complete_field_verification' => 'nullable|boolean',
        ]);

        $uploadedFiles = [];
        $completeFieldVerification = $request->boolean('complete_field_verification');
        // Determine if this is stage 2 based on status or field verification completion
        $isStage2 = $iinSingleBlockholder->status === 'pembayaran-tahap-2' ||
                   ($iinSingleBlockholder->status === 'verifikasi-lapangan' && $completeFieldVerification);

        if ($isStage2) {
            $existingDocuments = $iinSingleBlockholder->payment_documents_stage_2 ?? [];
        } else {
            $existingDocuments = $iinSingleBlockholder->payment_documents ?? [];
        }

        if ($request->hasFile('payment_documents')) {
            foreach ($request->file('payment_documents') as $file) {
                $stage = $isStage2 ? 'stage2' : 'stage1';
                $filename = $iinSingleBlockholder->application_number.'_'.time().'_'.uniqid().'_payment_doc_'.$stage.'.'.$file->getClientOriginalExtension();
                $path = $file->storeAs('iin-single-blockholder/payment-documents', $filename, 'public');

                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                    'stage' => $stage,
                ];
            }
        }

        // Merge with existing documents
        $allDocuments = array_merge($existingDocuments, $uploadedFiles);

        return DB::transaction(function () use ($isStage2, $allDocuments, $iinSingleBlockholder, $completeFieldVerification, $request, $uploadedFiles) {
            $oldStatus = $iinSingleBlockholder->status;

            if ($isStage2) {
                // If completing field verification, change status to pembayaran-tahap-2 first
                if ($completeFieldVerification && $iinSingleBlockholder->status === 'verifikasi-lapangan') {
                    $updateData = [
                        'payment_documents_stage_2' => $allDocuments,
                        'payment_documents_uploaded_at_stage_2' => now(),
                        'status' => 'pembayaran-tahap-2', // Change to pembayaran-tahap-2 after field verification
                        'field_verification_at' => now(),
                    ];
                } else {
                    // If already in pembayaran-tahap-2 status, change to menunggu-terbit
                    $updateData = [
                        'payment_documents_stage_2' => $allDocuments,
                        'payment_documents_uploaded_at_stage_2' => now(),
                        'status' => 'menunggu-terbit', // Auto change status to menunggu-terbit after stage 2 payment documents upload
                    ];
                    // Note: payment_verified_at_stage_2 will be set when admin manually changes status from pembayaran-tahap-2 to menunggu-terbit
                }

                $iinSingleBlockholder->update($updateData);
            } else {
                $iinSingleBlockholder->update([
                    'payment_documents' => $allDocuments,
                    'payment_documents_uploaded_at' => now(),
                ]);
            }

            // Handle status change if requested
            $statusChanged = false;
            if ($request->has('upload_and_change_status') && $request->upload_and_change_status && $request->status === 'pembayaran') {
                $iinSingleBlockholder->update([
                    'status' => 'pembayaran',
                    'notes' => $request->notes,
                    'admin_id' => Auth::id(),
                ]);
                $statusChanged = true;
            }

            // Log activity
            // Log status change if requested
            if ($statusChanged) {
                IinStatusLog::create([
                    'application_type' => 'single_blockholder',
                    'application_id' => $iinSingleBlockholder->id,
                    'user_id' => Auth::id(),
                    'status_from' => $oldStatus,
                    'status_to' => $iinSingleBlockholder->status,
                    'notes' => $request->notes ?? null,
                ]);
            }

            // Log document upload
            IinStatusLog::create([
                'application_type' => 'single_blockholder',
                'application_id' => $iinSingleBlockholder->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => $iinSingleBlockholder->status,
                'notes' => $isStage2 ? 'Dokumen pembayaran tahap 2 berhasil diunggah' : 'Dokumen pembayaran berhasil diunggah',
            ]);

            if ($statusChanged) {
                $message = count($uploadedFiles).' dokumen pembayaran berhasil diupload dan status diubah ke pembayaran';
            } elseif ($isStage2) {
                if ($completeFieldVerification && $oldStatus === 'verifikasi-lapangan') {
                    $message = 'Verifikasi lapangan berhasil diselesaikan dan '.count($uploadedFiles).' dokumen pembayaran tahap 2 diupload. Status aplikasi otomatis berubah ke pembayaran tahap 2.';
                } else {
                    $message = count($uploadedFiles).' dokumen pembayaran tahap 2 berhasil diupload dan status diubah ke menunggu terbit';
                }
            } else {
                $message = count($uploadedFiles).' dokumen pembayaran tahap 1 berhasil diupload';
            }

            return back()->with('success', $message);
        });
    }

    public function uploadFieldVerificationDocuments(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $this->authorize('uploadFieldVerificationDocuments', $iinSingleBlockholder);

        $request->validate([
            'field_verification_documents.*' => 'required|file|max:10240',
            'status' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $uploadedFiles = [];
        $existingDocuments = $iinSingleBlockholder->field_verification_documents ?? [];
        $oldStatus = $iinSingleBlockholder->status;

        if ($request->hasFile('field_verification_documents')) {
            foreach ($request->file('field_verification_documents') as $file) {
                $filename = $iinSingleBlockholder->application_number.'_'.time().'_'.uniqid().'_field_verification.'.$file->getClientOriginalExtension();
                $path = $file->storeAs('iin-single-blockholder/field-verification-documents', $filename, 'public');

                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString(),
                ];
            }
        }

        // Merge with existing documents
        $allDocuments = array_merge($existingDocuments, $uploadedFiles);

        // Update data aplikasi
        $updateData = [
            'field_verification_documents' => $allDocuments,
            'field_verification_documents_uploaded_at' => now(),
        ];

        // Handle status change if requested
        $statusChanged = false;
        if ($request->has('upload_and_change_status') && $request->upload_and_change_status && $request->status === 'verifikasi-lapangan') {
            $updateData['status'] = 'verifikasi-lapangan';
            $updateData['notes'] = $request->notes;
            $updateData['admin_id'] = Auth::id();
            $statusChanged = true;
        }

        return DB::transaction(function () use ($updateData, $iinSingleBlockholder, $statusChanged, $oldStatus, $request, $uploadedFiles) {
            $iinSingleBlockholder->update($updateData);

            // Log activity
            if ($statusChanged) {
                // Log status change
                IinStatusLog::create([
                    'application_type' => 'single_blockholder',
                    'application_id' => $iinSingleBlockholder->id,
                    'user_id' => Auth::id(),
                    'status_from' => $oldStatus,
                    'status_to' => 'verifikasi-lapangan',
                    'notes' => $request->notes ?: 'Status diubah ke verifikasi lapangan oleh admin',
                ]);

                // Log document upload
                if (count($uploadedFiles) > 0) {
                    IinStatusLog::create([
                        'application_type' => 'single_blockholder',
                        'application_id' => $iinSingleBlockholder->id,
                        'user_id' => Auth::id(),
                        'status_from' => $iinSingleBlockholder->status,
                        'status_to' => $iinSingleBlockholder->status,
                        'notes' => 'Dokumen verifikasi lapangan diupload oleh admin ('.count($uploadedFiles).' file)',
                    ]);
                }
            } else {
                IinStatusLog::create([
                    'application_type' => 'single_blockholder',
                    'application_id' => $iinSingleBlockholder->id,
                    'user_id' => Auth::id(),
                    'status_from' => $oldStatus,
                    'status_to' => $iinSingleBlockholder->status,
                    'notes' => 'Dokumen verifikasi lapangan diupload oleh admin ('.count($uploadedFiles).' file)',
                ]);
            }

            $message = $statusChanged
                ? count($uploadedFiles).' dokumen verifikasi lapangan berhasil diupload dan status diubah ke verifikasi lapangan'
                : count($uploadedFiles).' dokumen verifikasi lapangan berhasil diupload';

            return back()->with('success', $message);
        });
    }

    public function downloadFieldVerificationDocument(IinSingleBlockholderApplication $iinSingleBlockholder, int $index)
    {
        $this->authorize('view', $iinSingleBlockholder);

        $documents = $iinSingleBlockholder->field_verification_documents ?? [];

        if (! isset($documents[$index])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        $document = $documents[$index];
        $filePath = storage_path('app/public/'.$document['path']);

        if (! file_exists($filePath)) {
            abort(404, 'File tidak ditemukan');
        }

        return response()->download($filePath, $document['original_name']);
    }

    public function downloadFile(IinSingleBlockholderApplication $iinSingleBlockholder, string $type, ?int $index = null)
    {
        $this->authorize('downloadFile', $iinSingleBlockholder);

        $path = match ($type) {
            'application_form' => $iinSingleBlockholder->application_form_path,
            'requirements_archive' => $iinSingleBlockholder->requirements_archive_path,
            'payment_proof' => $iinSingleBlockholder->payment_proof_documents[$index]['path'],
            'payment_proof_stage2' => $iinSingleBlockholder->payment_proof_documents_stage_2[$index]['path'],
            'payment_document' => $iinSingleBlockholder->payment_documents[$index]['path'],
            'payment_document_stage2' => $iinSingleBlockholder->payment_documents_stage_2[$index]['path'],
            'certificate' => $iinSingleBlockholder->certificate_path,
            'qris' => $iinSingleBlockholder->additional_documents['path'],
            'field_verification_document' => $iinSingleBlockholder->field_verification_documents[$index]['path'],
            'expense_reimbursement' => $iinSingleBlockholder->expenseReimbursement?->payment_proof_path,
            default => null
        };

        if (! $path || ! Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan');
        }

        return response()->download(Storage::disk('public')->path($path));
    }

    public function downloadPaymentProof(IinSingleBlockholderApplication $iinSingleBlockholder, int $index, string $stage = 'stage1')
    {
        $this->authorize('downloadFile', $iinSingleBlockholder);

        if ($stage === 'stage2') {
            $paymentProofs = $iinSingleBlockholder->payment_proof_documents_stage_2 ?? [];
        } else {
            $paymentProofs = $iinSingleBlockholder->payment_proof_documents ?? [];
        }

        if (! isset($paymentProofs[$index])) {
            abort(404, 'Bukti pembayaran tidak ditemukan');
        }

        $document = $paymentProofs[$index];
        $path = $document['path'];

        if (! Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fullPath = Storage::disk('public')->path($path);
        $originalName = $document['original_name'] ?? basename($path);

        return response()->download($fullPath, $originalName);
    }

    public function downloadAdditionalDocument(IinSingleBlockholderApplication $iinSingleBlockholder, int $index)
    {
        $this->authorize('downloadFile', $iinSingleBlockholder);

        $additionalDocuments = $iinSingleBlockholder->additional_documents ?? [];

        if (! isset($additionalDocuments[$index])) {
            abort(404, 'Dokumen tambahan tidak ditemukan');
        }

        $document = $additionalDocuments[$index];
        $path = $document['path'];

        if (! Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fullPath = Storage::disk('public')->path($path);
        $originalName = $document['original_name'] ?? basename($path);

        return response()->download($fullPath, $originalName);
    }

    public function downloadPaymentDocument(IinSingleBlockholderApplication $iinSingleBlockholder, int $index, string $stage = 'stage1')
    {
        $this->authorize('downloadFile', $iinSingleBlockholder);

        if ($stage === 'stage2') {
            $paymentDocuments = $iinSingleBlockholder->payment_documents_stage_2 ?? [];
        } else {
            $paymentDocuments = $iinSingleBlockholder->payment_documents ?? [];
        }

        if (! isset($paymentDocuments[$index])) {
            abort(404, 'Dokumen pembayaran tidak ditemukan');
        }

        $document = $paymentDocuments[$index];
        $path = $document['path'];

        if (! Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fullPath = Storage::disk('public')->path($path);
        $originalName = $document['original_name'] ?? basename($path);

        return response()->download($fullPath, $originalName);
    }

    public function uploadCertificate(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $this->authorize('uploadCertificate', $iinSingleBlockholder);

        $request->validate([
            'certificate' => 'required|file|max:10240',
        ]);

        if ($request->hasFile('certificate')) {
            // Delete old file if exists
            if ($iinSingleBlockholder->certificate_path) {
                Storage::disk('public')->delete($iinSingleBlockholder->certificate_path);
            }

            $file = $request->file('certificate');
            $filename = $iinSingleBlockholder->application_number.'_'.time().'_certificate.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('iin-single-blockholder', $filename, 'public');

            $oldStatus = $iinSingleBlockholder->status;

            // Update certificate path and optionally change status to 'terbit' if currently 'menunggu-terbit'
            $updateData = ['certificate_path' => $path];
            if ($oldStatus === 'menunggu-terbit') {
                $updateData['status'] = 'terbit';
                $updateData['admin_id'] = Auth::id();
                $updateData['issued_at'] = now();
            }

            $iinSingleBlockholder->update($updateData);

            // Log activity
            IinStatusLog::create([
                'application_type' => 'single_blockholder',
                'application_id' => $iinSingleBlockholder->id,
                'user_id' => Auth::id(),
                'status_from' => $oldStatus,
                'status_to' => $oldStatus === 'menunggu-terbit' ? 'terbit' : $oldStatus,
                'notes' => $oldStatus === 'menunggu-terbit'
                    ? 'Sertifikat IIN diupload dan IIN diterbitkan'
                    : 'Sertifikat IIN diupload',
            ]);
        }

        $message = $iinSingleBlockholder->status === 'terbit'
            ? 'Sertifikat berhasil diupload dan IIN telah diterbitkan'
            : 'Sertifikat berhasil diupload';

        return back()->with('success', $message);
    }

    public function uploadAdditionalDocument(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = $iinSingleBlockholder->application_number.'_'.time().'_'.uniqid().'_additional.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('iin-single-blockholder/additional-document', $filename, 'public');

            $existingDocuments = [
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'uploaded_at' => now()->toISOString(),
            ];

            $iinSingleBlockholder->update([
                'additional_documents' => $existingDocuments,
            ]);

            IinStatusLog::create([
                'application_type' => 'single_blockholder',
                'application_id' => $iinSingleBlockholder->id,
                'user_id' => Auth::id(),
                'status_from' => $iinSingleBlockholder->status,
                'status_to' => $iinSingleBlockholder->status,
                'notes' => 'Dokumen tambahan diupload ('.$file->getClientOriginalName().')',
            ]);
        }

        return back()->with('success', 'Dokumen tambahan berhasil diupload');
    }

    public function storeExpenseReimbursement(Request $request, IinSingleBlockholderApplication $iinSingleBlockholder)
    {
        $this->authorize('view', $iinSingleBlockholder);

        $request->validate([
            'company_name' => 'required|string|max:255',
            'pic_name' => 'required|string|max:255',
            'pic_contact' => 'required|string|max:255',
            'verification_date' => 'required|date',
            'is_acknowledged' => 'required|boolean',
            'chief_verificator_amount' => 'required|integer|min:0',
            'member_verificator_amount' => 'required|integer|min:0',
            'payment_proof_path' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        try {
            return DB::transaction(function () use ($request, $iinSingleBlockholder) {
                // Handle file upload
                $paymentProofPath = null;
                if ($request->hasFile('payment_proof_path')) {
                    $file = $request->file('payment_proof_path');
                    $filename = 'single_blockholder_'.time().'_expense_proof.'.$file->getClientOriginalExtension();
                    $paymentProofPath = $file->storeAs('iin-single-blockholder/expense-reimbursement', $filename, 'public');
                }

                // Create expense reimbursement record
                $expenseReimbursement = \App\Models\ExpenseReimbursements::create([
                    'company_name' => $request->company_name,
                    'pic_name' => $request->pic_name,
                    'pic_contact' => $request->pic_contact,
                    'verification_date' => $request->verification_date,
                    'is_acknowledged' => $request->is_acknowledged,
                    'chief_verificator_amount' => $request->chief_verificator_amount,
                    'member_verificator_amount' => $request->member_verificator_amount,
                    'payment_proof_path' => $paymentProofPath,
                ]);

                // Link expense reimbursement to the application
                $iinSingleBlockholder->update([
                    'expense_reim_id' => $expenseReimbursement->id,
                ]);

                // Log activity
                IinStatusLog::create([
                    'application_type' => 'single_blockholder',
                    'application_id' => $iinSingleBlockholder->id,
                    'user_id' => Auth::id(),
                    'status_from' => null,
                    'status_to' => null,
                    'notes' => 'Form bukti penggantian transport dan uang harian disubmit',
                ]);

                return back()->with('success', 'Form bukti penggantian transport dan uang harian berhasil disubmit');
            });
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error submitting expense reimbursement: '.$e->getMessage());

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.']);
        }
    }
}
