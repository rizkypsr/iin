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
        Schema::create('pengawasan_single_iin_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pengawasan_single_iin_id')
                ->constrained('pengawasan_single_iin', 'id', 'pengawasan_single_iin_fk')
                ->onDelete('cascade');
            $table->enum('status_from', ['pengajuan', 'dalam_proses', 'selesai', 'ditolak'])->nullable();
            $table->enum('status_to', ['pengajuan', 'dalam_proses', 'selesai', 'ditolak']);
            $table->text('notes')->nullable();
            $table->foreignId('changed_by')
                ->nullable()
                ->constrained('users', 'id', 'single_iin_changed_by_fk')
                ->onDelete('set null');
            $table->timestamps();

            $table->index(['pengawasan_single_iin_id', 'created_at'], 'pengawasan_single_iin_logs_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengawasan_single_iin_status_logs');
    }
};
