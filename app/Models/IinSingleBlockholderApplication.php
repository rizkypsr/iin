<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class IinSingleBlockholderApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_number',
        'user_id',
        'status',
        'application_form_path',
        'requirements_archive_path',
        'payment_proof_path',
        'payment_proof_documents',
        'payment_proof_uploaded_at',
        'payment_documents',
        'payment_documents_uploaded_at',
        'payment_proof_documents_stage_2',
        'payment_proof_uploaded_at_stage_2',
        'payment_documents_stage_2',
        'payment_documents_uploaded_at_stage_2',
        'field_verification_documents',
        'field_verification_documents_uploaded_at',
        'certificate_path',
        'additional_documents',
        'iin_number',
        'iin_block_range',
        'notes',
        'submitted_at',
        'payment_verified_at',
        'payment_verified_at_stage_2',
        'field_verification_at',
        'issued_at',
        'viewed_at',
        'admin_id',
        'expense_reim_id',
    ];

    protected $casts = [
        'payment_proof_documents' => 'array',
        'payment_documents' => 'array',
        'payment_proof_documents_stage_2' => 'array',
        'payment_documents_stage_2' => 'array',
        'field_verification_documents' => 'array',
        'additional_documents' => 'array',
        'submitted_at' => 'datetime',
        'payment_verified_at' => 'datetime',
        'payment_verified_at_stage_2' => 'datetime',
        'field_verification_at' => 'datetime',
        'issued_at' => 'datetime',
        'payment_proof_uploaded_at' => 'datetime',
        'payment_documents_uploaded_at' => 'datetime',
        'payment_proof_uploaded_at_stage_2' => 'datetime',
        'payment_documents_uploaded_at_stage_2' => 'datetime',
        'field_verification_documents_uploaded_at' => 'datetime',
        'iin_block_range' => 'array',
        'viewed_at' => 'datetime',
        'additional_documents' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function statusLogs(): MorphMany
    {
        return $this->morphMany(IinStatusLog::class, 'application');
    }

    public function expenseReimbursement(): BelongsTo
    {
        return $this->belongsTo(ExpenseReimbursements::class, 'expense_reim_id');
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pengajuan' => 'Pengajuan',
            'perbaikan' => 'Perbaikan',
            'pembayaran' => 'Pembayaran Tahap 1',
            'verifikasi-lapangan' => 'Verifikasi Lapangan',
            'pembayaran-tahap-2' => 'Pembayaran Tahap 2',
            'menunggu-terbit' => 'Menunggu Terbit',
            'terbit' => 'Terbit',
            default => 'Unknown'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pengajuan' => 'bg-blue-100 text-blue-800',
            'perbaikan' => 'bg-yellow-100 text-yellow-800',
            'pembayaran' => 'bg-orange-100 text-orange-800',
            'verifikasi-lapangan' => 'bg-purple-100 text-purple-800',
            'pembayaran-tahap-2' => 'bg-red-100 text-red-800',
            'menunggu-terbit' => 'bg-cyan-100 text-cyan-800',
            'terbit' => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    public function getServiceTypeAttribute(): string
    {
        return 'single_blockholder';
    }

    public function getServiceLabelAttribute(): string
    {
        return 'Single IIN/Blockholder';
    }

    public function canUploadPaymentProof(): bool
    {
        return in_array($this->status, ['pembayaran', 'pembayaran-tahap-2']);
    }

    public function canUploadFieldVerificationDocuments(): bool
    {
        return in_array($this->status, ['pembayaran']);
    }

    public function canDownloadCertificate(): bool
    {
        return $this->status === 'terbit' && $this->certificate_path;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->application_number = 'IIN-SB-' . date('Ymd') . '-' . str_pad(
                static::whereDate('created_at', today())->count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );
        });
    }
}
