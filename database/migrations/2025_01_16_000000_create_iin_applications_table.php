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
        Schema::create('iin_nasional_applications', function (Blueprint $table) {
            $table->id();
            $table->string('application_number')->unique();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])->default('pengajuan');
            
            // File uploads
            $table->string('application_form_path')->nullable();
            $table->string('payment_proof_path')->nullable();
            $table->string('certificate_path')->nullable();
            
            // IIN details (filled when issued)
            $table->string('iin_number')->nullable();
            $table->json('iin_range')->nullable(); // Store range information
            $table->text('notes')->nullable();
            
            // Status tracking
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('payment_verified_at')->nullable();
            $table->timestamp('field_verification_at')->nullable();
            $table->timestamp('issued_at')->nullable();
            
            // Assignment
            $table->foreignId('verificator_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('admin_id')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iin_nasional_applications');
    }
};
