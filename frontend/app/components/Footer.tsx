import Link from 'next/link'
import {SOCIAL_LINKS} from '@/lib/constants'
import {SectionTitle} from '@/app/components/SectionTitle'

const sectionLinks = [
  {href: '/world', label: 'World'},
  {href: '/india', label: 'India'},
  {href: '/osint', label: 'NWS Originals'},
  {href: '/commentary', label: 'Commentary'},
]

const pageLinks = [
  {href: '/pages/about', label: 'About Us'},
  {href: '/pages/contact', label: 'Contact'},
  {href: '/pages/careers', label: 'Careers'},
  {href: '/pages/privacy', label: 'Privacy Policy'},
]

// Underline-on-hover treatment shared by all footer links
const linkClass =
  'group relative inline-block text-base'
const underlineClass =
  'absolute right-0 -bottom-[5px] left-0 h-0.5 origin-right scale-x-0 bg-[#ed1c24] transition-transform duration-200 group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100'

/* eslint-disable @next/next/no-img-element */
export default function Footer() {
  return (
    <footer className="flex flex-col gap-6 bg-black py-6 font-literata text-white">
      <div className="shell grid grid-cols-4 gap-6 max-tablet:grid-cols-2 max-phone:gap-2">
        {/* Logo and description */}
        <div className="flex flex-col gap-6 p-2.5 max-phone:col-span-full">
          <img src="/images/design/logo-white.svg" alt="NWS" width={136} height={56} className="h-14 w-[136px]" />
          <p className="m-0 text-base">
            NWS is an independent platform for cross-border and investigative journalism. We report
            overlooked stories from around the world.
          </p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-6 p-2.5 max-phone:col-span-full">
          <SectionTitle>Sections</SectionTitle>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {sectionLinks.map(({href, label}) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                  <span className={underlineClass} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-6 p-2.5">
          <SectionTitle>Links</SectionTitle>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {pageLinks.map(({href, label}) => (
              <li key={href}>
                <Link href={href} className={linkClass}>
                  {label}
                  <span className={underlineClass} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div className="flex flex-col gap-6 p-2.5">
          <SectionTitle>Social</SectionTitle>
          <ul className="m-0 flex list-none flex-col gap-2.5 p-0">
            {SOCIAL_LINKS.map((social) => (
              <li key={social.name}>
                <a href={social.url} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  {social.name}
                  <span className={underlineClass} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="m-0 px-6 text-center text-base max-phone:text-[13px]">
        © 2026 NWS. All rights reserved.
        <br />
        NWS™ and NWS Facts™ are trademarks of F3 Media Inc.
      </p>
    </footer>
  )
}
