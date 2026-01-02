<?php

use App\Http\Controllers\IinNasionalController;
use App\Http\Controllers\IinSingleBlockholderController;
use App\Http\Controllers\PengawasanIinNasionalController;
use App\Http\Controllers\PengawasanSingleIinController;
use App\Http\Controllers\SurveyController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/alur-pendaftaran', function () {
    return Inertia::render('alur-pendaftaran');
})->name('alur-pendaftaran');

Route::get('/jenis-layanan', function () {
    return Inertia::render('jenis-layanan');
})->name('jenis-layanan');

Route::get('/tarif', function () {
    return Inertia::render('tarif');
})->name('tarif');

Route::get('/layanan-publik', function () {
    $informations = App\Models\Information::where('is_active', true)->latest()->paginate(6);

    return Inertia::render('layanan-publik', [
        'informations' => $informations,
    ]);
})->name('layanan-publik');

Route::get('/layanan-publik/{information}', function (App\Models\Information $information) {
    if (! $information->is_active) {
        abort(404);
    }

    return Inertia::render('layanan-publik-detail', [
        'information' => $information,
    ]);
})->name('layanan-publik.show');

Route::get('/pengaduan', function () {
    return Inertia::render('pengaduan');
})->name('pengaduan');

Route::middleware(['auth', 'verified'])->group(function () {
    // Default dashboard - redirect based on role
    Route::get('dashboard', function () {
        $user = Auth::user();

        if ($user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        } else {
            // Get user-specific statistics
            $userApplications = App\Models\IinNasionalApplication::where('user_id', $user->id)
                ->get()
                ->merge(
                    App\Models\IinSingleBlockholderApplication::where('user_id', $user->id)->get()
                );

            $totalApplications = $userApplications->count();
            $approvedApplications = $userApplications->where('status', 'terbit')->count();
            $pendingApplications = $userApplications->whereIn('status', ['pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit'])->count();

            // Get recent applications for the user
            $recentApplications = App\Models\IinNasionalApplication::where('user_id', $user->id)
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($item) {
                    $item->type = 'nasional';

                    return $item;
                })
                ->merge(
                    App\Models\IinSingleBlockholderApplication::where('user_id', $user->id)
                        ->latest()
                        ->take(5)
                        ->get()
                        ->map(function ($item) {
                            $item->type = 'single_blockholder';

                            return $item;
                        })
                )
                ->sortByDesc('created_at')
                ->take(5)
                ->values();

            // Get recent activities (status logs) for the user's applications
            $recentActivities = App\Models\IinStatusLog::whereIn('application_id', $userApplications->pluck('id'))
                ->whereIn('application_type', ['nasional', 'single_blockholder'])
                ->with('changedBy')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($log) {
                    return [
                        'id' => $log->id,
                        'message' => $log->status_message ?? 'Status aplikasi diperbarui ke: '.$log->status,
                        'type' => $log->status === 'terbit' ? 'success' : ($log->status === 'ditolak' ? 'error' : 'info'),
                        'created_at' => $log->created_at->toISOString(),
                    ];
                });

            $stats = [
                'total_applications' => $totalApplications,
                'approved_applications' => $approvedApplications,
                'pending_applications' => $pendingApplications,
            ];

            // Get application counts for sidebar badges
            $applicationCountService = new App\Services\ApplicationCountService;
            $applicationCounts = $applicationCountService->getNewApplicationCounts();

            return Inertia::render('dashboard', [
                'stats' => $stats,
                'recent_applications' => $recentApplications,
                'recent_activities' => $recentActivities,
                'application_counts' => $applicationCounts,
            ]);
        }
    })->name('dashboard');

    // Note: Admin routes have been moved to routes/admin.php
    // Use admin.dashboard, admin.iin-nasional.show and admin.iin-single-blockholder.show instead

    // User routes (accessible by all authenticated users)
    Route::get('dashboard/notifikasi', function () {
        return Inertia::render('dashboard/notifikasi');
    })->name('dashboard.notifikasi');

    Route::get('dashboard/pengaduan', function () {
        return Inertia::render('dashboard/pengaduan-user');
    })->name('dashboard.pengaduan');

    Route::get('dashboard/profil', [App\Http\Controllers\Dashboard\ProfileController::class, 'show'])->name('dashboard.profil');
    Route::patch('dashboard/profil', [App\Http\Controllers\Dashboard\ProfileController::class, 'update'])->name('dashboard.profil.update');
    Route::patch('dashboard/profil/basic', [App\Http\Controllers\Dashboard\ProfileController::class, 'updateBasic'])->name('dashboard.profil.update-basic');
    Route::patch('dashboard/profil/iin-nasional', [App\Http\Controllers\Dashboard\ProfileController::class, 'updateIinNasional'])->name('dashboard.profil.update-iin-nasional');
    Route::patch('dashboard/profil/single-iin', [App\Http\Controllers\Dashboard\ProfileController::class, 'updateSingleIin'])->name('dashboard.profil.update-single-iin');
    Route::post('dashboard/profil/single-iin', [App\Http\Controllers\Dashboard\ProfileController::class, 'updateSingleIin']);

    // IIN Application routes
    // IIN Nasional routes
    Route::resource('iin-nasional', IinNasionalController::class);
    Route::post('iin-nasional/{iinNasional}/update-status', [IinNasionalController::class, 'updateStatus'])->name('iin-nasional.update-status');
    Route::post('iin-nasional/{iinNasional}/upload-payment-proof', [IinNasionalController::class, 'uploadPaymentProof'])->name('iin-nasional.upload-payment-proof');
    Route::post('iin-nasional/{iinNasional}/upload-certificate', [IinNasionalController::class, 'uploadCertificate'])->name('iin-nasional.upload-certificate');
    Route::post('iin-nasional/{iinNasional}/upload-payment-documents', [IinNasionalController::class, 'uploadPaymentDocuments'])->name('iin-nasional.upload-payment-documents');
    Route::post('iin-nasional/{iinNasional}/upload-field-verification-documents', [IinNasionalController::class, 'uploadFieldVerificationDocuments'])->name('iin-nasional.upload-field-verification-documents');
    Route::post('iin-nasional/{iinNasional}/upload-additional-documents', [IinNasionalController::class, 'uploadAdditionalDocument'])->name('iin-nasional.upload-additional-documents');
    Route::post('iin-nasional/{iinNasional}/expense-reimbursement', [IinNasionalController::class, 'storeExpenseReimbursement'])->name('iin-nasional.store-expense-reimbursement');
    Route::get('iin-nasional/{iinNasional}/download/{type}/{index?}', [IinNasionalController::class, 'downloadFile'])->name('iin-nasional.download-file');
    Route::get('iin-nasional/{iinNasional}/download-payment-document/{index}', [IinNasionalController::class, 'downloadPaymentDocument'])->name('iin-nasional.download-payment-document');
    Route::get('iin-nasional/{iinNasional}/download-payment-proof/{index}', [IinNasionalController::class, 'downloadPaymentProof'])->name('iin-nasional.download-payment-proof');
    Route::get('iin-nasional/{iinNasional}/download-field-verification-document/{index}', [IinNasionalController::class, 'downloadFieldVerificationDocument'])->name('iin-nasional.download-field-verification-document');
    Route::get('iin-nasional/{iinNasional}/download-additional-document/{index}', [IinNasionalController::class, 'downloadAdditionalDocument'])->name('iin-nasional.download-additional-document');

    // Survey completion routes
    Route::get('survey/check/{applicationType}/{applicationId}', [SurveyController::class, 'check'])->name('survey.check');
    Route::post('survey/complete/{applicationType}/{applicationId}', [SurveyController::class, 'complete'])->name('survey.complete');

    // IIN Single Blockholder routes
    Route::resource('iin-single-blockholder', IinSingleBlockholderController::class);
    Route::post('iin-single-blockholder/{iinSingleBlockholder}/update-status', [IinSingleBlockholderController::class, 'updateStatus'])->name('iin-single-blockholder.update-status');
    Route::post('iin-single-blockholder/{iinSingleBlockholder}/upload-payment-proof', [IinSingleBlockholderController::class, 'uploadPaymentProof'])->name('iin-single-blockholder.upload-payment-proof');
    Route::post('iin-single-blockholder/{iinSingleBlockholder}/upload-certificate', [IinSingleBlockholderController::class, 'uploadCertificate'])->name('iin-single-blockholder.upload-certificate');
    Route::post('iin-single-blockholder/{iinSingleBlockholder}/upload-payment-documents', [IinSingleBlockholderController::class, 'uploadPaymentDocuments'])->name('iin-single-blockholder.upload-payment-documents');
    Route::post('iin-single-blockholder/{iinSingleBlockholder}/upload-field-verification-documents', [IinSingleBlockholderController::class, 'uploadFieldVerificationDocuments'])->name('iin-single-blockholder.upload-field-verification-documents');
    Route::post('iin-single-blockholder/{iinSingleBlockholder}/upload-additional-documents', [IinSingleBlockholderController::class, 'uploadAdditionalDocument'])->name('iin-single-blockholder.upload-additional-documents');
    Route::post('iin-single-blockholder/{iinSingleBlockholder}/expense-reimbursement', [IinSingleBlockholderController::class, 'storeExpenseReimbursement'])->name('iin-single-blockholder.store-expense-reimbursement');
    Route::get('iin-single-blockholder/{iinSingleBlockholder}/download/{type}/{index?}', [IinSingleBlockholderController::class, 'downloadFile'])->name('iin-single-blockholder.download-file');
    Route::get('iin-single-blockholder/{iinSingleBlockholder}/download-payment-document/{index}/{stage?}', [IinSingleBlockholderController::class, 'downloadPaymentDocument'])->name('iin-single-blockholder.download-payment-document');
    Route::get('iin-single-blockholder/{iinSingleBlockholder}/download-payment-proof/{index}', [IinSingleBlockholderController::class, 'downloadPaymentProof'])->name('iin-single-blockholder.download-payment-proof');
    Route::get('iin-single-blockholder/{iinSingleBlockholder}/download-field-verification-document/{index}', [IinSingleBlockholderController::class, 'downloadFieldVerificationDocument'])->name('iin-single-blockholder.download-field-verification-document');
    Route::get('iin-single-blockholder/{iinSingleBlockholder}/download-additional-document/{index}', [IinSingleBlockholderController::class, 'downloadAdditionalDocument'])->name('iin-single-blockholder.download-additional-document');
    Route::get('iin-single-blockholder/{iinSingleBlockholder}/download-all-certificates', [IinSingleBlockholderController::class, 'downloadAllCertificates'])->name('iin-single-blockholder.download-all-certificates');

    // Pengawasan IIN Nasional routes
    Route::resource('pengawasan-iin-nasional', PengawasanIinNasionalController::class);
    Route::post('pengawasan-iin-nasional/{pengawasanIinNasional}/upload-payment-proof', [PengawasanIinNasionalController::class, 'uploadPaymentProof'])->name('pengawasan-iin-nasional.upload-payment-proof');
    Route::post('pengawasan-iin-nasional/{pengawasanIinNasional}/upload-additional-documents', [PengawasanIinNasionalController::class, 'uploadAdditionalDocument'])->name('pengawasan-iin-nasional.upload-additional-documents');
    Route::post('pengawasan-iin-nasional/{pengawasanIinNasional}/expense-reimbursement', [PengawasanIinNasionalController::class, 'storeExpenseReimbursement'])->name('pengawasan-iin-nasional.store-expense-reimbursement');
    Route::get('pengawasan-iin-nasional/{pengawasanIinNasional}/download/{type}/{index?}', [PengawasanIinNasionalController::class, 'downloadFile'])->name('pengawasan-iin-nasional.download-file');
    Route::get('pengawasan-iin-nasional/{pengawasanIinNasional}/download-issuance-document/{index}', [PengawasanIinNasionalController::class, 'downloadIssuanceDocument'])->name('pengawasan-iin-nasional.download-issuance-document');
    // Note: Download routes for payment documents are handled by admin routes only

    // Pengawasan Single IIN routes
    Route::resource('pengawasan-single-iin', PengawasanSingleIinController::class);
    Route::post('pengawasan-single-iin/{pengawasanSingleIin}/upload-payment-proof', [PengawasanSingleIinController::class, 'uploadPaymentProof'])->name('pengawasan-single-iin.upload-payment-proof');
    Route::post('pengawasan-single-iin/{pengawasanSingleIin}/upload-additional-documents', [PengawasanSingleIinController::class, 'uploadAdditionalDocument'])->name('pengawasan-single-iin.upload-additional-documents');
    Route::post('pengawasan-single-iin/{pengawasanSingleIin}/expense-reimbursement', [PengawasanSingleIinController::class, 'storeExpenseReimbursement'])->name('pengawasan-single-iin.expense-reimbursement');
    Route::get('pengawasan-single-iin/{pengawasanSingleIin}/download/{type}/{index?}', [PengawasanSingleIinController::class, 'downloadFile'])->name('pengawasan-single-iin.download-file');
    Route::get('pengawasan-single-iin/{pengawasanSingleIin}/download-payment-document/{index}', [PengawasanSingleIinController::class, 'downloadPaymentDocument'])->name('pengawasan-single-iin.download-payment-document');
    Route::get('pengawasan-single-iin/{pengawasanSingleIin}/download-payment-proof/{index}', [PengawasanSingleIinController::class, 'downloadPaymentProof'])->name('pengawasan-single-iin.download-payment-proof');
    Route::get('pengawasan-single-iin/{pengawasanSingleIin}/download-field-verification-document/{index}', [PengawasanSingleIinController::class, 'downloadFieldVerificationDocument'])->name('pengawasan-single-iin.download-field-verification-document');
    Route::get('pengawasan-single-iin/{pengawasanSingleIin}/download-issuance-document/{index}', [PengawasanSingleIinController::class, 'downloadIssuanceDocument'])->name('pengawasan-single-iin.download-issuance-document');

    // Form download routes
    Route::get('download-form/{type}', function (string $type) {
        // Handle QRIS form from public folder (static file)
        if ($type === 'qris') {
            $filename = 'Surat Pernyataan Penggunaan Sistem Pembayaran Nasional Berbasis QRIS.doc';
            $filePath = public_path("forms/{$filename}");

            if (! file_exists($filePath)) {
                abort(404, 'Form QRIS tidak ditemukan');
            }

            return response()->download($filePath, $filename);
        }

        // Handle dynamic form templates from database
        $formTemplates = App\Models\FormTemplate::getByType($type);

        if ($formTemplates->isEmpty()) {
            abort(404, 'Form tidak ditemukan');
        }

        // Check if all files exist
        foreach ($formTemplates as $template) {
            if (! Storage::disk('public')->exists($template->file_path)) {
                abort(404, "Form tidak ditemukan: {$template->name}");
            }
        }

        // If only one file, download directly
        if ($formTemplates->count() === 1) {
            $template = $formTemplates->first();

            return Storage::disk('public')->download($template->file_path, $template->original_name);
        }

        // Create ZIP for multiple files
        $zipFileName = match ($type) {
            'nasional' => 'Form_IIN_Nasional.zip',
            'single-blockholder' => 'Form_Single_IIN_Blockholder.zip',
            default => 'Forms.zip'
        };

        $zipPath = storage_path("app/temp/{$zipFileName}");

        // Ensure temp directory exists
        if (! file_exists(storage_path('app/temp'))) {
            mkdir(storage_path('app/temp'), 0755, true);
        }

        $zip = new \ZipArchive;
        if ($zip->open($zipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) === true) {
            foreach ($formTemplates as $template) {
                $fileContent = Storage::disk('public')->get($template->file_path);
                if ($fileContent !== null) {
                    $zip->addFromString($template->original_name, $fileContent);
                }
            }
            $zip->close();
        }

        return response()->download($zipPath)->deleteFileAfterSend(true);
    })->name('download-form');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
require __DIR__.'/admin.php';
