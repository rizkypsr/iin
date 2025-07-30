import { Head, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

import DeleteConfirmation from '@/components/delete-confirmation';
import FlashMessage from '@/components/flash-message';
import Pagination from '@/components/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserStats from '@/components/user-stats';
import DashboardLayout from '@/layouts/dashboard-layout';

interface User {
    id: number;
    name: string;
    email: string;
    created_at: string;
    roles: Array<{ name: string }>;
}

interface UsersIndexProps {
    users: {
        data: User[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    filters: {
        search?: string;
    };
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function UsersIndex({ users, filters, flash }: UsersIndexProps) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{
        isOpen: boolean;
        userId: number;
        userName: string;
        isLoading: boolean;
    }>({
        isOpen: false,
        userId: 0,
        userName: '',
        isLoading: false,
    });

    useEffect(() => {
        if (flash?.success) {
            setFlashMessage({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setFlashMessage({ type: 'error', message: flash.error });
        }
    }, [flash]);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            router.get(
                route('admin.users.index'),
                { search: searchTerm || undefined },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleSearch = (value: string) => {
        setSearchTerm(value);
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'user':
                return 'bg-green-100 text-green-800 border-green-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const handleDeleteUser = (userId: number, userName: string) => {
        setDeleteConfirmation({
            isOpen: true,
            userId,
            userName,
            isLoading: false,
        });
    };

    const confirmDeleteUser = () => {
        setDeleteConfirmation((prev) => ({ ...prev, isLoading: true }));

        router.delete(route('admin.users.destroy', deleteConfirmation.userId), {
            onSuccess: () => {
                setDeleteConfirmation({
                    isOpen: false,
                    userId: 0,
                    userName: '',
                    isLoading: false,
                });
            },
            onError: () => {
                setDeleteConfirmation((prev) => ({ ...prev, isLoading: false }));
            },
        });
    };

    const cancelDeleteUser = () => {
        setDeleteConfirmation({
            isOpen: false,
            userId: 0,
            userName: '',
            isLoading: false,
        });
    };

    const user = {
        id: 1,
        name: 'Admin User',
        email: 'admin@iin.go.id',
        role: 'admin' as const,
        email_verified_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        roles: [{ id: 1, name: 'admin', guard_name: 'web', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]
    };

    return (
        <DashboardLayout title="User Management" user={user}>
            <Head title="User Management" />

            {/* Flash Messages */}
            {flashMessage && <FlashMessage type={flashMessage.type} message={flashMessage.message} onClose={() => setFlashMessage(null)} />}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="bg-gradient-to-r from-purple-700 to-purple-900 bg-clip-text text-3xl font-bold text-transparent">
                            User Management
                        </h1>
                        <p className="mt-1 text-gray-600">Manage user accounts and roles</p>
                    </div>

                    <Link href={route('admin.users.create')}>
                        <Button className="bg-gradient-to-r from-purple-700 to-purple-900 text-white hover:from-purple-800 hover:to-purple-950">
                            <Plus className="mr-2 h-4 w-4" />
                            Create User
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <UserStats
                    totalUsers={users.total}
                    adminCount={users.data.filter((u) => u.roles.some((r) => r.name === 'admin')).length}
        
                    userCount={users.data.filter((u) => u.roles.some((r) => r.name === 'user')).length}
                />

                {/* Search and Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="rounded-2xl border border-purple-200/50 bg-white/95 p-6 shadow-lg shadow-purple-200/30 backdrop-blur-sm"
                >
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                            <Input
                                placeholder="Search users by name, email, or role..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="h-11 pl-10 transition-all duration-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Users Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="overflow-hidden rounded-2xl border border-purple-200/50 bg-white/95 shadow-lg shadow-purple-200/30 backdrop-blur-sm"
                >
                    <div className="p-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-900">Users List</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-purple-50 to-purple-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">User</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-4 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">Created</th>
                                    <th className="px-6 py-4 text-right text-xs font-medium tracking-wider text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-purple-100">
                                {users.data.map((user, index) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: 0.1 * index }}
                                        className="transition-colors duration-200 hover:bg-purple-50/50"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles.map((role) => (
                                                    <Badge key={role.name} className={`${getRoleColor(role.name)} border`}>
                                                        {role.name.charAt(0).toUpperCase() + role.name.slice(1)}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={route('admin.users.edit', user.id)}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                </Link>

                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-300 text-red-700 hover:bg-red-50"
                                                    onClick={() => handleDeleteUser(user.id, user.name)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.data.length === 0 && (
                        <div className="py-12 text-center">
                            <Users className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating a new user.'}
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Pagination */}
                <Pagination data={users} />
            </motion.div>

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmation
                isOpen={deleteConfirmation.isOpen}
                onClose={cancelDeleteUser}
                onConfirm={confirmDeleteUser}
                title="Delete User Account"
                message={`Are you sure you want to delete ${deleteConfirmation.userName}? This action cannot be undone and will permanently remove all user data.`}
                isLoading={deleteConfirmation.isLoading}
            />
        </DashboardLayout>
    );
}
