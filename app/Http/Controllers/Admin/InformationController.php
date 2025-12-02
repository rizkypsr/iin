<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Information;
use App\Services\ApplicationCountService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

final class InformationController extends Controller
{
    public function index(): Response
    {
        $information = Information::getActive();

        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/information/index', [
            'information' => $information,
            'application_counts' => $applicationCounts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        // Deactivate all existing information
        Information::query()->update(['is_active' => false]);

        // Create new active information
        Information::create([
            'title' => $request->title,
            'content' => $request->content,
            'is_active' => true,
        ]);

        return redirect()->back()->with('success', 'Informasi berhasil disimpan.');
    }

    public function update(Request $request, Information $information)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
        ]);

        $information->update([
            'title' => $request->title,
            'content' => $request->content,
        ]);

        return redirect()->back()->with('success', 'Informasi berhasil diperbarui.');
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120', // 5MB max
        ]);

        $path = $request->file('image')->store('information-images', 'public');

        return response()->json([
            'url' => Storage::url($path),
        ]);
    }
}
