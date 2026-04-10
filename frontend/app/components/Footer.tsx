import Image from 'next/image'
import Link from 'next/link'
import {SOCIAL_LINKS, SOCIAL_ICONS} from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-[1366px] mx-auto px-6 py-12">
        {/* Four column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Logo and Description Column */}
          <div>
            <Image 
              src="/images/Logo_White.svg" 
              alt="NWS" 
              width={136}
              height={56}
              className="h-10 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm leading-relaxed">
              NWS is an independent platform for cross-border and investigative journalism. We report overlooked stories from around the world.
            </p>
          </div>

          {/* Sections Column */}
          <div>
            <div className="mb-8">
              <h6 className="text-lg font-bold whitespace-nowrap mb-2">Sections</h6>
              <div className="w-4 h-1 bg-red-600"></div>
            </div>
            <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
              <li>
                <Link href="/world-exclusive" className="hover:text-red-500 transition-colors">
                  World Exclusive
                </Link>
              </li>
              <li>
                <Link href="/india-exclusive" className="hover:text-red-500 transition-colors">
                  India Exclusive
                </Link>
              </li>
              <li>
                <Link href="/osint-exclusive" className="hover:text-red-500 transition-colors">
                  OSINT Exclusive
                </Link>
              </li>
              <li>
                <Link href="/commentary" className="hover:text-red-500 transition-colors">
                  Commentary
                </Link>
              </li>
            </ul>
          </div>

          {/* About Column */}
          <div>
            <div className="mb-8">
              <h6 className="text-lg font-bold whitespace-nowrap mb-2">Links</h6>
              <div className="w-4 h-1 bg-red-600"></div>
            </div>
            <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
              <li>
                <Link href="/pages/about" className="hover:text-red-500 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/pages/contact" className="hover:text-red-500 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/pages/terms" className="hover:text-red-500 transition-colors">
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link href="/pages/privacy" className="hover:text-red-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us Column */}
          <div>
            <div className="mb-8">
              <h6 className="text-lg font-bold whitespace-nowrap mb-2">Social</h6>
              <div className="w-4 h-1 bg-red-600"></div>
            </div>
            <ul className="space-y-2 text-gray-400 text-sm leading-relaxed">
              {SOCIAL_LINKS.map((social) => {
                const icon = SOCIAL_ICONS[social.name]
                return (
                  <li key={social.name}>
                    <a 
                      href={social.url}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:text-red-500 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox={icon.viewBox}>
                        <path d={icon.path} />
                      </svg>
                      {social.name}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {/* Divider line */}
        <div className="border-t border-gray-700 mb-6"></div>

        {/* Copyright */}
        <div className="text-center text-gray-400">
          <p>© 2025 NWS. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
