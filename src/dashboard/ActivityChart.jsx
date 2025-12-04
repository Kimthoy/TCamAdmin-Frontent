// src/dashboard/ActivityChart.jsx
export function ActivityChart() {
  return (
    <div className="h-96 md:h-full min-h-96 relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black rounded-2xl p-8 flex flex-col items-center justify-center">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-20 right-10 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animation-delay-2000 animate-blob"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl animation-delay-4000 animate-blob"></div>
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Animated Pulse Ring */}
        <div className="relative mx-auto w-32 h-32 mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-20 animate-ping"></div>
          <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 opacity-30 animate-pulse"></div>
          <div className="absolute inset-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 opacity-50 animate-pulse animation-delay-1000"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6m5-10l-5-5m0 0L9 4m4 0v12"
                />
              </svg>
            </div>
          </div>
        </div>

        <h3 className="text-3xl font-bold text-[#1C1B1B] dark:text-white mb-3">
          Activity Overview
        </h3>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Real-time analytics and charts are coming soon!
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
          Stay tuned for beautiful data visualizations
        </p>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
