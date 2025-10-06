<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IinNasionalProfile extends Model
{
    protected $fillable = [
        'user_id',
        'details',
        'institution_name',
        'brand',
        'iin_national_assignment',
        'assignment_year',
        'regional',
        'aspi_recommendation_letter',
        'usage_purpose',
        'address',
        'phone_fax',
        'email_office',
        'contact_person_name',
        'contact_person_email',
        'contact_person_phone',
        'remarks_status',
        'card_issued',
    ];

    protected $casts = [
        'card_issued' => 'boolean',
        'assignment_year' => 'integer',
    ];

    /**
     * Get the user that owns the IIN Nasional profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
