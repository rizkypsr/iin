<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class PengawasanSingleIin extends Model
{
    use HasFactory;

    protected $table = 'pengawasan_single_iin';

    protected $fillable = [
        'application_number',
        'user_id',
        'single_iin_profile_id',
        'status',
        'agreement_path',
        'payment_proof_path',
        'payment_documents',
        'payment_documents_uploaded_at',
        'payment_proof_documents',
        'payment_proof_uploaded_at',
        'payment_proof_documents_stage_2',
        'payment_proof_uploaded_at_stage_2',
        'payment_documents_stage_2',
        'payment_documents_uploaded_at_stage_2',
        'payment_verified_at_stage_2',
        'field_verification_documents',
        'field_verification_documents_uploaded_at',
        'issuance_documents',
        'issuance_documents_uploaded_at',
        'submitted_at',
        'payment_verified_at',
        'field_verification_at',
        'issued_at',
        'admin_id',
    ];

    protected $casts = [
        'payment_documents' => 'array',
        'payment_proof_documents' => 'array',
        'payment_proof_documents_stage_2' => 'array',
        'payment_documents_stage_2' => 'array',
        'field_verification_documents' => 'array',
        'issuance_documents' => 'array',
        'submitted_at' => 'datetime',
        'payment_verified_at' => 'datetime',
        'payment_verified_at_stage_2' => 'datetime',
        'field_verification_at' => 'datetime',
        'issued_at' => 'datetime',
        'payment_documents_uploaded_at' => 'datetime',
        'payment_proof_uploaded_at' => 'datetime',
        'payment_proof_uploaded_at_stage_2' => 'datetime',
        'payment_documents_uploaded_at_stage_2' => 'datetime',
        'field_verification_documents_uploaded_at' => 'datetime',
        'issuance_documents_uploaded_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function singleIinProfile(): BelongsTo
    {
        return $this->belongsTo(SingleIinProfile::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }

    public function statusLogs(): MorphMany
    {
        return $this->morphMany(IinStatusLog::class, 'application');
    }

    public function pengawasanStatusLogs(): HasMany
    {
        return $this->hasMany(PengawasanSingleIinStatusLog::class);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pengajuan' => 'Pengajuan',
            'pembayaran' => 'Pembayaran',
            'verifikasi-lapangan' => 'Verifikasi Lapangan',
            'menunggu-terbit' => 'Menunggu Terbit',
            'terbit' => 'Terbit',
            default => 'Unknown'
        };
    }

    public function getStatusColorAttribute(): string
    {
        return match ($this->status) {
            'pengajuan' => 'bg-blue-100 text-blue-800',
            'pembayaran' => 'bg-orange-100 text-orange-800',
            'verifikasi-lapangan' => 'bg-purple-100 text-purple-800',
            'menunggu-terbit' => 'bg-cyan-100 text-cyan-800',
            'terbit' => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    public function canUploadPaymentProof(): bool
    {
        return in_array($this->status, ['pembayaran', 'pembayaran-tahap-2']);
    }

    public function canUploadFieldVerificationDocuments(): bool
    {
        return in_array($this->status, ['verifikasi-lapangan']);
    }

    public function canDownloadIssuanceDocuments(): bool
    {
        return $this->status === 'terbit' && $this->issuance_documents;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->application_number = 'PENGAWASAN-SINGLE-' . date('Ymd') . '-' . str_pad(
                static::whereDate('created_at', today())->count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );
        });
    }
}