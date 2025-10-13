export default function MentorCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer"></div>

      <div className="p-5">
        {/* Header skeleton */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-16 bg-gray-300 rounded"></div>
          </div>
        </div>

        {/* Bio skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Skills skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-24 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>

        {/* Availability skeleton */}
        <div className="flex items-center mb-4">
          <div className="h-4 w-4 bg-gray-300 rounded mr-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>

        {/* Button skeleton */}
        <div className="h-10 bg-gray-300 rounded w-full"></div>
      </div>
    </div>
  );
}
