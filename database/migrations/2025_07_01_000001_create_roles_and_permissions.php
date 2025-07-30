<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    public function up()
    {
        // Create roles
        $adminRole = Role::create(['name' => 'admin']);
        $userRole = Role::create(['name' => 'user']);

        // Create permissions for admin
        $adminPermissions = [
            'admin.dashboard',
            'permohonan.view',
            'permohonan.create',
            'permohonan.edit',
            'permohonan.delete',
            'pembayaran.view',
            'pembayaran.edit',
            'pengawasan.view',
            'pengawasan.create',
            'pengawasan.edit',
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
        ];

        // Create permissions for user
        $userPermissions = [
            'dashboard.user',
            'notifikasi.view',
            'pengaduan.view',
            'pengaduan.create',
            'profil.view',
            'profil.edit',
            'permohonan.create',
            'permohonan.view.own',
        ];

        // Verificator permissions now handled by admin
        $verificatorPermissions = [
            'verifikasi-lapangan.view',
            'verifikasi-lapangan.create',
            'verifikasi-lapangan.edit',
            'laporan.view',
            'laporan.create',
        ];

        // Create all permissions - admin now gets verificator permissions too
        $adminPermissions = array_merge($adminPermissions, $verificatorPermissions);
        $allPermissions = array_merge($adminPermissions, $userPermissions);
        $uniquePermissions = array_unique($allPermissions);

        foreach ($uniquePermissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Assign permissions to roles
        $adminRole->givePermissionTo($adminPermissions);
        $userRole->givePermissionTo($userPermissions);
    }

    public function down()
    {
        // Remove all roles and permissions
        Role::whereIn('name', ['admin', 'user'])->delete();
        Permission::whereIn('name', [
            'admin.dashboard', 'dashboard.user',
            'permohonan.view', 'permohonan.create', 'permohonan.edit', 'permohonan.delete', 'permohonan.view.own',
            'pembayaran.view', 'pembayaran.edit',
            'pengawasan.view', 'pengawasan.create', 'pengawasan.edit',
            'users.view', 'users.create', 'users.edit', 'users.delete',
            'notifikasi.view', 'pengaduan.view', 'pengaduan.create',
            'profil.view', 'profil.edit',
            'verifikasi-lapangan.view', 'verifikasi-lapangan.create', 'verifikasi-lapangan.edit',
            'laporan.view', 'laporan.create',
        ])->delete();
    }
};
