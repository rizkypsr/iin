<?php

namespace App\Http\Controllers;

use App\Models\PengawasanSingleIin;
use App\Models\PengawasanSingleIinStatusLog;
use App\Models\IinStatusLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Inertia\Inertia;

class PengawasanSingleIinController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        // Only show applications for the current user
        $applications = PengawasanSingleIin::with(['user', 'admin', 'singleIinProfile'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);



        return Inertia::render('PengawasanSingleIin/Index', [
            'applications' => $applications
        ]);
    }

    public function create()
    {
        $user = Auth::user();
        
        // Check if user has completed Single IIN profile
        if (!$user->singleIinProfile || !$this->isProfileComplete($user->singleIinProfile)) {
            return back()->withErrors(['profile' => 'Anda harus melengkapi profil Single IIN terlebih dahulu sebelum mengajukan pengawasan.']);
        }

        return Inertia::render('PengawasanSingleIin/Create', [
            'singleIinProfile' => $user->singleIinProfile,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();
        
        // Validate profile completion
        if (!$user->singleIinProfile || !$this->isProfileComplete($user->singleIinProfile)) {
            return back()->withErrors(['profile' => 'Anda harus melengkapi profil Single IIN terlebih dahulu sebelum mengajukan pengawasan.']);
        }

        $request->validate([
            'agreement' => 'nullable|file|max:10240',
        ]);

        // Use database transaction to ensure data consistency
        $application = DB::transaction(function () use ($request, $user) {
            $application = new PengawasanSingleIin();
            $application->user_id = Auth::id();
            $application->single_iin_profile_id = $user->singleIinProfile->id;
            $application->submitted_at = now();
            
            // Save first to generate the application_number
            $application->save();

            // Log status change using new status log system
            $this->logStatusChange($application, null, 'pengajuan', 'Aplikasi Pengawasan Single IIN diajukan');

            return $application;
        });

        return to_route('pengawasan-single-iin.index')->with('success', 'Aplikasi Pengawasan Single IIN berhasil diajukan');
    }

    public function show(PengawasanSingleIin $pengawasanSingleIin)
    {
        $this->authorize('view', $pengawasanSingleIin);

        $pengawasanSingleIin->load(['user', 'admin', 'singleIinProfile']);

        // Get status logs using polymorphic relationship
        $statusLogs = PengawasanSingleIinStatusLog::where('pengawasan_single_iin_id', $pengawasanSingleIin->id)
            ->with('changedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('PengawasanSingleIin/Show', [
            'application' => array_merge($pengawasanSingleIin->toArray(), [
                'can_upload_payment_proof' => ($pengawasanSingleIin->status === 'pembayaran' || $pengawasanSingleIin->status === 'pembayaran-tahap-2') && $pengawasanSingleIin->user_id === Auth::id(),
                'can_download_issuance_documents' => $pengawasanSingleIin->issuance_documents && Storage::disk('public')->exists($pengawasanSingleIin->issuance_documents[0]['path'] ?? ''),
            ]),
            'statusLogs' => $statusLogs
        ]);
    }

    public function uploadPaymentProof(Request $request, PengawasanSingleIin $pengawasanSingleIin)
    {
        $this->authorize('uploadPaymentProof', $pengawasanSingleIin);

        $request->validate([
            'payment_proof.*' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $uploadedFiles = [];
        $isStage2 = $pengawasanSingleIin->status === 'pembayaran-tahap-2';
        
        if ($isStage2) {
            $existingProofs = $pengawasanSingleIin->payment_proof_documents_stage_2 ?? [];
        } else {
            $existingProofs = $pengawasanSingleIin->payment_proof_documents ?? [];
        }

        if ($request->hasFile('payment_proof')) {
            foreach ($request->file('payment_proof') as $file) {
                $stage = $isStage2 ? 'stage2' : 'stage1';
                $filename = $pengawasanSingleIin->application_number . '_' . time() . '_' . uniqid() . '_payment_proof_' . $stage . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('pengawasan-single-iin/payment-proofs', $filename, 'public');
                
                $uploadedFiles[] = [
                    'path' => $path,
                    'original_name' => $file->getClientOriginalName(),
                    'uploaded_at' => now()->toISOString()
                ];
            }
        }

        // Merge with existing proofs
        $allProofs = array_merge($existingProofs, $uploadedFiles);
        
        return DB::transaction(function () use ($isStage2, $allProofs, $pengawasanSingleIin, $uploadedFiles) {
            if ($isStage2) {
                $pengawasanSingleIin->update([
                    'payment_proof_documents_stage_2' => $allProofs,
                    'payment_proof_uploaded_at_stage_2' => now()
                ]);
            } else {
                $pengawasanSingleIin->update([
                    'payment_proof_documents' => $allProofs,
                    'payment_proof_uploaded_at' => now()
                ]);
            }

            // Log the upload using new status log system
             $this->logStatusChange($pengawasanSingleIin, null, $pengawasanSingleIin->status, 'User mengupload bukti pembayaran ' . ($isStage2 ? 'tahap 2' : 'tahap 1') . ' (' . count($uploadedFiles) . ' file)');

            return back()->with('success', count($uploadedFiles) . ' bukti pembayaran berhasil diupload');
        });
    }

    /**
     * Check if Single IIN profile is complete with required fields
     */
    private function isProfileComplete($profile): bool
    {
        $requiredFields = [
            'institution_name',
            'institution_type',
            'year',
            'iin_assignment',
            'assignment_date',
            'regional',
            'usage_purpose',
            'address',
            'phone_fax',
            'email',
            'contact_person',
        ];

        foreach ($requiredFields as $field) {
            if (empty($profile->$field)) {
                return false;
            }
        }

        return true;
    }

    public function downloadPaymentDocument(PengawasanSingleIin $pengawasanSingleIin, int $index, string $stage = 'stage1')
    {
        $this->authorize('downloadFile', $pengawasanSingleIin);

        if ($stage === 'stage2') {
            $paymentDocuments = $pengawasanSingleIin->payment_documents_stage_2 ?? [];
        } else {
            $paymentDocuments = $pengawasanSingleIin->payment_documents ?? [];
        }
        
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

    /**
     * Download issuance document by index
     */
    public function downloadIssuanceDocument(PengawasanSingleIin $pengawasanSingleIin, int $index)
    {
        // Check authorization
        $this->authorize('view', $pengawasanSingleIin);

        $documents = $pengawasanSingleIin->issuance_documents ?? [];
        
        if (!isset($documents[$index])) {
            abort(404, 'Dokumen tidak ditemukan');
        }

        $document = $documents[$index];
        $path = $document['path'];

        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fullPath = Storage::disk('public')->path($path);
        $originalName = $document['original_name'] ?? 'issuance_document.pdf';
        
        return response()->download($fullPath, $originalName);
    }

    public function downloadPaymentProof(PengawasanSingleIin $pengawasanSingleIin, int $index, string $stage = 'stage1')
    {
        $this->authorize('downloadFile', $pengawasanSingleIin);

        if ($stage === 'stage2') {
            $paymentProofs = $pengawasanSingleIin->payment_proof_documents_stage_2 ?? [];
        } else {
            $paymentProofs = $pengawasanSingleIin->payment_proof_documents ?? [];
        }
        
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

    public function downloadFile(PengawasanSingleIin $pengawasanSingleIin, string $type)
    {
        $this->authorize('downloadFile', $pengawasanSingleIin);

        $path = match ($type) {
            'agreement' => $pengawasanSingleIin->agreement_path,
            'qris' => $pengawasanSingleIin->additional_documents['path'],
            default => null
        };

        if (!$path) {
            abort(404, 'File path tidak ditemukan untuk tipe: ' . $type);
        }

        if (!Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage: ' . $path);
        }

        $fullPath = Storage::disk('public')->path($path);
        
        // Get original filename with proper extension
        $originalFilename = match ($type) {
            'agreement' => $pengawasanSingleIin->application_number . '_single_iin.' . pathinfo($path, PATHINFO_EXTENSION),
            default => basename($path)
        };

        return response()->download($fullPath, $originalFilename);
    }

    public function downloadFieldVerificationDocument(PengawasanSingleIin $pengawasanSingleIin, int $index)
    {
        $this->authorize('downloadFile', $pengawasanSingleIin);

        $fieldVerificationDocuments = $pengawasanSingleIin->field_verification_documents ?? [];
        
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

    public function uploadAdditionalDocument(Request $request, PengawasanSingleIin $pengawasanSingleIin)
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = $pengawasanSingleIin->application_number . '_' . time() . '_' . uniqid() . '_additional.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('pengawasan-single-iin/additional-document', $filename, 'public');

            $existingDocuments = [
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'uploaded_at' => now()->toISOString()
            ];
            
            $pengawasanSingleIin->update([
                'additional_documents' => $existingDocuments,
            ]);

            $this->logStatusChange($pengawasanSingleIin, null, $pengawasanSingleIin->status, 'Dokumen tambahan diupload (' . $file->getClientOriginalName() . ')');
        }

        return back()->with('success', 'Dokumen tambahan berhasil diupload');
    }

    /**
     * Log status changes for pengawasan single IIN applications
     */
    private function logStatusChange(PengawasanSingleIin $pengawasan, ?string $statusFrom, ?string $statusTo, string $notes): void
    {
        PengawasanSingleIinStatusLog::create([
            'pengawasan_single_iin_id' => $pengawasan->id,
            'status_from' => $statusFrom,
            'status_to' => $statusTo,
            'notes' => $notes,
            'changed_by' => Auth::id(),
        ]);
    }

    public function storeExpenseReimbursement(Request $request, PengawasanSingleIin $pengawasanSingleIin)
    {
        $this->authorize('view', $pengawasanSingleIin);

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
            return DB::transaction(function () use ($request, $pengawasanSingleIin) {
                // Handle file upload
                $paymentProofPath = null;
                if ($request->hasFile('payment_proof_path')) {
                    $file = $request->file('payment_proof_path');
                    $filename = 'pengawasan_single_iin_' . time() . '_expense_proof.' . $file->getClientOriginalExtension();
                    $paymentProofPath = $file->storeAs('pengawasan-single-iin/expense-reimbursement', $filename, 'public');
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
                $pengawasanSingleIin->update([
                    'expense_reim_id' => $expenseReimbursement->id,
                ]);

                // Log activity
                PengawasanSingleIinStatusLog::create([
                    'pengawasan_single_iin_id' => $pengawasanSingleIin->id,
                    'status_from' => null,
                    'status_to' => null,
                    'notes' => 'Form bukti penggantian transport dan uang harian disubmit',
                    'changed_by' => Auth::id(),
                ]);

                return back()->with('success', 'Form bukti penggantian transport dan uang harian berhasil disubmit');
            });
        } catch (\Exception $e) {
            Log::error('Error submitting expense reimbursement: ' . $e->getMessage());
            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.']);
        }
    }
}