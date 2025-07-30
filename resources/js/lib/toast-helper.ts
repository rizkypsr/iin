import { toast } from 'sonner';

export const showSuccessToast = (message: string) => {
    console.log('showSuccessToast called with:', message);
    toast.success(message);
};

export const showErrorToast = (message: string) => {
    console.log('showErrorToast called with:', message);
    toast.error(message);
};

export const showInfoToast = (message: string) => {
    console.log('showInfoToast called with:', message);
    toast(message);
};
