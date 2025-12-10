<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class IinApplicationPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view the application.
     * Explicitly checking roles with Spatie's hasRole method.
     */
    public function view(User $user, $application)
    {
        return $user->id === $application->user_id || $user->hasRole('admin');
    }

    /**
     * Determine whether the user can update the status of the application.
     * Only admin can update status now.
     */
    public function updateStatus(User $user, $application)
    {
        $isAdmin = $user->hasRole('admin');

        // Log the permission check
        \Illuminate\Support\Facades\Log::debug('Update status permission check (SingleBlockholder)', [
            'user_id' => $user->id,
            'roles' => $user->getRoleNames()->toArray(),
            'is_admin' => $isAdmin,
        ]);

        return $isAdmin;
    }

    public function uploadPaymentProof(User $user, $application)
    {
        return $user->id === $application->user_id &&
               $application->status === 'pembayaran';
    }

    public function downloadFile(User $user, $application)
    {
        return $user->id === $application->user_id ||
               $user->hasRole('admin');
    }

    public function uploadCertificate(User $user, $application)
    {
        return $user->role === 'admin' &&
               in_array($application->status, ['menunggu-terbit', 'terbit']);
    }
}
