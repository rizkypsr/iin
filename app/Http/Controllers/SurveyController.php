<?php

namespace App\Http\Controllers;

use App\Models\SurveyCompletion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SurveyController extends Controller
{
    /**
     * Check if user has completed survey for a specific application.
     */
    public function check(string $applicationType, int $applicationId): JsonResponse
    {
        $userId = Auth::id();
        
        $hasCompleted = SurveyCompletion::hasCompleted($userId, $applicationType, $applicationId);

        return response()->json([
            'has_completed' => $hasCompleted,
        ]);
    }

    /**
     * Record survey completion when user downloads certificate.
     */
    public function complete(Request $request, string $applicationType, int $applicationId): JsonResponse
    {
        $userId = Auth::id();
        
        $request->validate([
            'certificate_type' => 'nullable|string|max:255',
        ]);

        $completion = SurveyCompletion::recordCompletion(
            $userId,
            $applicationType,
            $applicationId,
            $request->input('certificate_type')
        );

        return response()->json([
            'success' => true,
            'message' => 'Survey completion recorded',
            'data' => $completion,
        ]);
    }
}
