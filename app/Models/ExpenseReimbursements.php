<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ExpenseReimbursements extends Model
{

    protected $table = 'expense_reimbursements';

    protected $fillable = [
        'company_name',
        'pic_name',
        'pic_contact',
        'verification_date',
        'is_acknowledged',
        'chief_verificator_amount',
        'member_verificator_amount',
        'payment_proof_path',
    ];

    protected $casts = [
        'verification_date' => 'date',
        'is_acknowledged' => 'boolean',
        'chief_verificator_amount' => 'integer',
        'member_verificator_amount' => 'integer',
    ];
}
