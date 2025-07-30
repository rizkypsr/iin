import { Toaster } from '@/components/ui/sonner';
import { PropsWithChildren } from 'react';

export default function AppProvider({ children }: PropsWithChildren) {
    return (
        <>
            {children}
            <Toaster />
        </>
    );
}
