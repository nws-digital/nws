'use client'

import Link from 'next/link'
import {useEffect, useState} from 'react'
import {usePathname} from 'next/navigation'
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

const navLinks = [
  {href: '/world', label: 'World'},
  {href: '/india', label: 'India'},
  {href: '/nws-originals', label: 'NWS Originals'},
  {href: '/commentary', label: 'Commentary'},
]

/* eslint-disable @next/next/no-img-element */
export default function HeaderClient({latestArticles}: HeaderClientProps) {
  const [sideMenuOpen, setSideMenuOpen] = useState(false)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [compact, setCompact] = useState(false)
  const pathname = usePathname()

  // Shrink the masthead once the page has scrolled a little
  useEffect(() => {
    const update = () => setCompact(window.scrollY > 32)
    update()
    window.addEventListener('scroll', update, {passive: true})
    return () => window.removeEventListener('scroll', update)
  }, [])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 w-full bg-white/[0.97] font-literata backdrop-blur-md transition-shadow duration-300 ${
          compact ? 'shadow-[0_8px_28px_rgb(0_0_0/8%)]' : ''
        }`}
      >
        {/* Masthead: centred logo on desktop; menu / logo / search on mobile */}
        <div
          className={`shell relative flex items-center justify-center transition-[min-height,padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] max-tablet:justify-between ${
            compact
              ? 'min-h-[72px] py-2 max-tablet:min-h-16 max-tablet:py-1.5'
              : 'min-h-[104px] py-4 max-tablet:min-h-20 max-tablet:py-2.5'
          }`}
        >
          <button
            type="button"
            className="hidden size-[42px] place-items-center rounded-full transition-colors hover:bg-[#f3f3f3] max-tablet:grid"
            aria-label={sideMenuOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={sideMenuOpen}
            onClick={() => setSideMenuOpen(!sideMenuOpen)}
          >
            <img src="/images/design/icon-menu-lg.svg" alt="" className="size-8" />
          </button>
          <Link href="/" aria-label="NWS home" onClick={() => setSideMenuOpen(false)}>
            <img
              src="/images/design/logo-dark.svg"
              alt="NWS"
              width={175}
              height={72}
              className={`block transition-[width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                compact
                  ? 'h-12 w-[117px] max-tablet:h-10 max-tablet:w-[98px]'
                  : 'h-[72px] w-[175px] max-tablet:h-12 max-tablet:w-[117px]'
              }`}
            />
          </Link>
          <button
            type="button"
            className="hidden size-[42px] place-items-center rounded-full transition-colors hover:bg-[#f3f3f3] max-tablet:grid"
            aria-label="Search"
            onClick={() => setSearchModalOpen(true)}
          >
            <img src="/images/design/icon-search-lg.svg" alt="" className="size-8" />
          </button>
        </div>

        {/* Category nav (desktop) */}
        <div className="border-y border-[#d0d0d0] max-tablet:border-t-0">
          <div className="shell relative flex min-h-[57px] items-center justify-end max-tablet:min-h-0">
            <nav
              aria-label="Sections"
              className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 text-sm font-medium whitespace-nowrap uppercase tablet:flex wide:gap-8 wide:text-base"
            >
              {navLinks.map(({href, label}) => {
                const isActive = pathname === href
                return (
                  <Link key={href} href={href} className="group relative transition-colors">
                    {label}
                    <span
                      className={`absolute right-0 -bottom-[5px] left-0 h-0.5 bg-[#ed1c24] transition-transform duration-200 ${
                        isActive
                          ? 'origin-left scale-x-100'
                          : 'origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100'
                      }`}
                    />
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-2 max-tablet:hidden">
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full transition hover:scale-105 hover:bg-[#f3f3f3]"
                aria-label="Search"
                onClick={() => setSearchModalOpen(true)}
              >
                <img src="/images/design/icon-search.svg" alt="" className="size-6" />
              </button>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-full transition hover:scale-105 hover:bg-[#f3f3f3]"
                aria-label={sideMenuOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={sideMenuOpen}
                onClick={() => setSideMenuOpen(!sideMenuOpen)}
              >
                <img src="/images/design/icon-menu.svg" alt="" className="size-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Reserves the space the fixed header takes up so page content starts below it */}
      <div
        aria-hidden="true"
        className={`transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          compact ? 'h-[131px] max-tablet:h-[65px]' : 'h-[163px] max-tablet:h-[81px]'
        }`}
      />

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
