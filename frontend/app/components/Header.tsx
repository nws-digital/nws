'use client'

import Link from 'next/link'
import {useState} from 'react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed z-50 h-20 inset-0 bg-white/95 border-b border-gray-200 flex items-center backdrop-blur-lg">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo/Title */}
          <Link className="flex items-center" href="/" onClick={() => setMobileMenuOpen(false)}>
            <span className="text-2xl md:text-3xl font-bold text-black tracking-tight">
              NWS
            </span>
          </Link>

          {/* Navigation - Hidden on mobile, shown on desktop */}
          <nav className="hidden md:flex flex-1 justify-center">
            <ul className="flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-medium uppercase tracking-wide">
              <li>
                <Link href="/category/world-exclusive" className="hover:text-red-600 transition-colors">
                  World Exclusive
                </Link>
              </li>
              <li>
                <Link href="/category/india-exclusive" className="hover:text-red-600 transition-colors">
                  India Exclusive
                </Link>
              </li>
              <li>
                <Link href="/category/issot-exclusive" className="hover:text-red-600 transition-colors">
                  ISSOT Exclusive
                </Link>
              </li>
              <li>
                <Link href="/category/commentary" className="hover:text-red-600 transition-colors">
                  Commentary
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center gap-2">
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

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
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
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              ) : (
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
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden absolute top-20 left-0 right-0 bg-white/98 backdrop-blur-lg border-b border-gray-200 shadow-lg">
            <ul className="flex flex-col py-4">
              <li>
                <Link 
                  href="/category/world-exclusive" 
                  className="block px-6 py-3 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  World Exclusive
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/india-exclusive" 
                  className="block px-6 py-3 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  India Exclusive
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/issot-exclusive" 
                  className="block px-6 py-3 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ISSOT Exclusive
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/commentary" 
                  className="block px-6 py-3 hover:bg-gray-50 hover:text-red-600 transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Commentary
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  )
}
