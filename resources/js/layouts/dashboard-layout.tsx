import DashboardSidebar from '@/components/dashboard-sidebar';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { PropsWithChildren } from 'react';

interface DashboardLayoutProps {
    title?: string;
    user?: User;
}

import { User } from '@/types';

export default function DashboardLayout({ children, title = 'Dashboard', user }: PropsWithChildren<DashboardLayoutProps>) {
    return (
        <div className="min-h-screen overflow-hidden bg-gradient-to-br from-purple-50 via-purple-100/30 to-purple-200/20">
            <Head title={title} />

            <div className="flex h-screen">
                {/* Modern Floating Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="h-full w-80 flex-shrink-0 p-4"
                >
                    <div className="h-full overflow-hidden rounded-2xl border border-purple-200/30 bg-white/90 shadow-xl shadow-purple-200/40 backdrop-blur-lg">
                        <DashboardSidebar user={user} />
                    </div>
                </motion.div>

                {/* Main Content Area */}
                <div className="flex min-h-0 flex-1 flex-col p-4 pl-0">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="flex-1 overflow-y-auto rounded-2xl border border-purple-200/30 bg-white/90 shadow-xl shadow-purple-200/40 backdrop-blur-lg"
                    >
                        <div className="p-8">
                            <div className="mx-auto max-w-7xl">{children}</div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
