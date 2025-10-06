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
        Schema::table('pengawasan_iin_nasional_status_logs', function (Blueprint $table) {
            // Drop existing enum columns
            $table->dropColumn(['status_from', 'status_to']);
        });
        
        Schema::table('pengawasan_iin_nasional_status_logs', function (Blueprint $table) {
            // Add new enum columns with correct values matching pengawasan_iin_nasional table
            $table->enum('status_from', ['pengajuan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])->nullable()->after('pengawasan_iin_nasional_id');
            $table->enum('status_to', ['pengajuan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])->after('status_from');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengawasan_iin_nasional_status_logs', function (Blueprint $table) {
            // Drop updated enum columns
            $table->dropColumn(['status_from', 'status_to']);
        });
        
        Schema::table('pengawasan_iin_nasional_status_logs', function (Blueprint $table) {
            // Restore original enum columns
            $table->enum('status_from', ['pengajuan', 'dalam_proses', 'selesai', 'ditolak'])->nullable()->after('pengawasan_iin_nasional_id');
            $table->enum('status_to', ['pengajuan', 'dalam_proses', 'selesai', 'ditolak'])->after('status_from');
        });
    }
};