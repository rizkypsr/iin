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
         Schema::table('pengawasan_iin_nasional', function (Blueprint $table) {
            $table->json('additional_documents')->nullable();
        });

        Schema::table('pengawasan_single_iin', function (Blueprint $table) {
            $table->json('additional_documents')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengawasan_iin_nasional', function (Blueprint $table) {
            $table->dropColumn('additional_documents');
        });

        Schema::table('pengawasan_single_iin', function (Blueprint $table) {
            $table->dropColumn('additional_documents');
        });
    }
};
