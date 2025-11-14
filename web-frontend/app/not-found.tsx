import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="text-[150px] sm:text-[200px] font-bold text-slate-200 leading-none select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-blue-600 rounded-full p-8 shadow-xl animate-bounce">
                <svg 
                  className="w-16 h-16 sm:w-20 sm:h-20 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="font-bold text-3xl sm:text-4xl text-slate-900 mb-4">
          Page Not Found
        </h1>
        <p className="font-normal text-lg text-slate-600 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go Home
          </Link>
          <Link
            href="/suppliers"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Browse Suppliers
          </Link>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="font-medium text-sm text-slate-500 mb-4">Quick Links</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/guides" className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-2">
              Guides
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/categories" className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-2">
              Categories
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/locations" className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-2">
              Locations
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 hover:underline underline-offset-2">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
