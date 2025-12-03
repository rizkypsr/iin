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
        $informations = Information::latest()->paginate(6);

        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/information/index', [
            'informations' => $informations,
            'application_counts' => $applicationCounts,
        ]);
    }

    public function create(): Response
    {
        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/information/create', [
            'application_counts' => $applicationCounts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = Storage::url($request->file('image')->store('information-images', 'public'));
        }

        Information::create([
            'title' => $request->title,
            'image' => $imagePath,
            'content' => $request->content,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return redirect()->route('admin.information.index')->with('success', 'Informasi berhasil ditambahkan.');
    }

    public function edit(Information $information): Response
    {
        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/information/edit', [
            'information' => $information,
            'application_counts' => $applicationCounts,
        ]);
    }

    public function update(Request $request, Information $information)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'content' => 'required|string',
            'is_active' => 'boolean',
        ]);

        $data = [
            'title' => $request->title,
            'content' => $request->content,
            'is_active' => $request->boolean('is_active', $information->is_active),
        ];

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($information->image) {
                $oldPath = str_replace('/storage/', '', $information->image);
                Storage::disk('public')->delete($oldPath);
            }
            $data['image'] = Storage::url($request->file('image')->store('information-images', 'public'));
        }

        $information->update($data);

        return redirect()->route('admin.information.index')->with('success', 'Informasi berhasil diperbarui.');
    }

    public function destroy(Information $information)
    {
        // Delete image if exists
        if ($information->image) {
            $path = str_replace('/storage/', '', $information->image);
            Storage::disk('public')->delete($path);
        }

        $information->delete();

        return redirect()->route('admin.information.index')->with('success', 'Informasi berhasil dihapus.');
    }

    public function uploadImage(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ]);

        $path = $request->file('image')->store('information-images', 'public');

        return response()->json([
            'url' => Storage::url($path),
        ]);
    }
}
