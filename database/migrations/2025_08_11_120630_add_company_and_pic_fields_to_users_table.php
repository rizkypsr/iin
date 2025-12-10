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
        Schema::table('users', function (Blueprint $table) {
            // Company fields
            $table->string('company_name')->nullable()->after('email');
            $table->string('company_phone')->nullable()->after('company_name');
            $table->string('company_email')->nullable()->after('company_phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'company_name',
                'company_phone',
                'company_email',
            ]);
        });
    }
};
