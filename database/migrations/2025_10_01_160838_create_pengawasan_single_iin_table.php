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
        Schema::create('pengawasan_single_iin', function (Blueprint $table) {
            $table->id();
            $table->string('application_number')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('single_iin_profile_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pengajuan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])->default('pengajuan');
            
            // File uploads
            $table->string('agreement_path')->nullable();
            $table->string('payment_proof_path')->nullable();
            
            // Payment documents (uploaded by admin)
            $table->json('payment_documents')->nullable();
            $table->timestamp('payment_documents_uploaded_at')->nullable();
            
            // Payment proof documents (uploaded by user)
            $table->json('payment_proof_documents')->nullable();
            $table->timestamp('payment_proof_uploaded_at')->nullable();
            
            // Field verification documents (uploaded by admin)
            $table->json('field_verification_documents')->nullable();
            $table->timestamp('field_verification_documents_uploaded_at')->nullable();
            
            // Issuance documents (uploaded by admin)
            $table->json('issuance_documents')->nullable();
            $table->timestamp('issuance_documents_uploaded_at')->nullable();
            
            // Status tracking
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('payment_verified_at')->nullable();
            $table->timestamp('field_verification_at')->nullable();
            $table->timestamp('issued_at')->nullable();
            
            // Assignment
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengawasan_single_iin');
    }
};
