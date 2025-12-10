<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class IinStatusLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_type',
        'application_id',
        'user_id',
        'status_from',
        'status_to',
        'notes',
    ];

    public function application(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who changed the status.
     */
    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Auto-set application_type and application_id if not set
            if (! $model->application_type && ! $model->application_id && $model->application) {
                $model->application_type = $model->application->getServiceTypeAttribute();
                $model->application_id = $model->application->id;
            }
        });
    }
}
