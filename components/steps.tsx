import { ReactNode } from 'react'
import styles from './steps.module.css'

interface StepsProps {
  children: ReactNode
}

interface StepProps {
  title?: string
  children: ReactNode
}

export function Steps({ children }: StepsProps) {
  return (
    <div className={styles.steps}>
      {children}
    </div>
  )
}

export function Step({ title, children }: StepProps) {
  return (
    <div className={styles.step}>
      <div className={styles.stepIndicator}>
        <div className={styles.stepNumber} />
        <div className={styles.stepLine} />
      </div>
      <div className={styles.stepContent}>
        {title && <h4 className={styles.stepTitle}>{title}</h4>}
        <div className={styles.stepBody}>{children}</div>
      </div>
    </div>
  )
}
