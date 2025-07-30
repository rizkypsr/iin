import { cn } from '@/lib/utils';

interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'sidebar';
}

export function AppShell({ className, variant = 'default', ...props }: AppShellProps) {
    return <div className={cn('bg-background min-h-screen', variant === 'sidebar' && 'flex', className)} {...props} />;
}
