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
        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->enum('status', ['pengajuan', 'perbaikan', 'pembayaran', 'pembayaran-tahap-2', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])
                ->default('pengajuan')
                ->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->enum('status', ['pengajuan', 'perbaikan', 'pembayaran', 'verifikasi-lapangan', 'menunggu-terbit', 'terbit'])
                ->default('pengajuan')
                ->change();
        });
    }
};
