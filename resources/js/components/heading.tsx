import { cn } from '@/lib/utils';
import { createElement } from 'react';

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode;
    level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export default function Heading({ children, level = 1, className, ...props }: HeadingProps) {
    const headingClasses = {
        1: 'text-3xl font-bold text-foreground',
        2: 'text-2xl font-bold text-foreground',
        3: 'text-xl font-semibold text-foreground',
        4: 'text-lg font-semibold text-foreground',
        5: 'text-base font-semibold text-foreground',
        6: 'text-sm font-semibold text-foreground',
    };

    return createElement(
        `h${level}`,
        {
            className: cn(headingClasses[level], className),
            ...props,
        },
        children,
    );
}
