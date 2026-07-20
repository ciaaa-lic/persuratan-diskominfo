'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-red-50 px-4 text-center dark:bg-red-950/20">
      <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
        Something went wrong!
      </h2>
      <p className="mb-8 max-w-md text-gray-600 dark:text-gray-300">
        An unexpected error has occurred in the UI.
      </p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        variant="destructive"
      >
        Try again
      </Button>
    </div>
  );
}
