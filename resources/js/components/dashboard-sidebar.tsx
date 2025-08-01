import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ChevronRight, FileText, LayoutDashboard, LogOut, User as UserIcon, Users, CreditCard } from 'lucide-react';

interface DashboardSidebarProps {
    user?: User;
}

const menuItems = {
    user: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'IIN Nasional', href: '/iin-nasional', icon: FileText },
        { name: 'Single IIN/Blockholder', href: '/iin-single-blockholder', icon: CreditCard },
        // { name: 'Profil', href: '/dashboard/profil', icon: UserIcon },
    ],
    admin: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'IIN Nasional', href: '/admin/iin-nasional', icon: FileText },
        { name: 'Single IIN/Blockholder', href: '/admin/iin-single-blockholder', icon: CreditCard },
        { name: 'User Management', href: '/admin/users', icon: Users },
    ],

};

export default function DashboardSidebar() {
    const { user }: DashboardSidebarProps = usePage().props.auth as any;

    // Determine the user's role - using the direct role property that is now guaranteed to exist
    const userRole = user?.role || 'user'; // Default to 'user' if somehow undefined

    // Make sure we select the correct menu items based on role
    let currentMenuItems;
    if (userRole === 'admin') {
        currentMenuItems = menuItems.admin;

    } else {
        // Default to user menu for any other role
        currentMenuItems = menuItems.user;
    }

    return (
        <div className="flex h-full flex-col overflow-hidden">
            {/* Modern User Info */}
            {user && (
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="border-b border-purple-200/50 bg-white/70 p-6 backdrop-blur-sm"
                >
                    <div className="flex items-center space-x-3 rounded-xl border border-purple-200/30 bg-gradient-to-r from-purple-50/80 to-purple-100/60 p-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-purple-800 shadow-md">
                            <UserIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="truncate text-xs text-gray-500 mb-1">{user.email}</p>
                            <Badge
                                variant={userRole === 'admin' ? 'destructive' : 'default'}
                                className="h-4 py-0 text-xs inline-flex"
                            >
                                {userRole === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Modern Navigation Menu */}
            <nav className="flex-1 overflow-y-auto bg-white/50 p-4 backdrop-blur-sm">
                <div className="space-y-2">
                    {currentMenuItems.map((item, index) => {
                        const Icon = item.icon;
                        
                        return (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                            >
                                <Link
                                    href={item.href || '#'}
                                    className={cn(
                                        'group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                        'text-gray-700 hover:text-gray-900',
                                        'hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50',
                                        'hover:shadow-md hover:shadow-purple-100/50',
                                        'border border-transparent hover:border-purple-200/50',
                                        'backdrop-blur-sm',
                                    )}
                                >
                                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 transition-all duration-200 group-hover:from-purple-100 group-hover:to-blue-100">
                                        <Icon className="h-5 w-5 text-gray-600 group-hover:text-purple-700" />
                                    </div>
                                    <span className="flex-1 group-hover:text-gray-900">{item.name}</span>
                                    <ChevronRight className="h-4 w-4 transform text-gray-400 transition-all duration-200 group-hover:translate-x-1 group-hover:text-purple-600" />
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </nav>

            {/* Modern Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="border-t border-purple-500/20 bg-gradient-to-r from-purple-600 to-purple-900 p-4 backdrop-blur-lg"
            >
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    onBefore={() => confirm('Apakah Anda yakin ingin keluar dari sistem?')}
                    className={cn(
                        'group flex w-full items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                        'text-white hover:text-red-100',
                        'hover:bg-white/10 hover:backdrop-blur-sm',
                        'hover:shadow-lg hover:shadow-black/20',
                        'border border-white/20 hover:border-red-300/50',
                        'backdrop-blur-sm',
                    )}
                >
                    <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 transition-all duration-200 group-hover:bg-red-500/20">
                        <LogOut className="h-5 w-5 text-white group-hover:text-red-200" />
                    </div>
                    <span className="flex-1 text-white group-hover:text-red-100">Keluar</span>
                    <ChevronRight className="h-4 w-4 transform text-white/70 transition-all duration-200 group-hover:translate-x-1 group-hover:text-red-200" />
                </Link>
            </motion.div>
        </div>
    );
}
