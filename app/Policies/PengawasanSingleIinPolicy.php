<?php

namespace App\Policies;

use App\Models\PengawasanSingleIin;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class PengawasanSingleIinPolicy
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
    public function view(User $user, PengawasanSingleIin $pengawasanSingleIin): bool
    {
        return $user->id === $pengawasanSingleIin->user_id ||
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
    public function update(User $user, PengawasanSingleIin $pengawasanSingleIin): bool
    {
        // Only owner can update, and only in certain statuses
        return $user->id === $pengawasanSingleIin->user_id && 
               in_array($pengawasanSingleIin->status, ['pengajuan']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, PengawasanSingleIin $pengawasanSingleIin): bool
    {
        // Only owner can delete
        return $user->id === $pengawasanSingleIin->user_id;
    }

    /**
     * Determine whether the user can update the status of the application.
     */
    public function updateStatus(User $user, PengawasanSingleIin $pengawasanSingleIin): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Determine whether the user can upload payment proof.
     */
    public function uploadPaymentProof(User $user, PengawasanSingleIin $pengawasanSingleIin): bool
    {
        return $user->id === $pengawasanSingleIin->user_id && 
               in_array($pengawasanSingleIin->status, ['pembayaran', 'pembayaran-tahap-2']);
    }

    /**
     * Determine whether the user can upload payment documents.
     */
    public function uploadPaymentDocuments(User $user, PengawasanSingleIin $pengawasanSingleIin): bool
    {
        return $user->hasRole('admin') && 
               in_array($pengawasanSingleIin->status, ['pengajuan', 'pembayaran']);
    }

    /**
     * Determine whether the user can upload field verification documents.
     */
    public function uploadFieldVerificationDocuments(User $user, PengawasanSingleIin $pengawasanSingleIin): bool
    {
        return $user->hasRole('admin') && 
               $pengawasanSingleIin->status === 'pembayaran';
    }

    /**
     * Determine whether the user can upload issuance documents.
     */
    public function uploadIssuanceDocuments(User $user, PengawasanSingleIin $pengawasanSingleIin): bool
    {
        return $user->hasRole('admin') && 
               $pengawasanSingleIin->status === 'menunggu-terbit';
    }

    /**
     * Determine whether the user can download files.
     */
    public function downloadFile(User $user, PengawasanSingleIin $pengawasanSingleIin): bool
    {
        // User can download their own files
        // Admins can download all files
        return $user->id === $pengawasanSingleIin->user_id ||
               $user->hasRole('admin');
    }
}