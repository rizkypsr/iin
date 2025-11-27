<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ApplicationCountService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Show the admin user creation page.
     */
    public function create(): Response
    {
        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/create-user', [
            'application_counts' => $applicationCounts
        ]);
    }

    /**
     * Handle user creation by admin.
     * Only admins can create admin accounts.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:user,admin',
            // IIN Nasional Profile validation
            'iin_nasional_profile.institution_name' => 'nullable|string|max:255',
            'iin_nasional_profile.brand' => 'nullable|string|max:255',
            'iin_nasional_profile.iin_national_assignment' => 'nullable|string|max:255',
            'iin_nasional_profile.assignment_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'iin_nasional_profile.regional' => 'nullable|string|max:255',
            'iin_nasional_profile.phone_fax' => 'nullable|string|max:255',
            'iin_nasional_profile.email_office' => 'nullable|email|max:255',
            'iin_nasional_profile.contact_person' => 'nullable|string|max:255',
            'iin_nasional_profile.contact_person_phone' => 'nullable|string|max:255',
            'iin_nasional_profile.contact_person_email' => 'nullable|email|max:255',
            'iin_nasional_profile.details' => 'required|string',
            'iin_nasional_profile.usage_purpose' => 'nullable|string',
            'iin_nasional_profile.address' => 'nullable|string',
            'iin_nasional_profile.card_issued' => 'nullable|boolean',
            // Single IIN Profile validation
            'single_iin_profile.institution_name' => 'nullable|string|max:255',
            'single_iin_profile.type' => 'nullable|string|max:255',
            'single_iin_profile.year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'single_iin_profile.iin_assignment' => 'nullable|string|max:255',
            'single_iin_profile.assignment_date' => 'nullable|date',
            'single_iin_profile.regional' => 'nullable|string|max:255',
            'single_iin_profile.usage_purpose' => 'nullable|string',
            'single_iin_profile.address' => 'nullable|string',
            'single_iin_profile.updated_address' => 'nullable|string',
            'single_iin_profile.phone_fax' => 'nullable|string|max:255',
            'single_iin_profile.updated_phone_fax' => 'nullable|string|max:255',
            'single_iin_profile.email' => 'nullable|email|max:255',
            'single_iin_profile.contact_person' => 'nullable|string|max:255',
            'single_iin_profile.card_specimen' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'single_iin_profile.previous_name' => 'nullable|string|max:255',
        ]);

        // Only allow admin to create admin accounts
        if ($request->role === 'admin' && !Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized. Only admins can create admin accounts.');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'password_changed_at' => $request->password === env('DEFAULT_PASSWORD', 'password123') ? null : now(),
        ]);

        // Assign the specified role
        $user->assignRole($request->role);

        // Create IIN Nasional Profile if data is provided
        if ($request->has('iin_nasional_profile') && !empty(array_filter($request->iin_nasional_profile))) {
            $user->iinNasionalProfile()->create($request->iin_nasional_profile);
        }

        // Create Single IIN Profile if data is provided
        if ($request->has('single_iin_profile') && !empty(array_filter($request->single_iin_profile))) {
            $singleIinData = $request->single_iin_profile;

            if ($request->hasFile('single_iin_profile.card_specimen')) {
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
                $user->singleIinProfile()->create($singleIinData);
            }
        }

        return to_route('admin.users.index')
            ->with('success', ucfirst($request->role) . ' account created successfully.');
    }

    /**
     * Display a listing of users.
     */
    public function index(Request $request): Response
    {
        $query = User::with('roles');
        
        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('email', 'like', '%' . $search . '%')
                  ->orWhereHas('roles', function ($roleQuery) use ($search) {
                      $roleQuery->where('name', 'like', '%' . $search . '%');
                  });
            });
        }
        
        $users = $query->paginate(10)->withQueryString();
        
        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();
        
        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search']),
            'application_counts' => $applicationCounts
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $applicationCountService = new ApplicationCountService();
        $applicationCounts = $applicationCountService->getNewApplicationCounts();

        return Inertia::render('admin/users/edit', [
            'user' => $user->load(['roles', 'iinNasionalProfile', 'singleIinProfile']),
            'application_counts' => $applicationCounts
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|in:user,admin',
            // IIN Nasional Profile validation
            'iin_nasional_profile.institution_name' => 'nullable|string|max:255',
            'iin_nasional_profile.brand' => 'nullable|string|max:255',
            'iin_nasional_profile.iin_national_assignment' => 'nullable|string|max:255',
            'iin_nasional_profile.assignment_year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'iin_nasional_profile.regional' => 'nullable|string|max:255',
            'iin_nasional_profile.phone_fax' => 'nullable|string|max:255',
            'iin_nasional_profile.email_office' => 'nullable|email|max:255',
            'iin_nasional_profile.contact_person' => 'nullable|string|max:255',
            'iin_nasional_profile.contact_person_phone' => 'nullable|string|max:255',
            'iin_nasional_profile.contact_person_email' => 'nullable|email|max:255',
            'iin_nasional_profile.details' => 'required|string',
            'iin_nasional_profile.usage_purpose' => 'nullable|string',
            'iin_nasional_profile.address' => 'nullable|string',
            'iin_nasional_profile.card_issued' => 'nullable|boolean',
            // Single IIN Profile validation
            'single_iin_profile.institution_name' => 'nullable|string|max:255',
            'single_iin_profile.type' => 'nullable|string|max:255',
            'single_iin_profile.year' => 'nullable|integer|min:1900|max:' . date('Y'),
            'single_iin_profile.iin_assignment' => 'nullable|string|max:255',
            'single_iin_profile.assignment_date' => 'nullable|date',
            'single_iin_profile.regional' => 'nullable|string|max:255',
            'single_iin_profile.usage_purpose' => 'nullable|string',
            'single_iin_profile.address' => 'nullable|string',
            'single_iin_profile.updated_address' => 'nullable|string',
            'single_iin_profile.phone_fax' => 'nullable|string|max:255',
            'single_iin_profile.updated_phone_fax' => 'nullable|string|max:255',
            'single_iin_profile.email' => 'nullable|email|max:255',
            'single_iin_profile.contact_person' => 'nullable|string|max:255',
            'single_iin_profile.card_specimen' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'single_iin_profile.previous_name' => 'nullable|string|max:255',
        ]);

        // Only allow admin to change roles to admin
        if ($request->role === 'admin' && !Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized. Only admins can assign admin roles.');
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Update role
        $user->syncRoles([$request->role]);

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

        return to_route('admin.users.index')
            ->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified user.
     */
    public function destroy(User $user): RedirectResponse
    {
        // Prevent admin from deleting themselves
        if ($user->id === Auth::id()) {
            return to_route('admin.users.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $user->delete();

        return to_route('admin.users.index')
            ->with('success', 'User deleted successfully.');
    }
}
