import { motion } from 'framer-motion';
import { Shield, TrendingUp, UserCheck, Users } from 'lucide-react';

interface UserStatsProps {
    totalUsers: number;
    adminCount: number;
    userCount: number;
    recentUsersCount?: number;
}

export default function UserStats({ totalUsers, adminCount, userCount, recentUsersCount = 0 }: UserStatsProps) {
    const stats = [
        {
            name: 'Total Users',
            value: totalUsers,
            icon: Users,
            color: 'from-purple-600 to-purple-800',
            bgColor: 'bg-purple-100',
            textColor: 'text-purple-800',
            shadowColor: 'shadow-purple-200/30',
        },
        {
            name: 'Regular Users',
            value: userCount,
            icon: UserCheck,
            color: 'from-green-600 to-green-800',
            bgColor: 'bg-green-100',
            textColor: 'text-green-800',
            shadowColor: 'shadow-green-200/30',
        },

        {
            name: 'Administrators',
            value: adminCount,
            icon: Shield,
            color: 'from-red-600 to-red-800',
            bgColor: 'bg-red-100',
            textColor: 'text-red-800',
            shadowColor: 'shadow-red-200/30',
        },
    ];

    return (
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`rounded-2xl border border-purple-200/50 bg-white/95 p-6 shadow-lg backdrop-blur-sm ${stat.shadowColor} transition-all duration-300 hover:shadow-xl`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="mb-1 text-sm font-medium text-gray-600">{stat.name}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                        <div className={`h-12 w-12 bg-gradient-to-r ${stat.color} flex items-center justify-center rounded-xl`}>
                            <stat.icon className="h-6 w-6 text-white" />
                        </div>
                    </div>

                    {/* Growth indicator for recent users */}
                    {stat.name === 'Total Users' && recentUsersCount > 0 && (
                        <div className="mt-3 flex items-center">
                            <TrendingUp className="mr-1 h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-600">+{recentUsersCount} this month</span>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}
