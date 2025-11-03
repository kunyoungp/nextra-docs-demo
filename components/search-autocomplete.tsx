import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import styles from './search-autocomplete.module.css'

interface SearchResult {
  title: string
  path: string
  excerpt: string
}

const documentationPages: SearchResult[] = [
  { title: 'FactChat Introduction', path: '/factchat/introduction', excerpt: 'Learn about FactChat platform and its key benefits' },
  { title: 'FactChat API', path: '/factchat/api', excerpt: 'API documentation for FactChat integration' },
  { title: 'About', path: '/about', excerpt: 'About this documentation' },
  { title: 'Advanced Features', path: '/advanced', excerpt: 'Advanced configuration and features' },
  { title: 'Satori', path: '/advanced/satori', excerpt: 'Using Satori for image generation' },
  { title: 'Another Page', path: '/another', excerpt: 'Additional documentation content' },
]

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (query.trim().length > 0) {
      // BUG #2: Filter logic is broken - always returns empty array
      const filtered = documentationPages.filter(page => {
        const searchTerm = query.toLowerCase()
        return (
          page.title.toLowerCase().includes(searchTerm) &&
          page.path.toLowerCase().includes('nonexistent-path') // This ensures nothing matches
        )
      })
      setResults(filtered)
      setIsOpen(true)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [query])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault()
      handleResultClick(results[selectedIndex].path)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const handleResultClick = (path: string) => {
    // BUG #1: Function is defined but router.push is commented out
    // router.push(path)
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(`(${query})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className={styles.highlight}>{part}</mark>
      ) : (
        <span key={index}>{part}</span>
      )
    )
  }

  return (
    <div className={styles.searchContainer} ref={searchRef}>
      <div className={styles.searchInputWrapper}>
        <svg
          className={styles.searchIcon}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19l-4.35-4.35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search documentation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
        />
        {query && (
          <button
            className={styles.clearButton}
            onClick={() => {
              setQuery('')
              setIsOpen(false)
            }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {isOpen && (
        <div className={styles.resultsDropdown}>
          {results.length > 0 ? (
            <ul className={styles.resultsList}>
              {results.map((result, index) => (
                <li
                  key={result.path}
                  className={`${styles.resultItem} ${selectedIndex === index ? styles.selected : ''}`}
                  onClick={() => handleResultClick(result.path)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className={styles.resultTitle}>
                    {highlightMatch(result.title, query)}
                  </div>
                  <div className={styles.resultExcerpt}>{result.excerpt}</div>
                  <div className={styles.resultPath}>{result.path}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.noResults}>
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                className={styles.noResultsIcon}
              >
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="8" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p>No results found for "{query}"</p>
              <p className={styles.noResultsHint}>Try different keywords or check spelling</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
