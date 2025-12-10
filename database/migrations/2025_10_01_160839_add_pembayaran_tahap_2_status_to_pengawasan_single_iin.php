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
        Schema::table('pengawasan_single_iin', function (Blueprint $table) {
            $table->enum('status', ['pengajuan', 'pembayaran', 'pembayaran-tahap-2', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])
                ->default('pengajuan')
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengawasan_single_iin', function (Blueprint $table) {
            $table->enum('status', ['pengajuan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])
                ->default('pengajuan')
                ->change();
        });
    }
};
