export default function ResetPasswordLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="text-center space-y-2">
            <div className="h-8 bg-gray-200 rounded-lg animate-pulse mx-auto w-48"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-64"></div>
          </div>

          {/* Form skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Loading indicator */}
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
