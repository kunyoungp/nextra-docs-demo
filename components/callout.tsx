import { ReactNode } from 'react'
import styles from './callout.module.css'

type CalloutType = 'info' | 'warning' | 'danger' | 'success' | 'tip'

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: ReactNode
  emoji?: string
}

const defaultEmojis: Record<CalloutType, string> = {
  info: 'ℹ️',
  warning: '⚠️',
  danger: '🚫',
  success: '✅',
  tip: '💡'
}

const defaultTitles: Record<CalloutType, string> = {
  info: 'Info',
  warning: 'Warning',
  danger: 'Danger',
  success: 'Success',
  tip: 'Tip'
}

export function Callout({
  type = 'info',
  title,
  children,
  emoji
}: CalloutProps) {
  const displayEmoji = emoji || defaultEmojis[type]
  const displayTitle = title || defaultTitles[type]

  return (
    <div className={`${styles.callout} ${styles[type]}`}>
      <div className={styles.header}>
        <span className={styles.emoji}>{displayEmoji}</span>
        <span className={styles.title}>{displayTitle}</span>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}

// Convenience components for common use cases
export function Info({ title, children }: { title?: string; children: ReactNode }) {
  return <Callout type="info" title={title}>{children}</Callout>
}

export function Warning({ title, children }: { title?: string; children: ReactNode }) {
  return <Callout type="warning" title={title}>{children}</Callout>
}

export function Danger({ title, children }: { title?: string; children: ReactNode }) {
  return <Callout type="danger" title={title}>{children}</Callout>
}

export function Success({ title, children }: { title?: string; children: ReactNode }) {
  return <Callout type="success" title={title}>{children}</Callout>
}

export function Tip({ title, children }: { title?: string; children: ReactNode }) {
  return <Callout type="tip" title={title}>{children}</Callout>
}
