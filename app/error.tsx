// Location: /app/error.tsx

'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Use the error for logging (satisfies ESLint)
  console.error('Error boundary caught:', error);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
      <button onClick={() => reset()} className="btn-cyber">
        Try again
      </button>
    </div>
  );
}
