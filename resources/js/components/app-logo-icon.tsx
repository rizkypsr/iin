import { cn } from '@/lib/utils';

interface AppLogoIconProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg';
}

export default function AppLogoIcon({ className, size = 'md', ...props }: AppLogoIconProps) {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };

    return (
        <div className={cn('flex items-center justify-center', className)} {...props}>
            <img src="/logo.svg" alt="IIN Logo" className={cn(sizeClasses[size])} />
        </div>
    );
}
