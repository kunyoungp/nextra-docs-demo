import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import styles from './page-feedback.module.css'

type FeedbackState = 'idle' | 'positive' | 'negative' | 'submitted'

interface PageFeedbackProps {
  showCommentBox?: boolean
}

export function PageFeedback({ showCommentBox = true }: PageFeedbackProps) {
  const router = useRouter()
  const [feedbackState, setFeedbackState] = useState<FeedbackState>('idle')
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset feedback when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      setFeedbackState('idle')
      setComment('')
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  // Load saved feedback from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`feedback-${router.pathname}`)
    if (saved) {
      const data = JSON.parse(saved)
      if (data.submitted) {
        setFeedbackState('submitted')
      }
    }
  }, [router.pathname])

  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedbackState(type)

    // Track in localStorage (in production, send to analytics service)
    const feedbackData = {
      pathname: router.pathname,
      type,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : ''
    }

    const existingFeedback = localStorage.getItem('page-feedback-analytics') || '[]'
    const feedbackArray = JSON.parse(existingFeedback)
    feedbackArray.push(feedbackData)
    localStorage.setItem('page-feedback-analytics', JSON.stringify(feedbackArray))

    // If no comment box, auto-submit
    if (!showCommentBox) {
      handleSubmit(type)
    }
  }

  const handleSubmit = async (type?: 'positive' | 'negative') => {
    setIsSubmitting(true)

    const submissionData = {
      pathname: router.pathname,
      type: type || feedbackState,
      comment: comment.trim(),
      timestamp: new Date().toISOString(),
      submitted: true
    }

    // Save to localStorage (in production, send to backend API)
    localStorage.setItem(`feedback-${router.pathname}`, JSON.stringify(submissionData))

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    setFeedbackState('submitted')
    setIsSubmitting(false)
  }

  const handleReset = () => {
    setFeedbackState('idle')
    setComment('')
    localStorage.removeItem(`feedback-${router.pathname}`)
  }

  if (feedbackState === 'submitted') {
    return (
      <div className={styles.feedback}>
        <div className={styles.submitted}>
          <div className={styles.submittedIcon}>✓</div>
          <div className={styles.submittedText}>
            <p className={styles.submittedTitle}>Thank you for your feedback!</p>
            <p className={styles.submittedSubtitle}>
              Your input helps us improve our documentation.
            </p>
          </div>
          <button onClick={handleReset} className={styles.resetButton}>
            Change feedback
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.feedback}>
      <div className={styles.question}>
        <p>Was this page helpful?</p>
      </div>

      <div className={styles.buttons}>
        <button
          onClick={() => handleFeedback('positive')}
          className={`${styles.feedbackButton} ${feedbackState === 'positive' ? styles.active : ''}`}
          disabled={feedbackState !== 'idle' && feedbackState !== 'positive'}
        >
          <span className={styles.icon}>👍</span>
          <span>Yes</span>
        </button>
        <button
          onClick={() => handleFeedback('negative')}
          className={`${styles.feedbackButton} ${feedbackState === 'negative' ? styles.active : ''}`}
          disabled={feedbackState !== 'idle' && feedbackState !== 'negative'}
        >
          <span className={styles.icon}>👎</span>
          <span>No</span>
        </button>
      </div>

      {showCommentBox && (feedbackState === 'positive' || feedbackState === 'negative') && (
        <div className={styles.commentBox}>
          <label htmlFor="feedback-comment" className={styles.commentLabel}>
            {feedbackState === 'positive'
              ? 'What did you like most? (optional)'
              : 'How can we improve this page? (optional)'}
          </label>
          <textarea
            id="feedback-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              feedbackState === 'positive'
                ? 'Tell us what was helpful...'
                : 'Tell us what we can do better...'
            }
            className={styles.textarea}
            rows={4}
            maxLength={500}
          />
          <div className={styles.commentActions}>
            <span className={styles.charCount}>{comment.length}/500</span>
            <div className={styles.actionButtons}>
              <button onClick={handleReset} className={styles.cancelButton}>
                Cancel
              </button>
              <button
                onClick={() => handleSubmit()}
                disabled={isSubmitting}
                className={styles.submitButton}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
