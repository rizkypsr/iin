<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ApplicationCountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            'single_iin_profile.card_specimen' => 'required|string|max:255',
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
            $singleIinData = array_filter($request->single_iin_profile);
            if (!empty($singleIinData)) {
                $user->singleIinProfile()->updateOrCreate(
                    ['user_id' => $user->id],
                    $singleIinData
                );
            } else {
                // Delete if all fields are empty
                $user->singleIinProfile()->delete();
            }
        }

        return back()->with('success', 'Profil berhasil diperbarui');
    }
}