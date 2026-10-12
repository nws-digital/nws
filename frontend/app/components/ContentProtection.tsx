'use client'

import {useEffect} from 'react'

/**
 * Content Protection Component
 * Implements JavaScript-based content protection to prevent copying and keyboard shortcuts.
 * Right-click is intentionally allowed (e.g. "Open link in new tab"); its Copy item is still
 * blocked by the copy handler and the user-select: none rules in globals.css.
 */
export function ContentProtection() {
  useEffect(() => {
    // Prevent copy
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    // Prevent cut
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault()
      return false
    }

    // Prevent keyboard shortcuts for copy (Ctrl+C, Cmd+C)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+C / Cmd+C (Copy)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault()
        return false
      }
      // Prevent Ctrl+X / Cmd+X (Cut)
      if ((e.ctrlKey || e.metaKey) && e.key === 'x') {
        e.preventDefault()
        return false
      }
      // Prevent Ctrl+A / Cmd+A (Select All)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        return false
      }
      // Prevent Ctrl+U / Cmd+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault()
        return false
      }
      // Prevent F12 and Ctrl+Shift+I (DevTools)
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I')) {
        e.preventDefault()
        return false
      }
    }

    // Prevent selection via mouse drag
    const handleSelectStart = (e: Event) => {
      e.preventDefault()
      return false
    }

    // Add event listeners
    document.addEventListener('copy', handleCopy)
    document.addEventListener('cut', handleCut)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('selectstart', handleSelectStart)

    // Cleanup on unmount
    return () => {
      document.removeEventListener('copy', handleCopy)
      document.removeEventListener('cut', handleCut)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('selectstart', handleSelectStart)
    }
  }, [])

  return null // This component doesn't render anything
}
