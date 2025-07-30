import { cn } from '@/lib/utils';

interface HeadingSmallProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
}

export default function HeadingSmall({ children, className, ...props }: HeadingSmallProps) {
    return (
        <h3 className={cn('text-foreground text-lg font-semibold', className)} {...props}>
            {children}
        </h3>
    );
}
