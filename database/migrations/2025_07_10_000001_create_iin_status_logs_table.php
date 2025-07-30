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
        Schema::create('iin_status_logs', function (Blueprint $table) {
            $table->id();
            $table->string('application_type'); // 'nasional' or 'single_blockholder'
            $table->unsignedBigInteger('application_id'); // ID from respective table
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('status_from', ['pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])->nullable();
            $table->enum('status_to', ['pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit']);
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Index for polymorphic relationship
            $table->index(['application_type', 'application_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iin_status_logs');
    }
};
