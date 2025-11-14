<?php

namespace App\Http\Controllers;

use App\Models\PengawasanIinNasional;
use App\Models\PengawasanIinNasionalStatusLog;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class PengawasanIinNasionalController extends Controller
{
    use AuthorizesRequests;

    public function index()
    {
        // Only show applications for the current user
        $applications = PengawasanIinNasional::with(['user', 'admin', 'iinNasionalProfile'])
            ->where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('PengawasanIinNasional/Index', [
            'applications' => $applications,
        ]);
    }

    public function create()
    {
        $user = Auth::user();

        // Check if user has completed IIN Nasional profile
        if (! $user->iinNasionalProfile || ! $this->isProfileComplete($user->iinNasionalProfile)) {
            return back()->withErrors(['profile' => 'Anda harus melengkapi profil IIN Nasional terlebih dahulu sebelum mengajukan pengawasan.']);
        }

        return Inertia::render('PengawasanIinNasional/Create', [
            'iinNasionalProfile' => $user->iinNasionalProfile,
        ]);
    }

    public function store(Request $request)
    {
        $user = Auth::user();

        // Check if user has complete IIN Nasional profile
        if (! $user->iinNasionalProfile || ! $this->isProfileComplete($user->iinNasionalProfile)) {
            return redirect()->route('iin-nasional.create')
                ->with('error', 'Silakan lengkapi profil IIN Nasional terlebih dahulu sebelum mengajukan pengawasan.');
        }

        // Use database transaction to ensure data consistency
        $pengawasan = DB::transaction(function () use ($user) {
            // Create the pengawasan application
            $pengawasan = PengawasanIinNasional::create([
                'user_id' => auth()->id(),
                'iin_nasional_profile_id' => $user->iinNasionalProfile->id,
                'application_number' => 'PGW-'.date('Ymd').'-'.str_pad(PengawasanIinNasional::count() + 1, 4, '0', STR_PAD_LEFT),
                'status' => 'pengajuan',
                'submitted_at' => now(),
            ]);

            // Log the initial status
            $this->logStatusChange($pengawasan, null, 'pengajuan', 'Pengajuan pengawasan dibuat');

            return $pengawasan;
        });

        return redirect()->route('pengawasan-iin-nasional.show', $pengawasan)
            ->with('success', 'Aplikasi pengawasan berhasil diajukan.');
    }

    public function show(PengawasanIinNasional $pengawasanIinNasional)
    {
        $this->authorize('view', $pengawasanIinNasional);

        $pengawasanIinNasional->load(['user', 'admin', 'iinNasionalProfile', 'expenseReimbursement']);

        // Get status logs using the new dedicated status log model
        $statusLogs = PengawasanIinNasionalStatusLog::where('pengawasan_iin_nasional_id', $pengawasanIinNasional->id)
            ->with('changedBy')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('PengawasanIinNasional/Show', [
            'application' => array_merge($pengawasanIinNasional->toArray(), [
                'can_upload_payment_proof' => $pengawasanIinNasional->status === 'pembayaran' && $pengawasanIinNasional->user_id === Auth::id(),
                'can_download_issuance_documents' => $pengawasanIinNasional->issuance_documents && Storage::disk('public')->exists($pengawasanIinNasional->issuance_documents[0]['path'] ?? ''),
            ]),
            'statusLogs' => $statusLogs,
        ]);
    }

    public function uploadPaymentProof(Request $request, PengawasanIinNasional $pengawasanIinNasional)
    {
        $this->authorize('uploadPaymentProof', $pengawasanIinNasional);

        $request->validate([
            'payment_proof_documents.*' => 'required|file|max:10240',
        ]);

        if (! $request->hasFile('payment_proof_documents')) {
            return back()->withErrors(['payment_proof_documents' => 'Silakan pilih file bukti pembayaran']);
        }

        $uploadedFiles = [];
        foreach ($request->file('payment_proof_documents') as $file) {
            $filename = $pengawasanIinNasional->application_number.'_'.time().'_payment_proof_'.uniqid().'.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('pengawasan-iin-nasional/payment-proof', $filename, 'public');

            $uploadedFiles[] = [
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'uploaded_at' => now()->toISOString(),
            ];
        }

        $pengawasanIinNasional->update([
            'payment_proof_documents' => $uploadedFiles,
            'payment_proof_uploaded_at' => now(),
        ]);

        // Log the upload
        PengawasanIinNasionalStatusLog::create([
            'pengawasan_iin_nasional_id' => $pengawasanIinNasional->id,
            'status_from' => $pengawasanIinNasional->status,
            'status_to' => $pengawasanIinNasional->status,
            'notes' => 'User mengupload bukti pembayaran ('.count($uploadedFiles).' file)',
            'changed_by' => Auth::id(),
        ]);

        return back()->with('success', count($uploadedFiles).' file bukti pembayaran berhasil diupload');
    }

    public function downloadPaymentProof(PengawasanIinNasional $pengawasanIinNasional, int $index)
    {
        $this->authorize('downloadFile', $pengawasanIinNasional);

        $paymentProofs = $pengawasanIinNasional->payment_proof_documents ?? [];

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

    public function downloadFile(PengawasanIinNasional $pengawasanIinNasional, string $type, ?int $index = null)
    {
        $this->authorize('downloadFile', $pengawasanIinNasional);

        $pengawasanIinNasional->load(['expenseReimbursement']);

        $path = match ($type) {
            'certificate' => $pengawasanIinNasional->issuance_documents[$index]['path'],
            'agreement' => $pengawasanIinNasional->agreement_path,
            'qris' => $pengawasanIinNasional->additional_documents['path'],
            'expense_reimbursement' => $pengawasanIinNasional->expenseReimbursement?->payment_proof_path,
            'payment_proof' => $pengawasanIinNasional->payment_proof_documents[$index]['path'],
            'payment_document' => $pengawasanIinNasional->payment_documents[$index]['path'],
            'field_verification_document' => $pengawasanIinNasional->field_verification_documents[$index]['path'],
            default => null
        };


        if (! $path) {
            abort(404, 'File path tidak ditemukan untuk tipe: '.$type);
        }

        if (! Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage: '.$path);
        }

        $fullPath = Storage::disk('public')->path($path);

        // Get original filename with proper extension
        $originalFilename = match ($type) {
            'agreement' => $pengawasanIinNasional->application_number.'_iin_nasional.'.pathinfo($path, PATHINFO_EXTENSION),
            default => basename($path)
        };

        return response()->download($fullPath, $originalFilename);
    }

    public function downloadPaymentDocument(PengawasanIinNasional $pengawasanIinNasional, int $index)
    {
        $this->authorize('downloadFile', $pengawasanIinNasional);

        $paymentDocuments = $pengawasanIinNasional->payment_documents ?? [];

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

    public function downloadFieldVerificationDocument(PengawasanIinNasional $pengawasanIinNasional, int $index)
    {
        $this->authorize('downloadFile', $pengawasanIinNasional);

        $fieldVerificationDocuments = $pengawasanIinNasional->field_verification_documents ?? [];

        if (! isset($fieldVerificationDocuments[$index])) {
            abort(404, 'Dokumen verifikasi lapangan tidak ditemukan');
        }

        $document = $fieldVerificationDocuments[$index];
        $path = $document['path'];

        if (! Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fullPath = Storage::disk('public')->path($path);
        $originalName = $document['original_name'] ?? basename($path);

        return response()->download($fullPath, $originalName);
    }

    public function downloadIssuanceDocument(PengawasanIinNasional $pengawasanIinNasional, int $index)
    {
        $this->authorize('downloadFile', $pengawasanIinNasional);

        $issuanceDocuments = $pengawasanIinNasional->issuance_documents ?? [];

        if (! isset($issuanceDocuments[$index])) {
            abort(404, 'Dokumen penerbitan tidak ditemukan');
        }

        $document = $issuanceDocuments[$index];
        $path = $document['path'];

        if (! Storage::disk('public')->exists($path)) {
            abort(404, 'File tidak ditemukan di storage');
        }

        $fullPath = Storage::disk('public')->path($path);
        $originalName = $document['original_name'] ?? basename($path);

        return response()->download($fullPath, $originalName);
    }

    public function uploadAdditionalDocument(Request $request, PengawasanIinNasional $pengawasanIinNasional)
    {
        $request->validate([
            'file' => 'required|file|max:10240|mimes:pdf,doc,docx',
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = $pengawasanIinNasional->application_number.'_'.time().'_'.uniqid().'_additional.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('pengawasan-iin-nasional/additional-document', $filename, 'public');

            $existingDocuments = [
                'path' => $path,
                'original_name' => $file->getClientOriginalName(),
                'uploaded_at' => now()->toISOString(),
            ];

            $pengawasanIinNasional->update([
                'additional_documents' => $existingDocuments,
            ]);

            PengawasanIinNasionalStatusLog::create([
                'pengawasan_iin_nasional_id' => $pengawasanIinNasional->id,
                'status_from' => $pengawasanIinNasional->status,
                'status_to' => $pengawasanIinNasional->status,
                'notes' => 'Dokumen tambahan diupload ('.$file->getClientOriginalName().')',
                'changed_by' => Auth::id(),
            ]);
        }

        return back()->with('success', 'Dokumen tambahan berhasil diupload');
    }

    /**
     * Check if IIN Nasional profile is complete with required fields
     */
    private function isProfileComplete($profile): bool
    {
        $requiredFields = [
            'institution_name',
            'brand',
            'iin_national_assignment',
            'assignment_year',
            'regional',
            'usage_purpose',
            'address',
            'phone_fax',
            'email_office',
            'contact_person_name',
            'contact_person_email',
            'contact_person_phone',
        ];

        foreach ($requiredFields as $field) {
            if (empty($profile->$field)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Log status changes for pengawasan applications
     */
    private function logStatusChange(PengawasanIinNasional $pengawasan, ?string $statusFrom, string $statusTo, ?string $notes = null)
    {
        PengawasanIinNasionalStatusLog::create([
            'pengawasan_iin_nasional_id' => $pengawasan->id,
            'status_from' => $statusFrom,
            'status_to' => $statusTo,
            'notes' => $notes,
            'changed_by' => Auth::id(),
        ]);
    }

    public function storeExpenseReimbursement(Request $request, PengawasanIinNasional $pengawasanIinNasional)
    {
        $this->authorize('view', $pengawasanIinNasional);

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
            return DB::transaction(function () use ($request, $pengawasanIinNasional) {
                // Handle file upload
                $paymentProofPath = null;
                if ($request->hasFile('payment_proof_path')) {
                    $file = $request->file('payment_proof_path');
                    $filename = 'pemantauan_'.time().'_expense_proof.'.$file->getClientOriginalExtension();
                    $paymentProofPath = $file->storeAs('pengawasan-iin-nasional/expense-reimbursement', $filename, 'public');
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
                $pengawasanIinNasional->update([
                    'expense_reim_id' => $expenseReimbursement->id,
                ]);

                // Log activity
                PengawasanIinNasionalStatusLog::create([
                    'pengawasan_iin_nasional_id' => $pengawasanIinNasional->id,
                    'status_from' => null,
                    'status_to' => null,
                    'notes' => 'Form bukti penggantian transport dan uang harian disubmit',
                    'changed_by' => Auth::id(),
                ]);

                return back()->with('success', 'Form bukti penggantian transport dan uang harian berhasil disubmit');
            });
        } catch (\Exception $e) {
            Log::error('Error submitting expense reimbursement: '.$e->getMessage());

            return back()->withErrors(['error' => 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.']);
        }
    }
}
