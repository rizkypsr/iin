import { cn } from '@/lib/utils';

interface AppSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function AppSidebar({ className, ...props }: AppSidebarProps) {
    return (
        <div className={cn('bg-card fixed top-0 left-0 z-40 h-screen w-64 border-r', className)} {...props}>
            <div className="p-4">
                <h2 className="text-lg font-semibold">Navigation</h2>
            </div>
        </div>
    );
}
