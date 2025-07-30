#!/bin/bash

# This script removes the old Radix-based toast implementation
# since we're now using Sonner

echo "Removing old Radix-based toast files..."

# Remove the toast implementation files
if [ -f resources/js/components/ui/use-toast.ts ]; then
  rm resources/js/components/ui/use-toast.ts
  echo "Removed use-toast.ts"
fi

echo "Toast cleanup completed."
echo "The project is now using Sonner toast implementation."
