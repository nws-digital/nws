import Link from 'next/link'

export default async function Header() {
  return (
    <header className="fixed z-50 h-20 inset-0 bg-white/95 border-b border-gray-200 flex items-center backdrop-blur-lg">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <Link className="flex items-center" href="/">
            <span className="text-3xl font-bold text-black tracking-tight">
              NWS
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 flex justify-center">
            <ul className="flex items-center gap-8 text-sm font-medium uppercase tracking-wide">
              <li>
                <Link href="/world-exclusive" className="hover:text-red-600 transition-colors">
                  World Exclusive
                </Link>
              </li>
              <li>
                <Link href="/india-exclusive" className="hover:text-red-600 transition-colors">
                  India Exclusive
                </Link>
              </li>
              <li>
                <Link href="/issot-exclusive" className="hover:text-red-600 transition-colors">
                  ISSOT Exclusive
                </Link>
              </li>
              <li>
                <Link href="/commentary" className="hover:text-red-600 transition-colors">
                  Commentary
                </Link>
              </li>
            </ul>
          </nav>

          {/* Search Icon */}
          <button 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Search"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
