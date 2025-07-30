<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Gate;
use App\Models\IinNasionalApplication;
use App\Models\IinSingleBlockholderApplication;
use App\Models\User;
use App\Policies\IinApplicationPolicy;
use App\Policies\IinNasionalApplicationPolicy;
use App\Policies\IinSingleBlockholderApplicationPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(IinNasionalApplication::class, IinNasionalApplicationPolicy::class);
        Gate::policy(IinSingleBlockholderApplication::class, IinSingleBlockholderApplicationPolicy::class);
        
        // Define additional gates for specific actions if needed
        Gate::define('view-iin-nasional', function (User $user) {
            return $user->hasRole('user') || $user->hasRole('admin');
        });
        
        Gate::define('manage-iin-nasional', function (User $user) {
            return $user->hasRole('admin');
        });
        
        Gate::define('accessAdmin', function (User $user) {
            return $user->hasRole('admin');
        });
        
        Gate::define('accessUser', function (User $user) {
            return $user->hasRole('user');
        });
    }
}
