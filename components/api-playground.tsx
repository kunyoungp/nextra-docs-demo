import { useState } from 'react'
import styles from './api-playground.module.css'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'
type CodeLanguage = 'curl' | 'javascript' | 'python'

interface APIPlaygroundProps {
  defaultEndpoint?: string
  defaultMethod?: HttpMethod
  defaultBody?: string
  baseUrl?: string
}

export function APIPlayground({
  defaultEndpoint = '/v1/chat/completions',
  defaultMethod = 'POST',
  defaultBody = '{\n  "model": "gpt-3.5-turbo",\n  "messages": [\n    {\n      "role": "user",\n      "content": "Hello!"\n    }\n  ]\n}',
  baseUrl = 'https://api.factchat.io'
}: APIPlaygroundProps) {
  const [method, setMethod] = useState<HttpMethod>(defaultMethod)
  const [endpoint, setEndpoint] = useState(defaultEndpoint)
  const [headers, setHeaders] = useState('Authorization: Bearer YOUR_API_KEY\nContent-Type: application/json')
  const [body, setBody] = useState(defaultBody)
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedLang, setSelectedLang] = useState<CodeLanguage>('curl')

  const generateCode = () => {
    const headerLines = headers.split('\n').filter(h => h.trim())
    const headerObj: Record<string, string> = {}
    headerLines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (key && valueParts.length) {
        headerObj[key.trim()] = valueParts.join(':').trim()
      }
    })

    const fullUrl = `${baseUrl}${endpoint}`

    switch (selectedLang) {
      case 'curl':
        const headerFlags = Object.entries(headerObj)
          .map(([k, v]) => `-H "${k}: ${v}"`)
          .join(' \\\n  ')

        if (method === 'GET') {
          return `curl -X GET "${fullUrl}" \\\n  ${headerFlags}`
        }
        return `curl -X ${method} "${fullUrl}" \\\n  ${headerFlags} \\\n  -d '${body.replace(/\n/g, ' ')}'`

      case 'javascript':
        const jsHeaders = JSON.stringify(headerObj, null, 2).replace(/\n/g, '\n  ')
        const fetchOptions = method === 'GET'
          ? `{\n  method: '${method}',\n  headers: ${jsHeaders}\n}`
          : `{\n  method: '${method}',\n  headers: ${jsHeaders},\n  body: JSON.stringify(${body})\n}`

        return `fetch('${fullUrl}', ${fetchOptions})\n  .then(res => res.json())\n  .then(data => console.log(data))\n  .catch(err => console.error(err))`

      case 'python':
        const pyHeaders = Object.entries(headerObj)
          .map(([k, v]) => `    '${k}': '${v}'`)
          .join(',\n')

        if (method === 'GET') {
          return `import requests\n\nheaders = {\n${pyHeaders}\n}\n\nresponse = requests.get('${fullUrl}', headers=headers)\nprint(response.json())`
        }
        return `import requests\nimport json\n\nheaders = {\n${pyHeaders}\n}\n\ndata = ${body}\n\nresponse = requests.${method.toLowerCase()}('${fullUrl}', headers=headers, json=data)\nprint(response.json())`

      default:
        return ''
    }
  }

  const handleSendRequest = async () => {
    setLoading(true)
    setResponse('⏳ Sending request...\n\nNote: This is a demo playground. In production, configure CORS and use your actual API key.')

    try {
      const headerLines = headers.split('\n').filter(h => h.trim())
      const headerObj: Record<string, string> = {}
      headerLines.forEach(line => {
        const [key, ...valueParts] = line.split(':')
        if (key && valueParts.length) {
          headerObj[key.trim()] = valueParts.join(':').trim()
        }
      })

      const fullUrl = `${baseUrl}${endpoint}`
      const options: RequestInit = {
        method,
        headers: headerObj
      }

      if (method !== 'GET' && body) {
        options.body = body
      }

      // Simulated response for demo purposes
      setTimeout(() => {
        setResponse(JSON.stringify({
          status: 'success',
          message: 'This is a simulated response. Connect to a real API endpoint to see actual data.',
          request: {
            method,
            endpoint: fullUrl,
            headers: headerObj
          },
          data: method !== 'GET' ? JSON.parse(body || '{}') : null
        }, null, 2))
        setLoading(false)
      }, 1000)

    } catch (error) {
      setResponse(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setLoading(false)
    }
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generateCode())
  }

  return (
    <div className={styles.playground}>
      <div className={styles.header}>
        <h3>🧪 API Playground</h3>
        <p>Test API endpoints interactively and generate code in multiple languages</p>
      </div>

      <div className={styles.requestSection}>
        <div className={styles.requestLine}>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as HttpMethod)}
            className={styles.methodSelect}
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
          <input
            type="text"
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="/v1/endpoint"
            className={styles.endpointInput}
          />
          <button
            onClick={handleSendRequest}
            disabled={loading}
            className={styles.sendButton}
          >
            {loading ? '⏳ Sending...' : '▶ Send'}
          </button>
        </div>

        <div className={styles.inputGroup}>
          <label>Headers</label>
          <textarea
            value={headers}
            onChange={(e) => setHeaders(e.target.value)}
            placeholder="Authorization: Bearer YOUR_API_KEY"
            className={styles.textarea}
            rows={3}
          />
        </div>

        {method !== 'GET' && (
          <div className={styles.inputGroup}>
            <label>Request Body (JSON)</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder='{"key": "value"}'
              className={styles.textarea}
              rows={8}
            />
          </div>
        )}
      </div>

      <div className={styles.codeSection}>
        <div className={styles.codeHeader}>
          <div className={styles.langTabs}>
            <button
              className={selectedLang === 'curl' ? styles.active : ''}
              onClick={() => setSelectedLang('curl')}
            >
              cURL
            </button>
            <button
              className={selectedLang === 'javascript' ? styles.active : ''}
              onClick={() => setSelectedLang('javascript')}
            >
              JavaScript
            </button>
            <button
              className={selectedLang === 'python' ? styles.active : ''}
              onClick={() => setSelectedLang('python')}
            >
              Python
            </button>
          </div>
          <button onClick={copyCode} className={styles.copyButton}>
            📋 Copy
          </button>
        </div>
        <pre className={styles.codeBlock}>
          <code>{generateCode()}</code>
        </pre>
      </div>

      {response && (
        <div className={styles.responseSection}>
          <h4>Response</h4>
          <pre className={styles.responseBlock}>
            <code>{response}</code>
          </pre>
        </div>
      )}
    </div>
  )
}
