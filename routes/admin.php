<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Admin\IinNasionalAdminController;
use App\Http\Controllers\Admin\IinSingleBlockholderAdminController;
use App\Http\Controllers\Admin\SettingsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    // Admin Dashboard
    Route::get('/', function () {
        // Get comprehensive admin statistics
        $totalApplications = App\Models\IinNasionalApplication::count() + 
                           App\Models\IinSingleBlockholderApplication::count();
        
        $pendingReview = App\Models\IinNasionalApplication::whereIn('status', ['pengajuan', 'perbaikan'])->count() +
                       App\Models\IinSingleBlockholderApplication::whereIn('status', ['pengajuan', 'perbaikan'])->count();
        
        $approved = App\Models\IinNasionalApplication::where('status', 'terbit')->count() +
                   App\Models\IinSingleBlockholderApplication::where('status', 'terbit')->count();
        
        $totalUsers = App\Models\User::count();
        
        $awaitingPayment = App\Models\IinNasionalApplication::where('status', 'pembayaran')->count() +
                         App\Models\IinSingleBlockholderApplication::where('status', 'pembayaran')->count();
        
        $fieldVerification = App\Models\IinNasionalApplication::where('status', 'verifikasi-lapangan')->count() +
                           App\Models\IinSingleBlockholderApplication::where('status', 'verifikasi-lapangan')->count();
        
        $awaitingIssuance = App\Models\IinNasionalApplication::where('status', 'menunggu-terbit')->count() +
                          App\Models\IinSingleBlockholderApplication::where('status', 'menunggu-terbit')->count();
        
        $rejected = App\Models\IinNasionalApplication::where('status', 'ditolak')->count() +
                   App\Models\IinSingleBlockholderApplication::where('status', 'ditolak')->count();
        
        // Recent applications for activity feed
        $recentApplications = App\Models\IinNasionalApplication::with('user')
            ->latest()
            ->take(5)
            ->get()
            ->map(function($item) {
                $item->type = 'nasional';
                return $item;
            })
            ->merge(
                App\Models\IinSingleBlockholderApplication::with('user')
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function($item) {
                        $item->type = 'single_blockholder';
                        return $item;
                    })
            )
            ->sortByDesc('created_at')
            ->take(10);
        
        $stats = [
            'total_applications' => $totalApplications,
            'pending_review' => $pendingReview,
            'approved' => $approved,
            'total_users' => $totalUsers,
            'awaiting_payment' => $awaitingPayment,
            'field_verification' => $fieldVerification,
            'awaiting_issuance' => $awaitingIssuance,
            'rejected' => $rejected
        ];
        
        // Get application counts for sidebar badges
        $applicationCountService = new App\Services\ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();
        
        return Inertia::render('admin-dashboard', [
            'stats' => $stats,
            'recent_applications' => $recentApplications,
            'application_counts' => $applicationCounts
        ]);
    })->name('dashboard');
    // User Management Routes
    Route::get('/users', [UserManagementController::class, 'index'])->name('users.index');
    Route::get('/users/create', [UserManagementController::class, 'create'])->name('users.create');
    Route::post('/users', [UserManagementController::class, 'store'])->name('users.store');
    Route::get('/users/{user}/edit', [UserManagementController::class, 'edit'])->name('users.edit');
    Route::put('/users/{user}', [UserManagementController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserManagementController::class, 'destroy'])->name('users.destroy');
    
    // IIN Nasional Admin Routes
    Route::get('/iin-nasional', [IinNasionalAdminController::class, 'index'])->name('iin-nasional.index');
    Route::get('/iin-nasional/{iinNasional}', [IinNasionalAdminController::class, 'show'])->name('iin-nasional.show');
    Route::post('/iin-nasional/{iinNasional}/update-status', [IinNasionalAdminController::class, 'updateStatus'])->name('iin-nasional.update-status');
    Route::post('/iin-nasional/{iinNasional}/upload-certificate', [IinNasionalAdminController::class, 'uploadCertificate'])->name('iin-nasional.upload-certificate');
    Route::post('/iin-nasional/{iinNasional}/upload-payment-documents', [IinNasionalAdminController::class, 'uploadPaymentDocuments'])->name('iin-nasional.upload-payment-documents');
    Route::post('/iin-nasional/{iinNasional}/upload-field-verification-documents', [IinNasionalAdminController::class, 'uploadFieldVerificationDocuments'])->name('iin-nasional.upload-field-verification-documents');
    Route::get('/iin-nasional/{iinNasional}/download/{type}', [IinNasionalAdminController::class, 'downloadFile'])->name('iin-nasional.download-file');
    Route::get('/iin-nasional/{iinNasional}/download-payment-document/{index}', [IinNasionalAdminController::class, 'downloadPaymentDocument'])->name('iin-nasional.download-payment-document');
    Route::get('/iin-nasional/{iinNasional}/download-payment-proof/{index}', [IinNasionalAdminController::class, 'downloadPaymentProof'])->name('iin-nasional.download-payment-proof');
    Route::get('/iin-nasional/{iinNasional}/download-field-verification-document/{index}', [IinNasionalAdminController::class, 'downloadFieldVerificationDocument'])->name('iin-nasional.download-field-verification-document');
    
    // IIN Single Blockholder Admin Routes
    Route::get('/iin-single-blockholder', [IinSingleBlockholderAdminController::class, 'index'])->name('iin-single-blockholder.index');
    Route::get('/iin-single-blockholder/{iinSingleBlockholder}', [IinSingleBlockholderAdminController::class, 'show'])->name('iin-single-blockholder.show');
    Route::post('/iin-single-blockholder/{iinSingleBlockholder}/update-status', [IinSingleBlockholderAdminController::class, 'updateStatus'])->name('iin-single-blockholder.update-status');
    Route::post('/iin-single-blockholder/{iinSingleBlockholder}/upload-certificate', [IinSingleBlockholderAdminController::class, 'uploadCertificate'])->name('iin-single-blockholder.upload-certificate');
    Route::post('/iin-single-blockholder/{iinSingleBlockholder}/upload-payment-documents', [IinSingleBlockholderAdminController::class, 'uploadPaymentDocuments'])->name('iin-single-blockholder.upload-payment-documents');
    Route::post('/iin-single-blockholder/{iinSingleBlockholder}/upload-field-verification-documents', [IinSingleBlockholderAdminController::class, 'uploadFieldVerificationDocuments'])->name('iin-single-blockholder.upload-field-verification-documents');
    Route::get('/iin-single-blockholder/{iinSingleBlockholder}/download/{type}', [IinSingleBlockholderAdminController::class, 'downloadFile'])->name('iin-single-blockholder.download-file');
    Route::get('/iin-single-blockholder/{iinSingleBlockholder}/download-payment-document/{index}', [IinSingleBlockholderAdminController::class, 'downloadPaymentDocument'])->name('iin-single-blockholder.download-payment-document');
    Route::get('/iin-single-blockholder/{iinSingleBlockholder}/download-payment-proof/{index}', [IinSingleBlockholderAdminController::class, 'downloadPaymentProof'])->name('iin-single-blockholder.download-payment-proof');
    Route::get('/iin-single-blockholder/{iinSingleBlockholder}/download-field-verification-document/{index}', [IinSingleBlockholderAdminController::class, 'downloadFieldVerificationDocument'])->name('iin-single-blockholder.download-field-verification-document');
    
    // Settings Routes
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings/document-requirements', [SettingsController::class, 'updateDocumentRequirements'])->name('settings.update-document-requirements');
});
