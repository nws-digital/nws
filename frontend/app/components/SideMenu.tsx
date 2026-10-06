'use client'

import {useEffect, useRef} from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {motion, AnimatePresence} from 'framer-motion'
import {categoryToUrlSlug} from '@/sanity/lib/cleanCategorySlug'
import {urlForImage} from '@/sanity/lib/utils'
import {CATEGORY_LABELS, SOCIAL_LINKS, SOCIAL_ICONS} from '@/lib/constants'
import {formatTimeAgo} from '@/lib/timeAgo'
import {SectionTitle} from '@/app/components/SectionTitle'

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

const sectionLinks = [
  {href: '/world', label: 'World'},
  {href: '/india', label: 'India'},
  {href: '/osint', label: 'NWS Originals'},
  {href: '/commentary', label: 'Commentary'},
]

const utilityLinks = [
  {href: '/pages/about', label: 'About Us'},
  {href: '/pages/contact', label: 'Contact'},
  {href: '/pages/careers', label: 'Careers'},
  {href: '/pages/privacy', label: 'Privacy Policy'},
]

const linkClass =
  'block transition duration-200 hover:translate-x-1 hover:text-[#ed1c24] focus-visible:translate-x-1 focus-visible:text-[#ed1c24] focus-visible:outline-none'

function Divider() {
  return <div className="h-px w-full shrink-0 bg-[#d0d2d6]" />
}

/* eslint-disable @next/next/no-img-element */
export default function SideMenu({isOpen, onClose, latestArticles}: SideMenuProps) {
  const closeButton = useRef<HTMLButtonElement>(null)

  // Lock page scroll, close on Escape and move focus into the drawer while it is open
  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.3}}
            className="fixed inset-0 z-[100] bg-black/60"
            onClick={onClose}
          />

          {/* Slide-in Menu */}
          <motion.aside
            aria-label="Site menu"
            initial={{x: '100%'}}
            animate={{x: 0}}
            exit={{x: '100%'}}
            transition={{duration: 0.36, ease: [0.22, 1, 0.36, 1]}}
            className="fixed top-0 right-0 z-[101] flex h-dvh w-full flex-col items-start gap-6 overflow-x-hidden overflow-y-auto overscroll-contain bg-white p-6 font-literata text-black shadow-[-24px_0_60px_rgb(0_0_0/12%)] sm:w-[518px]"
          >
            {/* Logo + close */}
            <div className="flex w-full items-start justify-between">
              <Link href="/" onClick={onClose}>
                <img
                  src="/images/design/logo-dark-sm.svg"
                  alt="NWS"
                  width={136}
                  height={56}
                  className="block h-14 w-[136px]"
                />
              </Link>
              <button
                ref={closeButton}
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="-mt-1 -mr-1 grid size-8 place-items-center rounded-full p-1 transition duration-200 hover:rotate-90 hover:bg-[#f2f2f2] focus-visible:rotate-90 focus-visible:bg-[#f2f2f2] focus-visible:outline-none"
              >
                <img src="/images/design/icon-close.svg" alt="" className="size-6" />
              </button>
            </div>

            <Divider />

            {/* Sections (mobile only -- on desktop they live in the header nav) */}
            <nav
              aria-label="Sections"
              className="flex flex-col gap-6 text-base font-medium uppercase tablet:hidden"
            >
              {sectionLinks.map(({href, label}) => (
                <Link key={href} href={href} className={linkClass} onClick={onClose}>
                  {label}
                </Link>
              ))}
            </nav>
            <div className="w-full tablet:hidden">
              <Divider />
            </div>

            {/* Utility links */}
            <nav aria-label="Utility navigation" className="flex flex-col gap-6 text-base font-medium uppercase">
              {utilityLinks.map(({href, label}) => (
                <Link key={href} href={href} className={linkClass} onClick={onClose}>
                  {label}
                </Link>
              ))}
            </nav>

            <Divider />

            {/* Social */}
            <section className="flex w-full flex-col items-start gap-6">
              <SectionTitle headingClassName="text-2xl font-semibold">Social</SectionTitle>
              <div className="flex flex-col gap-3">
                {SOCIAL_LINKS.map((social) => {
                  const icon = SOCIAL_ICONS[social.name]
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${linkClass} flex items-center gap-3 text-base`}
                    >
                      <svg className="size-4" fill="currentColor" viewBox={icon.viewBox} aria-hidden="true">
                        <path d={icon.path} />
                      </svg>
                      <span>{social.name}</span>
                    </a>
                  )
                })}
              </div>
            </section>

            <Divider />

            {/* Latest */}
            <section className="flex w-full flex-col items-start gap-6">
              <div className="flex w-full items-center justify-between">
                <SectionTitle headingClassName="text-2xl font-semibold">Latest</SectionTitle>
                <Link
                  href="/#latest"
                  onClick={onClose}
                  className="text-base font-medium transition-colors hover:text-[#ed1c24]"
                >
                  View All
                </Link>
              </div>
              <div className="flex w-full flex-col gap-4">
                {latestArticles.map((article) => {
                  const coverImageUrl = article.coverImage
                    ? urlForImage(article.coverImage)?.width(160).height(160).fit('crop').url()
                    : null
                  const categoryLabel = CATEGORY_LABELS[article.category] || article.category

                  return (
                    <Link
                      key={article._id}
                      href={`/${categoryToUrlSlug(article.category)}/${article.slug.current}`}
                      onClick={onClose}
                      className="flex w-full items-start gap-2.5 rounded-lg transition duration-200 hover:translate-x-[3px] hover:bg-[#f6f6f6] focus-visible:translate-x-[3px] focus-visible:bg-[#f6f6f6] focus-visible:outline-none"
                    >
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[#eee]">
                        {coverImageUrl && (
                          <Image src={coverImageUrl} alt={article.title} fill className="object-cover" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-1">
                        <h3 className="text-sm leading-normal font-bold">{article.title}</h3>
                        <div className="flex items-center gap-2 text-xs whitespace-nowrap text-[#666]">
                          <span>{formatTimeAgo(article.date)}</span>
                          <span className="text-[#d0d2d6]">|</span>
                          <span>{categoryLabel}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
