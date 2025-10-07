import { toast } from 'sonner';

export const showSuccessToast = (message: string) => {
    toast.success(message);
};

export const showErrorToast = (message: string) => {
    toast.error(message);
};

export const showInfoToast = (message: string) => {
    toast(message);
};
