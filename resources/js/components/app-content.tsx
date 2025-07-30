import { cn } from '@/lib/utils';

interface AppContentProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'sidebar';
}

export function AppContent({ className, variant = 'default', ...props }: AppContentProps) {
    return <div className={cn('flex flex-1 flex-col', variant === 'sidebar' && 'ml-64', className)} {...props} />;
}
