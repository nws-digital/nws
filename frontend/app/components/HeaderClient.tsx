'use client'

import Link from 'next/link'
import Image from 'next/image'
import {useState} from 'react'
import SearchModal from '@/app/components/SearchModal'
import SideMenu from '@/app/components/SideMenu'

interface Article {
  _id: string
  title: string
  slug: {current: string}
  category: string
  date: string
  coverImage?: any
}

interface HeaderClientProps {
  latestArticles: Article[]
}

export default function HeaderClient({latestArticles}: HeaderClientProps) {
  const [sideMenuOpen, setSideMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)

  return (
    <>
      <header className="fixed z-50 h-20 inset-0 bg-white/95 border-b border-gray-200 flex items-center backdrop-blur-lg">
        <div className="max-w-[1366px] container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <Link className="flex items-center" href="/" onClick={() => setSideMenuOpen(false)}>
              <Image 
                src="/images/Logo_Dark.svg" 
                alt="NWS" 
                width={136}
                height={56}
                className="h-8 md:h-10 w-auto"
                priority
              />
            </Link>

            {/* Navigation - Hidden on mobile, shown on desktop */}
            <nav className="hidden md:flex flex-1 justify-center">
              <ul className="flex items-center gap-6 lg:gap-8 text-xs lg:text-sm font-bold uppercase tracking-wide text-black">
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
                  <Link href="/osint-exclusive" className="hover:text-red-600 transition-colors">
                    OSINT Exclusive
                  </Link>
                </li>
                              <li>
                                <Link href="/commentary" className="hover:text-red-600 transition-colors">
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
                              onClick={() => setSearchModalOpen(true)}
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

              {/* Menu Button - Always Visible */}
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Menu"
                onClick={() => setSideMenuOpen(!sideMenuOpen)}
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
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal - Outside header */}
      <SearchModal isOpen={searchModalOpen} onClose={() => setSearchModalOpen(false)} />
      
      {/* Side Menu - Outside header */}
      <SideMenu 
        isOpen={sideMenuOpen} 
        onClose={() => setSideMenuOpen(false)}
        latestArticles={latestArticles}
      />
    </>
  )
}
