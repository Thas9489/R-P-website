export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-950">
      {/* Logo mark */}
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white" aria-hidden="true">
            <path
              d="M9 12h6M9 16h4M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M9 8h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      {/* Spinner */}
      <div className="relative w-10 h-10 mb-4">
        <svg
          className="w-10 h-10 animate-spin text-blue-600"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-20"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      </div>

      {/* Text */}
      <p className="text-sm font-medium text-gray-400 dark:text-gray-500 animate-pulse">
        Loading…
      </p>

      {/* Skeleton shimmer bar */}
      <div className="mt-8 flex flex-col items-center gap-2 w-48">
        <div className="h-2 w-48 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent animate-[shimmer_1.5s_infinite]" />
        </div>
        <div className="h-2 w-32 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent animate-[shimmer_1.5s_infinite_0.3s]" />
        </div>
      </div>
    </div>
  )
}
