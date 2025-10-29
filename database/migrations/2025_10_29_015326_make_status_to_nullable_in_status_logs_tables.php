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
        // Make status_to nullable in iin_status_logs table
        Schema::table('iin_status_logs', function (Blueprint $table) {
            $table->string('status_to')->nullable()->change();
        });

        // Make status_to nullable in pengawasan_iin_nasional_status_logs table
        Schema::table('pengawasan_iin_nasional_status_logs', function (Blueprint $table) {
            $table->string('status_to')->nullable()->change();
        });

        // Make status_to nullable in pengawasan_single_iin_status_logs table
        Schema::table('pengawasan_single_iin_status_logs', function (Blueprint $table) {
            $table->string('status_to')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert status_to to not nullable in iin_status_logs table
        Schema::table('iin_status_logs', function (Blueprint $table) {
            $table->string('status_to')->nullable(false)->change();
        });

        // Revert status_to to not nullable in pengawasan_iin_nasional_status_logs table
        Schema::table('pengawasan_iin_nasional_status_logs', function (Blueprint $table) {
            $table->string('status_to')->nullable(false)->change();
        });

        // Revert status_to to not nullable in pengawasan_single_iin_status_logs table
        Schema::table('pengawasan_single_iin_status_logs', function (Blueprint $table) {
            $table->string('status_to')->nullable(false)->change();
        });
    }
};
