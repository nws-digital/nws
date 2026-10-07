'use client'

import {useEffect, useRef, useState} from 'react'
import {createPortal} from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import {urlForImage} from '@/sanity/lib/utils'
import {categoryToUrlSlug} from '@/sanity/lib/cleanCategorySlug'
import {CATEGORY_LABELS} from '@/lib/constants'
import {formatTimeAgo} from '@/lib/timeAgo'
import {moreLinkClass} from '@/app/components/MoreLink'
import type {MostReadArticle} from '@/app/actions/mostRead'

/* eslint-disable @next/next/no-img-element */
export function MostReadModal({articles}: {articles: MostReadArticle[]}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const closeButton = useRef<HTMLButtonElement>(null)

  useEffect(() => setMounted(true), [])

  // Lock page scroll, close on Escape and move focus into the dialog while open
  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButton.current?.focus()
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <>
      <button type="button" className={moreLinkClass} onClick={() => setOpen(true)} aria-haspopup="dialog">
        More
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] grid animate-[fade-in_180ms_ease-out] place-items-center bg-black/60 p-6 max-phone:p-3"
            role="presentation"
            onMouseDown={() => setOpen(false)}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="most-read-title"
              onMouseDown={(e) => e.stopPropagation()}
              className="flex max-h-[calc(100dvh-48px)] w-[min(800px,100%)] animate-[dialog-in_260ms_cubic-bezier(0.2,0.8,0.2,1)] flex-col gap-6 overflow-hidden rounded-2xl bg-white p-6 font-literata text-[#1a1a1a] shadow-[0_30px_90px_rgb(0_0_0/25%)] max-phone:max-h-[calc(100dvh-24px)] max-phone:gap-[18px] max-phone:p-[18px]"
            >
              <div className="flex shrink-0 items-center justify-between">
                <h2 id="most-read-title" className="text-xl font-bold">
                  Most Read
                </h2>
                <button
                  ref={closeButton}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close Most Read"
                  className="-m-1 grid size-8 place-items-center rounded-full p-1 transition duration-200 hover:rotate-90 hover:bg-[#f2f2f2] focus-visible:rotate-90 focus-visible:bg-[#f2f2f2] focus-visible:outline-none"
                >
                  <img src="/images/design/icon-close.svg" alt="" className="size-6" />
                </button>
              </div>
              <div className="h-px w-full shrink-0 bg-[#d0d2d6]" />
              <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain pr-2 max-phone:gap-[18px] max-phone:pr-1 [scrollbar-color:#b7b7b7_transparent] [scrollbar-width:thin]">
                {articles.map((article) => {
                  const imageUrl = article.coverImage
                    ? urlForImage(article.coverImage)?.width(200).height(200).fit('crop').url()
                    : null
                  const categoryLabel = article.category
                    ? CATEGORY_LABELS[article.category] || article.category
                    : ''

                  return (
                    <Link
                      key={article._id}
                      href={`/${categoryToUrlSlug(article.category || '')}/${article.slug.current}`}
                      onClick={() => setOpen(false)}
                      className="group flex shrink-0 items-start gap-4 max-phone:gap-3"
                    >
                      <div className="relative size-[100px] shrink-0 overflow-hidden rounded-lg bg-[#eee] max-phone:size-[82px]">
                        {imageUrl && (
                          <Image
                            src={imageUrl}
                            alt={article.title}
                            fill
                            sizes="100px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
                        <h3 className="text-base leading-normal font-bold transition-colors group-hover:text-[#ed1c24] max-phone:text-sm">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="line-clamp-3 text-base leading-normal max-phone:hidden">{article.excerpt}</p>
                        )}
                        <div className="flex items-center gap-2 text-sm whitespace-nowrap text-[#666] max-phone:text-xs">
                          {article.date && <span>{formatTimeAgo(article.date)}</span>}
                          {article.date && categoryLabel && <span className="text-[#a7a7a7]">|</span>}
                          {categoryLabel && <span>{categoryLabel}</span>}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </section>
          </div>,
          document.body,
        )}
    </>
  )
}
