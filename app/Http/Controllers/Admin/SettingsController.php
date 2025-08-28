<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DocumentRequirement;
use App\Services\ApplicationCountService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

final class SettingsController extends Controller
{
    public function index(): Response
    {
        $documentRequirements = [
            'iin_nasional' => DocumentRequirement::getIinNasionalRequirements(),
            'iin_single_blockholder' => DocumentRequirement::getIinSingleBlockholderRequirements(),
        ];

        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/settings/index', [
            'documentRequirements' => $documentRequirements,
            'application_counts' => $applicationCounts
        ]);
    }

    public function updateDocumentRequirements(Request $request)
    {
        $request->validate([
            'type' => 'required|in:iin_nasional,iin_single_blockholder',
            'content' => 'required|string',
        ]);

        DocumentRequirement::updateOrCreate(
            ['type' => $request->type],
            ['content' => $request->content]
        );

        return redirect()->back()->with('success', 'Document requirements updated successfully.');
    }
}
