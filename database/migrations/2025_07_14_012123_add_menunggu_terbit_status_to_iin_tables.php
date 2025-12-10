<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify iin_nasional_applications table
        DB::statement("ALTER TABLE iin_nasional_applications MODIFY COLUMN status ENUM('pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit') DEFAULT 'pengajuan'");

        // Modify iin_single_blockholder_applications table
        DB::statement("ALTER TABLE iin_single_blockholder_applications MODIFY COLUMN status ENUM('pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit') DEFAULT 'pengajuan'");

        // Modify iin_status_logs table
        DB::statement("ALTER TABLE iin_status_logs MODIFY COLUMN status_from ENUM('pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit') NULL");
        DB::statement("ALTER TABLE iin_status_logs MODIFY COLUMN status_to ENUM('pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert iin_nasional_applications table
        DB::statement("ALTER TABLE iin_nasional_applications MODIFY COLUMN status ENUM('pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'terbit') DEFAULT 'pengajuan'");

        // Revert iin_single_blockholder_applications table
        DB::statement("ALTER TABLE iin_single_blockholder_applications MODIFY COLUMN status ENUM('pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'terbit') DEFAULT 'pengajuan'");

        // Revert iin_status_logs table
        DB::statement("ALTER TABLE iin_status_logs MODIFY COLUMN status_from ENUM('pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'terbit') NULL");
        DB::statement("ALTER TABLE iin_status_logs MODIFY COLUMN status_to ENUM('pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'terbit')");
    }
};
