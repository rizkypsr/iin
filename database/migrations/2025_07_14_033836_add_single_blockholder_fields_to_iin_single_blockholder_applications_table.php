<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Single Blockholder applications already have the same base structure as IIN Nasional
        // They just use different file uploads (agreement_path, business_plan_path)
        // No additional fields needed
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No fields were added, so nothing to drop
    }
};
