<?php

namespace App\Policies;

use App\Models\IinSingleBlockholderApplication;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class IinSingleBlockholderApplicationPolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view the list
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, IinSingleBlockholderApplication $iinSingleBlockholderApplication): bool
    {
        return $user->id === $iinSingleBlockholderApplication->user_id ||
               $user->hasRole('admin');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('user');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, IinSingleBlockholderApplication $iinSingleBlockholderApplication): bool
    {
        // Only owner can update, and only in certain statuses
        return $user->id === $iinSingleBlockholderApplication->user_id &&
               in_array($iinSingleBlockholderApplication->status, ['pengajuan', 'perbaikan']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, IinSingleBlockholderApplication $iinSingleBlockholderApplication): bool
    {
        // Only owner can delete
        return $user->id === $iinSingleBlockholderApplication->user_id;
    }

    /**
     * Determine whether the user can update the status of the application.
     */
    public function updateStatus(User $user, IinSingleBlockholderApplication $iinSingleBlockholderApplication): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can upload payment proof.
     */
    public function uploadPaymentProof(User $user, IinSingleBlockholderApplication $iinSingleBlockholderApplication): bool
    {
        return $user->id === $iinSingleBlockholderApplication->user_id &&
               in_array($iinSingleBlockholderApplication->status, ['pembayaran', 'pembayaran-tahap-2']);
    }

    /**
     * Determine whether the user can upload payment documents.
     */
    public function uploadPaymentDocuments(User $user, IinSingleBlockholderApplication $iinSingleBlockholderApplication): bool
    {
        return $user->hasRole('admin') &&
               in_array($iinSingleBlockholderApplication->status, ['pembayaran', 'pembayaran-tahap-2', 'verifikasi-lapangan']);
    }

    /**
     * Determine whether the user can upload certificate.
     */
    public function uploadCertificate(User $user, IinSingleBlockholderApplication $iinSingleBlockholderApplication): bool
    {
        return $user->hasRole('admin') &&
               in_array($iinSingleBlockholderApplication->status, ['menunggu-terbit', 'terbit']);
    }

    /**
     * Determine whether the user can upload field verification documents.
     */
    public function uploadFieldVerificationDocuments(User $user, IinSingleBlockholderApplication $iinSingleBlockholderApplication): bool
    {
        return $user->hasRole('admin') &&
               $iinSingleBlockholderApplication->status === 'pembayaran';
    }

    /**
     * Determine whether the user can download files.
     */
    public function downloadFile(User $user, IinSingleBlockholderApplication $iinSingleBlockholderApplication): bool
    {
        // User can download their own files
        // Admins can download all files
        return $user->id === $iinSingleBlockholderApplication->user_id ||
               $user->hasRole('admin');
    }
}
