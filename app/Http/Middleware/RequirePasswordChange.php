<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Symfony\Component\HttpFoundation\Response;

class RequirePasswordChange
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();
        
        // Skip if user is not authenticated
        if (!$user) {
            return $next($request);
        }
        
        // Skip if already on password change route
        if ($request->routeIs('password.change') || $request->routeIs('password.update')) {
            return $next($request);
        }
        
        // Skip for logout route
        if ($request->routeIs('logout')) {
            return $next($request);
        }
        
        // Check if user is using default password and hasn't changed it
        $defaultPassword = env('DEFAULT_PASSWORD', 'password123');
        $isUsingDefaultPassword = Hash::check($defaultPassword, $user->password);
        
        if ($isUsingDefaultPassword && is_null($user->password_changed_at)) {
            return redirect()->route('password.change');
        }
        
        return $next($request);
    }
}
