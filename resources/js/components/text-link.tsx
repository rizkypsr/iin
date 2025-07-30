import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';

interface TextLinkProps {
    href: string;
    children: React.ReactNode;
    className?: string;
    [key: string]: any;
}

export default function TextLink({ href, children, className = '', ...props }: TextLinkProps) {
    return (
        <Link href={href} className={cn('text-primary underline-offset-4 hover:underline focus:ring-0 focus:outline-none', className)} {...props}>
            {children}
        </Link>
    );
}
