export function FeaturedPlaceholder() {
  return (
    <div className="relative overflow-hidden shadow-2xl bg-gradient-to-br from-gray-800 via-gray-900 to-black">
      <div className="aspect-[16/9] lg:aspect-[21/9] flex items-center justify-center p-12">
        <div className="text-center text-white max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/40 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            NO FEATURED STORY YET
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Welcome to NWS</h2>

          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Stay informed with the latest news from India and around the world
          </p>

          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Mark an article as "Featured" in Sanity Studio to display it here
          </div>
        </div>
      </div>
    </div>
  )
}
