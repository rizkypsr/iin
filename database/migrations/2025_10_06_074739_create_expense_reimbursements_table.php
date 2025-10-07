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
        Schema::create('expense_reimbursements', function (Blueprint $table) {
            $table->id();

            $table->string('company_name');
            $table->string('pic_name');
            $table->string('pic_contact');
            $table->date('verification_date');
            $table->boolean('is_acknowledged');
            $table->integer('chief_verificator_amount');
            $table->integer('member_verificator_amount');
            $table->string('payment_proof_path');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expense_reimbursements');
    }
};
