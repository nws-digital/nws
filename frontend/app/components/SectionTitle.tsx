interface SectionTitleProps {
  children: React.ReactNode
  className?: string
  headingClassName?: string
}

// Heading with the short red bar underneath, used throughout the redesigned UI
export function SectionTitle({children, className = '', headingClassName = ''}: SectionTitleProps) {
  return (
    <div className={`flex flex-col items-start gap-2.5 ${className}`}>
      <h2 className={`text-xl font-bold leading-normal ${headingClassName}`}>{children}</h2>
      <span className="block h-[6px] w-[30px] bg-[#ff0000]" aria-hidden="true" />
    </div>
  )
}
