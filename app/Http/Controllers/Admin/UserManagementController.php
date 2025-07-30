<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
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
        return Inertia::render('admin/create-user');
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
        ]);

        // Only allow admin to create admin accounts
        if ($request->role === 'admin' && !Auth::user()->hasRole('admin')) {
            abort(403, 'Unauthorized. Only admins can create admin accounts.');
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Assign the specified role
        $user->assignRole($request->role);

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
        
        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'user' => $user->load('roles'),
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
