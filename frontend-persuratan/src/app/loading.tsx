export default function Loading() {
  // You can add any UI inside Loading, including a Skeleton.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
        <p className="font-medium text-gray-500">Loading content...</p>
      </div>
    </div>
  );
}
