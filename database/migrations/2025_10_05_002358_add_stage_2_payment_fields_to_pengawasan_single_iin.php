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
        // Add stage 2 payment fields to pengawasan_single_iin
        Schema::table('pengawasan_single_iin', function (Blueprint $table) {
            $table->json('payment_proof_documents_stage_2')->nullable();
            $table->timestamp('payment_proof_uploaded_at_stage_2')->nullable()->after('payment_proof_documents_stage_2');
            $table->json('payment_documents_stage_2')->nullable()->after('payment_proof_uploaded_at_stage_2');
            $table->timestamp('payment_documents_uploaded_at_stage_2')->nullable()->after('payment_documents_stage_2');
            $table->timestamp('payment_verified_at_stage_2')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengawasan_single_iin', function (Blueprint $table) {
            $table->dropColumn([
                'payment_proof_documents_stage_2',
                'payment_proof_uploaded_at_stage_2',
                'payment_documents_stage_2',
                'payment_documents_uploaded_at_stage_2',
                'payment_verified_at_stage_2',
            ]);
        });
    }
};
