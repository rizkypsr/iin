<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $userRole = Role::firstOrCreate(['name' => 'user']);

        // Create default admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@iin.go.id'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('password'),
            ]
        );

        // Assign admin role
        $admin->assignRole($adminRole);

        // Create default user
        $user = User::firstOrCreate(
            ['email' => 'user@iin.go.id'],
            [
                'name' => 'Regular User',
                'password' => Hash::make('password'),
            ]
        );

        // Assign user role
        $user->assignRole($userRole);
    }
}
