import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'white' | 'gray';
    text?: string;
    className?: string;
}

export default function LoadingSpinner({ size = 'md', color = 'primary', text, className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const colorClasses = {
        primary: 'text-purple-600',
        white: 'text-white',
        gray: 'text-gray-600',
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className={`${sizeClasses[size]} ${colorClasses[color]}`}
            >
                <Loader2 className="h-full w-full" />
            </motion.div>
            {text && <span className={`ml-2 text-sm ${colorClasses[color]}`}>{text}</span>}
        </div>
    );
}
