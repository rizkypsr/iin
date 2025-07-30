<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add payment proof documents fields to iin_nasional_applications
        Schema::table('iin_nasional_applications', function (Blueprint $table) {
            $table->json('payment_proof_documents')->nullable()->after('payment_proof_path');
            $table->timestamp('payment_proof_uploaded_at')->nullable()->after('payment_proof_documents');
        });

        // Add payment proof documents fields to iin_single_blockholder_applications
        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->json('payment_proof_documents')->nullable()->after('payment_proof_path');
            $table->timestamp('payment_proof_uploaded_at')->nullable()->after('payment_proof_documents');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iin_nasional_applications', function (Blueprint $table) {
            $table->dropColumn(['payment_proof_documents', 'payment_proof_uploaded_at']);
        });

        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->dropColumn(['payment_proof_documents', 'payment_proof_uploaded_at']);
        });
    }
};