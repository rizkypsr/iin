# Toast Notifications with Sonner

This project uses [Sonner](https://sonner.emilkowal.ski/) for toast notifications. Sonner was chosen over Radix Toast for its modern design, ease of use, and better compatibility with our design requirements.

## Usage

### Basic Usage

Import the toast helper functions in your component:

```typescript
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast-helper';
```

Then use them in your component:

```typescript
// Show success toast
showSuccessToast('Operation completed successfully');

// Show error toast
showErrorToast('Something went wrong');

// Show info toast
showInfoToast('Information message');
```

### With Inertia.js Forms

When using Inertia.js forms, you can include toast notifications in your callbacks:

```typescript
const { data, setData, post, processing, errors } = useForm({
  // form data
});

const submit = (e: React.FormEvent) => {
  e.preventDefault();
  post(route('your-route'), {
    onSuccess: () => {
      showSuccessToast('Operation completed successfully');
    },
    onError: (errors) => {
      const errorMessage = Object.values(errors)[0] as string || 'Something went wrong';
      showErrorToast(errorMessage);
    }
  });
};
```

## Customization

The Sonner Toaster component is configured in `/resources/js/components/ui/sonner.tsx`. You can modify the default styling and behavior there.

Current configuration uses:
- Light theme (appropriate for government website)
- Custom colors for success and error toasts
- Right-top position for toast messages

## Integration

The Toaster component is integrated into the root app via the AppProvider in `/resources/js/components/app-provider.tsx`.
