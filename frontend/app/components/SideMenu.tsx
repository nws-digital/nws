'use client'

import Link from 'next/link'
import Image from 'next/image'
import {formatDistanceToNow} from 'date-fns'
import {urlForImage} from '@/sanity/lib/utils'

interface Article {
  _id: string
  title: string
  slug: {current: string}
  category: string
  date: string
  coverImage?: any
}

interface SideMenuProps {
  isOpen: boolean
  onClose: () => void
  latestArticles: Article[]
}

export default function SideMenu({isOpen, onClose, latestArticles}: SideMenuProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[100] transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Menu */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white z-[101] shadow-2xl overflow-y-auto">
        {/* Header with Close Button */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between z-10">
          <Link href="/" onClick={onClose}>
            <Image 
              src="/images/Logo_Dark.svg" 
              alt="NWS" 
              width={136}
              height={56}
              className="h-10 w-auto"
            />
          </Link>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Mobile Navigation (only on small screens) */}
          <div className="md:hidden space-y-2">
            <Link 
              href="/world-exclusive" 
              className="block py-2 text-sm font-medium hover:text-red-600 transition-colors"
              onClick={onClose}
            >
              World Exclusive
            </Link>
            <Link 
              href="/india-exclusive" 
              className="block py-2 text-sm font-medium hover:text-red-600 transition-colors"
              onClick={onClose}
            >
              India Exclusive
            </Link>
            <Link 
              href="/osint-exclusive" 
              className="block py-2 text-sm font-medium hover:text-red-600 transition-colors"
              onClick={onClose}
            >
              OSINT Exclusive
            </Link>
            <Link 
              href="/commentary" 
              className="block py-2 text-sm font-medium hover:text-red-600 transition-colors"
              onClick={onClose}
            >
              Commentary
            </Link>
            <div className="border-t border-gray-200 my-4"></div>
          </div>

          {/* About, Contact, etc. */}
          <div className="space-y-3">
            <Link 
              href="/pages/about" 
              className="block text-sm font-medium hover:text-red-600 transition-colors"
              onClick={onClose}
            >
              ABOUT US
            </Link>
            <Link 
              href="/pages/contact" 
              className="block text-sm font-medium hover:text-red-600 transition-colors"
              onClick={onClose}
            >
              CONTACT
            </Link>
            <Link 
              href="/pages/careers" 
              className="block text-sm font-medium hover:text-red-600 transition-colors"
              onClick={onClose}
            >
              CAREERS
            </Link>
            <Link 
              href="/pages/privacy" 
              className="block text-sm font-medium hover:text-red-600 transition-colors"
              onClick={onClose}
            >
              PRIVACY POLICY
            </Link>
          </div>

          {/* Latest News */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              <span className="relative inline-block">
                <span className="relative">L</span>
                <span className="relative">
                  a
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></span>
                </span>
                test News
              </span>
            </h3>
            <div className="space-y-4">
              {latestArticles.map((article) => {
                const coverImageUrl = article.coverImage 
                  ? urlForImage(article.coverImage)?.width(80).height(80).fit('crop').url()
                  : null
                const timeAgo = formatDistanceToNow(new Date(article.date), {addSuffix: true})

                return (
                  <Link
                    key={article._id}
                    href={`/${article.category}/${article.slug.current}`}
                    className="flex gap-3 group"
                    onClick={onClose}
                  >
                    {coverImageUrl && (
                      <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                        <Image
                          src={coverImageUrl}
                          alt={article.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 mb-1">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-500">{timeAgo}</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              <span className="relative inline-block">
                <span className="relative">
                  S
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></span>
                </span>
                <span className="relative">
                  o
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-red-600"></span>
                </span>
                cial
              </span>
            </h3>
            <div className="space-y-3">
              <a 
                href="https://twitter.com/nws" 
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium hover:text-red-600 transition-colors"
              >
                TWITTER
              </a>
              <a 
                href="https://facebook.com/nws" 
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium hover:text-red-600 transition-colors"
              >
                FACEBOOK
              </a>
              <a 
                href="https://instagram.com/nws" 
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium hover:text-red-600 transition-colors"
              >
                INSTAGRAM
              </a>
              <a 
                href="https://linkedin.com/company/nws" 
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-medium hover:text-red-600 transition-colors"
              >
                LINKEDIN
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
