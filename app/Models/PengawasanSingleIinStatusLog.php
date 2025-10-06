<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PengawasanSingleIinStatusLog extends Model
{
    protected $fillable = [
        'pengawasan_single_iin_id',
        'status_from',
        'status_to',
        'notes',
        'changed_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the pengawasan single IIN that owns this status log.
     */
    public function pengawasanSingleIin(): BelongsTo
    {
        return $this->belongsTo(PengawasanSingleIin::class);
    }

    /**
     * Get the user who changed the status.
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * Scope to get logs for a specific pengawasan.
     */
    public function scopeForPengawasan($query, $pengawasanId)
    {
        return $query->where('pengawasan_single_iin_id', $pengawasanId);
    }

    /**
     * Scope to order by latest first.
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }
}
