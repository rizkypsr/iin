<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasRoles;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'company_name',
        'company_phone',
        'company_email',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
    
    /**
     * Check if the user has a specific role
     * This method extends Spatie's HasRoles trait functionality
     * to also check the legacy 'role' column for backward compatibility
     *
     * @param mixed $roles
     * @param string|null $guard
     * @return bool
     */
    public function hasRole($roles, $guard = null): bool
    {
        // Check using Spatie's HasRoles functionality
        if ($this->hasSpatieTrait()) {
            // Use the original trait method via the collection of roles
            if ($this->roles->pluck('name')->contains($roles)) {
                return true;
            }
        }
        
        // Fallback to direct role property check for backward compatibility
        if (isset($this->role) && $this->role === $roles) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Helper method to check if the HasRoles trait is properly loaded
     * and the roles relationship is accessible
     * 
     * @return bool
     */
    protected function hasSpatieTrait(): bool
    {
        return method_exists($this, 'roles') && $this->roles !== null;
    }
}
