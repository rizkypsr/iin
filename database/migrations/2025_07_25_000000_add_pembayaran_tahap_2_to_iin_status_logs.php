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
        Schema::table('iin_status_logs', function (Blueprint $table) {
            // Drop existing enum columns
            $table->dropColumn(['status_from', 'status_to']);
        });
        
        Schema::table('iin_status_logs', function (Blueprint $table) {
            // Add new enum columns with updated values
            $table->enum('status_from', ['pengajuan', 'perbaikan', 'pembayaran', 'pembayaran-tahap-2', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])->nullable()->after('user_id');
            $table->enum('status_to', ['pengajuan', 'perbaikan', 'pembayaran', 'pembayaran-tahap-2', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])->after('status_from');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iin_status_logs', function (Blueprint $table) {
            // Drop updated enum columns
            $table->dropColumn(['status_from', 'status_to']);
        });
        
        Schema::table('iin_status_logs', function (Blueprint $table) {
            // Restore original enum columns
            $table->enum('status_from', ['pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])->nullable()->after('user_id');
            $table->enum('status_to', ['pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])->after('status_from');
        });
    }
};