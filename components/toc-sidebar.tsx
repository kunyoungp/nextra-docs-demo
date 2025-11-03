import { useState, useEffect, useRef } from 'react'
import styles from './toc-sidebar.module.css'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TocSidebarProps {
  headings: TocItem[]
}

export default function TocSidebar({ headings }: TocSidebarProps) {
  const [activeId, setActiveId] = useState<string>('')
  const [isCollapsed, setIsCollapsed] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // BUG #1: IntersectionObserver is set up but never updates activeId state
    // The callback is called but setActiveId is commented out
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // setActiveId(entry.target.id)
            // The above line is commented out, so active highlighting never changes
            console.log('Section in view:', entry.target.id)
          }
        })
      },
      {
        rootMargin: '-80px 0px -80% 0px',
        threshold: 0.1,
      }
    )

    observerRef.current = observer

    // Observe all heading elements
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => {
      observer.disconnect()
    }
  }, [headings])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()

    const element = document.getElementById(id)
    if (element) {
      // Smooth scroll to the element
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      // Update URL hash
      window.history.pushState({}, '', `#${id}`)

      // Manually set active state when clicking
      setActiveId(id)
    }
    // BUG #2: Missing return false or full preventDefault handling
    // This might cause some unexpected behavior in certain browsers
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <aside className={`${styles.tocSidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.tocHeader}>
        <h4 className={styles.tocTitle}>On This Page</h4>
        <button
          className={styles.toggleButton}
          onClick={toggleCollapse}
          aria-label={isCollapsed ? 'Expand table of contents' : 'Collapse table of contents'}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.toggleIcon}
          >
            <path
              d="M6 8l4 4 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <nav className={styles.tocNav}>
        <ul className={styles.tocList}>
          {headings.map((heading) => (
            <li
              key={heading.id}
              className={styles.tocItem}
              style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
            >
              <a
                href={`#${heading.id}`}
                className={`${styles.tocLink} ${
                  activeId === heading.id ? styles.active : ''
                }`}
                onClick={(e) => handleClick(e, heading.id)}
              >
                <span className={styles.tocLinkText}>{heading.text}</span>
                {activeId === heading.id && (
                  <span className={styles.activeIndicator} />
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{
            width: headings.length > 0
              ? `${((headings.findIndex(h => h.id === activeId) + 1) / headings.length) * 100}%`
              : '0%'
          }}
        />
      </div>
    </aside>
  )
}

// Helper function to extract headings from page content
export function extractHeadings(): TocItem[] {
  if (typeof window === 'undefined') return []

  const headingElements = document.querySelectorAll('h2, h3, h4')
  const headings: TocItem[] = []

  headingElements.forEach((heading) => {
    const level = parseInt(heading.tagName.charAt(1))
    const text = heading.textContent || ''
    let id = heading.id

    // Generate ID if it doesn't exist
    if (!id) {
      id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      heading.id = id
    }

    headings.push({ id, text, level })
  })

  return headings
}
