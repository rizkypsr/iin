<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SingleIinProfile extends Model
{
    protected $fillable = [
        'user_id',
        'institution_name',
        'institution_type',
        'year',
        'iin_assignment',
        'assignment_date',
        'regional',
        'usage_purpose',
        'address',
        'address_updated',
        'phone_fax',
        'phone_fax_updated',
        'email',
        'contact_person',
        'card_specimen',
        'previous_name',
    ];

    protected $casts = [
        'assignment_date' => 'date',
        'year' => 'integer',
    ];

    /**
     * Get the user that owns the Single IIN profile.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
