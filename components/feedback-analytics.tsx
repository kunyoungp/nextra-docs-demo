import { useEffect, useState } from 'react'
import styles from './feedback-analytics.module.css'

interface FeedbackEntry {
  pathname: string
  type: 'positive' | 'negative'
  timestamp: string
  comment?: string
}

interface PageStats {
  pathname: string
  positive: number
  negative: number
  total: number
  satisfaction: number
}

export function FeedbackAnalytics() {
  const [stats, setStats] = useState<PageStats[]>([])
  const [recentFeedback, setRecentFeedback] = useState<FeedbackEntry[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = () => {
    // Load from localStorage (in production, this would be an API call)
    const feedbackData = localStorage.getItem('page-feedback-analytics')
    if (!feedbackData) {
      setStats([])
      setRecentFeedback([])
      return
    }

    const feedback: FeedbackEntry[] = JSON.parse(feedbackData)
    setRecentFeedback(feedback.slice(-10).reverse())

    // Calculate stats per page
    const pageMap = new Map<string, { positive: number; negative: number }>()

    feedback.forEach(entry => {
      if (!pageMap.has(entry.pathname)) {
        pageMap.set(entry.pathname, { positive: 0, negative: 0 })
      }
      const page = pageMap.get(entry.pathname)!
      if (entry.type === 'positive') {
        page.positive++
      } else {
        page.negative++
      }
    })

    const pageStats: PageStats[] = Array.from(pageMap.entries()).map(([pathname, counts]) => {
      const total = counts.positive + counts.negative
      const satisfaction = total > 0 ? (counts.positive / total) * 100 : 0
      return {
        pathname,
        positive: counts.positive,
        negative: counts.negative,
        total,
        satisfaction
      }
    }).sort((a, b) => b.total - a.total)

    setStats(pageStats)
  }

  const clearAnalytics = () => {
    if (confirm('Are you sure you want to clear all feedback analytics?')) {
      localStorage.removeItem('page-feedback-analytics')
      loadAnalytics()
    }
  }

  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 80) return styles.excellent
    if (satisfaction >= 60) return styles.good
    if (satisfaction >= 40) return styles.fair
    return styles.poor
  }

  return (
    <div className={styles.analytics}>
      <div className={styles.header}>
        <h2>📊 Page Feedback Analytics</h2>
        <p>View user satisfaction metrics across documentation pages</p>
        <button onClick={clearAnalytics} className={styles.clearButton}>
          Clear Analytics
        </button>
      </div>

      {stats.length === 0 ? (
        <div className={styles.empty}>
          <p>No feedback data collected yet.</p>
          <p className={styles.emptySubtext}>
            Navigate through documentation pages and submit feedback to see analytics here.
          </p>
        </div>
      ) : (
        <>
          <div className={styles.section}>
            <h3>Page Statistics</h3>
            <div className={styles.table}>
              <div className={styles.tableHeader}>
                <div className={styles.colPath}>Page</div>
                <div className={styles.colStat}>👍 Positive</div>
                <div className={styles.colStat}>👎 Negative</div>
                <div className={styles.colStat}>Total</div>
                <div className={styles.colSatisfaction}>Satisfaction</div>
              </div>
              {stats.map((stat, idx) => (
                <div key={idx} className={styles.tableRow}>
                  <div className={styles.colPath}>{stat.pathname}</div>
                  <div className={styles.colStat}>{stat.positive}</div>
                  <div className={styles.colStat}>{stat.negative}</div>
                  <div className={styles.colStat}>{stat.total}</div>
                  <div className={styles.colSatisfaction}>
                    <span className={`${styles.badge} ${getSatisfactionColor(stat.satisfaction)}`}>
                      {stat.satisfaction.toFixed(0)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <h3>Recent Feedback</h3>
            <div className={styles.recentList}>
              {recentFeedback.map((entry, idx) => (
                <div key={idx} className={styles.feedbackItem}>
                  <div className={styles.feedbackHeader}>
                    <span className={entry.type === 'positive' ? styles.positive : styles.negative}>
                      {entry.type === 'positive' ? '👍' : '👎'}
                    </span>
                    <span className={styles.pathname}>{entry.pathname}</span>
                    <span className={styles.timestamp}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {entry.comment && (
                    <div className={styles.comment}>"{entry.comment}"</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
