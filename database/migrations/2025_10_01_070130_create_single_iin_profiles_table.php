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
        Schema::create('single_iin_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('institution_name');
            $table->string('institution_type')->nullable();
            $table->year('year')->nullable();
            $table->string('iin_assignment')->nullable();
            $table->date('assignment_date')->nullable();
            $table->string('regional')->nullable();
            $table->string('usage_purpose')->nullable();
            $table->text('address')->nullable();
            $table->text('address_updated')->nullable();
            $table->string('phone_fax')->nullable();
            $table->string('phone_fax_updated')->nullable();
            $table->string('email')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('remarks_status')->nullable();
            $table->string('card_specimen')->nullable();
            $table->string('previous_name')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('single_iin_profiles');
    }
};
