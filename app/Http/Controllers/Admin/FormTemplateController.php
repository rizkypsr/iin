<?php

declare(strict_types=1);

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FormTemplate;
use App\Services\ApplicationCountService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

final class FormTemplateController extends Controller
{
    public function index(): Response
    {
        $nasionalForms = FormTemplate::getNasionalForms();
        $singleBlockholderForms = FormTemplate::getSingleBlockholderForms();

        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/form-templates/index', [
            'nasionalForms' => $nasionalForms,
            'singleBlockholderForms' => $singleBlockholderForms,
            'application_counts' => $applicationCounts,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'type' => 'required|in:nasional,single-blockholder',
            'name' => 'required|string|max:255',
            'file' => 'required|file|max:51200|mimes:pdf,doc,docx,jpg,jpeg,png,gif,webp,zip,rar', // 50MB max
        ]);

        $file = $request->file('file');
        $path = $file->store('form-templates', 'public');

        $maxOrder = FormTemplate::where('type', $request->type)->max('order') ?? 0;

        FormTemplate::create([
            'type' => $request->type,
            'name' => $request->name,
            'file_path' => $path,
            'original_name' => $file->getClientOriginalName(),
            'order' => $maxOrder + 1,
        ]);

        return redirect()->back()->with('success', 'Form template berhasil ditambahkan.');
    }

    public function update(Request $request, FormTemplate $formTemplate)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'file' => 'nullable|file|max:51200|mimes:pdf,doc,docx,jpg,jpeg,png,gif,webp,zip,rar',
        ]);

        $data = ['name' => $request->name];

        if ($request->hasFile('file')) {
            // Delete old file
            Storage::disk('public')->delete($formTemplate->file_path);

            $file = $request->file('file');
            $data['file_path'] = $file->store('form-templates', 'public');
            $data['original_name'] = $file->getClientOriginalName();
        }

        $formTemplate->update($data);

        return redirect()->back()->with('success', 'Form template berhasil diperbarui.');
    }

    public function destroy(FormTemplate $formTemplate)
    {
        Storage::disk('public')->delete($formTemplate->file_path);
        $formTemplate->delete();

        return redirect()->back()->with('success', 'Form template berhasil dihapus.');
    }
}
