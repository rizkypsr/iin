import { cn } from '@/lib/utils';
import { type BreadcrumbItem } from '@/types';

interface AppHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ className, breadcrumbs = [], ...props }: AppHeaderProps) {
    return (
        <header className={cn('bg-background border-b px-6 py-4', className)} {...props}>
            {breadcrumbs.length > 0 && (
                <nav className="flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2">
                        {breadcrumbs.map((item, index) => (
                            <li key={index}>
                                {index > 0 && <span className="text-muted-foreground mx-2">/</span>}
                                <span className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}>
                                    {item.title}
                                </span>
                            </li>
                        ))}
                    </ol>
                </nav>
            )}
        </header>
    );
}
