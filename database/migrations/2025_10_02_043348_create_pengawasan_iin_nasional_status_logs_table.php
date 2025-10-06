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
        Schema::create('pengawasan_iin_nasional_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengawasan_iin_nasional_id')
                ->constrained('pengawasan_iin_nasional', 'id', 'pengawasan_iin_nasional_fk')
                ->onDelete('cascade');
            $table->enum('status_from', ['pengajuan', 'dalam_proses', 'selesai', 'ditolak'])->nullable();
            $table->enum('status_to', ['pengajuan', 'dalam_proses', 'selesai', 'ditolak']);
            $table->text('notes')->nullable();
            $table->foreignId('changed_by')
                ->nullable()
                ->constrained('users', 'id', 'changed_by_fk')
                ->onDelete('set null');
            $table->timestamps();
            
            $table->index(['pengawasan_iin_nasional_id', 'created_at'], 'pengawasan_iin_nasional_logs_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengawasan_iin_nasional_status_logs');
    }
};
