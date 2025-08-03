"use client"
import { useUser } from "@/hooks/use-user"

export default function DashboardHome() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-lg text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl font-bold mb-2">Not signed in</h1>
        <p className="text-gray-600 mb-4">Please log in to access your dashboard.</p>
        <a href="/login" className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition">Go to Login</a>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.email}!</h1>
      <p className="text-gray-700">Use the sidebar to navigate your shipping tools and account features.</p>
      <div className="mt-6 p-4 bg-gray-50 rounded border text-gray-800">
        <div><strong>User ID:</strong> {user.id}</div>
        <div><strong>Email:</strong> {user.email}</div>
      </div>
    </div>
  );
}
