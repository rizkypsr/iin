<?php

namespace App\Policies;

use App\Models\PengawasanIinNasional;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PengawasanIinNasionalPolicy
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
    public function view(User $user, PengawasanIinNasional $pengawasanIinNasional): bool
    {
        return $user->id === $pengawasanIinNasional->user_id ||
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
    public function update(User $user, PengawasanIinNasional $pengawasanIinNasional): bool
    {
        // Only owner can update, and only in certain statuses
        return $user->id === $pengawasanIinNasional->user_id &&
               in_array($pengawasanIinNasional->status, ['pengajuan']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PengawasanIinNasional $pengawasanIinNasional): bool
    {
        // Only owner can delete
        return $user->id === $pengawasanIinNasional->user_id;
    }

    /**
     * Determine whether the user can update the status of the application.
     */
    public function updateStatus(User $user, PengawasanIinNasional $pengawasanIinNasional): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can upload payment proof.
     */
    public function uploadPaymentProof(User $user, PengawasanIinNasional $pengawasanIinNasional): bool
    {
        return $user->id === $pengawasanIinNasional->user_id &&
               $pengawasanIinNasional->status === 'pembayaran';
    }

    /**
     * Determine whether the user can upload payment documents.
     */
    public function uploadPaymentDocuments(User $user, PengawasanIinNasional $pengawasanIinNasional): bool
    {
        return $user->hasRole('admin') &&
               in_array($pengawasanIinNasional->status, ['pengajuan', 'pembayaran']);
    }

    /**
     * Determine whether the user can upload field verification documents.
     */
    public function uploadFieldVerificationDocuments(User $user, PengawasanIinNasional $pengawasanIinNasional): bool
    {
        return $user->hasRole('admin') &&
               $pengawasanIinNasional->status === 'pembayaran';
    }

    /**
     * Determine whether the user can upload issuance documents.
     */
    public function uploadIssuanceDocuments(User $user, PengawasanIinNasional $pengawasanIinNasional): bool
    {
        return $user->hasRole('admin') &&
               $pengawasanIinNasional->status === 'menunggu-terbit';
    }

    /**
     * Determine whether the user can download files.
     */
    public function downloadFile(User $user, PengawasanIinNasional $pengawasanIinNasional): bool
    {
        // User can download their own files
        // Admins can download all files
        return $user->id === $pengawasanIinNasional->user_id ||
               $user->hasRole('admin');
    }
}
