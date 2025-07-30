import { HTMLAttributes } from 'react';

export default function InputError({ message, className = '', ...props }: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p {...props} className={`text-destructive text-sm ${className}`}>
            {message}
        </p>
    ) : null;
}
