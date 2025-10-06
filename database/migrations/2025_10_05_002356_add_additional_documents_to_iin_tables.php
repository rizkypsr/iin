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
        Schema::table('iin_nasional_applications', function (Blueprint $table) {
            $table->json('additional_documents')->nullable()->after('certificate_path');
        });

        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->json('additional_documents')->nullable()->after('certificate_path');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iin_nasional_applications', function (Blueprint $table) {
            $table->dropColumn('additional_documents');
        });

        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->dropColumn('additional_documents');
        });
    }
};
