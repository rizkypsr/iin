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
        Schema::create('iin_nasional_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->text('details')->nullable();
            $table->string('institution_name');
            $table->string('brand')->nullable();
            $table->string('iin_national_assignment')->nullable();
            $table->year('assignment_year')->nullable();
            $table->string('regional')->nullable();
            $table->string('aspi_recommendation_letter')->nullable();
            $table->string('usage_purpose')->nullable();
            $table->text('address')->nullable();
            $table->string('phone_fax')->nullable();
            $table->string('email_office')->nullable();
            $table->string('contact_person_name')->nullable();
            $table->string('contact_person_email')->nullable();
            $table->string('contact_person_phone')->nullable();
            $table->string('remarks_status')->nullable();
            $table->boolean('card_issued')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('iin_nasional_profiles');
    }
};
