<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SurveyCompletion extends Model
{
    protected $fillable = [
        'user_id',
        'application_type',
        'application_id',
        'certificate_type',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    /**
     * Get the user that completed the survey.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if a user has completed survey for a specific application.
     */
    public static function hasCompleted(int $userId, string $applicationType, int $applicationId): bool
    {
        return self::where('user_id', $userId)
            ->where('application_type', $applicationType)
            ->where('application_id', $applicationId)
            ->exists();
    }

    /**
     * Record a survey completion.
     */
    public static function recordCompletion(int $userId, string $applicationType, int $applicationId, ?string $certificateType = null): self
    {
        return self::firstOrCreate(
            [
                'user_id' => $userId,
                'application_type' => $applicationType,
                'application_id' => $applicationId,
            ],
            [
                'certificate_type' => $certificateType,
                'completed_at' => now(),
            ]
        );
    }
}
