<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class IinApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_number',
        'user_id',
        'status',
        'application_form_path',
        'payment_proof_path',
        'certificate_path',
        'iin_number',
        'notes',
        'submitted_at',
        'payment_verified_at',
        'field_verification_at',
        'issued_at',
        'viewed_at',
        'admin_id',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'payment_verified_at' => 'datetime',
        'field_verification_at' => 'datetime',
        'issued_at' => 'datetime',
        'viewed_at' => 'datetime',
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

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'pengajuan' => 'Pengajuan',
            'perbaikan' => 'Perbaikan',
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
            'perbaikan' => 'bg-yellow-100 text-yellow-800',
            'pembayaran' => 'bg-orange-100 text-orange-800',
            'verifikasi-lapangan' => 'bg-purple-100 text-purple-800',
            'menunggu-terbit' => 'bg-cyan-100 text-cyan-800',
            'terbit' => 'bg-green-100 text-green-800',
            default => 'bg-gray-100 text-gray-800'
        };
    }

    public function getServiceTypeAttribute(): string
    {
        return 'nasional';
    }

    public function getServiceLabelAttribute(): string
    {
        return 'IIN Nasional';
    }

    public function canUploadPaymentProof(): bool
    {
        return $this->status === 'pembayaran';
    }

    public function canDownloadCertificate(): bool
    {
        return $this->status === 'terbit' && $this->certificate_path;
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            $model->application_number = 'IIN-NAS-'.date('Ymd').'-'.str_pad(
                static::whereDate('created_at', today())->count() + 1,
                4,
                '0',
                STR_PAD_LEFT
            );
        });
    }
}
