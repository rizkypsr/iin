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
        // Add payment documents fields to iin_nasional_applications
        Schema::table('iin_nasional_applications', function (Blueprint $table) {
            $table->json('payment_documents')->nullable()->after('payment_proof_path');
            $table->timestamp('payment_documents_uploaded_at')->nullable()->after('payment_documents');
        });

        // Add payment documents fields to iin_single_blockholder_applications
        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->json('payment_documents')->nullable()->after('payment_proof_path');
            $table->timestamp('payment_documents_uploaded_at')->nullable()->after('payment_documents');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iin_nasional_applications', function (Blueprint $table) {
            $table->dropColumn(['payment_documents', 'payment_documents_uploaded_at']);
        });

        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->dropColumn(['payment_documents', 'payment_documents_uploaded_at']);
        });
    }
};