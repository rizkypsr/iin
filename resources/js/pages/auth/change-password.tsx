import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Lock, LogOut } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from '@inertiajs/react';

export default function ChangePassword() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                // Redirect to dashboard after successful password change
                window.location.href = route('dashboard');
            },
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Head title="Ubah Password Wajib" />
            
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <Lock className="w-6 h-6 text-amber-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        Ubah Password Wajib
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                        Anda harus mengubah password default untuk melanjutkan
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <Alert className="border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                            Untuk keamanan akun Anda, silakan ubah password default dengan password yang lebih aman.
                        </AlertDescription>
                    </Alert>

                    <form onSubmit={updatePassword} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_password" className="text-sm font-medium text-gray-700">
                                Password Saat Ini <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type="password"
                                className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                autoComplete="current-password"
                                placeholder="Masukkan password saat ini"
                                required
                            />
                            <InputError message={errors.current_password} className="text-xs" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password Baru <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                autoComplete="new-password"
                                placeholder="Masukkan password baru"
                                required
                            />
                            <InputError message={errors.password} className="text-xs" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-sm font-medium text-gray-700">
                                Konfirmasi Password Baru <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                className="h-11 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                autoComplete="new-password"
                                placeholder="Konfirmasi password baru"
                                required
                            />
                            <InputError message={errors.password_confirmation} className="text-xs" />
                        </div>

                    <div className="pt-4 space-y-3">
                        <Button 
                            type="submit"
                            disabled={processing}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors duration-200"
                        >
                            {processing ? 'Mengubah Password...' : 'Ubah Password'}
                        </Button>
                        
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            onBefore={() => confirm('Apakah Anda yakin ingin keluar dari sistem?')}
                            className="w-full h-11 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors duration-200 rounded-md flex items-center justify-center gap-2 border border-gray-300"
                        >
                            <LogOut className="h-4 w-4" />
                            Keluar
                        </Link>
                    </div>
                    </form>

                    <div className="text-center">
                        <p className="text-xs text-gray-500">
                            Password harus minimal 8 karakter dan mengandung kombinasi huruf dan angka
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}