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
        // add expense_reimbursements_id to iin_nasinal_applications and iin_single_blockholder_applications
        Schema::table('iin_nasional_applications', function (Blueprint $table) {
            $table->foreignId('expense_reim_id')->nullable()->constrained('expense_reimbursements')->onDelete('set null');
        });

        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->foreignId('expense_reim_id')->nullable()->constrained('expense_reimbursements')->onDelete('set null');
        });

        // add expense_reimbursements_id to pengawasan_iin_nasional and pengawasan_single_iin
        Schema::table('pengawasan_iin_nasional', function (Blueprint $table) {
            $table->foreignId('expense_reim_id')->nullable()->constrained('expense_reimbursements')->onDelete('set null');
        });

        Schema::table('pengawasan_single_iin', function (Blueprint $table) {
            $table->foreignId('expense_reim_id')->nullable()->constrained('expense_reimbursements')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('iin_nasional_applications', function (Blueprint $table) {
            $table->dropForeign(['expense_reimbursements_id']);
            $table->dropColumn('expense_reimbursements_id');
        });

        Schema::table('iin_single_blockholder_applications', function (Blueprint $table) {
            $table->dropForeign(['expense_reimbursements_id']);
            $table->dropColumn('expense_reimbursements_id');
        });

        Schema::table('pengawasan_iin_nasional', function (Blueprint $table) {
            $table->dropForeign(['expense_reimbursements_id']);
            $table->dropColumn('expense_reimbursements_id');
        });

        Schema::table('pengawasan_single_iin', function (Blueprint $table) {
            $table->dropForeign(['expense_reimbursements_id']);
            $table->dropColumn('expense_reimbursements_id');
        });
    }
};
