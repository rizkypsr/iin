# Sonner Toast Implementation

This project uses Sonner for toast notifications instead of the Radix-UI toast implementation.

## Usage

To use the toast notifications in your components, import the toast helpers:

```tsx
import { showSuccessToast, showErrorToast, showInfoToast } from '@/lib/toast-helper';
```

Then use them in your components:

```tsx
// Success notification
showSuccessToast('Operation completed successfully');

// Error notification
showErrorToast('An error occurred');

// Info notification
showInfoToast('This is some information');
```

## Implementation Details

1. The Sonner toaster is integrated into the application through the `AppProvider` component in `resources/js/components/app-provider.tsx`.

2. Toast helpers are provided in `resources/js/lib/toast-helper.ts`.

3. The toaster has been customized to match the government website design system with appropriate colors and styling.

## Toast Types

- **Success**: Green background with white text
- **Error**: Red background with white text
- **Info**: White background with dark text

## Position and Duration

By default, toasts are shown in the top-right corner and disappear after 5 seconds. This can be customized in the `toast-helper.ts` file.
