<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ApplicationCountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile page.
     */
    public function show(Request $request): Response
    {
        $user = Auth::user();
        $user->load(['iinNasionalProfile', 'singleIinProfile']);

        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('dashboard/profil', [
            'user' => $user,
            'application_counts' => $applicationCounts,
        ]);
    }

    /**
     * Update the user's basic profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . Auth::id(),
            // IIN Nasional Profile validation
            'iin_nasional_profile.institution_name' => 'required|string|max:255',
            'iin_nasional_profile.brand' => 'required|string|max:255',
            'iin_nasional_profile.iin_national_assignment' => 'required|string|max:255',
            'iin_nasional_profile.assignment_year' => 'required|integer|min:1900|max:' . date('Y'),
            'iin_nasional_profile.regional' => 'required|string|max:255',
            'iin_nasional_profile.phone_fax' => 'required|string|max:255',
            'iin_nasional_profile.email_office' => 'required|email|max:255',
            'iin_nasional_profile.contact_person_name' => 'required|string|max:255',
            'iin_nasional_profile.contact_person_phone' => 'required|string|max:255',
            'iin_nasional_profile.contact_person_email' => 'required|email|max:255',
            'iin_nasional_profile.details' => 'required|string',
            'iin_nasional_profile.usage_purpose' => 'required|string',
            'iin_nasional_profile.address' => 'required|string',
            'iin_nasional_profile.card_issued' => 'required|boolean',
            // Single IIN Profile validation
            'single_iin_profile.institution_name' => 'required|string|max:255',
            'single_iin_profile.institution_type' => 'required|string|max:255',
            'single_iin_profile.year' => 'required|integer|min:1900|max:' . date('Y'),
            'single_iin_profile.iin_assignment' => 'required|string|max:255',
            'single_iin_profile.assignment_date' => 'required|date',
            'single_iin_profile.regional' => 'required|string|max:255',
            'single_iin_profile.usage_purpose' => 'required|string',
            'single_iin_profile.address' => 'required|string',
            'single_iin_profile.address_updated' => 'required|string',
            'single_iin_profile.phone_fax' => 'required|string|max:255',
            'single_iin_profile.phone_fax_updated' => 'required|string|max:255',
            'single_iin_profile.email' => 'required|email|max:255',
            'single_iin_profile.contact_person' => 'required|string|max:255',
            'single_iin_profile.card_specimen' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'single_iin_profile.previous_name' => 'required|string|max:255',
        ]);

        $user = Auth::user();

        // Update basic user information
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Update or create IIN Nasional Profile
        if ($request->has('iin_nasional_profile')) {
            $iinNasionalData = array_filter($request->iin_nasional_profile);
            if (!empty($iinNasionalData)) {
                $user->iinNasionalProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $iinNasionalData
                );
            } else {
                // Delete if all fields are empty
                $user->iinNasionalProfile()->delete();
            }
        }

        // Update or create Single IIN Profile
        if ($request->has('single_iin_profile')) {
            $singleIinData = $request->single_iin_profile;

            if ($request->hasFile('single_iin_profile.card_specimen')) {
                $existing = $user->singleIinProfile?->card_specimen;
                if ($existing && Storage::disk('public')->exists($existing)) {
                    Storage::disk('public')->delete($existing);
                }

                $file = $request->file('single_iin_profile.card_specimen');
                $filename = 'single_iin_card_specimen_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('single-iin/card-specimen', $filename, 'public');
                $singleIinData['card_specimen'] = $path;
            } else {
                if (isset($singleIinData['card_specimen']) && !is_string($singleIinData['card_specimen'])) {
                    unset($singleIinData['card_specimen']);
                }
            }

            $singleIinData = array_filter($singleIinData, function ($v) {
                return !is_null($v) && $v !== '';
            });

            if (!empty($singleIinData)) {
                $user->singleIinProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $singleIinData
                );
            } else {
                $user->singleIinProfile()->delete();
            }
        }

        return back()->with('success', 'Profil berhasil diperbarui');
    }

    /**
     * Update only basic name/email.
     */
    public function updateBasic(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . Auth::id(),
        ]);

        $user = Auth::user();
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return back()->with('success', 'Informasi dasar berhasil diperbarui');
    }

    /**
     * Update only IIN Nasional profile.
     */
    public function updateIinNasional(Request $request): RedirectResponse
    {
        $request->validate([
            'iin_nasional_profile.institution_name' => 'required|string|max:255',
            'iin_nasional_profile.brand' => 'required|string|max:255',
            'iin_nasional_profile.iin_national_assignment' => 'required|string|max:255',
            'iin_nasional_profile.assignment_year' => 'required|integer|min:1900|max:' . date('Y'),
            'iin_nasional_profile.regional' => 'required|string|max:255',
            'iin_nasional_profile.phone_fax' => 'required|string|max:255',
            'iin_nasional_profile.email_office' => 'required|email|max:255',
            'iin_nasional_profile.contact_person_name' => 'required|string|max:255',
            'iin_nasional_profile.contact_person_phone' => 'required|string|max:255',
            'iin_nasional_profile.contact_person_email' => 'required|email|max:255',
            'iin_nasional_profile.details' => 'required|string',
            'iin_nasional_profile.usage_purpose' => 'required|string',
            'iin_nasional_profile.address' => 'required|string',
            'iin_nasional_profile.card_issued' => 'required|boolean',
        ]);

        $user = Auth::user();
        if ($request->has('iin_nasional_profile')) {
            $iinNasionalData = array_filter($request->iin_nasional_profile);
            if (!empty($iinNasionalData)) {
                $user->iinNasionalProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $iinNasionalData
                );
            } else {
                $user->iinNasionalProfile()->delete();
            }
        }

        return back()->with('success', 'Profil IIN Nasional berhasil diperbarui');
    }

    /**
     * Update only Single IIN profile.
     */
    public function updateSingleIin(Request $request): RedirectResponse
    {
        $request->validate([
            'single_iin_profile.institution_name' => 'required|string|max:255',
            'single_iin_profile.year' => 'required|integer|min:1900|max:' . date('Y'),
            'single_iin_profile.iin_assignment' => 'required|string|max:255',
            'single_iin_profile.assignment_date' => 'required|date',
            'single_iin_profile.regional' => 'required|string|max:255',
            'single_iin_profile.usage_purpose' => 'required|string',
            'single_iin_profile.address' => 'required|string',
            'single_iin_profile.address_updated' => 'required|string',
            'single_iin_profile.phone_fax' => 'required|string|max:255',
            'single_iin_profile.phone_fax_updated' => 'required|string|max:255',
            'single_iin_profile.email' => 'required|email|max:255',
            'single_iin_profile.contact_person' => 'required|string|max:255',
            'single_iin_profile.previous_name' => 'required|string|max:255',
        ]);

        if ($request->hasFile('single_iin_profile.card_specimen')) {
            $request->validate([
                'single_iin_profile.card_specimen' => 'image|mimes:jpg,jpeg,png|max:2048',
            ]);
        }

        if ($request->hasFile('single_iin_profile.card_specimen')) {
            $request->validate([
                'single_iin_profile.card_specimen' => 'image|mimes:jpg,jpeg,png|max:2048',
            ]);
        }

        $user = Auth::user();
        if ($request->has('single_iin_profile')) {
            $singleIinData = $request->single_iin_profile;

            if ($request->hasFile('single_iin_profile.card_specimen')) {
                $existing = $user->singleIinProfile?->card_specimen;
                if ($existing && Storage::disk('public')->exists($existing)) {
                    Storage::disk('public')->delete($existing);
                }

                $file = $request->file('single_iin_profile.card_specimen');
                $filename = 'single_iin_card_specimen_' . $user->id . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('single-iin/card-specimen', $filename, 'public');
                $singleIinData['card_specimen'] = $path;
            } else {
                if (isset($singleIinData['card_specimen']) && !is_string($singleIinData['card_specimen'])) {
                    unset($singleIinData['card_specimen']);
                }
            }

            $singleIinData = array_filter($singleIinData, function ($v) {
                return !is_null($v) && $v !== '';
            });

            if (!empty($singleIinData)) {
                $user->singleIinProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $singleIinData
                );
            } else {
                $user->singleIinProfile()->delete();
            }
        }

        return back()->with('success', 'Profil Single IIN berhasil diperbarui');
    }
}
