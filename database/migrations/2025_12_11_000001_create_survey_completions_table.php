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
        Schema::create('survey_completions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('application_type'); // 'iin_nasional', 'single_iin', 'pengawasan_iin_nasional', 'pengawasan_single_iin'
            $table->unsignedBigInteger('application_id');
            $table->string('certificate_type')->nullable();
            $table->timestamp('completed_at');
            $table->timestamps();

            // Unique constraint to prevent duplicate entries
            $table->unique(['user_id', 'application_type', 'application_id'], 'survey_completion_unique');
            
            // Index for faster lookups
            $table->index(['application_type', 'application_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('survey_completions');
    }
};
