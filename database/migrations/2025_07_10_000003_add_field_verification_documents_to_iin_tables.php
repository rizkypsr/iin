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
        // Add field verification documents fields to iin_nasional_applications
        Schema::table('iin_nasional_applications', function (Blueprint $table) {
            $table->json('field_verification_documents')->nullable();
            $table->timestamp('field_verification_documents_uploaded_at')->nullable()->after('field_verification_documents');
        });

        // Add field verification documents fields to iin_single_blockholder_applications
        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->json('field_verification_documents')->nullable();
            $table->timestamp('field_verification_documents_uploaded_at')->nullable()->after('field_verification_documents');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iin_nasional_applications', function (Blueprint $table) {
            $table->dropColumn(['field_verification_documents', 'field_verification_documents_uploaded_at']);
        });

        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->dropColumn(['field_verification_documents', 'field_verification_documents_uploaded_at']);
        });
    }
};