import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
      <span style={{ fontSize: '24px' }}>🧠</span>
      <span>FactChat Docs</span>
    </div>
  ),
  project: {
    link: 'https://github.com/kunyoungp/nextra-docs-demo',
  },
  docsRepositoryBase: 'https://github.com/kunyoungp/nextra-docs-demo',
  footer: {
    text: (
      <span>
        {new Date().getFullYear()} © FactChat by Mindlogic. All rights reserved.
      </span>
    ),
  },
  primaryHue: 215, // Blue hue matching #1751D0
  primarySaturation: 80,
  useNextSeoProps() {
    return {
      titleTemplate: '%s – FactChat Docs'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="FactChat Documentation" />
      <meta property="og:description" content="Complete documentation for FactChat - AI-powered chatbot platform" />
    </>
  ),
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <div style={{ fontWeight: 600, marginTop: '16px' }}>{title}</div>
      }
      return <>{title}</>
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
  },
}

export default config
