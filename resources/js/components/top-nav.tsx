import { Button } from '@/components/ui/button';
import { SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function TopNav() {
    const { auth, ziggy } = usePage<SharedData>().props;
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        { href: route('home'), label: 'Beranda' },
        { href: route('jenis-layanan'), label: 'Layanan' },
        { href: route('alur-pendaftaran'), label: 'Pendaftaran' },
        { href: route('tarif'), label: 'Tarif' },
        { href: route('layanan-publik'), label: 'Informasi' },
        { href: route('pengaduan'), label: 'Pengaduan' },
    ];

    return (
        <nav className="fixed top-0 right-0 left-0 z-50">
            <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-gray-200 bg-white px-6 py-2 shadow-lg transition-all duration-300">
                    <div className="flex h-12 items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href={route('home')} className="group flex items-center space-x-2">
                                <span className="text-xl font-bold text-gray-900 transition-colors duration-300">
                                    Portal Layanan Otoritas Sponsor
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden items-center space-x-8 lg:flex">
                            {navigationItems.map((item) => {
                                const isActive =
                                    ziggy.location === item.href || (item.href !== route('home') && ziggy.location.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 ${
                                            isActive ? 'font-semibold text-[#01AEEC]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Auth Section */}
                        <div className="hidden items-center space-x-4 lg:flex">
                            {auth.user ? (
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-600 transition-colors duration-300">Hi, {auth.user.name}</span>
                                    <Link href={route('dashboard')}>
                                        <Button
                                            size="sm"
                                            className="bg-gradient-accent hover:bg-gradient-secondary rounded-full border-0 px-4 text-white transition-all duration-300"
                                        >
                                            Dashboard
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link href={route('login')}>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full text-gray-600 transition-all duration-300 hover:bg-gray-100 hover:text-gray-900"
                                        >
                                            Masuk
                                        </Button>
                                    </Link>
                                    <Link href={route('register')}>
                                        <Button
                                            size="sm"
                                            className="bg-gradient-accent hover:bg-gradient-secondary rounded-full border-0 px-4 text-white transition-all duration-300"
                                        >
                                            Daftar
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="lg:hidden">
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 text-gray-600 transition-colors hover:text-gray-900"
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="mt-2 rounded-b-xl border-t border-gray-200 bg-white shadow-lg transition-all duration-300 lg:hidden">
                            <div className="space-y-2 py-4">
                                {/* Mobile Navigation Links */}
                                {navigationItems.map((item) => {
                                    const isActive =
                                        ziggy.location === item.href || (item.href !== route('home') && ziggy.location.startsWith(item.href));
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`mx-2 block rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                                                isActive ? 'font-semibold text-blue-600' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                            }`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}

                                {/* Mobile Auth Section */}
                                <div className="mt-4 border-t border-gray-200 pt-2">
                                    {auth.user ? (
                                        <div className="space-y-2">
                                            <div className="px-4 py-2 text-sm text-gray-600">Hi, {auth.user.name}</div>
                                            <Link href={route('dashboard')} className="block px-4">
                                                <Button
                                                    className="bg-gradient-accent hover:bg-gradient-secondary w-full rounded-full border-0 text-white transition-all duration-300"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Dashboard
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-2 px-4">
                                            <Link href={route('login')} className="block">
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-center rounded-full text-gray-600 transition-all duration-300 hover:bg-gray-100 hover:text-gray-900"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Masuk
                                                </Button>
                                            </Link>
                                            <Link href={route('register')} className="block">
                                                <Button
                                                    className="bg-gradient-accent hover:bg-gradient-secondary w-full rounded-full border-0 text-white transition-all duration-300"
                                                    onClick={() => setIsMobileMenuOpen(false)}
                                                >
                                                    Daftar
                                                </Button>
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
