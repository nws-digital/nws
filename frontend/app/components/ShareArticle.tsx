'use client'

import {useState, useRef, useEffect} from 'react'

interface ShareArticleProps {
  title: string
  url: string
  className?: string
}

export function ShareArticle({title, url, className = ''}: ShareArticleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : url
  const encodedUrl = encodeURIComponent(shareUrl)
  const encodedTitle = encodeURIComponent(title)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
        setIsOpen(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareLinks = [
    {
      name: 'Facebook',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      hoverColor: 'hover:bg-blue-50',
      iconColor: 'text-[#1877F2]',
    },
    {
      name: 'X',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      hoverColor: 'hover:bg-gray-50',
      iconColor: 'text-black',
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
        </svg>
      ),
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      hoverColor: 'hover:bg-blue-50',
      iconColor: 'text-[#0A66C2]',
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      hoverColor: 'hover:bg-green-50',
      iconColor: 'text-[#25D366]',
    },
    {
      name: 'Email',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      url: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
      hoverColor: 'hover:bg-gray-50',
      iconColor: 'text-gray-600',
    },
  ]

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Share Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Share article"
        aria-expanded={isOpen}
      >
        <svg 
          className="w-4 h-4 transition-transform duration-200 group-hover:rotate-12" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        <span className="hidden sm:inline">Share</span>
      </button>

      {/* Premium Modern Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Card */}
          <div className="absolute right-0 mt-2 w-80 bg-white/98 backdrop-blur-2xl rounded-xl shadow-2xl border border-gray-100/50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-300">
            {/* Arrow pointer */}
            <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-l border-t border-gray-100/50 transform rotate-45"></div>
            
            {/* Header */}
            <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-bold text-gray-800">Share Article</p>
              <p className="text-xs text-gray-500 mt-0.5">Choose your platform</p>
            </div>
            
            {/* Social Platforms Grid */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-3">
                {shareLinks.map((platform) => (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-gray-100 ${platform.hoverColor} transition-all duration-200 hover:scale-105 hover:shadow-md active:scale-95 group`}
                    onClick={() => setIsOpen(false)}
                  >
                    <div className={`${platform.iconColor} transition-transform duration-200 group-hover:scale-110`}>
                      {platform.icon}
                    </div>
                    <span className="text-xs font-semibold text-gray-700 text-center leading-tight">
                      {platform.name}
                    </span>
                  </a>
                ))}
              </div>
              
              {/* Copy Link Card */}
              <button
                onClick={handleCopyLink}
                className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-lg transition-all duration-300 w-full border-2 ${
                  copied 
                    ? 'bg-green-50 border-green-200 shadow-md' 
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-all duration-300 ${
                    copied 
                      ? 'bg-green-100 text-green-600 scale-110' 
                      : 'bg-white text-gray-600 group-hover:scale-110'
                  }`}>
                    {copied ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    )}
                  </div>
                  <div className="text-left">
                    <span className={`block text-sm font-bold ${
                      copied ? 'text-green-700' : 'text-gray-800'
                    }`}>
                      {copied ? 'Link Copied!' : 'Copy Link'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {copied ? 'Share it anywhere' : 'Get shareable link'}
                    </span>
                  </div>
                </div>
                {!copied && (
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
