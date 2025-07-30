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
            $table->dropColumn('status_from');
        });
        
        Schema::table('iin_status_logs', function (Blueprint $table) {
            $table->enum('status_from', ['draft', 'pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'pembayaran-tahap-2', 'menunggu-terbit', 'terbit'])->nullable()->after('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iin_status_logs', function (Blueprint $table) {
            $table->dropColumn('status_from');
        });
        
        Schema::table('iin_status_logs', function (Blueprint $table) {
            $table->enum('status_from', ['pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])->nullable()->after('user_id');
        });
    }
};